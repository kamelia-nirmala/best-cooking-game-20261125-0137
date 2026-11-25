import { createWorld, makeItem } from './world.js';
import { RECIPES } from './config.js';

function itemFromSpec(spec) {
  if (typeof spec === 'string') {
    return makeItem(spec);
  }
  if (!spec || typeof spec !== 'object') {
    return makeItem(String(spec));
  }
  return makeItem(spec.id, !!spec.cooked, !!spec.chopped);
}

function recipeItems(recipe) {
  if (!recipe) return [];
  return recipe.items || recipe.ingredients || [];
}

export function setupShot(world, name) {
  switch (name) {
    case 'recipes': {
      world.reset();
      world.spawnOrder();
      world.spawnOrder();
      world.elapsed = 30;
      world.timeLeft = 120;
      world.level = 2;
      world.score = 240;
      world.coins = 240;
      world.combo = 2;
      world.bestCombo = 3;
      world.served = 2;
      world.failed = 0;
      world.plate = [makeItem('bun')];
      world.tray = [];
      world.chef = { x: 640, y: 595 };
      world.message = '';
      world.messageT = 0;
      break;
    }

    case 'play': {
      world.reset();
      world.spawnOrder();
      world.spawnOrder();
      world.elapsed = 65;
      world.timeLeft = 85;
      world.level = 3;
      world.score = 420;
      world.coins = 420;
      world.combo = 5;
      world.bestCombo = 5;
      world.served = 4;

      world.chopSlot = {
        item: makeItem('lettuce'),
        t: 1.5,
        done: false,
      };

      if (!world.grillSlots[0]) {
        world.grillSlots[0] = { item: null, t: 0, burnt: false };
      }
      world.grillSlots[0].item = makeItem('patty');
      world.grillSlots[0].t = 4;
      world.grillSlots[0].burnt = false;

      if (!world.grillSlots[1]) {
        world.grillSlots[1] = { item: null, t: 0, burnt: false };
      }
      world.grillSlots[1].item = makeItem('patty');
      world.grillSlots[1].t = 2;
      world.grillSlots[1].burnt = false;

      world.plate = [makeItem('bun'), makeItem('patty', true), makeItem('lettuce', false, true)];

      world.tray = [makeItem('bun')];

      world.chef.x = 185;
      world.chef.y = 460;

      if (world.orders[0]) {
        world.orders[0].patience = 45;
        world.orders[0].maxPatience = 50;
      }
      if (world.orders[1]) {
        world.orders[1].patience = 24;
        world.orders[1].maxPatience = 50;
      }
      if (world.orders[2]) {
        world.orders[2].patience = 11;
        world.orders[2].maxPatience = 50;
      }
      if (world.orders[3]) {
        world.orders[3].patience = 5;
        world.orders[3].maxPatience = 50;
      }

      world.message = '';
      world.messageT = 0;
      break;
    }

    case 'serve': {
      world.reset();
      world.spawnOrder();
      world.spawnOrder();

      if (world.orders[0]) {
        world.orders[0].patience = 38;
        world.orders[0].maxPatience = 50;
      }
      if (world.orders[1]) {
        world.orders[1].patience = 20;
        world.orders[1].maxPatience = 50;
      }
      if (world.orders[2]) {
        world.orders[2].patience = 9;
        world.orders[2].maxPatience = 50;
      }
      if (world.orders[3]) {
        world.orders[3].patience = 3;
        world.orders[3].maxPatience = 50;
      }

      world.elapsed = 100;
      world.timeLeft = 50;
      world.level = 4;
      world.score = 600;
      world.coins = 600;
      world.combo = 6;
      world.bestCombo = 6;
      world.served = 5;

      world.plate = [makeItem('bun'), makeItem('patty', true), makeItem('patty', true), makeItem('lettuce', false, true)];

      world.chef = { x: 820, y: 660, dir: 1, moving: false };

      world.message = '';
      world.messageT = 0;
      break;
    }

    case 'results': {
      world.reset();
      world.spawnOrder();
      world.spawnOrder();
      world.elapsed = 150;
      world.timeLeft = 0;
      world.level = 5;
      world.score = 650;
      world.coins = 650;
      world.combo = 0;
      world.bestCombo = 6;
      world.served = 6;
      world.failed = 1;
      world.plate = [];
      world.tray = [];
      world.chef = { x: 640, y: 595 };
      world.over = true;
      world.message = '';
      world.messageT = 0;
      break;
    }

    default: {
      world.reset();
      break;
    }
  }

  return world;
}

export const SHOT_NAMES = ['play', 'recipes', 'serve', 'results'];