export const ISO_DX = 14;
export const ISO_DY = -14;

export function box3D(ctx, x, y, w, h, top, front, side) {
  ctx.save();

  // Top face (parallelogram shifted up-right)
  ctx.beginPath();
  ctx.moveTo(x + ISO_DX, y + ISO_DY);
  ctx.lineTo(x + w + ISO_DX, y + ISO_DY);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x, y);
  ctx.closePath();
  ctx.fillStyle = top;
  ctx.fill();

  // Right side face (parallelogram)
  ctx.beginPath();
  ctx.moveTo(x + w, y);
  ctx.lineTo(x + w + ISO_DX, y + ISO_DY);
  ctx.lineTo(x + w + ISO_DX, y + ISO_DY + h);
  ctx.lineTo(x + w, y + h);
  ctx.closePath();
  ctx.fillStyle = side;
  ctx.fill();

  // Front face (rectangle)
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.fillStyle = front;
  ctx.fill();

  // Thin dark edges around top and front faces
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.moveTo(x + ISO_DX, y + ISO_DY);
  ctx.lineTo(x + w + ISO_DX, y + ISO_DY);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x, y);
  ctx.closePath();
  ctx.stroke();

  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.stroke();

  ctx.restore();
}

export function floorShadow(ctx, x, y, w, h) {
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h + 6, w * 0.55, 10, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.30)';
  ctx.fill();
  ctx.restore();
}

export function depthSort(items) {
  return items.slice().sort((a, b) => a.y - b.y);
}

export function shade(hex, amt) {
  let raw = String(hex).trim();
  if (raw.charAt(0) === '#') raw = raw.slice(1);

  if (raw.length === 3) {
    raw = raw.charAt(0) + raw.charAt(0) +
          raw.charAt(1) + raw.charAt(1) +
          raw.charAt(2) + raw.charAt(2);
  }

  const num = parseInt(raw, 16);
  if (isNaN(num)) return '#000000';

  let r = (num >> 16) & 255;
  let g = (num >> 8) & 255;
  let b = num & 255;

  r = Math.max(0, Math.min(255, Math.round(r + amt)));
  g = Math.max(0, Math.min(255, Math.round(g + amt)));
  b = Math.max(0, Math.min(255, Math.round(b + amt)));

  const toHex = (v) => {
    const s = v.toString(16);
    return s.length === 1 ? '0' + s : s;
  };

  return '#' + toHex(r) + toHex(g) + toHex(b);
}
