import {
  SHIFT_SECONDS,
  LEVEL,
  RECIPES,
  BINS,
  CHOP_TIME,
  GRILL_TIME,
  GRILL_BURN_TIME,
  GRILL_SLOTS,
  PLATE_MAX,
  TRAY_MAX,
  WRONG_PENALTY,
  ORDER_MAX,
  ORDER_PATIENCE_BASE,
  ORDER_PATIENCE_PER_LEVEL,
  ORDER_PATIENCE_MIN,
  STATIONS,
  CHEF_START,
  CHEF_SPEED,
  formatTime,
  recipeById,
} from './config.js';

export function makeItem(id, cooked, chopped) {
  return { id, cooked, chopped };
}

export function stationAt(x, y) {
  const keys = Object.keys(STATIONS);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const station = STATIONS[key];
    if (!station) continue;
    const rect = station.rect || station;
    const w = rect.w != null ? rect.w : rect.width;
    const h = rect.h != null ? rect.h : rect.height;
    if (w == null || h == null) continue;
    if (x >= rect.x && x <= rect.x + w && y >= rect.y && y <= rect.y + h) {
      return key;
    }
  }
  return null;
}

function emptyGrillSlots() {
  const slots = [];
  for (let i = 0; i < GRILL_SLOTS; i++) {
    slots.push({ item: null, t: 0 });
  }
  return slots;
}

export function createWorld(random) {
  const rnd = typeof random === 'function' ? random : () => 0.5;

  const state = {
    elapsed: 0,
    timeLeft: SHIFT_SECONDS,
    score: 0,
    coins: 0,
    combo: 0,
    bestCombo: 0,
    served: 0,
    failed: 0,
    level: 1,
    over: false,
    paused: false,
    chef: { x: CHEF_START.x, y: CHEF_START.y },
    tray: [],
    plate: [],
    grillSlots: emptyGrillSlots(),
    chopSlot: null,
    orders: [],
    spawnQueue: [],
    spawnTimer: 0,
    message: '',
    messageT: 0,
    lastTickSecond: Math.ceil(SHIFT_SECONDS),
  };

  state.reset = function reset() {
    state.elapsed = 0;
    state.timeLeft = SHIFT_SECONDS;
    state.score = 0;
    state.coins = 0;
    state.combo = 0;
    state.bestCombo = 0;
    state.served = 0;
    state.failed = 0;
    state.level = 1;
    state.over = false;
    state.paused = false;
    state.chef = { x: CHEF_START.x, y: CHEF_START.y };
    state.tray = [];
    state.plate = [];
    state.grillSlots = emptyGrillSlots();
    state.chopSlot = null;
    state.orders = [];
    state.spawnQueue = [];
    state.spawnTimer = 0;
    state.message = 'Shift started — sizzle!';
    state.messageT = 2;
    state.lastTickSecond = Math.ceil(state.timeLeft);

    const startingOrders = Math.min(2, ORDER_MAX);
    for (let i = 0; i < startingOrders; i++) {
      state.spawnOrder();
    }
    return state;
  };

  state.spawnOrder = function spawnOrder() {
    if (state.orders.length >= ORDER_MAX) return null;

    const pool = Array.isArray(RECIPES) ? RECIPES : Object.values(RECIPES || {});
    if (!pool.length) return null;

    if (!state.spawnQueue.length) {
      const shuffled = pool.slice();
      for (let i = shuffled.length - 1; i > 0; i--) {
        let r = rnd();
        if (!(r >= 0)) r = 0;
        if (r >= 1) r = 0.999999;
        const j = Math.floor(r * (i + 1));
        const tmp = shuffled[i];
        shuffled[i] = shuffled[j];
        shuffled[j] = tmp;
      }
      state.spawnQueue = shuffled;
    }

    const recipe = state.spawnQueue.shift();

    const patience = Math.max(
      ORDER_PATIENCE_MIN,
      ORDER_PATIENCE_BASE - ORDER_PATIENCE_PER_LEVEL * (state.level - 1)
    );

    const order = { recipe, patience, maxPatience: patience };
    state.orders.push(order);
    return order;
  };

  state.setMessage = function setMessage(text, seconds) {
    state.message = text;
    state.messageT = seconds || 2;
  };

  state.step = function step(dt) {
    if (state.paused || state.over) return;

    state.elapsed += dt;
    state.timeLeft = Math.max(0, SHIFT_SECONDS - state.elapsed);
    state.level = Math.min(LEVEL.max, Math.floor(state.elapsed / LEVEL.seconds) + 1);

    if (state.messageT > 0) state.messageT -= dt;

    if (state.chopSlot) {
      state.chopSlot.t += dt;
      if (state.chopSlot.t >= CHOP_TIME && !state.chopSlot.done) {
        state.chopSlot.done = true;
        state.chopSlot.item.chopped = true;
        state.setMessage('Chopped!', 1);
      }
    }

    for (let i = 0; i < state.grillSlots.length; i++) {
      const slot = state.grillSlots[i];
      if (!slot.item) continue;
      slot.t += dt;
      if (slot.t >= GRILL_BURN_TIME && !slot.burnt) {
        slot.burnt = true;
        state.setMessage('Burnt!', 1.5);
      }
    }

    for (let i = state.orders.length - 1; i >= 0; i--) {
      const order = state.orders[i];
      order.patience -= dt;
      if (order.patience <= 0) {
        state.orders.splice(i, 1);
        state.failed += 1;
        state.combo = 0;
        state.setMessage('Order expired!', 1.5);
      }
    }

    state.spawnTimer += dt;
    if (state.spawnTimer >= 6 && state.orders.length < ORDER_MAX) {
      state.spawnTimer = 0;
      state.spawnOrder();
    }

    if (state.timeLeft <= 0) {
      state.over = true;
      state.setMessage('Shift over!', 3);
    }
  };

  state.interactNearest = function interactNearest() {
    const station = stationAt(state.chef.x, state.chef.y);
    if (!station) return;

    if (station === 'bins') {
      const rect = STATIONS.bins;
      const idx = Math.min(
        BINS.length - 1,
        Math.max(0, Math.floor((state.chef.x - rect.x) / (rect.w / BINS.length)))
      );
      const id = BINS[idx];
      if (state.tray.length >= TRAY_MAX) {
        state.setMessage('Tray full!', 1);
        return;
      }
      state.tray.push(makeItem(id, false, false));
      state.setMessage('Picked up ' + id, 0.8);
    } else if (station === 'chop') {
      if (state.chopSlot && state.chopSlot.done) {
        if (state.tray.length < TRAY_MAX) {
          state.tray.push(state.chopSlot.item);
          state.chopSlot = null;
        }
      } else if (!state.chopSlot) {
        const i = state.tray.findIndex((it) => (it.id === 'lettuce' || it.id === 'tomato') && !it.chopped);
        if (i >= 0) {
          state.chopSlot = { item: state.tray[i], t: 0, done: false };
          state.tray.splice(i, 1);
        } else {
          state.setMessage('Need lettuce or tomato', 1);
        }
      }
    } else if (station === 'grill') {
      const ready = state.grillSlots.find((s) => s.item && s.t >= GRILL_TIME && !s.burnt);
      if (ready) {
        if (state.tray.length < TRAY_MAX) {
          ready.item.cooked = true;
          state.tray.push(ready.item);
          ready.item = null;
          ready.t = 0;
          ready.burnt = false;
        }
      } else {
        const burnt = state.grillSlots.find((s) => s.item && s.burnt);
        if (burnt) {
          burnt.item = null;
          burnt.t = 0;
          burnt.burnt = false;
          state.setMessage('Burnt patty tossed', 1);
        } else {
          const i = state.tray.findIndex((it) => it.id === 'patty' && !it.cooked);
          const slot = state.grillSlots.find((s) => !s.item);
          if (i >= 0 && slot) {
            slot.item = state.tray[i];
            slot.t = 0;
            slot.burnt = false;
            state.tray.splice(i, 1);
          }
        }
      }
    } else if (station === 'plate') {
      while (state.tray.length && state.plate.length < PLATE_MAX) {
        state.plate.push(state.tray.shift());
      }
    } else if (station === 'serve') {
      if (!state.plate.length) return;
      const match = state.orders.find((o) => state.plateMatches(o.recipe));
      if (match) {
        state.combo += 1;
        if (state.combo > state.bestCombo) state.bestCombo = state.combo;
        const points = match.recipe.points + (state.combo - 1) * 10;
        state.score += points;
        state.coins += points;
        state.served += 1;
        state.orders.splice(state.orders.indexOf(match), 1);
        state.plate = [];
        state.setMessage('Served! +' + points, 1.5);
      } else {
        state.score = Math.max(0, state.score - WRONG_PENALTY);
        state.combo = 0;
        state.plate = [];
        state.setMessage('Wrong dish! -' + WRONG_PENALTY, 1.5);
      }
    } else if (station === 'trash') {
      state.plate = [];
      state.setMessage('Plate cleared', 1);
    }
  };

  state.plateMatches = function plateMatches(recipe) {
    if (state.plate.length !== recipe.items.length) return false;
    const key = (it) => it.id + '|' + (it.cooked ? 1 : 0) + '|' + (it.chopped ? 1 : 0);
    const have = state.plate.map(key).sort();
    const want = recipe.items.map(key).sort();
    for (let i = 0; i < want.length; i++) {
      if (have[i] !== want[i]) return false;
    }
    return true;
  };

  state.isTimeLow = function isTimeLow() { return state.timeLeft <= 10; };

  state.reset();
  return state;
}

// PART 2 FOLLOWS.