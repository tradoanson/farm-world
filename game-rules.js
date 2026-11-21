(function (root) {
  'use strict';

  // Durations are in seconds. All deadlines use UTC epoch milliseconds.
  const CROPS = Object.freeze({ wheat: 120, carrot: 600, corn: 300, tomato: 1800, strawberry: 5400 });
  const PENS = Object.freeze({ chicken: 900, cow: 2100, sheep: 5400 });
  const RECIPES = Object.freeze({ feed: 360, bread: 720, cheese: 2700, woolenSweater: 3600 });
  const ORDER_REPLACEMENT_SECONDS = 180;
  const WATER_REMAINING_RATIO = 0.75;
  const SAVE_VERSION = 2;

  function deadline(now, seconds) {
    return now + seconds * 1000;
  }

  function remainingSeconds(readyAt, now) {
    return Math.max(0, Math.ceil((readyAt - now) / 1000));
  }

  function shortenByWater(readyAt, now) {
    return now + Math.ceil(Math.max(0, readyAt - now) * WATER_REMAINING_RATIO);
  }

  function countdown(seconds) {
    const total = Math.max(0, Math.ceil(seconds));
    const hours = Math.floor(total / 3600);
    const minutes = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
    const remainder = String(total % 60).padStart(2, '0');
    return hours ? `${hours}:${minutes}:${remainder}` : `${minutes}:${remainder}`;
  }

  function formatDuration(seconds) {
    const time = Math.max(0, Math.ceil(seconds));
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const remainder = time % 60;
    return [
      hours && `${hours} giờ`,
      minutes && `${minutes} phút`,
      remainder && `${remainder} giây`
    ].filter(Boolean).join(' ') || '0 giây';
  }

  function migrateTiming(state, now) {
    if (state.timingVersion === SAVE_VERSION) return state;
    const previousSave = Number.isFinite(state.savedAt) ? Math.min(state.savedAt, now) : now;
    for (const plot of state.plots) {
      if (plot.state === 'growing') {
        plot.readyAt = deadline(previousSave, Math.max(0, Number(plot.timer) || 0));
      }
    }
    for (const [type, pen] of Object.entries(state.husbandry)) {
      if (pen.state === 'producing') {
        pen.readyAt = deadline(previousSave, Math.max(0, Number(pen.timer) || 0));
        // The progress bar keeps its old denominator until the current cycle finishes.
        pen.cycleDuration = pen.produceTime;
      }
      pen.produceTime = PENS[type] ?? pen.produceTime;
    }
    state.energyAt = previousSave;
    state.energySeconds ??= 0;
    state.timingVersion = SAVE_VERSION;
    return state;
  }

  function syncCycle(cycle, activeState, now) {
    if (cycle.state !== activeState) return;
    cycle.timer = remainingSeconds(cycle.readyAt, now);
    if (cycle.timer === 0) {
      cycle.state = 'ready';
      cycle.readyAt = null;
    }
  }

  function syncFarm(state, now) {
    for (const plot of state.plots) syncCycle(plot, 'growing', now);
    for (const pen of Object.values(state.husbandry)) syncCycle(pen, 'producing', now);

    const { player } = state;
    if (!Number.isFinite(state.energyAt) || state.energyAt > now) state.energyAt = now;
    if (player.energy >= player.maxEnergy) {
      state.energySeconds = 0;
      state.energyAt = now;
      return;
    }

    const elapsed = Math.floor((now - state.energyAt) / 1000);
    const charge = (state.energySeconds || 0) + elapsed;
    player.energy = Math.min(player.maxEnergy, player.energy + Math.floor(charge / 30));
    state.energySeconds = player.energy === player.maxEnergy ? 0 : charge % 30;
    state.energyAt += elapsed * 1000;
  }

  const rules = Object.freeze({
    CROPS, PENS, RECIPES, ORDER_REPLACEMENT_SECONDS, WATER_REMAINING_RATIO, SAVE_VERSION, deadline, remainingSeconds,
    shortenByWater, countdown, formatDuration, migrateTiming, syncFarm
  });
  if (typeof module === 'object' && module.exports) module.exports = rules;
  else root.NTVV_RULES = rules;
}(globalThis));
