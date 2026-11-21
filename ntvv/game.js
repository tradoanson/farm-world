/**
 * NÔNG TRẠI VUI VẺ - FARM WORLD V3.1 (EXPANDED EDITION)
 * Core Game Engine & Advanced Gameplay Systems:
 * - Husbandry & 3D Isometric Pens
 * - 9-12 Interactive Crop Plots with Watering & Fertilizer
 * - Pier Fishing Mini-Game
 * - Wheel of Fortune (Lucky Wheel)
 * - Farm Dog Pet Interaction
 * - Roadside Shop (Gian Hàng Ven Đường)
 * - Day/Night Atmosphere & Weather Systems
 */

class FarmGame {
  constructor() {
    this.storageKey = 'NTVV_FARM_DATA_V3_1_EXP';
    this.selectedPlotIndex = null;
    this.selectedTool = 'sickle'; // 'sickle', 'water', 'fertilizer'
    this.cropPointer = null;
    this.suppressPlotClick = false;
    this.activeModal = null;
    this.activeScene = null;
    this.modalTrigger = null;
    this.activeTimeOfDay = 'day'; // 'day', 'sunset', 'night'
    this.isRaining = false;

    // Fishing State
    this.fishingState = 'idle'; // 'idle', 'waiting', 'bite'
    this.fishingTimer = null;
    this.biteTimeout = null;

    // Wheel State
    this.isSpinning = false;
    this.wheelRotation = 0;

    // Load or initialize state
    const now = Date.now();
    this.state = this.loadState() || this.getDefaultState(now);
    NTVV_RULES.migrateTiming(this.state, now);
    NTVV_RULES.syncFarm(this.state, now);

    // FX array
    this.particles = [];
    this.rainDrops = [];

    this.init();
  }

  getDefaultState(now = Date.now()) {
    return {
      player: {
        name: 'Nông dân vui vẻ',
        level: 1,
        exp: 0,
        maxExp: FarmGame.experienceForLevel(1),
        gold: 300,
        gems: 4,
        energy: 100,
        maxEnergy: 100
      },
      husbandry: {
        chicken: {
          name: 'Chuồng Gà',
          type: 'chicken',
          count: 3,
          max: 6,
          product: 'Trứng',
          icon: '🥚',
          produceTime: NTVV_RULES.PENS.chicken,
          timer: 0,
          state: 'ready',
          yield: 3,
          feedCost: 2
        },
        cow: {
          name: 'Chuồng Bò',
          type: 'cow',
          count: 2,
          max: 4,
          product: 'Sữa',
          icon: '🥛',
          produceTime: NTVV_RULES.PENS.cow,
          timer: 0,
          state: 'hungry',
          yield: 2,
          feedCost: 2
        },
        sheep: {
          name: 'Chuồng Cừu',
          type: 'sheep',
          count: 2,
          max: 4,
          product: 'Lông cừu',
          icon: '🧶',
          produceTime: NTVV_RULES.PENS.sheep,
          timer: 0,
          state: 'hungry',
          yield: 2,
          feedCost: 2
        }
      },
      inventory: {
        products: { egg: 0, milk: 0, wool: 0 },
        feed: 4,
        fertilizer: 2,
        crops: { wheat: 6, carrot: 2, corn: 3, tomato: 0, strawberry: 0 },
        seeds: { wheat: 14, carrot: 7, corn: 5, tomato: 3, strawberry: 2 },
        processed: { bread: 0, cheese: 0, woolenSweater: 0 },
        fish: { carp: 0, tilapia: 0, salmon: 0, prawn: 0 }
      },
      plots: [
        { id: 0, type: 'wheat', state: 'ready', timer: 0, duration: NTVV_RULES.CROPS.wheat, watered: false },
        { id: 1, type: 'wheat', state: 'growing', timer: 45, duration: NTVV_RULES.CROPS.wheat, readyAt: NTVV_RULES.deadline(now, 45), watered: true },
        { id: 2, type: 'carrot', state: 'growing', timer: 180, duration: NTVV_RULES.CROPS.carrot, readyAt: NTVV_RULES.deadline(now, 180), watered: false },
        { id: 3, type: null, state: 'empty', timer: 0, duration: 0, watered: false },
        { id: 4, type: 'wheat', state: 'ready', timer: 0, duration: NTVV_RULES.CROPS.wheat, watered: false },
        { id: 5, type: null, state: 'empty', timer: 0, duration: 0, watered: false },
        { id: 6, type: null, state: 'empty', timer: 0, duration: 0, watered: false },
        { id: 7, type: 'corn', state: 'ready', timer: 0, duration: NTVV_RULES.CROPS.corn, watered: false },
        { id: 8, type: 'carrot', state: 'ready', timer: 0, duration: NTVV_RULES.CROPS.carrot, watered: false }
      ],
      orders: [
        { id: 1, npc: 'Bác Ba Nông Dân', avatar: '👨‍🌾', req: { wheat: 3, egg: 2 }, reward: { gold: 155, exp: 25 } },
        { id: 2, npc: 'Bé Na', avatar: '👧', req: { carrot: 2, milk: 1 }, reward: { gold: 185, exp: 30 } },
        { id: 3, npc: 'Cô Lan Bếp Trưởng', avatar: '👩‍🍳', req: { bread: 1, wheat: 2 }, reward: { gold: 335, exp: 45 } }
      ],
      quests: [],
      campaign: { chapter: 0, progress: {}, claimed: [], legacyRecipes: false },
      daily: null,
      production: [],
      nextJobId: 1,
      energySeconds: 0,
      energyAt: now,
      timingVersion: NTVV_RULES.SAVE_VERSION,
      freeSpinAvailable: true
    };
  }

  // Registries
  static CROPS_DATA = {
    wheat: { name: 'Lúa mì', icon: '🌾', duration: NTVV_RULES.CROPS.wheat, seedCost: 15, sellPrice: 35, exp: 10 },
    carrot: { art: 'scene-art/crop-carrot.png', name: 'Cà rốt', icon: '🥕', duration: NTVV_RULES.CROPS.carrot, seedCost: 25, sellPrice: 60, exp: 16 },
    corn: { art: 'scene-art/crop-corn.png', name: 'Bắp ngô', icon: '🌽', duration: NTVV_RULES.CROPS.corn, seedCost: 35, sellPrice: 85, exp: 22 },
    tomato: { art: 'scene-art/crop-tomato.png', name: 'Cà chua', icon: '🍅', duration: NTVV_RULES.CROPS.tomato, seedCost: 50, sellPrice: 120, exp: 30 },
    strawberry: { art: 'scene-art/crop-strawberry.png', name: 'Dâu tây', icon: '🍓', duration: NTVV_RULES.CROPS.strawberry, seedCost: 80, sellPrice: 190, exp: 45 }
  };

  static ANIMAL_DATA = {
    chicken: { name: 'Gà mái', icon: '🐔', cost: 500, max: 6, product: 'egg', prodName: 'Trứng', prodIcon: '🥚', sellPrice: 50, exp: 15 },
    cow: { name: 'Bò sữa', icon: '🐄', cost: 1500, max: 4, product: 'milk', prodName: 'Sữa', prodIcon: '🥛', sellPrice: 120, exp: 35 },
    sheep: { name: 'Cừu lông', icon: '🐑', cost: 2500, max: 4, product: 'wool', prodName: 'Lông cừu', prodIcon: '🧶', sellPrice: 220, exp: 60 }
  };

  static FISH_DATA = {
    carp: { name: 'Cá Chép Vàng', icon: '🐟', sellPrice: 80, exp: 25, chance: 0.40 },
    tilapia: { name: 'Cá Rô Phi', icon: '🐠', sellPrice: 130, exp: 40, chance: 0.30 },
    salmon: { name: 'Cá Hồi Đại Dương', icon: '🐡', sellPrice: 240, exp: 70, chance: 0.20 },
    prawn: { name: 'Tôm Càng Xanh', icon: '🦞', sellPrice: 380, exp: 110, chance: 0.10 }
  };

  static START_PEN_CAPACITY = { chicken: 3, cow: 2, sheep: 2 };

  static LEVEL_UNLOCKS = [
    { level: 2, animal: 'chicken', capacity: 4, label: 'Chuồng gà có 4 chỗ' },
    { level: 3, crop: 'tomato', label: 'Mua hạt cà chua' },
    { level: 4, animal: 'cow', capacity: 3, label: 'Chuồng bò có 3 chỗ' },
    { level: 5, crop: 'strawberry', label: 'Mua hạt dâu tây' },
    { level: 5, animal: 'chicken', capacity: 5, label: 'Chuồng gà có 5 chỗ' },
    { level: 6, animal: 'sheep', capacity: 3, label: 'Chuồng cừu có 3 chỗ' },
    { level: 7, animal: 'cow', capacity: 4, label: 'Chuồng bò có 4 chỗ' },
    { level: 8, animal: 'sheep', capacity: 4, label: 'Chuồng cừu có 4 chỗ' },
    { level: 8, workshopSlots: 1, label: 'Thêm 1 ô xếp mẻ trong xưởng' },
    { level: 9, animal: 'chicken', capacity: 6, label: 'Chuồng gà có 6 chỗ' }
  ];

  static experienceForLevel(level) {
    const steps = level - 1;
    return Math.min(Number.MAX_SAFE_INTEGER, 130 + 45 * steps + 11 * steps * steps);
  }

  static RECIPES = {
    feed: { name: 'Thức ăn gia súc (x5)', icon: '🌾', req: { wheat: 2, corn: 1 }, yield: 5, time: NTVV_RULES.RECIPES.feed, category: 'feed' },
    bread: { name: 'Bánh mì nướng', icon: '🍞', req: { wheat: 3, egg: 2 }, yield: 1, time: NTVV_RULES.RECIPES.bread, sellPrice: 280, exp: 45, category: 'processed' },
    cheese: { name: 'Phô mai thơm', icon: '🧀', req: { milk: 3 }, yield: 1, time: NTVV_RULES.RECIPES.cheese, sellPrice: 400, exp: 65, category: 'processed', chapter: 2 },
    woolenSweater: { name: 'Áo len ấm', icon: '🧶', req: { wool: 3 }, yield: 1, time: NTVV_RULES.RECIPES.woolenSweater, sellPrice: 750, exp: 110, category: 'processed', chapter: 3 }
  };

  static CAMPAIGN = [
    {
      name: 'Vụ mùa đầu tiên',
      summary: 'Gặt cây chín để lấy nông sản, rồi gieo và tưới cho vụ tiếp theo.',
      finish: 'Thưởng chương: 150 vàng và 5 hạt lúa mì.',
      reward: { gold: 150, seeds: 5 },
      tasks: [
        { id: 'first-harvest', title: 'Gặt 3 ô chín', type: 'harvest_crop', target: 3, scene: 'farm', reward: { gold: 45, exp: 15 } },
        { id: 'first-plant', title: 'Gieo 3 ô đất', type: 'plant_crop', target: 3, scene: 'farm', reward: { seeds: 4, exp: 15 } },
        { id: 'first-water', title: 'Tưới 1 ô đang lớn', type: 'water_crop', target: 1, scene: 'farm', reward: { gold: 40, exp: 15 } }
      ]
    },
    {
      name: 'Nhịp sống trong chuồng',
      summary: 'Dùng lúa mì và bắp để xay thức ăn, chăm đàn vật nuôi và thu sản phẩm.',
      finish: 'Mở công thức phô mai và nhận 2 kim cương.',
      legacyFinish: 'Thưởng chương: 2 kim cương.',
      reward: { gem: 2 },
      tasks: [
        { id: 'first-feed-bag', title: 'Nhận 1 mẻ thức ăn từ xưởng', type: 'collect_feed', target: 1, scene: 'workshop', reward: { gold: 60, exp: 20 } },
        { id: 'first-feed-pens', title: 'Cho ăn 2 lượt chuồng', type: 'feed_animal', target: 2, scene: 'animals', reward: { gold: 80, exp: 20 } },
        { id: 'first-pen-products', title: 'Thu sản phẩm 2 lượt chuồng', type: 'harvest_pen', target: 2, scene: 'animals', reward: { gold: 100, exp: 25 } }
      ]
    },
    {
      name: 'Hàng về thị trấn',
      summary: 'Nướng bánh mì, giao đơn đã đủ hàng và bán phần dư trong kho.',
      finish: 'Mở công thức áo len, thêm 1 ô xưởng và nhận 3 kim cương.',
      legacyFinish: 'Thêm 1 ô xưởng và nhận 3 kim cương.',
      reward: { gem: 3 },
      tasks: [
        { id: 'first-bread', title: 'Nhận 1 mẻ bánh mì từ xưởng', type: 'collect_bread', target: 1, scene: 'workshop', reward: { gold: 90, exp: 25 } },
        { id: 'first-delivery', title: 'Giao 2 đơn hàng', type: 'deliver_order', target: 2, scene: 'orders', reward: { gold: 160, exp: 35 } },
        { id: 'first-sale', title: 'Bán ít nhất 1 món trong kho', type: 'sell_item', target: 1, scene: 'warehouse', reward: { gold: 80, exp: 20 } }
      ]
    },
    {
      name: 'Xưởng làng phát triển',
      summary: 'Dùng sữa và lông cừu để làm thành phẩm và giao mặt hàng chế biến.',
      finish: 'Thưởng hoàn thành hành trình: 500 vàng và 5 kim cương.',
      reward: { gold: 500, gem: 5 },
      tasks: [
        { id: 'first-cheese', title: 'Nhận 1 mẻ phô mai', type: 'collect_cheese', target: 1, scene: 'workshop', reward: { gold: 125, exp: 30 } },
        { id: 'first-sweater', title: 'Nhận 1 mẻ áo len', type: 'collect_woolenSweater', target: 1, scene: 'workshop', reward: { gold: 150, exp: 40 } },
        { id: 'first-finished-order', title: 'Giao 1 đơn có thành phẩm', type: 'deliver_processed', target: 1, scene: 'orders', reward: { gold: 200, exp: 40 } }
      ]
    }
  ];

  static DAILY = [
    [
      { title: 'Gieo 4 ô đất', type: 'plant_crop', target: 4, scene: 'farm', reward: { gold: 70, exp: 20 } },
      { title: 'Gặt 5 ô chín', type: 'harvest_crop', target: 5, scene: 'farm', reward: { gold: 100, exp: 25 } },
      { title: 'Tưới 2 ô đang lớn', type: 'water_crop', target: 2, scene: 'farm', reward: { seeds: 3, gem: 1 } }
    ],
    [
      { title: 'Cho ăn 2 lượt chuồng', type: 'feed_animal', target: 2, scene: 'animals', reward: { gold: 90, exp: 25 } },
      { title: 'Thu sản phẩm 2 lượt chuồng', type: 'harvest_pen', target: 2, scene: 'animals', reward: { gold: 120, exp: 30 } },
      { title: 'Nhận 2 mẻ từ xưởng', type: 'collect_batch', target: 2, scene: 'workshop', reward: { gem: 1, exp: 25 } }
    ],
    [
      { title: 'Giao 2 đơn hàng', type: 'deliver_order', target: 2, scene: 'orders', reward: { gold: 130, exp: 30 } },
      { title: 'Bán 5 món trong kho', type: 'sell_item', target: 5, scene: 'warehouse', reward: { gold: 75, exp: 20 } },
      { title: 'Nhận 2 mẻ từ xưởng', type: 'collect_batch', target: 2, scene: 'workshop', reward: { gem: 1, exp: 25 } }
    ]
  ];

  static WHEEL_PRIZES = [
    { label: '500 Vàng', icon: '🪙', type: 'gold', val: 500 },
    { label: '15 Kim Cương', icon: '💎', type: 'gem', val: 15 },
    { label: '10 Thức Ăn', icon: '🌾', type: 'feed', val: 10 },
    { label: '1,000 Vàng', icon: '🪙', type: 'gold', val: 1000 },
    { label: '50 Thể Lực', icon: '⚡', type: 'energy', val: 50 },
    { label: '3 Phân Bón', icon: '✨', type: 'fertilizer', val: 3 },
    { label: '5 Dâu Tây', icon: '🍓', type: 'crop', cropKey: 'strawberry', val: 5 },
    { label: 'Rương Báu', icon: '🎁', type: 'chest', val: { gold: 1200, gem: 20 } }
  ];

  init() {
    this.setupFXCanvas();
    this.refreshDaily();
    this.refreshOrderBoard(Date.now());
    this.saveState();
    this.renderAll();
    this.showScene('farm', false);
    this.drawWheel();
    this.bindEvents();
    this.addExp(0);
    this.saveState();
    this.startMainLoop();
    this.startAutoSave();
  }

  // --- RENDERING ---

  renderAll() {
    this.renderHeader();
    this.renderRightSidebar();
    this.renderHusbandryPens();
    this.renderCrops();
    this.renderFarmStatus();
    this.renderQuestShortcut();
  }

  renderHeader() {
    document.getElementById('hud-player-name').textContent = this.state.player.name;
    document.getElementById('hud-player-level').textContent = `Cấp ${this.state.player.level}`;
    const { exp, maxExp } = this.state.player;
    const bar = document.getElementById('hud-xp-bar');
    bar.max = maxExp;
    bar.value = exp;
    document.getElementById('hud-xp-text').textContent = `${exp}/${maxExp} EXP`;

    document.getElementById('hud-gold-val').textContent = this.state.player.gold.toLocaleString();
    document.getElementById('hud-gem-val').textContent = this.state.player.gems.toLocaleString();
    document.getElementById('hud-energy-val').textContent = `${this.state.player.energy}/${this.state.player.maxEnergy}`;
  }

  renderRightSidebar() {
    document.getElementById('stock-egg-val').textContent = this.state.inventory.products.egg;
    document.getElementById('stock-milk-val').textContent = this.state.inventory.products.milk;
    document.getElementById('stock-wool-val').textContent = this.state.inventory.products.wool;
    document.getElementById('stock-feed-val').textContent = this.state.inventory.feed;
  }

  renderHusbandryPens() {
    const types = ['chicken', 'cow', 'sheep'];
    types.forEach(type => {
      const pen = this.state.husbandry[type];
      const bubbleEl = document.getElementById(`bubble-${type}`);
      if (!bubbleEl) return;

      bubbleEl.className = `pen-card ${pen.state}`;
      bubbleEl.querySelector('.pen-name').textContent = `${pen.name} (${pen.count}/${this.penCapacity(type)})`;
      const titleEl = bubbleEl.querySelector('.bubble-title');
      const timeEl = bubbleEl.querySelector('.bubble-countdown');
      const progFillEl = bubbleEl.querySelector('.bubble-progress-fill');
      const action = bubbleEl.querySelector('.pen-action');
      action.disabled = false;

      if (pen.state === 'hungry') {
        titleEl.textContent = 'Đang đói';
        timeEl.textContent = '';
        action.textContent = 'Cho ăn';
        progFillEl.style.width = '0%';
      } else if (pen.state === 'producing') {
        titleEl.textContent = pen.product;
        timeEl.textContent = this.formatTimer(pen.timer);
        action.disabled = this.selectedTool !== 'fertilizer';
        action.textContent = action.disabled ? 'Đang sản xuất' : 'Bón phân';
        const duration = pen.cycleDuration || pen.produceTime;
        const pct = Math.max(0, Math.floor(((duration - pen.timer) / duration) * 100));
        progFillEl.style.width = `${pct}%`;
      } else if (pen.state === 'ready') {
        titleEl.textContent = pen.product;
        timeEl.textContent = 'Sẵn sàng';
        action.textContent = 'Thu hoạch';
        progFillEl.style.width = '100%';
      }
    });
  }

  formatTimer(seconds) {
    return NTVV_RULES.countdown(seconds);
  }

  renderCrops() {
    const field = document.getElementById('crops-field');
    this.state.plots.forEach((plot, index) => {
      let tile = field.children[index];
      if (!tile) {
        tile = document.createElement('button');
        tile.type = 'button';
        tile.dataset.index = index;
        tile.innerHTML = `
          <span class="crop-growth" aria-hidden="true"><img class="crop-illustration" alt="" draggable="false" hidden><span class="crop-fallback"></span></span>
          <span class="crop-badge">
            <span class="crop-icon" aria-hidden="true"></span>
            <span class="crop-details"><strong class="crop-name"></strong><span class="crop-status"></span></span>
          </span>
        `;
        field.appendChild(tile);
      }

      const data = FarmGame.CROPS_DATA[plot.type];
      const name = data?.name || 'Gieo hạt';
      let status = 'Ô đất trống';
      if (plot.state === 'growing') status = this.formatTimer(plot.timer);
      if (plot.state === 'ready') status = 'Gặt ngay';
      tile.className = `crop-plot ${plot.state}${plot.watered ? ' watered' : ''}`;
      tile.dataset.cropType = plot.type || '';
      const fraction = plot.timer / (plot.duration || 1);
      let phase = plot.state;
      if (plot.state === 'growing') phase = fraction > 0.72 ? 'seeded' : fraction > 0.35 ? 'sprout' : 'maturing';
      tile.dataset.phase = phase;
      const art = tile.querySelector('.crop-illustration');
      const fallback = tile.querySelector('.crop-fallback');
      const showArt = Boolean(data?.art && (phase === 'ready' || phase === 'maturing'));
      if (showArt && art.getAttribute('src') !== data.art) art.setAttribute('src', data.art);
      art.hidden = !showArt;
      fallback.hidden = showArt || phase === 'empty';
      fallback.textContent = { seeded: '· · ·', sprout: '🌱', maturing: '🌿', ready: data?.icon }[phase] || '';

      tile.querySelector('.crop-icon').textContent = data?.icon || '🌱';
      tile.querySelector('.crop-name').textContent = name;
      const statusLabel = tile.querySelector('.crop-status');
      statusLabel.className = `crop-status ${plot.state === 'ready' ? 'ready-harvest-badge' : 'crop-timer-badge'}`;
      statusLabel.textContent = status;
      tile.setAttribute('aria-label', `Ô ${index + 1}, ${name}, ${status}`);
    });
  }

  renderFarmStatus() {
    const crops = this.state.plots.filter(plot => plot.state === 'ready').length;
    const pens = Object.values(this.state.husbandry).filter(pen => pen.state === 'ready').length;
    const orders = this.state.orders.filter(order => this.canFulfillOrder(order)).length;
    document.getElementById('ready-crops').textContent = crops ? `${crops} ô thu hoạch được` : 'Chưa có cây chín';
    document.getElementById('ready-pens').textContent = pens ? `${pens} chuồng sẵn sàng` : 'Đang chăm sóc';
    document.getElementById('ready-orders').textContent = orders ? `${orders} đơn có thể giao ngay` : 'Chuẩn bị nông sản cho đơn tiếp theo.';
    const now = Date.now();
    const work = [
      ...this.state.plots.filter(plot => plot.state === 'growing').map(plot => plot.readyAt),
      ...Object.values(this.state.husbandry).filter(pen => pen.state === 'producing').map(pen => pen.readyAt),
      ...this.state.production.map(job => job.readyAt)
    ].filter(readyAt => readyAt > now);
    const batches = this.state.production.filter(job => job.readyAt <= now).length;
    document.getElementById('farm-ready-work').textContent = `${crops} ô ruộng · ${pens} chuồng · ${batches} mẻ xưởng đã xong`;
    document.getElementById('farm-next-work').textContent = work.length
      ? `Lượt tiếp theo sẵn sàng sau ${this.formatTimer(NTVV_RULES.remainingSeconds(Math.min(...work), now))}.`
      : '';
  }

  renderSeedPicker() {
    document.querySelectorAll('.seed-card').forEach(card => {
      const crop = card.dataset.crop;
      const data = FarmGame.CROPS_DATA[crop];
      const count = this.state.inventory.seeds[crop] || 0;
      const canResow = count < 1 && (this.state.inventory.crops[crop] || 0) > 0;
      const source = canResow ? 'Dùng 1 nông sản để gieo' : `${count} hạt trong kho`;
      const time = NTVV_RULES.formatDuration(data.duration);
      card.disabled = count < 1 && !canResow;
      card.setAttribute('aria-label', `${data.name}, ${source}, ${time}`);
      card.querySelector('.seed-stock').textContent = source;
      card.querySelector('.seed-time').textContent = time;
    });
  }

  // --- ACTIONS: CROPS & TOOLS ---

  handlePlotClick(index) {
    NTVV_RULES.syncFarm(this.state, Date.now());
    const plot = this.state.plots[index];

    // Tool logic
    if (this.selectedTool === 'water') {
      this.waterPlot(index);
      return;
    } else if (this.selectedTool === 'fertilizer') {
      this.fertilizePlot(index);
      return;
    }

    if (plot.state === 'empty') {
      this.selectedPlotIndex = index;
      this.openModal('modal-seed-picker');
    } else if (plot.state === 'ready') {
      this.harvestPlot(index);
    } else if (plot.state === 'growing') {
      window.soundEngine.playClick();
      this.showToast(`Đang lớn · còn ${NTVV_RULES.formatDuration(plot.timer)}`);
    }
  }

  waterPlot(index) {
    const now = Date.now();
    NTVV_RULES.syncFarm(this.state, now);
    const plot = this.state.plots[index];
    if (plot.state === 'growing' && !plot.watered) {
      plot.watered = true;
      plot.readyAt = NTVV_RULES.shortenByWater(plot.readyAt, now);
      NTVV_RULES.syncFarm(this.state, now);
      window.soundEngine.playWater();

      this.updateQuestProgress('water_crop', 1);
      this.addExp(2);
      this.saveState();
      this.showToast('💧 Đã tưới nước · +2 EXP');
      this.renderCrops();
    } else {
      this.showToast('Cây đã được tưới hoặc đã chín!');
    }
  }

  fertilizePlot(index) {
    NTVV_RULES.syncFarm(this.state, Date.now());
    const plot = this.state.plots[index];
    if (plot.state === 'growing') {
      if (this.state.inventory.fertilizer > 0 || this.state.player.gems >= 2) {
        if (this.state.inventory.fertilizer > 0) {
          this.state.inventory.fertilizer--;
        } else {
          this.state.player.gems -= 2;
        }
        plot.timer = 0;
        plot.readyAt = null;
        plot.state = 'ready';
        window.soundEngine.playHarvest();

        this.saveState();
        this.showToast('✨ Chín ngay lập tức!');
        this.renderAll();
      } else {
        this.showToast('Hết Phân Bón! Cần 2 Kim Cương');
      }
    }
  }

  plantCrop(cropType) {
    const now = Date.now();
    NTVV_RULES.syncFarm(this.state, now);
    const cropData = FarmGame.CROPS_DATA[cropType];
    if (!cropData || this.selectedPlotIndex === null) return;
    const { seeds, crops } = this.state.inventory;
    const source = seeds[cropType] > 0 ? seeds : crops;
    if (!(source[cropType] > 0)) {
      this.showToast('Cần hạt giống hoặc một nông sản cùng loại để gieo.');
      return;
    }

    if (this.state.player.energy <= 0) {
      this.showToast('Hết thể lực. Thể lực tự hồi khi bạn nghỉ.');
      return;
    }

    const plot = this.state.plots[this.selectedPlotIndex];
    if (plot.state !== 'empty') return;
    source[cropType]--;
    plot.type = cropType;
    plot.state = 'growing';
    plot.duration = cropData.duration;
    plot.timer = cropData.duration;
    plot.readyAt = NTVV_RULES.deadline(now, cropData.duration);
    plot.watered = false;

    this.state.player.energy = Math.max(0, this.state.player.energy - 1);
    window.soundEngine.playPlant();
    this.closeModal('modal-seed-picker');
    this.renderAll();

    this.updateQuestProgress('plant_crop', 1);
    this.addExp(2);
    this.saveState();
    this.showToast(`Gieo ${cropData.name} · +2 EXP`);
  }

  harvestPlot(index) {
    NTVV_RULES.syncFarm(this.state, Date.now());
    const plot = this.state.plots[index];
    if (plot.state !== 'ready') return;

    const cropData = FarmGame.CROPS_DATA[plot.type] || FarmGame.CROPS_DATA.wheat;
    const yieldAmount = 2;

    this.state.inventory.crops[plot.type] = (this.state.inventory.crops[plot.type] || 0) + yieldAmount;
    this.addExp(cropData.exp);
    this.updateQuestProgress('harvest_crop', 1);

    plot.state = 'empty';
    plot.type = null;
    plot.timer = 0;
    plot.readyAt = null;
    plot.watered = false;

    window.soundEngine.playHarvest();

    this.saveState();
    this.showToast(`+${yieldAmount} ${cropData.name} · +${cropData.exp} EXP`);

    this.renderAll();
  }

  // --- ACTIONS: HUSBANDRY ---

  feedAllPens() {
    const now = Date.now();
    NTVV_RULES.syncFarm(this.state, now);
    window.soundEngine.playClick();
    let fedCount = 0;
    const types = ['chicken', 'cow', 'sheep'];

    types.forEach(type => {
      const pen = this.state.husbandry[type];
      if (pen.state === 'hungry') {
        if (this.state.inventory.feed >= pen.feedCost) {
          this.state.inventory.feed -= pen.feedCost;
          pen.state = 'producing';
          pen.timer = pen.produceTime;
          pen.cycleDuration = pen.produceTime;
          pen.readyAt = NTVV_RULES.deadline(now, pen.produceTime);
          fedCount++;
          this.triggerFeedSound(type);
        }
      }
    });

    if (fedCount > 0) {
      this.updateQuestProgress('feed_animal', fedCount);
      this.addExp(5 * fedCount);
      this.saveState();
      this.renderAll();
      this.showToast(`Đã cho ăn ${fedCount} chuồng · +${5 * fedCount} EXP`);
    } else {
      if (this.state.inventory.feed <= 0) {
        this.openModal('modal-craft-feed');
        this.showToast('Hết thức ăn! Hãy chế biến thêm');
      } else {
        this.showToast('Các chuồng đang sản xuất hoặc sẵn sàng!');
      }
    }
  }

  harvestAllPens() {
    NTVV_RULES.syncFarm(this.state, Date.now());
    window.soundEngine.playHarvest();
    let totalHarvested = 0;
    let earnedExp = 0;
    const types = ['chicken', 'cow', 'sheep'];

    types.forEach(type => {
      const pen = this.state.husbandry[type];
      if (pen.state === 'ready') {
        const productKey = pen.type === 'chicken' ? 'egg' : (pen.type === 'cow' ? 'milk' : 'wool');
        const yieldAmount = pen.yield;

        this.state.inventory.products[productKey] += yieldAmount;
        const animalInfo = FarmGame.ANIMAL_DATA[pen.type];
        earnedExp += animalInfo.exp * yieldAmount;

        pen.state = 'hungry';
        pen.timer = 0;
        totalHarvested++;

        if (pen.type === 'chicken') {
          this.updateQuestProgress('harvest_egg', yieldAmount);
        }

      }
    });

    if (totalHarvested > 0) {
      this.updateQuestProgress('harvest_pen', totalHarvested);
      this.addExp(earnedExp);
      this.saveState();
      this.showToast(`Đã thu hoạch ${totalHarvested} chuồng.`);
      this.renderAll();
    } else {
      this.showToast('Chưa có chuồng nào hoàn thành sản xuất!');
    }
  }

  handlePenClick(type) {
    const now = Date.now();
    NTVV_RULES.syncFarm(this.state, now);
    const pen = this.state.husbandry[type];
    if (this.selectedTool === 'fertilizer' && pen.state === 'producing') {
      if (this.state.inventory.fertilizer > 0 || this.state.player.gems >= 2) {
        if (this.state.inventory.fertilizer > 0) this.state.inventory.fertilizer--;
        else this.state.player.gems -= 2;
        pen.timer = 0;
        pen.readyAt = null;
        pen.state = 'ready';
        window.soundEngine.playHarvest();
        this.saveState();
        this.showToast('✨ Sản xuất hoàn thành ngay!');
        this.renderAll();
        return;
      }
    }

    if (pen.state === 'ready') {
      window.soundEngine.playHarvest();
      const productKey = pen.type === 'chicken' ? 'egg' : (pen.type === 'cow' ? 'milk' : 'wool');
      this.state.inventory.products[productKey] += pen.yield;
      const animalInfo = FarmGame.ANIMAL_DATA[pen.type];
      this.addExp(animalInfo.exp * pen.yield);

      if (pen.type === 'chicken') this.updateQuestProgress('harvest_egg', pen.yield);

      pen.state = 'hungry';
      pen.timer = 0;
      this.updateQuestProgress('harvest_pen', 1);
      this.saveState();

      this.showToast(`+${pen.yield} ${pen.product} · +${animalInfo.exp * pen.yield} EXP`);
      this.renderAll();
    } else if (pen.state === 'hungry') {
      if (this.state.inventory.feed >= pen.feedCost) {
        this.state.inventory.feed -= pen.feedCost;
        pen.state = 'producing';
        pen.timer = pen.produceTime;
        pen.cycleDuration = pen.produceTime;
        pen.readyAt = NTVV_RULES.deadline(now, pen.produceTime);
        this.triggerFeedSound(type);
        this.updateQuestProgress('feed_animal', 1);
        this.addExp(5);
        this.saveState();

        this.showToast(`Đã cho ăn · +5 EXP`);
        this.renderAll();
      } else {
        this.openModal('modal-craft-feed');
        this.showToast('Hết thức ăn!');
      }
    } else {
      this.triggerAnimalSound(type);
      this.showToast(`Đang sản xuất · còn ${NTVV_RULES.formatDuration(pen.timer)}`);
    }
  }

  triggerFeedSound(type) {
    window.soundEngine.playFeed();
    this.triggerAnimalSound(type);
  }

  triggerAnimalSound(type) {
    if (type === 'chicken') window.soundEngine.playChicken();
    else if (type === 'cow') window.soundEngine.playCow();
    else if (type === 'sheep') window.soundEngine.playSheep();
  }

  // --- FISHING SYSTEM (CÂU CÁ TẠI BẾN SÔNG) ---

  openFishingModal() {
    this.resetFishing();
    this.openModal('modal-fishing');
  }

  resetFishing() {
    clearTimeout(this.fishingTimer);
    clearTimeout(this.biteTimeout);
    this.fishingState = 'idle';
    document.getElementById('fishing-bite-alert').style.display = 'none';
    document.getElementById('btn-cast-rod').textContent = '🎣 Quăng Cần Câu (Tốn 2 Thể Lực)';
    document.getElementById('btn-cast-rod').disabled = false;
    document.getElementById('btn-cast-rod').style.background = '';
  }

  castFishingRod() {
    NTVV_RULES.syncFarm(this.state, Date.now());
    if (this.fishingState !== 'idle') return;

    if (this.state.player.energy < 2) {
      this.showToast('Hết thể lực để câu cá!');
      return;
    }

    this.state.player.energy -= 2;
    this.renderHeader();

    this.fishingState = 'waiting';
    window.soundEngine.playSplash();

    const btn = document.getElementById('btn-cast-rod');
    btn.textContent = '⏳ Đang chờ cá cắn câu...';
    btn.disabled = true;

    // Random wait between 2 to 4.5 seconds
    const waitTime = 2000 + Math.random() * 2500;
    this.fishingTimer = setTimeout(() => {
      this.triggerFishBite();
    }, waitTime);
  }

  triggerFishBite() {
    if (this.fishingState !== 'waiting') return;
    this.fishingState = 'bite';

    window.soundEngine.playReel();
    const alertBox = document.getElementById('fishing-bite-alert');
    alertBox.style.display = 'block';

    const btn = document.getElementById('btn-cast-rod');
    btn.textContent = '💥 GIẬT CẦN NGAY!';
    btn.disabled = false;
    btn.style.background = 'linear-gradient(180deg, #e74c3c, #c0392b)';

    // Must click within 1.8 seconds or fish escapes
    this.biteTimeout = setTimeout(() => {
      if (this.fishingState === 'bite') {
        this.fishingState = 'idle';
        alertBox.style.display = 'none';
        btn.textContent = '💨 Cá đã đớp mồi bơi mất! Thử lại';
        btn.style.background = '';
        btn.disabled = false;
      }
    }, 1800);
  }

  reelInFish() {
    if (this.fishingState === 'bite') {
      clearTimeout(this.biteTimeout);
      this.fishingState = 'idle';
      document.getElementById('fishing-bite-alert').style.display = 'none';

      // Roll fish reward
      const rand = Math.random();
      let caught = FarmGame.FISH_DATA.carp;
      if (rand < 0.10) caught = FarmGame.FISH_DATA.prawn;
      else if (rand < 0.30) caught = FarmGame.FISH_DATA.salmon;
      else if (rand < 0.60) caught = FarmGame.FISH_DATA.tilapia;

      // Add to inventory
      const fishKey = Object.keys(FarmGame.FISH_DATA).find(k => FarmGame.FISH_DATA[k] === caught);
      this.state.inventory.fish[fishKey] = (this.state.inventory.fish[fishKey] || 0) + 1;
      this.addExp(caught.exp);
      this.updateQuestProgress('catch_fish', 1);
      this.saveState();

      window.soundEngine.playHarvest();
      this.spawnCelebrationConfetti();

      const btn = document.getElementById('btn-cast-rod');
      btn.textContent = `🎉 Câu được ${caught.name}! (+${caught.exp} EXP)`;
      btn.style.background = '';
      btn.disabled = false;

      this.showToast(`+1 ${caught.icon} ${caught.name}`);
      this.renderAll();
    } else if (this.fishingState === 'idle') {
      this.castFishingRod();
    }
  }

  // --- LUCKY WHEEL (VÒNG QUAY MAY MẮN) ---

  drawWheel() {
    const canvas = document.getElementById('wheel-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const numSectors = FarmGame.WHEEL_PRIZES.length;
    const arc = (2 * Math.PI) / numSectors;
    const radius = 160;

    ctx.clearRect(0, 0, 320, 320);

    const colors = ['#f39c12', '#3498db', '#2ecc71', '#9b59b6', '#e74c3c', '#1abc9c', '#e67e22', '#f1c40f'];

    FarmGame.WHEEL_PRIZES.forEach((prize, i) => {
      const angle = i * arc;
      ctx.beginPath();
      ctx.fillStyle = colors[i % colors.length];
      ctx.moveTo(160, 160);
      ctx.arc(160, 160, radius, angle, angle + arc);
      ctx.lineTo(160, 160);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Text and Icon
      ctx.save();
      ctx.translate(160, 160);
      ctx.rotate(angle + arc / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px Segoe UI, sans-serif';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 3;
      ctx.fillText(`${prize.icon} ${prize.label}`, radius - 15, 5);
      ctx.restore();
    });
  }

  spinWheel() {
    if (this.isSpinning) return;

    if (!this.state.freeSpinAvailable && this.state.player.gems < 10) {
      this.showToast('Cần 10 Kim Cương để quay thêm!');
      return;
    }

    this.isSpinning = true;
    const canvas = document.getElementById('wheel-canvas');
    const spinButton = document.getElementById('btn-spin-wheel');
    const result = document.getElementById('wheel-result');
    const winningIndex = Math.floor(Math.random() * FarmGame.WHEEL_PRIZES.length);
    const sectorAngle = 360 / FarmGame.WHEEL_PRIZES.length;
    // Drawing starts at 3 o'clock. The pointer sits at 12 o'clock (270 degrees).
    const target = 270 - (winningIndex + 0.5) * sectorAngle;
    const remaining = ((target - this.wheelRotation) % 360 + 360) % 360;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const spinDuration = reduceMotion ? 0 : 4000;
    this.wheelRotation += (reduceMotion ? 0 : 5 * 360) + remaining;
    canvas.style.transitionDuration = `${spinDuration}ms`;
    canvas.style.transform = `rotate(${this.wheelRotation}deg)`;
    spinButton.disabled = true;
    result.textContent = 'Đang quay…';

    let tickCount = 0;
    const tickInterval = reduceMotion ? null : setInterval(() => {
      window.soundEngine.playWheelTick();
      if (++tickCount >= 25) clearInterval(tickInterval);
    }, 120);

    setTimeout(() => {
      clearInterval(tickInterval);
      this.isSpinning = false;
      if (this.state.freeSpinAvailable) this.state.freeSpinAvailable = false;
      else this.state.player.gems -= 10;
      const prize = FarmGame.WHEEL_PRIZES[winningIndex];
      result.textContent = `Trúng ${prize.icon} ${prize.label}`;
      spinButton.disabled = false;
      this.awardWheelPrize(prize);
      this.saveState();
    }, spinDuration);
  }

  awardWheelPrize(prize) {
    if (prize.type === 'gold') this.state.player.gold += prize.val;
    else if (prize.type === 'gem') this.state.player.gems += prize.val;
    else if (prize.type === 'energy') this.state.player.energy = Math.min(this.state.player.maxEnergy, this.state.player.energy + prize.val);
    else if (prize.type === 'feed') this.state.inventory.feed += prize.val;
    else if (prize.type === 'fertilizer') this.state.inventory.fertilizer += prize.val;
    else if (prize.type === 'crop') this.state.inventory.crops[prize.cropKey] = (this.state.inventory.crops[prize.cropKey] || 0) + prize.val;
    else if (prize.type === 'chest') {
      this.state.player.gold += prize.val.gold;
      this.state.player.gems += prize.val.gem;
    }

    window.soundEngine.playLevelUp();
    this.spawnCelebrationConfetti();
    this.updateQuestProgress('spin_wheel', 1);
    this.showToast(`Trúng thưởng: ${prize.icon} ${prize.label}!`);
    this.renderAll();
  }

  // --- FARM DOG PET ---

  petFarmDog() {
    window.soundEngine.playDogBark();
    const dog = document.getElementById('farm-dog-pet');
    if (dog) {
      dog.style.transform = 'scale(1.3) translateY(-10px)';
      setTimeout(() => dog.style.transform = '', 250);
    }

    const now = Date.now();
    if (now >= (this.state.dogNextFindAt || 0)) {
      this.state.dogNextFindAt = NTVV_RULES.deadline(now, 1800);
      if (Math.random() < 0.4) {
        this.state.player.gold += 50;
        window.soundEngine.playCoin();
        this.showToast('🐕 Chó Vàng tìm được 50 vàng!');
      } else {
        this.showToast('🐕 Chó Vàng vui vì được vuốt ve.');
      }
      this.saveState();
    } else {
      this.showToast('🐕 Chó Vàng vui vì được vuốt ve.');
    }
    this.renderHeader();
  }

  // --- DAY / NIGHT & WEATHER SYSTEMS ---

  cycleTimeOfDay() {
    const overlay = document.getElementById('day-night-overlay');
    if (this.activeTimeOfDay === 'day') {
      this.activeTimeOfDay = 'sunset';
      overlay.className = 'sunset';
      this.showToast('🌅 Hoàng hôn ấm áp');
    } else if (this.activeTimeOfDay === 'sunset') {
      this.activeTimeOfDay = 'night';
      overlay.className = 'night';
      this.showToast('🌙 Màn đêm lung linh ánh đom đóm');
    } else {
      this.activeTimeOfDay = 'day';
      overlay.className = '';
      this.showToast('☀️ Ngày mới tràn ngập ánh nắng');
    }
  }

  toggleWeather() {
    this.isRaining = !this.isRaining;
    if (this.isRaining) window.soundEngine.playWater();
    this.showToast(this.isRaining ? '🌧️ Mưa phùn trên nông trại.' : '☀️ Trời đã tạnh.');
  }

  // --- PROGRESSION & ORDERS ---

  addExp(amount) {
    if (!Number.isSafeInteger(amount) || amount < 0) return;
    const player = this.state.player;
    const previousLevel = player.level;
    let gold = 0;
    let gems = 0;
    player.exp = Math.min(Number.MAX_SAFE_INTEGER, player.exp + amount);
    while (player.exp >= player.maxExp) {
      player.exp -= player.maxExp;
      player.level++;
      player.maxExp = FarmGame.experienceForLevel(player.level);
      const legacy = this.state.campaign.legacyRecipes;
      gold += legacy ? 1000 : 150 + player.level * 35;
      gems += legacy ? 10 : 1 + Math.floor(player.level / 8);
    }

    if (player.level > previousLevel) {
      player.energy = player.maxEnergy;
      this.state.energySeconds = 0;
      player.gold += gold;
      player.gems += gems;
      this.showLevelUp(previousLevel, gold, gems);
    }
    this.renderHeader();
    if (this.activeScene?.dataset.scene === 'levels') this.renderLevels();
  }

  showLevelUp(previous, gold, gems) {
    const { level } = this.state.player;
    document.getElementById('lvlup-level-num').textContent = String(level);
    document.getElementById('lvlup-reward').textContent = `🪙 +${gold} vàng · 💎 +${gems} kim cương · Hồi đầy thể lực`;
    const list = document.getElementById('lvlup-unlocks');
    list.replaceChildren();
    this.appendUnlocks(list, FarmGame.LEVEL_UNLOCKS.filter(unlock => unlock.level > previous && unlock.level <= level));
    list.hidden = list.childElementCount === 0;

    window.soundEngine.playLevelUp();
    this.spawnCelebrationConfetti();
    this.openModal('modal-level-up');
  }

  appendUnlocks(list, unlocks) {
    for (const unlock of unlocks) {
      const item = document.createElement('li');
      item.textContent = unlock.label;
      list.appendChild(item);
    }
  }

  renderLevels() {
    const { level, exp, maxExp } = this.state.player;
    document.getElementById('level-current').textContent = `Cấp ${level}`;
    const bar = document.getElementById('scene-xp-bar');
    bar.max = maxExp;
    bar.value = exp;
    document.getElementById('level-xp-detail').textContent = `${exp}/${maxExp} EXP · Còn ${maxExp - exp} EXP đến cấp ${level + 1}.`;

    const milestones = FarmGame.LEVEL_UNLOCKS;
    const next = milestones.find(unlock => unlock.level > level);
    document.getElementById('level-next-unlock').textContent = next
      ? `Mở khóa tiếp theo ở cấp ${next.level}.`
      : 'Đã mở toàn bộ mốc tính năng hiện có.';
    const list = document.getElementById('level-unlocks');
    list.replaceChildren();
    for (const rank of new Set(milestones.map(unlock => unlock.level))) {
      const row = document.createElement('li');
      row.className = rank <= level ? 'level-unlock unlocked' : 'level-unlock';
      const title = document.createElement('strong');
      title.textContent = `Cấp ${rank}`;
      const details = document.createElement('ul');
      this.appendUnlocks(details, milestones.filter(unlock => unlock.level === rank));
      const status = document.createElement('span');
      status.textContent = rank <= level ? 'Đã mở' : 'Chưa mở';
      row.append(title, details, status);
      list.appendChild(row);
    }
  }

  cropPurchaseLevel(key) {
    return FarmGame.LEVEL_UNLOCKS.find(unlock => unlock.crop === key)?.level || 1;
  }

  penCapacity(type) {
    const pen = this.state.husbandry[type];
    const opened = FarmGame.LEVEL_UNLOCKS
      .filter(unlock => unlock.animal === type && unlock.level <= this.state.player.level)
      .at(-1);
    return Math.min(pen.max, Math.max(pen.count, opened?.capacity ?? FarmGame.START_PEN_CAPACITY[type]));
  }

  sellItem(category, key, amount) {
    const stock = this.state.inventory[category]?.[key] || 0;
    if (stock < amount || amount <= 0) return;

    let pricePerUnit = 20;
    if (category === 'products') {
      const animal = Object.values(FarmGame.ANIMAL_DATA).find(a => a.product === key);
      pricePerUnit = animal ? animal.sellPrice : 50;
    } else if (category === 'crops') {
      pricePerUnit = FarmGame.CROPS_DATA[key]?.sellPrice || 30;
    } else if (category === 'fish') {
      pricePerUnit = FarmGame.FISH_DATA[key]?.sellPrice || 100;
    } else if (category === 'processed') {
      pricePerUnit = FarmGame.RECIPES[key]?.sellPrice || 200;
    }

    const earnedGold = pricePerUnit * amount;
    this.state.inventory[category][key] -= amount;
    this.state.player.gold += earnedGold;
    this.updateQuestProgress('sell_item', amount);
    this.saveState();

    window.soundEngine.playCoin();
    this.showToast(`+${earnedGold} Vàng`);

    this.renderAll();
    this.renderWarehouse();
  }

  goodsStores() {
    const { products, crops, processed } = this.state.inventory;
    return [products, crops, processed];
  }

  orderStock(item) {
    return this.goodsStores().reduce((total, stock) => total + (stock[item] || 0), 0);
  }

  takeGoods(item, amount) {
    let remaining = amount;
    for (const stock of this.goodsStores()) {
      const portion = Math.min(stock[item] || 0, remaining);
      if (portion > 0) stock[item] -= portion;
      remaining -= portion;
    }
  }

  canFulfillOrder(order) {
    return !order.pendingUntil && Object.entries(order.req).every(([item, needed]) => this.orderStock(item) >= needed);
  }

  discardOrder(orderId) {
    const order = this.state.orders.find(item => item.id === orderId);
    if (!order || order.pendingUntil) return;
    order.pendingUntil = NTVV_RULES.deadline(Date.now(), NTVV_RULES.ORDER_REPLACEMENT_SECONDS);
    this.saveState();
    this.renderFarmStatus();
    this.renderOrders();
    this.showToast('Đã bỏ đơn. Đơn mới sẽ tới sau 3 phút.');
  }

  refreshOrderBoard(now) {
    const arrived = this.state.orders.filter(order => order.pendingUntil && order.pendingUntil <= now);
    if (!arrived.length) return;
    for (const order of arrived) this.generateNewOrder(order.id);
    this.saveState();
    if (this.activeScene?.dataset.scene === 'orders') this.renderOrders();
  }

  fulfillOrder(orderId) {
    const order = this.state.orders.find(o => o.id === orderId);
    if (!order) return;

    if (!this.canFulfillOrder(order)) {
      this.showToast('Chưa đủ nông sản để giao đơn.');
      return;
    }

    for (const [item, needed] of Object.entries(order.req)) {
      this.takeGoods(item, needed);
    }

    this.state.player.gold += order.reward.gold;
    this.state.player.gems += order.reward.gem || 0;
    this.addExp(order.reward.exp);

    window.soundEngine.playCoin();
    this.showToast(`Giao hàng thành công! +${order.reward.gold} 🪙`);

    this.updateQuestProgress('deliver_order', 1);
    if (Object.keys(order.req).some(key => FarmGame.RECIPES[key]?.category === 'processed')) {
      this.updateQuestProgress('deliver_processed', 1);
    }
    this.generateNewOrder(orderId);
    this.saveState();
    this.renderAll();
    this.renderOrders();
  }

  generateNewOrder(orderId) {
    const index = this.state.orders.findIndex(order => order.id === orderId);
    if (index < 0) return;
    const fieldOrders = [
      { npc: 'Bác Ba Nông Dân', avatar: '👨‍🌾', req: { wheat: 4, egg: 2 }, reward: { gold: 190, exp: 30 } },
      { npc: 'Bé Na', avatar: '👧', req: { carrot: 2, milk: 1 }, reward: { gold: 190, exp: 35 } },
      { npc: 'Chú Tư Bán Hàng', avatar: '🤵', req: { corn: 3, tomato: 2 }, reward: { gold: 290, exp: 40 } }
    ];
    const workshopOrders = [
      { npc: 'Cô Lan Bếp Trưởng', avatar: '👩‍🍳', req: { bread: 1, wheat: 2 }, reward: { gold: 335, exp: 45 } },
      { npc: 'Chú Tư Bán Hàng', avatar: '🤵', req: { cheese: 1, carrot: 2 }, reward: { gold: 520, exp: 60 } },
      { npc: 'Bác Thợ Dệt Kim', avatar: '👴', req: { woolenSweater: 1, corn: 2 }, reward: { gold: 895, exp: 80 } }
    ].filter(order => Object.keys(order.req).every(key => this.recipeUnlocked(key)));

    const catalog = index === this.state.orders.length - 1
      ? workshopOrders
      : fieldOrders.filter(order => Object.keys(order.req).every(key =>
        this.state.player.level >= this.cropPurchaseLevel(key)));

    const previous = this.state.orders[index].npc;
    const alternatives = catalog.filter(order => order.npc !== previous);
    const options = alternatives.length ? alternatives : catalog;
    const choice = options[Math.floor(Math.random() * options.length)];
    this.state.orders[index] = { id: orderId, ...choice };
  }

  recipeUnlocked(key) {
    const chapter = FarmGame.RECIPES[key]?.chapter || 0;
    return this.state.campaign.legacyRecipes || this.state.campaign.chapter >= chapter;
  }

  productionCapacity() {
    const levelBonus = FarmGame.LEVEL_UNLOCKS.reduce((slots, unlock) =>
      slots + (unlock.level <= this.state.player.level ? (unlock.workshopSlots || 0) : 0), 0);
    return 2 + Number(this.state.campaign.chapter >= 3) + levelBonus;
  }

  queueRecipe(recipeKey) {
    const recipe = FarmGame.RECIPES[recipeKey];
    if (!recipe || !this.recipeUnlocked(recipeKey)) return false;
    if (this.state.production.length >= this.productionCapacity()) {
      this.showToast('Xưởng hết ô. Nhận thành phẩm để giải phóng ô.');
      return false;
    }
    if (Object.entries(recipe.req).some(([key, amount]) => this.orderStock(key) < amount)) {
      this.showToast(`Thiếu nguyên liệu để làm ${recipe.name}.`);
      return false;
    }

    for (const [key, amount] of Object.entries(recipe.req)) {
      this.takeGoods(key, amount);
    }
    const startsAt = Math.max(Date.now(), this.state.production.at(-1)?.readyAt || 0);
    this.state.production.push({
      id: this.state.nextJobId++,
      recipe: recipeKey,
      startsAt,
      readyAt: NTVV_RULES.deadline(startsAt, recipe.time)
    });
    this.saveState();
    this.renderAll();
    this.renderWorkshop();
    this.showToast(`Đã xếp ${recipe.name} vào xưởng.`);
    return true;
  }

  collectProduction(jobId) {
    const index = this.state.production.findIndex(job => job.id === jobId);
    if (index < 0 || this.state.production[index].readyAt > Date.now()) return;
    const [job] = this.state.production.splice(index, 1);
    const recipe = FarmGame.RECIPES[job.recipe];
    if (recipe.category === 'feed') {
      this.state.inventory.feed += recipe.yield;
    } else {
      this.state.inventory.processed[job.recipe] = (this.state.inventory.processed[job.recipe] || 0) + recipe.yield;
    }
    this.updateQuestProgress('collect_batch', 1);
    this.updateQuestProgress(`collect_${job.recipe}`, 1);
    this.addExp(recipe.exp || 15);
    this.saveState();
    window.soundEngine.playHarvest();
    this.renderAll();
    this.renderWorkshop();
    this.showToast(`Đã nhập kho: ${recipe.name}.`);
  }

  buyAnimal(type) {
    const data = FarmGame.ANIMAL_DATA[type];
    const pen = this.state.husbandry[type];
    if (!data || !pen) return;

    if (pen.count >= this.penCapacity(type)) {
      this.showToast(`${pen.name} đã đủ chỗ ở cấp hiện tại.`);
      return;
    }

    if (this.state.player.gold < data.cost) {
      this.showToast(`Không đủ vàng để mua ${data.name}!`);
      return;
    }

    this.state.player.gold -= data.cost;
    pen.count++;
    pen.yield = pen.count;
    this.saveState();

    window.soundEngine.playCoin();
    this.triggerAnimalSound(type);
    this.showToast(`Mua thành công 1 ${data.name}!`);

    this.renderAll();
    this.renderBuyAnimalsModal();
  }

  buySeeds(cropKey, amount = 5) {
    const crop = FarmGame.CROPS_DATA[cropKey];
    if (!crop || !Number.isSafeInteger(amount) || amount <= 0) return;
    const level = this.cropPurchaseLevel(cropKey);
    if (this.state.player.level < level) {
      this.showToast(`Cần cấp ${level} để mua hạt ${crop.name.toLowerCase()}.`);
      return;
    }
    const totalCost = crop.seedCost * amount;

    if (this.state.player.gold < totalCost) {
      this.showToast('Không đủ vàng!');
      return;
    }

    this.state.player.gold -= totalCost;
    this.state.inventory.seeds[cropKey] = (this.state.inventory.seeds[cropKey] || 0) + amount;
    this.saveState();

    window.soundEngine.playCoin();
    this.showToast(`+${amount} Hạt giống ${crop.name}`);
    this.renderAll();
    this.renderShop();
  }

  refreshDaily(now = new Date()) {
    const year = now.getFullYear();
    const month = now.getMonth();
    const day = now.getDate();
    const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    if (this.state.daily && key <= this.state.daily.date) return false;
    const dayIndex = Math.floor(Date.UTC(year, month, day) / 86400000);
    const rotation = FarmGame.DAILY[dayIndex % FarmGame.DAILY.length];
    this.state.daily = {
      date: key,
      tasks: rotation.map((quest, index) => ({
        ...quest, id: `daily-${key}-${index}`, current: 0, claimed: false
      }))
    };
    return true;
  }

  chapterTasks() {
    const campaign = this.state.campaign;
    const chapter = FarmGame.CAMPAIGN[campaign.chapter];
    return (chapter?.tasks || []).map(quest => ({
      ...quest,
      current: campaign.progress[quest.id] || 0,
      claimed: campaign.claimed.includes(quest.id)
    }));
  }

  updateQuestProgress(type, amount) {
    this.refreshDaily();
    const campaign = this.state.campaign;
    for (const quest of this.chapterTasks()) {
      if (quest.type === type && !quest.claimed) {
        campaign.progress[quest.id] = Math.min(quest.target, quest.current + amount);
      }
    }
    for (const quest of [...this.state.daily.tasks, ...this.state.quests]) {
      if (quest.type === type && !quest.claimed) {
        quest.current = Math.min(quest.target, quest.current + amount);
      }
    }
    this.renderQuestShortcut();
    if (this.activeScene?.dataset.scene === 'quests') this.renderQuests();
  }

  giveQuestReward({ gold = 0, gem = 0, exp = 0, seeds = 0 }) {
    this.state.player.gold += gold;
    this.state.player.gems += gem;
    this.state.inventory.seeds.wheat = (this.state.inventory.seeds.wheat || 0) + seeds;
    if (exp) this.addExp(exp);
  }

  claimQuest(questId) {
    this.refreshDaily();
    const campaign = this.state.campaign;
    const current = this.chapterTasks();
    const isChapter = current.some(quest => quest.id === questId);
    const active = isChapter ? current : [...this.state.daily.tasks, ...this.state.quests];
    const quest = active.find(item => item.id === questId);
    if (!quest || quest.claimed || quest.current < quest.target) return;

    if (isChapter) campaign.claimed.push(quest.id);
    else quest.claimed = true;
    this.giveQuestReward(quest.reward);

    let message = 'Đã nhận thưởng nhiệm vụ.';
    if (isChapter && current.every(item => campaign.claimed.includes(item.id))) {
      const finished = FarmGame.CAMPAIGN[campaign.chapter];
      campaign.chapter++;
      this.giveQuestReward(finished.reward);
      const finishText = campaign.legacyRecipes && finished.legacyFinish || finished.finish;
      message = `Hoàn thành ${finished.name}. ${finishText}`;
    }
    this.saveState();
    window.soundEngine.playCoin();
    this.renderAll();
    this.renderQuests();
    this.showToast(message);
  }

  // --- GAME LOOPS & TIMERS ---

  startMainLoop() {
    setInterval(() => this.tick(), 1000);
  }

  tick() {
    const now = Date.now();
    NTVV_RULES.syncFarm(this.state, now);
    this.refreshOrderBoard(now);
    document.querySelectorAll('#orders-list-wrap [data-order-ready-at]').forEach(label => {
      label.textContent = this.formatTimer(NTVV_RULES.remainingSeconds(Number(label.dataset.orderReadyAt), now));
    });
    this.renderHusbandryPens();
    this.renderCrops();
    this.renderFarmStatus();
    document.getElementById('hud-energy-val').textContent = `${this.state.player.energy}/${this.state.player.maxEnergy}`;
    if (this.activeScene?.dataset.scene === 'workshop') this.updateProductionTimers(now);
    if (this.refreshDaily()) {
      this.saveState();
      this.renderQuestShortcut();
      if (this.activeScene?.dataset.scene === 'quests') this.renderQuests();
    }
  }

  // --- FX CANVAS (PARTICLES & RAIN) ---

  setupFXCanvas() {
    this.canvas = document.getElementById('fx-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = 1672;
    this.canvas.height = 941;

    // Initialize rain drops
    for (let i = 0; i < 70; i++) {
      this.rainDrops.push({
        x: Math.random() * 1672,
        y: Math.random() * 941,
        length: 15 + Math.random() * 10,
        speed: 12 + Math.random() * 8
      });
    }

    let hadEffects = false;
    const renderLoop = () => {
      const hasEffects = this.isRaining || this.particles.length > 0;
      if (hasEffects || hadEffects) this.updateAndDrawFX();
      hadEffects = hasEffects;
      requestAnimationFrame(renderLoop);
    };
    requestAnimationFrame(renderLoop);
  }

  showToast(text) {
    const toast = document.getElementById('game-toast');
    toast.classList.toggle('over-dialog', Boolean(this.activeModal));
    toast.textContent = text;
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => { toast.textContent = ''; }, 2600);
  }

  spawnCelebrationConfetti() {
    for (let i = 0; i < 80; i++) {
      this.particles.push({
        x: 836,
        y: 470,
        vx: (Math.random() - 0.5) * 16,
        vy: (Math.random() - 0.7) * 18,
        color: ['#f5b800', '#37af2b', '#2b8cee', '#e84118', '#9c88ff'][Math.floor(Math.random() * 5)],
        size: 6 + Math.random() * 8,
        alpha: 1.0,
        gravity: 0.35,
        life: 80
      });
    }
  }

  updateAndDrawFX() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, 1672, 941);

    // Draw Rain if active
    if (this.isRaining) {
      this.ctx.save();
      this.ctx.strokeStyle = 'rgba(174, 214, 241, 0.45)';
      this.ctx.lineWidth = 1.5;
      this.rainDrops.forEach(drop => {
        this.ctx.beginPath();
        this.ctx.moveTo(drop.x, drop.y);
        this.ctx.lineTo(drop.x - 3, drop.y + drop.length);
        this.ctx.stroke();

        drop.y += drop.speed;
        drop.x -= 1.5;
        if (drop.y > 941) {
          drop.y = -20;
          drop.x = Math.random() * 1672;
        }
      });
      this.ctx.restore();
    }

    // Draw Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.alpha -= 0.015;
      p.life--;

      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0, p.alpha);
      this.ctx.fillStyle = p.color;
      this.ctx.fillRect(p.x, p.y, p.size, p.size);
      this.ctx.restore();

      if (p.life <= 0 || p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }

  }

  // --- MODALS & MENUS ---

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal || this.activeModal === modal) return;
    const trigger = this.modalTrigger || document.activeElement;
    if (this.activeModal) this.closeModal(this.activeModal.id, false);
    window.soundEngine.playClick();
    this.activeModal = modal;
    this.modalTrigger = trigger;
    modal.classList.add('open');
    modal.setAttribute('aria-modal', 'true');
    document.getElementById('game-viewport').inert = true;
    document.body.style.overflow = 'hidden';

    if (modalId === 'modal-buy-animals') this.renderBuyAnimalsModal();
    else if (modalId === 'modal-seed-picker') this.renderSeedPicker();
    modal.querySelector('button:not([disabled])')?.focus({ preventScroll: true });
  }

  closeModal(modalId, restoreFocus = true) {
    if (this.activeModal?.id !== modalId) return;
    if (modalId === 'modal-fishing') this.resetFishing();
    if (modalId === 'modal-seed-picker') this.selectedPlotIndex = null;
    this.activeModal.classList.remove('open');
    this.activeModal.removeAttribute('aria-modal');
    this.activeModal = null;
    document.getElementById('game-viewport').inert = false;
    document.body.style.overflow = '';
    if (restoreFocus) this.modalTrigger?.focus({ preventScroll: true });
    this.modalTrigger = null;
  }

  renderWarehouse() {
    const container = document.getElementById('warehouse-items-grid');
    if (!container) return;
    container.innerHTML = '';

    // Animal products
    for (let key in this.state.inventory.products) {
      const count = this.state.inventory.products[key];
      const animal = Object.values(FarmGame.ANIMAL_DATA).find(a => a.product === key);
      const name = animal ? animal.prodName : key;
      const icon = animal ? animal.prodIcon : '📦';
      const price = animal ? animal.sellPrice : 50;

      const card = document.createElement('div');
      card.className = 'store-item-card';
      card.innerHTML = `
        <span class="store-item-icon">${icon}</span>
        <span class="store-item-title">${name}</span>
        <span class="store-item-desc">Kho: ${count} cái</span>
        <span class="store-item-price">🪙 ${price} / cái</span>
        <button class="btn-store-action" ${count <= 0 ? 'disabled style="opacity:0.5"' : ''}>Bán 5 cái</button>
      `;
      card.querySelector('button').addEventListener('click', () => {
        this.sellItem('products', key, Math.min(5, count));
      });
      container.appendChild(card);
    }

    // Crops
    for (let key in this.state.inventory.crops) {
      const count = this.state.inventory.crops[key];
      const crop = FarmGame.CROPS_DATA[key];
      if (!crop) continue;

      const card = document.createElement('div');
      card.className = 'store-item-card';
      card.innerHTML = `
        <span class="store-item-icon">${crop.icon}</span>
        <span class="store-item-title">${crop.name}</span>
        <span class="store-item-desc">Kho: ${count} củ</span>
        <span class="store-item-price">🪙 ${crop.sellPrice} / cái</span>
        <button class="btn-store-action" ${count <= 0 ? 'disabled style="opacity:0.5"' : ''}>Bán 5 cái</button>
      `;
      card.querySelector('button').addEventListener('click', () => {
        this.sellItem('crops', key, Math.min(5, count));
      });
      container.appendChild(card);
    }

    // Finished goods from the workshop.
    for (const [key, count] of Object.entries(this.state.inventory.processed)) {
      const recipe = FarmGame.RECIPES[key];
      if (!recipe) continue;

      const card = document.createElement('div');
      card.className = 'store-item-card';
      card.innerHTML = `
        <span class="store-item-icon">${recipe.icon}</span>
        <span class="store-item-title">${recipe.name}</span>
        <span class="store-item-desc">Kho: ${count}</span>
        <span class="store-item-price">🪙 ${recipe.sellPrice} / món</span>
        <button class="btn-store-action" ${count <= 0 ? 'disabled' : ''}>Bán 1 món</button>
      `;
      card.querySelector('button').addEventListener('click', () => this.sellItem('processed', key, 1));
      container.appendChild(card);
    }

    // Fish
    for (let key in this.state.inventory.fish) {
      const count = this.state.inventory.fish[key];
      const fish = FarmGame.FISH_DATA[key];
      if (!fish) continue;

      const card = document.createElement('div');
      card.className = 'store-item-card';
      card.innerHTML = `
        <span class="store-item-icon">${fish.icon}</span>
        <span class="store-item-title">${fish.name}</span>
        <span class="store-item-desc">Kho: ${count} con</span>
        <span class="store-item-price">🪙 ${fish.sellPrice} / con</span>
        <button class="btn-store-action" ${count <= 0 ? 'disabled style="opacity:0.5"' : ''}>Bán 1 con</button>
      `;
      card.querySelector('button').addEventListener('click', () => {
        this.sellItem('fish', key, 1);
      });
      container.appendChild(card);
    }
  }

  renderOrders() {
    const container = document.getElementById('orders-list-wrap');
    if (!container) return;
    container.innerHTML = '';

    const orders = [...this.state.orders].sort((a, b) => Number(this.canFulfillOrder(b)) - Number(this.canFulfillOrder(a)));
    orders.forEach(order => {
      const row = document.createElement('div');
      const canFulfill = this.canFulfillOrder(order);
      row.className = canFulfill ? 'order-card ready' : 'order-card';
      row.dataset.orderId = order.id;

      if (order.pendingUntil) {
        row.classList.add('order-waiting');
        const title = document.createElement('strong');
        title.textContent = 'Đang chờ đơn mới';
        const time = document.createElement('span');
        time.dataset.orderReadyAt = order.pendingUntil;
        time.textContent = this.formatTimer(NTVV_RULES.remainingSeconds(order.pendingUntil, Date.now()));
        row.append(title, time);
        container.appendChild(row);
        return;
      }

      let reqsHtml = '';
      for (let item in order.req) {
        const need = order.req[item];
        const has = this.orderStock(item);
        const icon = FarmGame.CROPS_DATA[item]?.icon || FarmGame.RECIPES[item]?.icon || Object.values(FarmGame.ANIMAL_DATA).find(animal => animal.product === item)?.prodIcon || '📦';
        reqsHtml += `<span class="order-req-badge" style="color: ${has >= need ? '#217d18' : '#e74c3c'}">${icon} ${has}/${need}</span>`;
      }

      row.innerHTML = `
        <div class="order-npc">
          <span class="order-npc-avatar">${order.avatar}</span>
          <span class="order-npc-name">${order.npc}</span>
        </div>
        <div class="order-reqs">${reqsHtml}</div>
        <div class="order-rewards">🪙 +${order.reward.gold} | ⭐ +${order.reward.exp}</div>
        <div class="order-actions">
          <button class="btn-store-action" type="button" ${canFulfill ? '' : 'disabled'}>${canFulfill ? 'Giao hàng' : 'Thiếu hàng'}</button>
          <button class="secondary-button" type="button" title="Chờ 3 phút để có đơn mới">Bỏ đơn</button>
        </div>
      `;

      row.querySelector('.btn-store-action').addEventListener('click', () => this.fulfillOrder(order.id));
      row.querySelector('.secondary-button').addEventListener('click', () => this.discardOrder(order.id));
      container.appendChild(row);
    });
  }

  renderShop() {
    const container = document.getElementById('shop-items-grid');
    container.innerHTML = '';
    for (const [key, crop] of Object.entries(FarmGame.CROPS_DATA)) {
      const level = this.cropPurchaseLevel(key);
      const unlocked = this.state.player.level >= level;
      const enough = this.state.player.gold >= crop.seedCost * 5;
      const label = !unlocked ? `Mở ở cấp ${level}` : enough ? 'Mua 5 hạt' : 'Thiếu vàng';
      const illustration = crop.art
        ? `<img class="crop-illustration" src="${crop.art}" alt="" draggable="false">`
        : `<span class="store-item-icon" aria-hidden="true">${crop.icon}</span>`;
      const card = document.createElement('div');
      card.className = `store-item-card seed-product${unlocked ? '' : ' level-locked'}`;
      card.dataset.cropType = key;
      card.innerHTML = `
        <div class="seed-product-art">${illustration}</div>
        <span class="store-item-title">${crop.name}</span>
        <span class="store-item-desc">${NTVV_RULES.formatDuration(crop.duration)} · Kho: ${this.state.inventory.seeds[key] || 0} hạt</span>
        <span class="store-item-price">🪙 ${crop.seedCost * 5}</span>
        <button class="btn-store-action" type="button" ${unlocked && enough ? '' : 'disabled'}>${label}</button>
      `;
      card.querySelector('button').addEventListener('click', () => this.buySeeds(key, 5));
      container.appendChild(card);
    }
  }

  renderWorkshop() {
    const container = document.getElementById('workshop-recipes-grid');
    container.innerHTML = '';
    const full = this.state.production.length >= this.productionCapacity();

    for (const [key, recipe] of Object.entries(FarmGame.RECIPES)) {
      const ingredients = Object.entries(recipe.req);
      const enough = ingredients.every(([item, amount]) => this.orderStock(item) >= amount);
      const unlocked = this.recipeUnlocked(key);
      const reqText = ingredients.map(([item, amount]) => {
        const crop = FarmGame.CROPS_DATA[item];
        const animal = Object.values(FarmGame.ANIMAL_DATA).find(data => data.product === item);
        return `${crop?.name || animal?.prodName || item} ${this.orderStock(item)}/${amount}`;
      }).join(' · ');
      let buttonLabel = 'Xếp vào xưởng';
      if (!unlocked) buttonLabel = `Mở sau chương ${recipe.chapter}`;
      else if (!enough) buttonLabel = 'Thiếu nguyên liệu';
      else if (full) buttonLabel = 'Hết ô trống';

      const card = document.createElement('div');
      card.className = 'store-item-card recipe-card';
      card.innerHTML = `
        <span class="store-item-icon">${recipe.icon}</span>
        <span class="store-item-title">${recipe.name}</span>
        <span class="store-item-desc">${reqText}</span>
        <span class="recipe-time">⏱ ${NTVV_RULES.formatDuration(recipe.time)} mỗi mẻ</span>
        <button class="btn-store-action" type="button" ${unlocked && enough && !full ? '' : 'disabled'}>${buttonLabel}</button>
      `;
      card.querySelector('button').addEventListener('click', () => this.queueRecipe(key));
      container.appendChild(card);
    }
    this.renderProduction();
  }

  renderProduction() {
    const queue = document.getElementById('production-queue');
    const jobs = this.state.production;
    document.getElementById('workshop-slots').textContent = `${jobs.length}/${this.productionCapacity()} ô`;
    queue.innerHTML = '';

    if (!jobs.length) {
      const hint = document.createElement('p');
      hint.className = 'quest-summary';
      hint.textContent = 'Chọn một công thức để bắt đầu. Mỗi lần xưởng làm một mẻ.';
      queue.appendChild(hint);
      return;
    }
    for (const job of jobs) {
      const recipe = FarmGame.RECIPES[job.recipe];
      const row = document.createElement('div');
      row.className = 'production-job';
      row.dataset.jobId = job.id;
      row.innerHTML = `
        <strong>${recipe.icon} ${recipe.name}</strong>
        <span class="job-status"></span>
        <button class="btn-store-action" type="button" disabled>Nhận hàng</button>
      `;
      row.querySelector('button').addEventListener('click', () => this.collectProduction(job.id));
      queue.appendChild(row);
    }
    this.updateProductionTimers(Date.now());
  }

  updateProductionTimers(now) {
    document.querySelectorAll('#production-queue [data-job-id]').forEach(row => {
      const job = this.state.production.find(item => item.id === Number(row.dataset.jobId));
      if (!job) return;
      const remaining = NTVV_RULES.remainingSeconds(job.readyAt, now);
      let label = 'Có thể nhận';
      if (job.startsAt > now) label = `Chờ · bắt đầu sau ${this.formatTimer(NTVV_RULES.remainingSeconds(job.startsAt, now))}`;
      else if (remaining > 0) label = `Đang làm · ${this.formatTimer(remaining)}`;
      const status = row.querySelector('.job-status');
      if (status.textContent !== label) status.textContent = label;
      row.classList.toggle('ready', remaining === 0);
      row.querySelector('button').disabled = remaining > 0;
    });
  }

  renderQuestShortcut() {
    const active = [...this.chapterTasks(), ...this.state.daily.tasks, ...this.state.quests];
    const ready = active.filter(quest => !quest.claimed && quest.current >= quest.target).length;
    const label = ready ? `${ready} nhiệm vụ có thưởng` : 'Xem hành trình';
    document.getElementById('farm-progress-link').textContent = label;
    const indicator = document.getElementById('quest-indicator');
    indicator.hidden = ready === 0;
    indicator.textContent = String(ready);
    indicator.setAttribute('aria-label', label);
  }

  describeReward({ gold, gem, exp, seeds }) {
    return [
      gold && `🪙 ${gold} vàng`,
      gem && `💎 ${gem} kim cương`,
      exp && `⭐ ${exp} EXP`,
      seeds && `🌾 ${seeds} hạt lúa mì`
    ].filter(Boolean).join(' · ');
  }

  renderQuestGroup(containerId, quests) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    for (const quest of quests) {
      const item = document.createElement('article');
      const done = quest.current >= quest.target;
      item.className = `quest-item${done && !quest.claimed ? ' ready' : ''}`;
      item.innerHTML = `
        <div class="quest-copy">
          <strong class="quest-name"></strong>
          <div class="quest-progress"><progress></progress><span></span></div>
          <p class="quest-reward"></p>
        </div>
        <button class="btn-store-action" type="button"></button>
      `;
      item.querySelector('.quest-name').textContent = quest.title;
      const progress = item.querySelector('progress');
      progress.max = quest.target;
      progress.value = quest.current;
      progress.setAttribute('aria-label', quest.title);
      item.querySelector('.quest-progress span').textContent = `${quest.current}/${quest.target}`;
      item.querySelector('.quest-reward').textContent = this.describeReward(quest.reward);

      const button = item.querySelector('button');
      if (quest.claimed) {
        button.textContent = 'Đã nhận';
        button.disabled = true;
      } else if (done) {
        button.textContent = 'Nhận thưởng';
        button.addEventListener('click', () => this.claimQuest(quest.id));
      } else if (quest.scene) {
        const destination = document.getElementById(`heading-${quest.scene}`).textContent;
        button.textContent = `Đến ${destination}`;
        button.classList.add('quest-route');
        button.addEventListener('click', () => this.showScene(quest.scene));
      } else {
        button.textContent = 'Đang làm';
        button.disabled = true;
      }
      container.appendChild(item);
    }
  }

  renderQuests() {
    this.refreshDaily();
    const index = this.state.campaign.chapter;
    const chapter = FarmGame.CAMPAIGN[index];
    const total = FarmGame.CAMPAIGN.length;
    document.getElementById('chapter-title').textContent = chapter ? chapter.name : 'Đã hoàn thành hành trình';
    document.getElementById('chapter-count').textContent = chapter ? `Chương ${index + 1}/${total}` : `${total}/${total} chương`;
    document.getElementById('chapter-summary').textContent = chapter
      ? `${chapter.summary} ${this.state.campaign.legacyRecipes && chapter.legacyFinish || chapter.finish}`
      : 'Bạn đã mở đủ công thức và nhận thêm một ô xưởng từ hành trình. Việc mỗi ngày tiếp tục đổi theo lịch.';
    document.getElementById('daily-date').textContent = this.state.daily.date.split('-').reverse().join('/');
    document.getElementById('legacy-quests').hidden = !this.state.quests.length;
    this.renderQuestGroup('chapter-quests', this.chapterTasks());
    this.renderQuestGroup('daily-quests', this.state.daily.tasks);
    this.renderQuestGroup('quests-list-wrap', this.state.quests);
    this.renderQuestShortcut();
  }

  renderBuyAnimalsModal() {
    const container = document.getElementById('buy-animals-grid');
    container.innerHTML = '';
    for (const [type, data] of Object.entries(FarmGame.ANIMAL_DATA)) {
      const pen = this.state.husbandry[type];
      const capacity = this.penCapacity(type);
      const upgrade = FarmGame.LEVEL_UNLOCKS.find(unlock =>
        unlock.animal === type && unlock.capacity > capacity && unlock.level > this.state.player.level);
      const space = pen.count < capacity;
      const enough = this.state.player.gold >= data.cost;
      let label = enough ? 'Mua thêm' : 'Thiếu vàng';
      if (!space) label = upgrade ? `Thêm chỗ ở cấp ${upgrade.level}` : 'Đã đủ chỗ';
      const card = document.createElement('div');
      card.className = 'store-item-card';
      card.dataset.animalType = type;
      card.innerHTML = `
        <span class="store-item-icon" aria-hidden="true">${data.icon}</span>
        <span class="store-item-title">${data.name}</span>
        <span class="store-item-desc">Hiện có: ${pen.count}/${capacity} con</span>
        <span class="store-item-price">🪙 ${data.cost.toLocaleString()}</span>
        <button class="btn-store-action" type="button" ${space && enough ? '' : 'disabled'}>${label}</button>
      `;
      card.querySelector('button').addEventListener('click', () => this.buyAnimal(type));
      container.appendChild(card);
    }
  }

  // --- EVENT BINDING ---

  showScene(sceneName, focusHeading = true) {
    const nextScene = document.getElementById(`scene-${sceneName}`);
    if (!nextScene) return;
    if (this.activeModal) this.closeModal(this.activeModal.id, this.activeScene === nextScene);
    if (this.activeScene === nextScene) return;

    if (this.activeScene) this.activeScene.hidden = true;
    clearTimeout(this.toastTimer);
    document.getElementById('game-toast').textContent = '';
    nextScene.hidden = false;
    this.activeScene = nextScene;
    document.querySelectorAll('#farm-navigation [data-scene-target]').forEach(button => {
      if (button.dataset.sceneTarget === sceneName) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    });

    if (sceneName === 'orders') this.renderOrders();
    else if (sceneName === 'workshop') this.renderWorkshop();
    else if (sceneName === 'warehouse') this.renderWarehouse();
    else if (sceneName === 'shop') this.renderShop();
    else if (sceneName === 'quests') this.renderQuests();
    else if (sceneName === 'levels') this.renderLevels();
    else if (sceneName === 'animals') this.renderHusbandryPens();

    if (focusHeading) {
      window.scrollTo(0, 0);
      nextScene.querySelector('h1').focus({ preventScroll: true });
    }
  }

  bindCropControls() {
    const field = document.getElementById('crops-field');
    field.addEventListener('click', event => {
      const tile = event.target.closest('.crop-plot');
      if (tile && (!this.suppressPlotClick || event.detail === 0)) this.handlePlotClick(Number(tile.dataset.index));
    });
    field.addEventListener('pointerdown', event => {
      const tile = event.target.closest('.crop-plot');
      if (!event.isPrimary || event.button !== 0 || !tile) return;
      this.suppressPlotClick = false;
      this.cropPointer = { id: event.pointerId, index: Number(tile.dataset.index), x: event.clientX, y: event.clientY };
    });
    field.addEventListener('pointermove', event => {
      const pointer = this.cropPointer;
      if (pointer?.id !== event.pointerId || this.selectedTool !== 'sickle') return;
      if (!this.suppressPlotClick) {
        if (Math.hypot(event.clientX - pointer.x, event.clientY - pointer.y) < 8) return;
        this.suppressPlotClick = true;
        field.setPointerCapture(event.pointerId);
        this.harvestPlot(pointer.index);
      }
      const tile = document.elementFromPoint(event.clientX, event.clientY)?.closest('.crop-plot');
      if (tile && field.contains(tile)) this.harvestPlot(Number(tile.dataset.index));
    });
    window.addEventListener('pointerup', event => {
      const pointer = this.cropPointer;
      if (pointer?.id !== event.pointerId) return;
      this.cropPointer = null;
      if (event.pointerType !== 'touch' || this.suppressPlotClick) return;

      const tile = document.elementFromPoint(event.clientX, event.clientY)?.closest('.crop-plot');
      if (Number(tile?.dataset.index) === pointer.index) {
        // Some browsers suppress the first synthetic click after a swipe.
        this.suppressPlotClick = true;
        this.handlePlotClick(pointer.index);
      }
    });
    window.addEventListener('pointercancel', event => {
      if (this.cropPointer?.id === event.pointerId) this.cropPointer = null;
    });
  }

  bindEvents() {
    document.getElementById('btn-feed-animal').addEventListener('click', () => this.feedAllPens());
    document.getElementById('btn-harvest-animal').addEventListener('click', () => this.harvestAllPens());
    document.getElementById('btn-feed-plus').addEventListener('click', () => this.openModal('modal-craft-feed'));
    document.querySelectorAll('[data-pen]').forEach(button => {
      button.addEventListener('click', () => this.handlePenClick(button.dataset.pen));
    });

    this.bindCropControls();
    document.querySelectorAll('[data-open]').forEach(button => {
      button.addEventListener('click', () => this.openModal(button.dataset.open));
    });
    document.querySelectorAll('[data-scene-target]').forEach(button => {
      button.addEventListener('click', () => {
        window.soundEngine.playClick();
        this.showScene(button.dataset.sceneTarget);
      });
    });

    const tools = document.querySelectorAll('.tool-dock-btn');
    tools.forEach(btn => {
      btn.addEventListener('click', () => {
        window.soundEngine.playClick();
        const deselect = btn.hasAttribute('data-toggle-tool') && this.selectedTool === btn.dataset.tool;
        this.selectedTool = deselect ? 'sickle' : btn.dataset.tool;
        tools.forEach(tool => {
          const active = tool.dataset.tool === this.selectedTool;
          tool.classList.toggle('active', active);
          tool.setAttribute('aria-pressed', String(active));
        });
        this.renderHusbandryPens();
        if (this.selectedTool === 'water') this.showToast('Chạm vào cây đang lớn để tưới.');
        if (this.selectedTool === 'fertilizer') this.showToast('Chạm vào cây hoặc chuồng đang sản xuất để bón phân.');
      });
    });

    // 6. Scenic Hotspots: Pier & Dog
    document.getElementById('pier-fishing-hotspot')?.addEventListener('click', () => {
      this.openFishingModal();
    });

    document.getElementById('farm-dog-pet')?.addEventListener('click', () => {
      this.petFarmDog();
    });

    // 7. Fishing Modal Actions
    document.getElementById('btn-cast-rod')?.addEventListener('click', () => {
      this.reelInFish();
    });

    // 8. Lucky Wheel Modal Actions
    document.getElementById('btn-spin-wheel')?.addEventListener('click', () => {
      this.spinWheel();
    });

    // 9. Day/Night & Weather Toggles
    document.getElementById('btn-tool-daynight')?.addEventListener('click', () => {
      this.cycleTimeOfDay();
    });

    document.getElementById('btn-tool-weather')?.addEventListener('click', () => {
      this.toggleWeather();
    });

    // 10. Seed Picker Cards
    document.querySelectorAll('.seed-card').forEach(card => {
      card.addEventListener('click', () => {
        const type = card.dataset.crop;
        this.plantCrop(type);
      });
    });

    document.querySelectorAll('.modal-overlay').forEach(modal => {
      modal.setAttribute('role', 'dialog');
      const title = modal.querySelector('.modal-title');
      title.id = `${modal.id}-title`;
      modal.setAttribute('aria-labelledby', title.id);
      modal.querySelector('.modal-close-btn')?.addEventListener('click', () => this.closeModal(modal.id));
      modal.addEventListener('click', event => {
        if (event.target === modal) this.closeModal(modal.id);
      });
    });
    document.addEventListener('keydown', event => {
      if (!this.activeModal) return;
      if (event.key === 'Escape') this.closeModal(this.activeModal.id);
      if (event.key !== 'Tab') return;
      const controls = [...this.activeModal.querySelectorAll('button:not([disabled]), a[href]')];
      const first = controls[0];
      const last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    });

    // 13. Sound & Fullscreen Tools
    document.getElementById('btn-tool-sound')?.addEventListener('click', () => {
      const active = window.soundEngine.toggleSound();
      const button = document.getElementById('btn-tool-sound');
      button.textContent = active ? '🔊 Âm thanh' : '🔇 Âm thanh';
      button.setAttribute('aria-pressed', String(active));
    });

    document.getElementById('btn-tool-music')?.addEventListener('click', () => {
      const active = window.soundEngine.toggleMusic();
      const button = document.getElementById('btn-tool-music');
      button.textContent = active ? '🎶 Nhạc nền' : '🎵 Nhạc nền';
      button.setAttribute('aria-pressed', String(active));
    });

    document.getElementById('btn-tool-fullscreen')?.addEventListener('click', () => {
      this.toggleFullscreen();
    });

    // Reset game data button
    document.getElementById('btn-reset-game')?.addEventListener('click', () => {
      if (confirm('Bạn có chắc muốn đặt lại toàn bộ tiến độ trang trại về mặc định?')) {
        this.state = this.getDefaultState();
        this.saveState();
        location.reload();
      }
    });

    document.getElementById('btn-queue-feed').addEventListener('click', () => {
      if (this.queueRecipe('feed')) {
        this.showScene('workshop');
        this.showToast('Theo dõi mẻ thức ăn trong hàng chờ xưởng.');
      }
    });
    document.getElementById('btn-plus-energy').addEventListener('click', () => {
      const { energy, maxEnergy } = this.state.player;
      this.showToast(energy === maxEnergy
        ? 'Thể lực đang đầy.'
        : `Hồi thêm 1 thể lực sau khoảng ${30 - this.state.energySeconds} giây.`);
    });
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      if (!document.documentElement.requestFullscreen) {
        this.showToast('Trình duyệt này không hỗ trợ toàn màn hình.');
        return;
      }
      document.documentElement.requestFullscreen().catch(() => this.showToast('Không thể mở toàn màn hình.'));
    } else {
      document.exitFullscreen().catch(err => console.log(err));
    }
  }

  // --- DATA STORAGE ---

  saveState() {
    try {
      const now = Date.now();
      NTVV_RULES.syncFarm(this.state, now);
      this.state.savedAt = now;
      localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    } catch (e) {
      console.warn('Unable to save to localStorage', e);
    }
  }

  loadState() {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) return null;
      const state = JSON.parse(data);
      if (!state?.player || !state.inventory || !state.husbandry || !Array.isArray(state.plots)) return null;
      const { player } = state;
      if (!Number.isSafeInteger(player.level) || player.level < 1) player.level = 1;
      if (!Number.isSafeInteger(player.exp) || player.exp < 0) player.exp = 0;
      if (!Number.isSafeInteger(player.maxExp) || player.maxExp < 1) {
        player.maxExp = FarmGame.experienceForLevel(player.level);
      }
      state.campaign ??= { chapter: 0, progress: {}, claimed: [], legacyRecipes: true };
      state.daily ??= null;
      state.quests ??= [];
      state.production ??= [];
      state.nextJobId ??= 1;
      state.energySeconds ??= 0;
      state.inventory.processed ??= {};
      return state;
    } catch (e) {
      return null;
    }
  }

  startAutoSave() {
    setInterval(() => {
      this.saveState();
    }, 5000);
    window.addEventListener('beforeunload', () => {
      this.saveState();
    });
  }
}

// Instantiate game upon window load
window.addEventListener('DOMContentLoaded', () => {
  window.farmGame = new FarmGame();
});
