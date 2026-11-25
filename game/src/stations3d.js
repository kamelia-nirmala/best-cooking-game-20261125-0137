const RECTS = {
  chop: { x: 60, y: 300, w: 250, h: 150 },
  grill: { x: 360, y: 300, w: 250, h: 150 },
  plate: { x: 420, y: 520, w: 250, h: 150 },
  serve: { x: 720, y: 520, w: 280, h: 150 },
  trash: { x: 60, y: 520, w: 150, h: 110 }
};

const wood = new THREE.MeshStandardMaterial({ color: 0x8a5a34, roughness: 0.8 });
const woodTop = new THREE.MeshStandardMaterial({ color: 0xa06b40, roughness: 0.7 });
const darkMetal = new THREE.MeshStandardMaterial({ color: 0x2f2c2a, roughness: 0.55, metalness: 0.4 });
const steel = new THREE.MeshStandardMaterial({ color: 0xb8bcc2, roughness: 0.35, metalness: 0.6 });
const white = new THREE.MeshStandardMaterial({ color: 0xf5f0e6, roughness: 0.4 });
const gold = new THREE.MeshStandardMaterial({ color: 0xd4a017, roughness: 0.4, metalness: 0.5 });

function box(w, h, d, x, y, z, mat, parent) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  parent.add(m);
  return m;
}

function cyl(rt, rb, h, x, y, z, mat, parent, seg) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg || 14), mat);
  m.position.set(x, y, z);
  parent.add(m);
  return m;
}

function roundRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function setBadge(b, text) {
  if (b.lastText === text) return;
  b.lastText = text;
  const ctx = b.ctx;
  ctx.clearRect(0, 0, 256, 64);
  roundRectPath(ctx, 5, 5, 246, 54, 18);
  ctx.fillStyle = 'rgba(20,16,12,0.85)';
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#d4a017';
  ctx.stroke();
  ctx.fillStyle = '#ffd166';
  ctx.font = 'bold 28px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 128, 33);
  b.texture.needsUpdate = true;
}

function badge(parent, x, y, z, label) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false
  }));
  sprite.scale.set(2.6, 0.65, 1);
  sprite.position.set(x, y, z);
  sprite.renderOrder = 999;
  parent.add(sprite);
  const b = { sprite, canvas, ctx, texture, label, lastText: null };
  setBadge(b, label);
  return b;
}

function stationGroup(scene, rect) {
  const centerX = (rect.x + rect.w / 2 - 640) / 64;
  const centerZ = (rect.y + rect.h / 2 - 400) / 45;
  const width3d = rect.w / 64;
  const depth3d = rect.h / 45;
  const group = new THREE.Group();
  group.position.set(centerX, 0, centerZ);
  scene.add(group);
  return { group, width3d, depth3d };
}

export function buildStations(scene) {
  // ---- CHOP ----
  const chop = stationGroup(scene, RECTS.chop);
  box(chop.width3d, 1.0, chop.depth3d, 0, 0.5, 0, wood, chop.group);
  box(chop.width3d + 0.2, 0.12, chop.depth3d + 0.2, 0, 1.05, 0, woodTop, chop.group);
  const boardMat = new THREE.MeshStandardMaterial({ color: 0xd9b48a, roughness: 0.7 });
  box(1.6, 0.08, 1.1, -0.4, 1.15, 0, boardMat, chop.group);
  const knife = box(0.9, 0.05, 0.16, 0.8, 1.15, 0.3, steel, chop.group);
  knife.rotation.y = 0.5;
  const chopBadge = badge(chop.group, 0, 2.6, 0, 'POTONG');

  // ---- GRILL ----
  const grill = stationGroup(scene, RECTS.grill);
  box(grill.width3d, 1.0, grill.depth3d, 0, 0.5, 0, darkMetal, grill.group);
  const grillTopMat = new THREE.MeshStandardMaterial({ color: 0x1c1c1c, roughness: 0.5, metalness: 0.3 });
  box(grill.width3d + 0.2, 0.12, grill.depth3d + 0.2, 0, 1.05, 0, grillTopMat, grill.group);
  const burnerMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.4 });
  cyl(0.55, 0.55, 0.08, -0.9, 1.15, 0, burnerMat, grill.group);
  cyl(0.55, 0.55, 0.08, 0.9, 1.15, 0, burnerMat, grill.group);
  const glowMatL = new THREE.MeshStandardMaterial({ color: 0xff6a00, emissive: 0xff5a00, emissiveIntensity: 0 });
  const glowMatR = new THREE.MeshStandardMaterial({ color: 0xff6a00, emissive: 0xff5a00, emissiveIntensity: 0 });
  const glowL = cyl(0.5, 0.5, 0.05, -0.9, 1.18, 0, glowMatL, grill.group);
  const glowR = cyl(0.5, 0.5, 0.05, 0.9, 1.18, 0, glowMatR, grill.group);
  cyl(0.12, 0.12, 0.1, -0.6, 1.1, grill.depth3d / 2 + 0.05, steel, grill.group);
  cyl(0.12, 0.12, 0.1, 0.6, 1.1, grill.depth3d / 2 + 0.05, steel, grill.group);
  const grillBadge = badge(grill.group, 0, 2.6, 0, 'PANGGANG');

  // ---- PLATE ----
  const plate = stationGroup(scene, RECTS.plate);
  box(plate.width3d, 1.0, plate.depth3d, 0, 0.5, 0, wood, plate.group);
  box(plate.width3d + 0.2, 0.12, plate.depth3d + 0.2, 0, 1.05, 0, woodTop, plate.group);
  cyl(0.7, 0.7, 0.08, 0, 1.15, 0, white, plate.group, 24);
  const garnishMat = new THREE.MeshStandardMaterial({ color: 0x4a7d3a, roughness: 0.8 });
  const garnish = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 12), garnishMat);
  garnish.position.set(0.3, 1.22, 0.2);
  plate.group.add(garnish);
  badge(plate.group, 0, 2.6, 0, 'PIRING');

  // ---- SERVE ----
  const serve = stationGroup(scene, RECTS.serve);
  box(serve.width3d, 1.0, serve.depth3d, 0, 0.5, 0, wood, serve.group);
  box(serve.width3d + 0.2, 0.12, serve.depth3d + 0.2, 0, 1.05, 0, woodTop, serve.group);
  const bellX = serve.width3d / 2 - 0.5;
  const bellZ = -serve.depth3d / 2 + 0.4;
  const bell = new THREE.Mesh(new THREE.SphereGeometry(0.28, 18, 14), gold);
  bell.position.set(bellX, 1.35, bellZ);
  serve.group.add(bell);
  cyl(0.3, 0.3, 0.06, bellX, 1.12, bellZ, gold, serve.group, 20);
  box(0.12, 1.6, 0.12, -serve.width3d / 2 + 0.2, 1.9, -serve.depth3d / 2 + 0.1, darkMetal, serve.group);
  box(0.12, 1.6, 0.12, serve.width3d / 2 - 0.2, 1.9, -serve.depth3d / 2 + 0.1, darkMetal, serve.group);
  box(serve.width3d, 0.12, 0.12, 0, 2.7, -serve.depth3d / 2 + 0.1, darkMetal, serve.group);
  badge(serve.group, 0, 3.2, 0, 'SAJI');

  // ---- TRASH ----
  const trash = stationGroup(scene, RECTS.trash);
  cyl(0.7, 0.7, 1.1, 0, 0.55, 0, darkMetal, trash.group, 20);
  const lidMat = new THREE.MeshStandardMaterial({ color: 0x4a4a4a, roughness: 0.6 });
  const lid = box(1.5, 0.08, 1.5, 0, 1.2, 0, lidMat, trash.group);
  lid.rotation.z = 0.25;
  lid.rotation.x = 0.1;
  const paper = new THREE.Mesh(new THREE.SphereGeometry(0.16, 14, 10), white);
  paper.position.set(0.5, 1.25, 0.3);
  trash.group.add(paper);
  badge(trash.group, 0, 2.2, 0, 'SAMPAH');

  function update(world, frame) {
    // Grill burner glow
    const slots = (world && world.grillSlots) || [];
    const pulse = 1.6 + 0.4 * Math.sin(frame * 0.08);
    const glows = [glowL, glowR];
    for (let i = 0; i < 2; i++) {
      const slot = slots[i];
      let intensity = 0;
      if (slot) intensity = slot.burnt ? 0.4 : pulse;
      glows[i].material.emissiveIntensity = intensity;
    }

    // Chop badge progress
    const chopSlot = world && world.chopSlot;
    if (chopSlot) {
      const pct = Math.round(Math.min(1, chopSlot.t / 2.5) * 100);
      setBadge(chopBadge, 'POTONG ' + pct + '%');
    } else {
      setBadge(chopBadge, 'POTONG');
    }

    // Grill badge progress (slot with largest t)
    let best = null;
    for (let i = 0; i < 2; i++) {
      const slot = slots[i];
      if (slot && (!best || slot.t > best.t)) best = slot;
    }
    if (best) {
      const pct = Math.round(Math.min(1, best.t / 4) * 100);
      setBadge(grillBadge, 'PANGGANG ' + pct + '%');
    } else {
      setBadge(grillBadge, 'PANGGANG');
    }
  }

  return { update };
}
