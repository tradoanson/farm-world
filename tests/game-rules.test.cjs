const test = require('node:test');
const assert = require('node:assert/strict');
const rules = require('../game-rules.js');

const start = Date.UTC(2026, 10, 21, 2);

function oldFarm() {
  return {
    savedAt: start,
    plots: [{ type: 'wheat', state: 'growing', timer: 9, duration: 10 }],
    husbandry: { chicken: { state: 'producing', timer: 15, produceTime: 25 } },
    player: { energy: 93, maxEnergy: 100 },
    energySeconds: 20,
    production: [{ id: 1, startsAt: start, readyAt: start + 20000 }]
  };
}

test('paced crop, livestock, and workshop rules use seconds', () => {
  assert.deepEqual(Object.values(rules.CROPS).sort((a, b) => a - b), [120, 300, 600, 1800, 5400]);
  assert.deepEqual(Object.values(rules.PENS), [900, 2100, 5400]);
  assert.deepEqual(Object.values(rules.RECIPES), [360, 720, 2700, 3600]);
  assert.equal(rules.ORDER_REPLACEMENT_SECONDS, 180);
});

test('countdowns display a positive final fraction and stop at the deadline', () => {
  assert.equal(rules.remainingSeconds(start + 1, start), 1);
  assert.equal(rules.remainingSeconds(start, start), 0);
  assert.equal(rules.remainingSeconds(start, start + 9999), 0);
  assert.equal(rules.countdown(5400), '1:30:00');
  assert.equal(rules.countdown(120), '02:00');
  assert.equal(rules.formatDuration(5430), '1 giờ 30 phút 30 giây');
});

test('watering shortens the actual remaining duration by 25 percent', () => {
  const now = start + 30000;
  const wet = rules.shortenByWater(rules.deadline(start, 120), now);
  assert.equal(wet, start + 97500);
  assert.equal(rules.remainingSeconds(wet, now), 68);
});

test('legacy migration keeps absolute finish times and new cycle lengths separate', () => {
  const farm = oldFarm();
  rules.migrateTiming(farm, start + 4000);
  assert.equal(farm.plots[0].readyAt, start + 9000);
  assert.equal(farm.husbandry.chicken.readyAt, start + 15000);
  assert.equal(farm.husbandry.chicken.cycleDuration, 25);
  assert.equal(farm.husbandry.chicken.produceTime, 900);
  assert.equal(farm.production[0].readyAt, start + 20000);

  rules.syncFarm(farm, start + 10000);
  assert.equal(farm.plots[0].state, 'ready');
  assert.equal(farm.husbandry.chicken.timer, 5);
  assert.equal(farm.player.energy, 94);
  rules.migrateTiming(farm, start + 12000);
  rules.syncFarm(farm, start + 15000);
  assert.equal(farm.husbandry.chicken.state, 'ready');
  assert.equal(farm.husbandry.chicken.readyAt, null);
});

test('reopening an absolute-time save never restarts a crop or grants energy twice', () => {
  const farm = oldFarm();
  rules.migrateTiming(farm, start);
  const saved = JSON.stringify(farm);
  const reopened = JSON.parse(saved);
  rules.migrateTiming(reopened, start + 70000);
  rules.syncFarm(reopened, start + 70000);
  assert.equal(reopened.plots[0].state, 'ready');
  assert.equal(reopened.husbandry.chicken.state, 'ready');
  assert.equal(reopened.player.energy, 96);
  rules.syncFarm(reopened, start + 70000);
  assert.equal(reopened.player.energy, 96);
});

test('full energy does not accumulate a hidden balance', () => {
  const farm = oldFarm();
  rules.migrateTiming(farm, start);
  farm.player.energy = 100;
  rules.syncFarm(farm, start + 999999);
  assert.equal(farm.energySeconds, 0);
  farm.player.energy = 99;
  rules.syncFarm(farm, start + 1000999);
  assert.equal(farm.player.energy, 99);
  rules.syncFarm(farm, start + 1029999);
  assert.equal(farm.player.energy, 100);
});
