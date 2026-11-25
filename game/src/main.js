import { CANVAS_W, CANVAS_H } from './config.js';
import { createWorld } from './world.js';
import { draw, SCREEN_TITLE, SCREEN_PLAY, SCREEN_OVER, SCREEN_RECIPES } from './render.js';
import { createInput, updateInput } from './input.js';
import { createAudio } from './audio.js';
import { setupShot, SHOT_NAMES } from './shots.js';
import { createRandom } from './random.js';

const BEST_KEY = 'dapur-sizzle-best';
const MAX_DT = 0.05;
const SEED = 1337;

const canvas = document.getElementById('game');
canvas.width = CANVAS_W;
canvas.height = CANVAS_H;

const ctx = canvas.getContext('2d');

function loadBest() {
  try {
    const raw = localStorage.getItem(BEST_KEY);
    const value = parseInt(raw, 10);
    if (Number.isNaN(value)) return 0;
    return Math.max(0, value);
  } catch (err) {
    return 0;
  }
}

const world = createWorld(createRandom(SEED));
const audio = createAudio();

let best = loadBest();
let screen = SCREEN_TITLE;
let paused = false;
let lastTime = 0;

function startGame() {
  screen = SCREEN_PLAY;
  paused = false;
  world.paused = false;
  world.reset();
  audio.ensure();
}

const input = createInput(canvas, world, {
  onStart() {
    startGame();
  },
  onRestart() {
    startGame();
  },
  onPause() {
    paused = !paused;
    world.paused = paused;
  },
  onMute() {
    audio.toggleMuted();
  }
});

function saveBest() {
  if (world.score <= best) return;
  best = world.score;
  try {
    localStorage.setItem(BEST_KEY, String(best));
  } catch (err) {
    // Storage may be unavailable; keep the in-memory best score.
  }
}

function stepGame(dt) {
  if (screen === SCREEN_PLAY && !world.paused && !paused) {
    world.step(dt);
  }

  if (world.over) {
    screen = SCREEN_OVER;
    saveBest();
  }
}

function frame(now) {
  let dt = (now - lastTime) / 1000;
  lastTime = now;

  if (!Number.isFinite(dt) || dt < 0) dt = 0;
  if (dt > MAX_DT) dt = MAX_DT;

  if (screen === SCREEN_PLAY && !paused && !world.paused) {
    updateInput(input, dt);
  }

  stepGame(dt);
  draw(ctx, world, screen, best);

  requestAnimationFrame(frame);
}

const shotNames = Array.isArray(SHOT_NAMES) ? SHOT_NAMES : Object.keys(SHOT_NAMES || {});
const query = typeof window !== 'undefined' && window.location ? window.location.search : '';
const shot = new URLSearchParams(query).get('shot');

if (shot && shotNames.includes(shot)) {
  setupShot(world, shot);

  if (shot === 'title') {
    screen = SCREEN_TITLE;
  } else if (shot === 'end') {
    screen = SCREEN_OVER;
  } else if (shot === 'recipes') {
    screen = SCREEN_RECIPES;
  } else if (shot === 'results') {
    screen = SCREEN_OVER;
  } else {
    screen = SCREEN_PLAY;
  }

  draw(ctx, world, screen, best);
} else {
  lastTime = performance.now();
  requestAnimationFrame(frame);
}