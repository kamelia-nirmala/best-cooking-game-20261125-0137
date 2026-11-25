export const SHIFT_SECONDS = 150;

export const LEVEL = { seconds: 30, max: 5 };

export const INGREDIENTS = [
  { id: "bun", label: "Bun" },
  { id: "patty", label: "Patty" },
  { id: "lettuce", label: "Lettuce" },
  { id: "tomato", label: "Tomato" },
  { id: "cheese", label: "Cheese" },
  { id: "egg", label: "Egg" }
];

export const RECIPES = [
  {
    id: "sizzle-burger",
    name: "Sizzle Burger",
    points: 120,
    items: [
      { id: "bun", cooked: false, chopped: false },
      { id: "patty", cooked: true, chopped: false },
      { id: "lettuce", cooked: false, chopped: true }
    ]
  },
  {
    id: "cheese-melt",
    name: "Cheese Melt",
    points: 100,
    items: [
      { id: "bun", cooked: false, chopped: false },
      { id: "patty", cooked: true, chopped: false },
      { id: "cheese", cooked: false, chopped: false }
    ]
  },
  {
    id: "garden-salad",
    name: "Garden Salad",
    points: 80,
    items: [
      { id: "lettuce", cooked: false, chopped: true },
      { id: "tomato", cooked: false, chopped: true },
      { id: "cheese", cooked: false, chopped: false }
    ]
  },
  {
    id: "sunny-omelette",
    name: "Sunny Omelette",
    points: 110,
    items: [
      { id: "egg", cooked: false, chopped: false },
      { id: "tomato", cooked: false, chopped: true },
      { id: "cheese", cooked: false, chopped: false }
    ]
  },
  {
    id: "double-stacker",
    name: "Double Stacker",
    points: 180,
    items: [
      { id: "bun", cooked: false, chopped: false },
      { id: "patty", cooked: true, chopped: false },
      { id: "patty", cooked: true, chopped: false },
      { id: "lettuce", cooked: false, chopped: true }
    ]
  }
];

export function recipeById(id) {
  return RECIPES.find((recipe) => recipe.id === id);
}

export const BINS = ["bun", "patty", "lettuce", "tomato", "cheese", "egg"];

export const CHOP_TIME = 2.5;
export const GRILL_TIME = 4;
export const GRILL_BURN_TIME = 8;
export const GRILL_SLOTS = 2;
export const PLATE_MAX = 4;
export const TRAY_MAX = 3;
export const WRONG_PENALTY = 20;
export const ORDER_MAX = 4;
export const ORDER_PATIENCE_BASE = 50;
export const ORDER_PATIENCE_PER_LEVEL = 4;
export const ORDER_PATIENCE_MIN = 32;

export const CANVAS_W = 1280;
export const CANVAS_H = 720;

export const STATIONS = {
  bins: { x: 40, y: 192, w: 800, h: 72 },
  chop: { x: 60, y: 300, w: 200, h: 110 },
  grill: { x: 290, y: 300, w: 200, h: 110 },
  plate: { x: 520, y: 300, w: 200, h: 110 },
  serve: { x: 900, y: 280, w: 320, h: 180 },
  trash: { x: 1100, y: 560, w: 120, h: 90 }
};

export const CHEF_START = { x: 640, y: 520 };
export const CHEF_SPEED = 260;

export function formatTime(seconds) {
  const total = Math.ceil(seconds);
  const minutes = Math.floor(total / 60);
  const secs = total % 60;
  return `${minutes}:${String(secs).padStart(2, "0")}`;
}