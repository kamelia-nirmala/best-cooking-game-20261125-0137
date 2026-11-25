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
case 'assembly': {
      world.reset();
      world.spawnOrder();
      world.spawnOrder();
      world.elapsed = 80;
      world.timeLeft = 70;
      world.level = 3;
      world.score = 300;
      world.coins = 300;
      world.combo = 2;
      world.bestCombo = 3;
      world.served = 3;

      world.chopSlot = {
        item: makeItem('tomato'),
        t: 1.0,
        done: false,
      };

      if (!world.grillSlots[0]) {
        world.grillSlots[0] = { item: null, t: 0, burnt: false };
      }
      world.grillSlots[0].item = makeItem('patty');
      world.grillSlots[0].t = 4;
      world.grillSlots[0].burnt = false;

      world.plate = [makeItem('bun'), makeItem('patty', true)];

      world.tray = [makeItem('lettuce', false, true)];

      world.chef.x = 450;
      world.chef.y = 595;

      if (world.orders[0]) {
        world.orders[0].patience = 40;
        world.orders[0].maxPatience = 50;
      }
      if (world.orders[1]) {
        world.orders[1].patience = 22;
        world.orders[1].maxPatience = 50;
      }
      if (world.orders[2]) {
        world.orders[2].patience = 10;
        world.orders[2].maxPatience = 50;
      }
      if (world.orders[3]) {
        world.orders[3].patience = 4;
        world.orders[3].maxPatience = 50;
      }

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

      world.plate = [makeItem('bun'), makeItem('patty', true), makeItem('lettuce', false, true)];

      world.tray = [makeItem('bun')];

      world.chef.x = 485;
      world.chef.y = 375;

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

      world.chef.x = 860;
      world.chef.y = 595;

      world.message = 'Served! +120';
      world.messageT = 1.5;
      break;
    }

    case 'rush':
      world.reset();
      world.spawnOrder();
      world.spawnOrder();

      world.elapsed = 140;
      world.timeLeft = 10;
      world.level = 5;
      world.score = 650;
      world.coins = 650;
      world.combo = 5;
      world.bestCombo = 5;
      world.served = 6;
      world.failed = 0;

      world.chopSlot = {
        item: makeItem('lettuce'),
        t: 2.0,
        done: false,
      };

      if (!world.grillSlots[0]) {
        world.grillSlots[0] = { item: null, t: 0, burnt: false };
      }
      world.grillSlots[0].item = makeItem('patty');
      world.grillSlots[0].t = 7;
      world.grillSlots[0].burnt = false;

      world.plate = [makeItem('bun'), makeItem('patty', true)];
      world.tray = [makeItem('lettuce', false, true)];
      world.chef = { x: 485, y: 375 };

      if (world.orders[0]) {
        world.orders[0].patience = 8;
        world.orders[0].maxPatience = 50;
      }
      if (world.orders[1]) {
        world.orders[1].patience = 6;
        world.orders[1].maxPatience = 50;
      }
      if (world.orders[2]) {
        world.orders[2].patience = 4;
        world.orders[2].maxPatience = 50;
      }
      if (world.orders[3]) {
        world.orders[3].patience = 2;
        world.orders[3].maxPatience = 50;
      }

      world.message = '';
      world.messageT = 0;
      break;

    default: {
      world.reset();
      break;
    }
  }

  return world;
}

export const SHOT_NAMES = ['play', 'assembly', 'serve', 'rush'];