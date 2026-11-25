import {
  CHEF_SPEED,
  CANVAS_W,
  CANVAS_H,
  STATIONS,
} from './config.js';

const MIN_X = 20;
const MAX_X = CANVAS_W - 20;
const MIN_Y = 260;
const MAX_Y = CANVAS_H - 20;
const ARRIVE_DISTANCE = 12;
const ARRIVE_DISTANCE_SQ = ARRIVE_DISTANCE * ARRIVE_DISTANCE;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function normalizeKey(event) {
  const raw = event && event.key;

  if (typeof raw !== 'string' || raw.length === 0) return '';
  if (raw === ' ' || raw === 'Spacebar' || raw === 'Space') return ' ';

  return raw.toLowerCase();
}

function isArrowKey(key) {
  return key === 'arrowup'
    || key === 'arrowdown'
    || key === 'arrowleft'
    || key === 'arrowright';
}

function clampToPlayable(point) {
  return {
    x: clamp(Number(point.x), MIN_X, MAX_X),
    y: clamp(Number(point.y), MIN_Y, MAX_Y),
  };
}

function findStationCenterAt(x, y) {
  for (const key of Object.keys(STATIONS)) {
    const rect = STATIONS[key];
    if (!rect) continue;

    if (
      x >= rect.x
      && x <= rect.x + rect.w
      && y >= rect.y
      && y <= rect.y + rect.h
    ) {
      if (key === 'bins') {
        return {
          x: clamp(x, rect.x, rect.x + rect.w),
          y: rect.y + rect.h / 2,
        };
      }

      return {
        x: rect.x + rect.w / 2,
        y: rect.y + rect.h / 2,
      };
    }
  }

  return null;
}

function moveChefToward(chef, target, maxDistance) {
  const dx = target.x - chef.x;
  const dy = target.y - chef.y;
  const distance = Math.hypot(dx, dy);

  if (distance > 0) {
    const step = Math.min(distance, maxDistance);
    chef.x += (dx / distance) * step;
    chef.y += (dy / distance) * step;
  }

  chef.x = clamp(chef.x, MIN_X, MAX_X);
  chef.y = clamp(chef.y, MIN_Y, MAX_Y);

  const remainingX = target.x - chef.x;
  const remainingY = target.y - chef.y;

  return remainingX * remainingX + remainingY * remainingY <= ARRIVE_DISTANCE_SQ;
}

function moveChefByKeys(chef, keys, maxDistance) {
  let dx = 0;
  let dy = 0;

  if (keys.has('w') || keys.has('arrowup')) dy -= 1;
  if (keys.has('s') || keys.has('arrowdown')) dy += 1;
  if (keys.has('a') || keys.has('arrowleft')) dx -= 1;
  if (keys.has('d') || keys.has('arrowright')) dx += 1;

  if (dx === 0 && dy === 0) return;

  const length = Math.hypot(dx, dy);

  chef.x += (dx / length) * maxDistance;
  chef.y += (dy / length) * maxDistance;

  chef.x = clamp(chef.x, MIN_X, MAX_X);
  chef.y = clamp(chef.y, MIN_Y, MAX_Y);
}

export function updateInput(input, dt) {
  if (!input || typeof input.update !== 'function') return;
  input.update(dt);
}

export function createInput(canvas, world, callbacks = {}) {
  const cbs = callbacks || {};
  const targetWindow = typeof window !== 'undefined' ? window : null;

  const input = {
    keys: new Set(),
    walkTarget: null,
    paused: false,
    muted: false,
    destroyed: false,

    update(dt) {
      if (input.destroyed) return;

      const maxDistance = CHEF_SPEED * dt;

      if (input.walkTarget) {
        const arrived = moveChefToward(world.chef, input.walkTarget, maxDistance);
        if (arrived) {
          world.chef.x = input.walkTarget.x;
          world.chef.y = input.walkTarget.y;
          input.walkTarget = null;
          world.interactNearest();
        }
        return;
      }

      moveChefByKeys(world.chef, input.keys, maxDistance);
    },

    destroy() {
      if (input.destroyed) return;
      input.destroyed = true;

      if (targetWindow) {
        targetWindow.removeEventListener('keydown', onKeyDown);
        targetWindow.removeEventListener('keyup', onKeyUp);
      }

      if (canvas) {
        canvas.removeEventListener('mousedown', onMouseDown);
      }
    },
  };

  function onKeyDown(event) {
    const key = normalizeKey(event);
    if (!key) return;

    if (isArrowKey(key) || key === ' ') {
      event.preventDefault();
    }

    input.keys.add(key);

    if (key === 'e' || key === ' ') {
      world.interactNearest();
      return;
    }

    if (key === 'enter') {
      if (world.over) {
        if (typeof cbs.onRestart === 'function') cbs.onRestart();
      } else if (world.timeLeft >= 150 && world.elapsed === 0) {
        if (typeof cbs.onStart === 'function') cbs.onStart();
      }
      return;
    }

    if (key === 'p') {
      if (typeof cbs.onPause === 'function') cbs.onPause();
      return;
    }

    if (key === 'm') {
      if (typeof cbs.onMute === 'function') cbs.onMute();
    }
  }

  function onKeyUp(event) {
    const key = normalizeKey(event);
    if (!key) return;

    input.keys.delete(key);
  }

  function onMouseDown(event) {
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return;

    const x = (event.clientX - rect.left) * (CANVAS_W / rect.width);
    const y = (event.clientY - rect.top) * (CANVAS_H / rect.height);

    const station = findStationCenterAt(x, y);
    const point = station
      ? clampToPlayable(station)
      : clampToPlayable({ x, y });

    input.walkTarget = point;

    if (station) {
      const dx = point.x - world.chef.x;
      const dy = point.y - world.chef.y;
      if (dx * dx + dy * dy <= ARRIVE_DISTANCE_SQ) {
        world.interactNearest();
      }
    }
  }

  if (targetWindow) {
    targetWindow.addEventListener('keydown', onKeyDown);
    targetWindow.addEventListener('keyup', onKeyUp);
  }

  if (canvas) {
    canvas.addEventListener('mousedown', onMouseDown);
  }

  return input;
}