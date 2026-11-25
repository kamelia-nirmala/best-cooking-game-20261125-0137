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
    case 'title': {
      world.reset();
      world.elapsed = 0;
      world.timeLeft = 150;
      world.level = 1;
      world.chef.x = 640;
      world.chef.y = 520;
      break;
    }

    case 'play': {
      world.reset();
      world.spawnOrder();
      world.spawnOrder();
      world.elapsed = 65;
      world.timeLeft = 85;
      world.level = 3;
      world.score = 240;
      world.coins = 240;
      world.combo = 3;
      world.bestCombo = 3;
      world.served = 2;

      world.chopSlot = {
        item: makeItem('lettuce'),
        t: 1.5,
        done: false,
      };

      if (!world.grillSlots[0]) {
        world.grillSlots[0] = { item: null, t: 0, burnt: false };
      }
      world.grillSlots[0].item = makeItem('patty');
      world.grillSlots[0].t = 2;
      world.grillSlots[0].burnt = false;

      world.tray = [makeItem('bun'), makeItem('patty', true)];

      world.chef.x = 390;
      world.chef.y = 355;

      world.message = '';
      world.messageT = 0;
      break;
    }

    case 'serve': {
      world.reset();
      world.spawnOrder();
      world.spawnOrder();
      world.elapsed = 100;
      world.timeLeft = 50;
      world.level = 4;
      world.score = 420;
      world.coins = 420;
      world.combo = 4;
      world.bestCombo = 4;
      world.served = 4;

      if (!world.orders.length) {
        world.spawnOrder();
      }

      const recipe = (world.orders[0] && world.orders[0].recipe) || RECIPES[0];
      world.plate = recipeItems(recipe).map(itemFromSpec);

      world.chef.x = 1060;
      world.chef.y = 370;

      world.message = 'Served! +120';
      world.messageT = 1.5;
      break;
    }

    case 'end': {
      world.reset();
      world.elapsed = 150;
      world.timeLeft = 0;
      world.level = 5;
      world.score = 680;
      world.coins = 680;
      world.served = 6;
      world.failed = 1;
      world.bestCombo = 5;
      world.over = true;
      world.message = 'Shift over!';
      world.messageT = 3;
      break;
    }

    default: {
      world.reset();
      break;
    }
  }

  return world;
}

export const SHOT_NAMES = ['title', 'play', 'serve', 'end'];