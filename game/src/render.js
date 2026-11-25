import {
  CANVAS_W,
  CANVAS_H,
  STATIONS,
  INGREDIENTS,
  RECIPES,
  BINS,
  CHOP_TIME,
  GRILL_TIME,
  GRILL_BURN_TIME,
  formatTime,
  recipeById
} from './config.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_OVER = 'over';
export const SCREEN_RECIPES = 'recipes';

export const EMOJI = {
  bun: '🍞',
  patty: '🥩',
  lettuce: '🥬',
  tomato: '🍅',
  cheese: '🧀',
  egg: '🥚'
};

const FONT_FAMILY = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

export function drawBox(ctx, x, y, w, h, fill, stroke) {
  ctx.save();

  if (fill !== undefined && fill !== null && fill !== '') {
    ctx.fillStyle = fill;
    ctx.fillRect(x, y, w, h);
  }

  if (stroke !== undefined && stroke !== null && stroke !== '') {
    const lineWidth = Math.max(2, Math.min(4, Math.min(w, h) * 0.035));
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth;
    ctx.strokeRect(
      x + lineWidth / 2,
      y + lineWidth / 2,
      Math.max(0, w - lineWidth),
      Math.max(0, h - lineWidth)
    );
  }

  ctx.restore();
}

export function drawText(ctx, text, x, y, size, color, align) {
  ctx.save();
  ctx.fillStyle = color || '#ffffff';
  ctx.font = `700 ${Math.max(1, Math.round(size))}px ${FONT_FAMILY}`;
  ctx.textAlign = align || 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(text), x, y);
  ctx.restore();
}

function fitTextSize(ctx, text, maxWidth, maxSize, minSize) {
  const floor = minSize || 8;
  let size = Math.max(floor, Math.round(maxSize));

  ctx.save();
  while (size > floor) {
    ctx.font = `700 ${size}px ${FONT_FAMILY}`;
    if (ctx.measureText(String(text)).width <= maxWidth) break;
    size -= 1;
  }
  ctx.restore();

  return size;
}

export function draw(ctx, world, screen, best) {
  const w = CANVAS_W;
  const h = CANVAS_H;
  const hudH = Math.max(58, Math.min(78, Math.round(h * 0.11)));
  const wd = world || {};

  ctx.clearRect(0, 0, w, h);

  // Warm kitchen floor base
  ctx.fillStyle = '#2d221d';
  ctx.fillRect(0, 0, w, h);

  // Kitchen floor tiles
  const tileSize = Math.max(34, Math.round(w / 22));
  const cols = Math.ceil(w / tileSize);
  const rows = Math.ceil(h / tileSize);

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const x = col * tileSize;
      const y = row * tileSize;
      const alternate = (row + col) % 2 === 0;

      ctx.fillStyle = alternate ? '#5a3d2b' : '#4e3423';
      ctx.fillRect(x + 1, y + 1, tileSize - 2, tileSize - 2);

      ctx.fillStyle = 'rgba(255, 224, 180, 0.035)';
      ctx.fillRect(x + 3, y + 3, tileSize - 6, 2);

      if (alternate) {
        const diamondSize = tileSize * 0.22;
        ctx.save();
        ctx.translate(x + tileSize / 2, y + tileSize / 2);
        ctx.rotate(Math.PI / 4);
        ctx.fillStyle = 'rgba(255, 200, 140, 0.10)';
        ctx.fillRect(-diamondSize / 2, -diamondSize / 2, diamondSize, diamondSize);
        ctx.restore();
      }
    }
  }

  // Patterned border strip along the bottom edge
  ctx.fillStyle = '#211713';
  ctx.fillRect(0, h - 10, w, 10);

  for (let bx = 14; bx < w; bx += 28) {
    ctx.save();
    ctx.translate(bx, h - 5);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = '#c97b3f';
    ctx.fillRect(-2.5, -2.5, 5, 5);
    ctx.restore();
  }

  // Soft ambient shading over the floor
  const floorShade = ctx.createLinearGradient(0, hudH, 0, h);
  floorShade.addColorStop(0, 'rgba(255, 196, 120, 0.07)');
  floorShade.addColorStop(0.55, 'rgba(255, 196, 120, 0)');
  floorShade.addColorStop(1, 'rgba(0, 0, 0, 0.20)');

  ctx.save();
  ctx.fillStyle = floorShade;
  ctx.fillRect(0, hudH, w, h - hudH);
  ctx.restore();

  // Top HUD bar
  drawBox(ctx, 0, 0, w, hudH, '#211713', '#c97b3f');
  ctx.fillStyle = '#ffb703';
  ctx.fillRect(0, hudH - 3, w, 3);

  const titleMaxW = Math.min(260, Math.max(145, w * 0.24));
  const titleSize = fitTextSize(
    ctx,
    'DAPUR SIZZLE',
    titleMaxW - 26,
    Math.min(24, hudH * 0.36),
    12
  );

  drawText(ctx, 'DAPUR SIZZLE', 14, hudH / 2, titleSize, '#ffd166', 'left');

  const statsLeft = titleMaxW + 12;
  const statsRight = w - 10;
  const statW = Math.max(42, (statsRight - statsLeft) / 5);
  const statMaxTextW = Math.max(24, statW - 12);

  const rawTime = Number(wd.timeLeft);
  const timeLeft = Number.isFinite(rawTime) ? Math.max(0, rawTime) : 0;
  const timeLow = timeLeft <= 10;
  const timerText = timeLow ? 'TIME LOW!' : formatTime(timeLeft);

  const bestNumber = Number(best);
  const worldBestNumber = Number(wd.best);
  let bestValue = Number.isFinite(bestNumber)
    ? bestNumber
    : Number.isFinite(worldBestNumber)
      ? worldBestNumber
      : 0;
  bestValue = Math.max(bestValue, Number(wd.score) || 0);

  const stats = [
    { label: 'SCORE', value: String(wd.score ?? 0), color: '#fff1d6' },
    { label: 'COMBO', value: `x${wd.combo ?? 0}`, color: '#ffb86b' },
    { label: 'LEVEL', value: String(wd.level ?? 1), color: '#e9d6bb' },
    {
      label: 'TIMER',
      value: timerText,
      color: timeLow ? '#ff4d4d' : '#9de5a4'
    },
    { label: 'BEST', value: String(bestValue), color: '#ffd166' }
  ];

  const labelY = hudH * 0.31;
  const valueY = hudH * 0.69;
  const labelSize = Math.max(8, Math.min(10, Math.round(hudH * 0.15)));
  const valueMaxSize = Math.max(12, Math.min(19, Math.round(hudH * 0.28)));
  const timerValueMaxSize = Math.min(30, valueMaxSize * 1.6);

  for (let i = 0; i < stats.length; i += 1) {
    const cellX = statsLeft + statW * i;
    const centerX = cellX + statW / 2;
    const item = stats[i];

    if (i > 0) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.075)';
      ctx.fillRect(cellX, hudH * 0.2, 1, hudH * 0.6);
    }

    const fittedLabelSize = fitTextSize(
      ctx,
      item.label,
      statMaxTextW,
      labelSize,
      7
    );
    const maxValueSize = item.label === 'TIMER' ? timerValueMaxSize : valueMaxSize;
    const fittedValueSize = fitTextSize(
      ctx,
      item.value,
      statMaxTextW,
      maxValueSize,
      9
    );

    const isComboFlash =
      item.label === 'COMBO' &&
      typeof wd.message === 'string' &&
      wd.message.indexOf('Served!') === 0 &&
      wd.messageT > 0;
    const flashValueSize = isComboFlash
      ? Math.min(30, fittedValueSize * 1.4)
      : fittedValueSize;
    const flashColor = isComboFlash ? '#ffe066' : item.color;

    drawText(ctx, item.label, centerX, labelY, fittedLabelSize, '#c8a98b', 'center');
    drawText(ctx, item.value, centerX, valueY, flashValueSize, flashColor, 'center');
  }

  if (screen === SCREEN_TITLE) {
    drawTitle(ctx, world, best);
  } else if (screen === SCREEN_OVER) {
    drawOver(ctx, world, best);
  } else if (screen === SCREEN_RECIPES) {
    drawRecipeBook(ctx, world);
  } else {
    drawPlay(ctx, world);
  }
}

function drawOrderCard(ctx, order, x, y, w, h) {
  const p = Math.max(0, Math.min(1, order.patience / order.maxPatience));
  const barColor = p > 0.5 ? '#5ad17a' : p > 0.25 ? '#ffc93c' : '#ff4d4d';
  const textColor = p > 0.5 ? '#9fe0a0' : p > 0.25 ? '#ffd166' : '#ff5f5f';
  drawBox(ctx, x, y, w, h, '#2f3852', '#4a5470');
  drawText(ctx, order.recipe.name, x + 10, y + 17, 15, '#f2f5ff', 'left');
  drawText(ctx, formatTime(order.patience), x + w - 10, y + 17, 13, textColor, 'right');
  order.recipe.items.forEach((it, i) => {
    const ix = x + 18 + i * 34;
    drawText(ctx, EMOJI[it.id], ix, y + 42, 24, '#ffffff', 'center');
    if (it.chopped) drawText(ctx, 'C', ix - 8, y + 32, 8, '#7fd3ff', 'center');
    if (it.cooked) drawText(ctx, '🔥', ix + 8, y + 32, 8, '#ff9a3c', 'center');
  });
  drawBox(ctx, x + 10, y + h - 14, w - 20, 8, '#141a26', '#3a4256');
  drawBox(ctx, x + 10, y + h - 14, Math.max(2, (w - 20) * p), 8, barColor, null);
}

function drawOrderBoard(ctx, world) {
  drawBox(ctx, 40, 86, 1200, 92, '#1b2233', '#3a4256');
  drawText(ctx, 'ORDERS', 52, 138, 14, '#8fa1c7', 'left');
  const n = Math.min(4, world.orders.length);
  for (let i = 0; i < n; i++) {
    drawOrderCard(ctx, world.orders[i], 150 + i * 270, 98, 250, 70);
  }
}

function drawBins(ctx) {
  const b = STATIONS.bins;
  drawBox(ctx, b.x, b.y, b.w, b.h, '#1b2233', '#3a4256');
  const gap = 8;
  const pad = 10;
  const bw = (b.w - pad * 2 - gap * (BINS.length - 1)) / BINS.length;
  const bh = b.h - pad * 2;
  BINS.forEach((id, i) => {
    const bx = b.x + pad + i * (bw + gap);
    const by = b.y + pad;
    drawBox(ctx, bx, by, bw, bh, '#2f3852', '#4a5470');
    drawText(ctx, EMOJI[id], bx + bw / 2, by + 22, 20, '#ffffff', 'center');
    drawText(ctx, INGREDIENTS.find((ing) => ing.id === id).label, bx + bw / 2, by + bh - 8, 11, '#dfe6f5', 'center');
  });
}

function drawChopStation(ctx, world) {
  const s = STATIONS.chop;
  drawBox(ctx, s.x, s.y, s.w, s.h, '#1b2233', '#3a4256');
  drawText(ctx, 'CHOP', s.x + s.w / 2, s.y + 24, 15, '#dfe6f5', 'center');
  const slot = world.chopSlot;
  if (!slot) {
    drawText(ctx, 'EMPTY', s.x + s.w / 2, s.y + 68, 12, '#6c7a99', 'center');
    return;
  }
  drawText(ctx, EMOJI[slot.item.id], s.x + s.w / 2, s.y + 62, 24, '#ffffff', 'center');
  const p = slot.done ? 1 : Math.min(1, slot.t / CHOP_TIME);
  drawBox(ctx, s.x + 20, s.y + 72, s.w - 40, 10, '#141a26', '#3a4256');
  drawBox(ctx, s.x + 20, s.y + 72, Math.max(2, (s.w - 40) * p), 10, '#5ad17a', null);
  if (slot.done) drawText(ctx, 'READY', s.x + s.w / 2, s.y + 100, 12, '#8bffa8', 'center');
}
function drawGrillStation(ctx, world) {
  const R = STATIONS.grill;
  drawBox(ctx, R.x, R.y, R.w, R.h, '#3a2418', '#8a5a34');
  drawText(ctx, 'GRILL', R.x + R.w / 2, R.y + 18, 15, '#ffcf9a', 'center');
  world.grillSlots.forEach((slot, i) => {
    const cx = R.x + 60 + i * 80;
    const cy = R.y + 54;
    const blink = Math.floor(world.elapsed * 2) % 2 === 0;
    const warning = slot.item && !slot.burnt && slot.t >= GRILL_TIME && slot.t >= GRILL_BURN_TIME - 2;
    ctx.beginPath();
    ctx.arc(cx, cy, 24, 0, Math.PI * 2);
    ctx.fillStyle = slot.item ? '#6b4a2f' : '#2a2a2a';
    ctx.fill();
    ctx.lineWidth = 3;
    if (warning) ctx.strokeStyle = blink ? '#ff2e1f' : '#ff9a3c';
    else ctx.strokeStyle = slot.burnt ? '#ff5a44' : '#a93f2a';
    ctx.stroke();
    if (slot.item) {
      ctx.font = '24px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(EMOJI[slot.item.id] || '🍔', cx, cy + 1);
    }
    if (slot.item && !slot.burnt) {
      const drift = (world.elapsed * 12) % 10;
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.beginPath(); ctx.arc(cx - 6, cy - 34 - drift, 5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + 4, cy - 42 - drift, 4, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + 10, cy - 30 - drift, 3, 0, Math.PI * 2); ctx.fill();
    }
    const p = slot.item ? Math.min(1, slot.t / GRILL_TIME) : 0;
    ctx.fillStyle = '#22201c';
    ctx.fillRect(cx - 28, cy + 30, 56, 7);
    ctx.fillStyle = slot.burnt ? '#e0402e' : (slot.t >= GRILL_TIME ? '#5ad46a' : '#f0a63c');
    ctx.fillRect(cx - 28, cy + 30, 56 * p, 7);
    if (slot.burnt) drawText(ctx, 'BURNING', cx, cy + 48, 11, '#ff5a44', 'center');
    else if (warning) drawText(ctx, 'HURRY!', cx, cy + 48, 11, blink ? '#ffd23e' : '#ff5a44', 'center');
    else if (slot.t >= GRILL_TIME) drawText(ctx, 'READY', cx, cy + 48, 11, '#7bdc8a', 'center');
  });
}

function drawPlateStation(ctx, world) {
  const R = STATIONS.plate;
  drawBox(ctx, R.x, R.y, R.w, R.h, '#2c2c34', '#7d7d92');
  drawText(ctx, 'PLATE', R.x + R.w / 2, R.y + 18, 15, '#d6d6e6', 'center');
  const cx = R.x + R.w / 2;
  const cy = R.y + R.h / 2 + 12;
  const radius = 54;
  ctx.beginPath();
  ctx.ellipse(cx, cy + radius + 6, radius + 6, 8, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = '#e8e4da';
  ctx.fill();
  ctx.strokeStyle = '#b8b0a0';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.font = '26px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  if (world.plate.length === 0) {
    ctx.fillText('🍽', cx, cy);
  } else {
    const bottomY = cy + 32;
    world.plate.forEach((item, i) => {
      const iy = bottomY - i * 16;
      ctx.font = '32px serif';
      ctx.fillText(EMOJI[item.id] || '🍽', cx, iy);
    });
  }
}

function drawServeWindow(ctx, world) {
  const R = STATIONS.serve;
  drawBox(ctx, R.x, R.y, R.w, R.h, '#20303a', '#5b8fa8');
  drawText(ctx, 'SERVE', R.x + R.w / 2, R.y + 26, 18, '#bfe4f5', 'center');
  drawText(ctx, 'Served: ' + world.served, R.x + R.w / 2, R.y + R.h - 22, 22, '#ffffff', 'center');
}

function drawTrash(ctx) {
  const R = STATIONS.trash;
  drawBox(ctx, R.x, R.y, R.w, R.h, '#33222a', '#8a5560');
  drawText(ctx, 'TRASH', R.x + R.w / 2, R.y + R.h / 2, 15, '#e6b8c0', 'center');
}

function drawChef(ctx, world) {
  const x = world.chef.x;
  const y = world.chef.y;

  // Shadow under the feet
  ctx.beginPath();
  ctx.ellipse(x, y + 42, 26, 7, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.30)';
  ctx.fill();

  // Shoes
  ctx.fillStyle = '#2b2b2b';
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(x - 16, y + 30, 14, 10, 3);
  } else {
    ctx.rect(x - 16, y + 30, 14, 10);
  }
  ctx.fill();
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(x + 2, y + 30, 14, 10, 3);
  } else {
    ctx.rect(x + 2, y + 30, 14, 10);
  }
  ctx.fill();

  // Pants
  drawBox(ctx, x - 15, y + 8, 30, 24, '#3a3f4a', '#2c3038');

  // Jacket
  drawBox(ctx, x - 19, y - 14, 38, 30, '#f5f5f0', '#c9c9c9');

  // Apron (on top of jacket)
  drawBox(ctx, x - 14, y - 6, 28, 32, '#e05a4f', '#a33b33');
  ctx.fillStyle = '#f08070';
  ctx.fillRect(x - 14, y - 6, 28, 5);

  // Buttons
  ctx.fillStyle = '#333333';
  ctx.beginPath();
  ctx.arc(x, y - 6, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x, y + 2, 2, 0, Math.PI * 2);
  ctx.fill();

  // Collar
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#c9c9c9';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - 8, y - 14);
  ctx.lineTo(x - 2, y - 14);
  ctx.lineTo(x - 8, y - 7);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + 8, y - 14);
  ctx.lineTo(x + 2, y - 14);
  ctx.lineTo(x + 8, y - 7);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Hands
  ctx.fillStyle = '#f2c48d';
  ctx.beginPath();
  ctx.arc(x - 22, y + 6, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + 22, y + 6, 5, 0, Math.PI * 2);
  ctx.fill();

  // Face
  ctx.beginPath();
  ctx.arc(x, y - 26, 13, 0, Math.PI * 2);
  ctx.fillStyle = '#f2c48d';
  ctx.fill();
  ctx.strokeStyle = '#c9955f';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Eyes
  ctx.fillStyle = '#222222';
  ctx.beginPath();
  ctx.arc(x - 5, y - 28, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + 5, y - 28, 2, 0, Math.PI * 2);
  ctx.fill();

  // Smile
  ctx.beginPath();
  ctx.arc(x, y - 22, 5, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.strokeStyle = '#8a5a3b';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Toque base band
  drawBox(ctx, x - 14, y - 46, 28, 10, '#ffffff', '#c9c9c9');

  // Toque puffy top
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#c9c9c9';
  ctx.lineWidth = 2;
  const puffs = [
    [x - 9, y - 50],
    [x, y - 54],
    [x + 9, y - 50],
  ];
  puffs.forEach(([px, py]) => {
    ctx.beginPath();
    ctx.arc(px, py, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });

  // Tray items on the apron, below the hands, in front of the chef
  if (world.tray && world.tray.length) {
    ctx.font = '18px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const spacing = 22;
    const startX = x - ((world.tray.length - 1) * spacing) / 2;
    world.tray.forEach((item, i) => {
      ctx.fillText(EMOJI[item.id] || '❓', startX + i * spacing, y + 16);
    });
  }
}

function drawMessage(ctx, world) {
  if (world.messageT <= 0) return;
  const w = 620;
  const h = 44;
  const x = (CANVAS_W - w) / 2;
  // Sit in the empty middle-floor gap between the station rows so it never covers the serve panel or the plate
  const y = 463;
  ctx.globalAlpha = Math.min(1, world.messageT / 0.5);
  drawBox(ctx, x, y, w, h, 'rgba(0,0,0,0.82)', '#f0a63c');
  drawText(ctx, world.message, CANVAS_W / 2, y + h / 2, 18, '#ffe9c9', 'center');
  ctx.globalAlpha = 1;
}

function drawScorePopup(ctx, world) {
  if (!world.message || world.message.indexOf('Served!') !== 0 || world.messageT <= 0) return;
  const text = world.message.replace('Served! ', '');
  const y = 580 - (1.5 - world.messageT) * 40;
  ctx.globalAlpha = Math.min(1, world.messageT / 0.5);
  drawText(ctx, text, 975, y, 24, '#ffd166', 'center');
  ctx.globalAlpha = 1;
}

function drawFooter(ctx) {
  drawText(ctx, 'WASD / arrows move, E use, P pause, M mute, Enter start', CANVAS_W / 2, CANVAS_H - 24, 13, '#9c9384', 'center');
}

function drawStationLabels(ctx) {
  drawText(ctx, 'ORDERS', 52, 138, 14, '#8fa1c7', 'left');

  const b = STATIONS.bins;
  const gap = 8;
  const pad = 10;
  const bw = (b.w - pad * 2 - gap * (BINS.length - 1)) / BINS.length;
  const bh = b.h - pad * 2;
  for (let i = 0; i < BINS.length; i++) {
    const id = BINS[i];
    const bx = b.x + pad + i * (bw + gap);
    const by = b.y + pad;
    drawText(ctx, INGREDIENTS.find((ing) => ing.id === id).label, bx + bw / 2, by + bh - 8, 11, '#dfe6f5', 'center');
  }

  const s = STATIONS.chop;
  drawText(ctx, 'CHOP', s.x + s.w / 2, s.y + 24, 15, '#dfe6f5', 'center');

  const g = STATIONS.grill;
  drawText(ctx, 'GRILL', g.x + g.w / 2, g.y + 18, 15, '#ffcf9a', 'center');

  const p = STATIONS.plate;
  drawText(ctx, 'PLATE', p.x + p.w / 2, p.y + 18, 15, '#d6d6e6', 'center');

  const sv = STATIONS.serve;
  drawText(ctx, 'SERVE', sv.x + sv.w / 2, sv.y + 26, 18, '#bfe4f5', 'center');

  const t = STATIONS.trash;
  drawText(ctx, 'TRASH', t.x + t.w / 2, t.y + t.h / 2, 15, '#e6b8c0', 'center');
}

function drawDecorations(ctx) {
  ctx.save();

  // Flat floor mat (keset) below the serve panel
  ctx.fillStyle = '#a8452e'; ctx.beginPath(); ctx.ellipse(850, 692, 150, 12, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#c0603f'; ctx.beginPath(); ctx.ellipse(850, 692, 132, 8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#8f3a28'; ctx.beginPath(); ctx.ellipse(850, 692, 100, 4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#6f2a1c'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(850, 692, 150, 12, 0, 0, Math.PI * 2); ctx.stroke();

  // Left potted plant
  ctx.fillStyle = '#c97b3f'; ctx.beginPath(); ctx.moveTo(70, 684); ctx.lineTo(120, 684); ctx.lineTo(114, 706); ctx.lineTo(76, 706); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#a85f2c'; ctx.fillRect(66, 678, 58, 8);
  ctx.fillStyle = '#3a2416'; ctx.fillRect(72, 680, 46, 6);
  ctx.fillStyle = '#5a7d4a'; ctx.beginPath(); ctx.arc(85, 661, 14, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(105, 656, 12, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#6b8f55'; ctx.beginPath(); ctx.arc(95, 646, 13, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(112, 668, 10, 0, Math.PI * 2); ctx.fill();

  // Right potted plant
  ctx.fillStyle = '#c97b3f'; ctx.beginPath(); ctx.moveTo(1160, 678); ctx.lineTo(1210, 678); ctx.lineTo(1204, 700); ctx.lineTo(1166, 700); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#a85f2c'; ctx.fillRect(1156, 672, 58, 8);
  ctx.fillStyle = '#3a2416'; ctx.fillRect(1162, 674, 46, 6);
  ctx.fillStyle = '#5a7d4a'; ctx.beginPath(); ctx.arc(1175, 655, 14, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(1195, 650, 12, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#6b8f55'; ctx.beginPath(); ctx.arc(1185, 640, 13, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(1168, 662, 10, 0, Math.PI * 2); ctx.fill();

  // Menu board on the right wall, right of the bins and above the oven
  ctx.fillStyle = '#5a3a20'; ctx.fillRect(1040, 185, 200, 85);
  ctx.fillStyle = '#2b1a10'; ctx.fillRect(1048, 193, 184, 69);
  ctx.strokeStyle = '#7a4a28'; ctx.lineWidth = 2; ctx.strokeRect(1040, 185, 200, 85);

  // Fake menu text lines
  ctx.strokeStyle = '#e8d5a8'; ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(1060, 210); ctx.lineTo(1118, 210);
  ctx.moveTo(1060, 226); ctx.lineTo(1110, 226);
  ctx.moveTo(1060, 242); ctx.lineTo(1122, 242);
  ctx.stroke();

  // Small chalk burger drawing
  ctx.beginPath(); ctx.arc(1190, 216, 15, Math.PI, 0); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(1175, 220); ctx.lineTo(1205, 220); ctx.stroke();
  ctx.beginPath(); ctx.arc(1190, 228, 15, 0, Math.PI); ctx.stroke();

  // Wall rack with jars above the oven
  ctx.fillStyle = '#8a5a34'; ctx.fillRect(1040, 280, 200, 18);
  ctx.fillStyle = '#5a3a20'; ctx.fillRect(1040, 296, 200, 4);

  var jarXs = [1070, 1140, 1210];
  var jarColors = ['#c94f45', '#6b8f55', '#d9a33a'];
  var j;
  for (j = 0; j < 3; j++) {
    ctx.fillStyle = jarColors[j];
    ctx.beginPath(); ctx.arc(jarXs[j], 272, 10, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.28)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(jarXs[j], 272, 10, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#d8d2c4'; ctx.fillRect(jarXs[j] - 8, 258, 16, 5);
    ctx.strokeStyle = '#8f8878'; ctx.lineWidth = 1; ctx.strokeRect(jarXs[j] - 8, 258, 16, 5);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.beginPath(); ctx.arc(jarXs[j] - 3, 269, 3, 0, Math.PI * 2); ctx.fill();
  }

  // Stove / oven on the right wall
  ctx.fillStyle = '#2b2b30'; ctx.fillRect(1040, 300, 200, 130);
  ctx.strokeStyle = '#17171a'; ctx.lineWidth = 2; ctx.strokeRect(1040, 300, 200, 130);
  ctx.fillStyle = '#3a3a42'; ctx.fillRect(1040, 300, 200, 16);

  // Two burner circles on top
  ctx.strokeStyle = '#0f0f12'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(1090, 310, 8, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(1160, 310, 8, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = '#55555e'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(1090, 310, 4, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(1160, 310, 4, 0, Math.PI * 2); ctx.stroke();

  // Oven door and lighter window
  ctx.fillStyle = '#1b1b1f'; ctx.fillRect(1055, 335, 170, 80);
  ctx.fillStyle = '#4b4f55'; ctx.fillRect(1060, 340, 160, 70);
  ctx.strokeStyle = '#121215'; ctx.lineWidth = 2; ctx.strokeRect(1060, 340, 160, 70);
  ctx.strokeStyle = '#646a72'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(1068, 404); ctx.lineTo(1112, 348); ctx.stroke();

  // Oven handle
  ctx.strokeStyle = '#9a9aa2'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(1070, 331); ctx.lineTo(1210, 331); ctx.stroke();

  // Small red indicator light
  ctx.fillStyle = '#e0453a'; ctx.beginPath(); ctx.arc(1218, 325, 5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)'; ctx.beginPath(); ctx.arc(1216, 323, 2, 0, Math.PI * 2); ctx.fill();

  // Long wooden work table in the middle-floor gap
  ctx.fillStyle = '#6b4326'; ctx.fillRect(60, 480, 16, 38); ctx.fillRect(1200, 480, 16, 38);
  ctx.fillStyle = '#5a371f'; ctx.fillRect(68, 480, 4, 38); ctx.fillRect(1208, 480, 4, 38);

  ctx.fillStyle = '#8a5a34'; ctx.fillRect(40, 458, 1200, 22);
  ctx.fillStyle = '#a06b40'; ctx.fillRect(40, 458, 1200, 3);
  ctx.fillStyle = '#5e3a1f'; ctx.fillRect(40, 475, 1200, 5);

  // Subtle wood grain
  ctx.strokeStyle = '#7a4e2c'; ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(44, 465); ctx.lineTo(1236, 465);
  ctx.moveTo(44, 470); ctx.lineTo(1236, 470);
  ctx.stroke();

  // Chopping board on the table
  ctx.fillStyle = '#d2a86e'; ctx.fillRect(200, 462, 120, 14);
  ctx.strokeStyle = '#8a5a34'; ctx.lineWidth = 2; ctx.strokeRect(200, 462, 120, 14);

  // Small knife on the chopping board
  ctx.strokeStyle = '#c9ccd2'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(228, 469); ctx.lineTo(278, 469); ctx.stroke();
  ctx.strokeStyle = '#3a3a3e'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(278, 469); ctx.lineTo(296, 469); ctx.stroke();

  // Stack of bowls
  ctx.strokeStyle = '#e8dcc8'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(520, 460, 15, 0, Math.PI); ctx.stroke();
  ctx.beginPath(); ctx.arc(520, 456, 10, 0, Math.PI); ctx.stroke();

  // Small pot on the table
  ctx.fillStyle = '#2f2c2a'; ctx.beginPath(); ctx.arc(715, 468, 11, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#5c5c62'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(715, 468, 11, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = '#2f2c2a'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(704, 466); ctx.lineTo(699, 466); ctx.moveTo(726, 466); ctx.lineTo(731, 466); ctx.stroke();

  ctx.restore();
}

export function drawRecipeBook(ctx, world) {
  const DISH_EMOJI = {
    'sizzle-burger': '🍔',
    'cheese-melt': '🧀',
    'garden-salad': '🥗',
    'sunny-omelette': '🍳',
    'double-stacker': '🍔',
  };
  const ITEM_LABEL = {
    bun: 'Roti',
    patty: 'Daging',
    lettuce: 'Selada',
    tomato: 'Tomat',
    cheese: 'Keju',
    egg: 'Telur',
  };

  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  drawBox(ctx, 90, 70, 1100, 580, '#2c2118', '#c97b3f');

  drawText(ctx, 'BUKU RESEP', 640, 115, 34, '#ffd166', 'center');
  drawText(ctx, 'Dapur Sizzle — 5 resep, sajikan sebelum waktu habis', 640, 148, 16, '#e8dcc8', 'center');

  for (let i = 0; i < RECIPES.length; i++) {
    const recipe = RECIPES[i];
    const rowY = 185 + i * 90;

    drawBox(ctx, 120, rowY, 1040, 84, '#3a2c20', '#6b4a33');

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '44px serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(DISH_EMOJI[recipe.id] || '🍽️', 170, rowY + 42);

    drawText(ctx, recipe.name, 210, rowY + 30, 24, '#f2f5ff', 'left');
    drawText(ctx, recipe.points + ' poin', 210, rowY + 60, 16, '#ffd166', 'left');

    for (let j = 0; j < recipe.items.length; j++) {
      const item = recipe.items[j];
      const x = 560 + j * 56;

      drawText(ctx, EMOJI[item.id] || '•', x, rowY + 42, 28, '#ffffff', 'center');
      drawText(ctx, ITEM_LABEL[item.id] || item.id, x, rowY + 68, 11, '#c8a98b', 'center');

      if (item.cooked) {
        drawText(ctx, '🔥', x + 18, rowY + 22, 10, '#ffb347', 'center');
      }
      if (item.chopped) {
        drawText(ctx, 'C', x - 18, rowY + 22, 10, '#7fd3ff', 'center');
      }
    }
  }

  drawText(ctx, 'Tekan R untuk kembali ke dapur', 640, 668, 16, '#8ef58e', 'center');
}

function drawPlay(ctx, world) {
  drawOrderBoard(ctx, world);
  drawBins(ctx);
  drawChopStation(ctx, world);
  drawGrillStation(ctx, world);
  drawPlateStation(ctx, world);
  drawServeWindow(ctx, world);
  drawTrash(ctx);
  drawDecorations(ctx);
  drawChef(ctx, world);
  drawStationLabels(ctx);
  drawMessage(ctx, world);
  drawScorePopup(ctx, world);
  drawFooter(ctx);
}
export function drawTitle(ctx, world, best = 0) {
  ctx.fillStyle = '#141a26';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  const cx = CANVAS_W / 2;
  const maxW = CANVAS_W * 0.9;
  const title = 'DAPUR SIZZLE';
  const subtitle = 'A fast kitchen shift: cook, serve, survive the rush.';
  const prompt = 'Press Enter or click to start';
  const bestText = `Best: ${best || 0}`;

  const titleSize = fitTitleText(title, Math.min(CANVAS_W * 0.12, CANVAS_H * 0.14), maxW);
  drawText(ctx, title, cx, CANVAS_H * 0.32, titleSize, '#ffd166', 'center');

  const subtitleSize = fitTitleText(subtitle, Math.min(CANVAS_W * 0.032, 22), maxW);
  drawText(ctx, subtitle, cx, CANVAS_H * 0.32 + titleSize * 0.95, subtitleSize, '#e8e8e8', 'center');

  const promptSize = fitTitleText(prompt, Math.min(CANVAS_W * 0.036, 24), maxW);
  drawText(ctx, prompt, cx, CANVAS_H * 0.63, promptSize, '#8ef58e', 'center');

  const bestSize = fitTitleText(bestText, Math.min(CANVAS_W * 0.032, 22), maxW);
  drawText(ctx, bestText, cx, CANVAS_H * 0.63 + promptSize * 1.7, bestSize, '#ffd166', 'center');
}

export function drawOver(ctx, world, best = 0) {
  ctx.fillStyle = 'rgba(0,0,0,0.62)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  const stars = world.score >= 500 ? 3 : world.score >= 300 ? 2 : world.score >= 100 ? 1 : 0;

  const titleBase = Math.min(CANVAS_W * 0.1, CANVAS_H * 0.13);
  const titleSize = fitTitleText('SHIFT SELESAI', titleBase, CANVAS_W * 0.82);
  drawText(ctx, 'SHIFT SELESAI', CANVAS_W / 2, CANVAS_H * 0.16, titleSize, '#ff6b6b', 'center');

  for (let k = 0; k < 3; k++) {
    const filled = k < stars;
    drawText(
      ctx,
      filled ? '★' : '☆',
      CANVAS_W / 2 + (k - 1) * 56,
      CANVAS_H * 0.27,
      44,
      filled ? '#ffd166' : '#5a5a5a',
      'center'
    );
  }

  const rows = [
    [`Skor: ${world.score}`, '#ffffff', 0.38],
    [`Tersaji: ${world.served}`, '#8ef58e', 0.48],
    [`Gagal: ${world.failed}`, '#ff9f43', 0.57],
    [`Kombo terbaik: x${world.bestCombo}`, '#ffd166', 0.66],
    [`Terbaik: ${Math.max(best || 0, world.score || 0)}`, '#ffd166', 0.75],
    ['Tekan Enter atau klik untuk main lagi', '#8ef58e', 0.88],
  ];
  const rowBases = [0.052, 0.048, 0.048, 0.048, 0.048, 0.05];

  for (let i = 0; i < rows.length; i++) {
    const [text, color, fy] = rows[i];
    const base = CANVAS_H * rowBases[i];
    const size = fitTitleText(text, base, CANVAS_W * 0.8);
    drawText(ctx, text, CANVAS_W / 2, CANVAS_H * fy, size, color, 'center');
  }
}

function fitTitleText(text, base, maxWidth) {
  const estimate = text.length * 0.62;
  return Math.min(base, maxWidth / estimate);
}