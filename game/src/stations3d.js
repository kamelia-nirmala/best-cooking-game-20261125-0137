const RECTS = {
  chop: { x: 60, y: 300, w: 250, h: 150 },
  grill: { x: 360, y: 300, w: 250, h: 150 },
  plate: { x: 420, y: 520, w: 250, h: 150 },
  serve: { x: 720, y: 520, w: 280, h: 150 },
  trash: { x: 60, y: 520, w: 150, h: 110 }
};

const cabinetGreen = new THREE.MeshStandardMaterial({ color: 0x2e5d43, roughness: 0.7 });
const cabinetGreenDark = new THREE.MeshStandardMaterial({ color: 0x244a36, roughness: 0.75 });
const cabinetWood = new THREE.MeshStandardMaterial({ color: 0x6b4a2f, roughness: 0.75 });
const cabinetWoodDark = new THREE.MeshStandardMaterial({ color: 0x543a25, roughness: 0.8 });
const counterMat = new THREE.MeshStandardMaterial({ color: 0xf0e6d0, roughness: 0.6 });
const backsplashMat = new THREE.MeshStandardMaterial({ color: 0xe8dcc0, roughness: 0.65 });
const darkMetal = new THREE.MeshStandardMaterial({ color: 0x2f2c2a, roughness: 0.55, metalness: 0.4 });
const steel = new THREE.MeshStandardMaterial({ color: 0xb8bcc2, roughness: 0.35, metalness: 0.6 });
const white = new THREE.MeshStandardMaterial({ color: 0xf5f0e6, roughness: 0.4 });
const gold = new THREE.MeshStandardMaterial({ color: 0xd4a017, roughness: 0.4, metalness: 0.5 });

function box(w, h, d, x, y, z, mat, parent) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}

function cyl(rt, rb, h, x, y, z, mat, parent, seg) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg || 14), mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}

function mesh(geo, mat, x, y, z, parent) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
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
    opacity: 0.85,
    depthTest: false
  }));
  sprite.scale.set(1.3, 0.32, 1);
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

function buildCabinet(st, bodyMat, panelMat) {
  const w = st.width3d;
  const d = st.depth3d;
  const g = st.group;

  box(w, 0.95, d, 0, 0.475, 0, bodyMat, g);

  const frontZ = d / 2 + 0.015;
  const panelH = 0.26;
  const panelY1 = 0.35;
  const panelY2 = 0.7;
  const panelW = Math.max(0.4, w - 0.3);
  const knobZ = d / 2 + 0.06;

  const p1 = box(panelW, panelH, 0.06, 0, panelY1, frontZ, panelMat, g);
  const p2 = box(panelW, panelH, 0.06, 0, panelY2, frontZ, panelMat, g);
  p1.castShadow = true;
  p2.castShadow = true;

  mesh(new THREE.SphereGeometry(0.05, 12, 10), gold, -panelW / 2 + 0.12, panelY1, knobZ, g);
  mesh(new THREE.SphereGeometry(0.05, 12, 10), gold, -panelW / 2 + 0.12, panelY2, knobZ, g);

  const overhang = 0.12;
  const topW = w + overhang * 2;
  const topD = d + overhang * 2;
  box(topW, 0.14, topD, 0, 1.02, 0, counterMat, g);
  box(topW, 0.04, topD, 0, 0.93, 0, gold, g);

  box(topW, 0.5, 0.08, 0, 1.29, -d / 2 + 0.04, backsplashMat, g);
}

export function buildStations(scene) {
  // ---- CHOP ----
  const chop = stationGroup(scene, RECTS.chop);
  buildCabinet(chop, cabinetGreen, cabinetGreenDark);
  const boardMat = new THREE.MeshStandardMaterial({ color: 0xd9b48a, roughness: 0.7 });
  box(1.6, 0.08, 1.1, -0.4, 1.15, 0, boardMat, chop.group);
  const knife = box(0.9, 0.05, 0.16, 0.8, 1.15, 0.3, steel, chop.group);
  knife.rotation.y = 0.5;
  const chopVeg = mesh(new THREE.SphereGeometry(0.32, 12, 10), new THREE.MeshStandardMaterial({ color: 0x7bc47f, roughness: 0.8 }), -0.4, 1.28, 0, chop.group);
  chopVeg.scale.set(1, 0.55, 1);
  chopVeg.visible = false;
  const chopBadge = badge(chop.group, 0, 2.6, 0, 'POTONG');

  // ---- GRILL ----
  const grill = stationGroup(scene, RECTS.grill);
  box(grill.width3d, 0.95, grill.depth3d, 0, 0.475, 0, darkMetal, grill.group);
  const frontZ = grill.depth3d / 2 + 0.015;
  const gPanelW = Math.max(0.4, grill.width3d - 0.3);
  box(gPanelW, 0.26, 0.06, 0, 0.35, frontZ, darkMetal, grill.group);
  box(gPanelW, 0.26, 0.06, 0, 0.7, frontZ, darkMetal, grill.group);
  mesh(new THREE.SphereGeometry(0.05, 12, 10), gold, -gPanelW / 2 + 0.12, 0.35, grill.depth3d / 2 + 0.06, grill.group);
  mesh(new THREE.SphereGeometry(0.05, 12, 10), gold, -gPanelW / 2 + 0.12, 0.7, grill.depth3d / 2 + 0.06, grill.group);
  const grillTopMat = new THREE.MeshStandardMaterial({ color: 0x1c1c1c, roughness: 0.5, metalness: 0.3 });
  box(grill.width3d + 0.24, 0.14, grill.depth3d + 0.24, 0, 1.02, 0, grillTopMat, grill.group);
  box(grill.width3d + 0.24, 0.04, grill.depth3d + 0.24, 0, 0.93, 0, gold, grill.group);
  box(grill.width3d + 0.24, 0.5, 0.08, 0, 1.29, -grill.depth3d / 2 + 0.04, backsplashMat, grill.group);
  const burnerMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.4 });
  cyl(0.55, 0.55, 0.08, -0.9, 1.15, 0, burnerMat, grill.group);
  cyl(0.55, 0.55, 0.08, 0.9, 1.15, 0, burnerMat, grill.group);
  const glowMatL = new THREE.MeshStandardMaterial({ color: 0xff6a00, emissive: 0xff5a00, emissiveIntensity: 0 });
  const glowMatR = new THREE.MeshStandardMaterial({ color: 0xff6a00, emissive: 0xff5a00, emissiveIntensity: 0 });
  const glowL = cyl(0.5, 0.5, 0.05, -0.9, 1.18, 0, glowMatL, grill.group);
  const glowR = cyl(0.5, 0.5, 0.05, 0.9, 1.18, 0, glowMatR, grill.group);
  const pattyMat = new THREE.MeshStandardMaterial({ color: 0x8a4a2a, roughness: 0.75 });
  const pattyMatCooked = new THREE.MeshStandardMaterial({ color: 0x5a2e18, roughness: 0.7 });
  const pattyL = mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.14, 14), pattyMat, -0.9, 1.28, 0, grill.group);
  pattyL.visible = false;
  const pattyR = mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.14, 14), pattyMat, 0.9, 1.28, 0, grill.group);
  pattyR.visible = false;
  cyl(0.12, 0.12, 0.1, -0.6, 1.1, grill.depth3d / 2 + 0.05, steel, grill.group);
  cyl(0.12, 0.12, 0.1, 0.6, 1.1, grill.depth3d / 2 + 0.05, steel, grill.group);
  const grillBadge = badge(grill.group, 0, 2.6, 0, 'PANGGANG');

  // ---- PLATE ----
  const plate = stationGroup(scene, RECTS.plate);
  buildCabinet(plate, cabinetGreen, cabinetGreenDark);
  cyl(0.7, 0.7, 0.08, 0, 1.15, 0, white, plate.group, 24);
  const garnishMat = new THREE.MeshStandardMaterial({ color: 0x4a7d3a, roughness: 0.8 });
  mesh(new THREE.SphereGeometry(0.12, 16, 12), garnishMat, 0.3, 1.22, 0.2, plate.group);
  badge(plate.group, 0, 2.6, 0, 'PIRING');

  // ---- SERVE ----
  const serve = stationGroup(scene, RECTS.serve);
  buildCabinet(serve, cabinetWood, cabinetWoodDark);
  const bellX = serve.width3d / 2 - 0.5;
  const bellZ = -serve.depth3d / 2 + 0.4;
  mesh(new THREE.SphereGeometry(0.28, 18, 14), gold, bellX, 1.35, bellZ, serve.group);
  cyl(0.3, 0.3, 0.06, bellX, 1.12, bellZ, gold, serve.group, 20);
  box(0.12, 1.6, 0.12, -serve.width3d / 2 + 0.2, 1.9, -serve.depth3d / 2 + 0.1, darkMetal, serve.group);
  box(0.12, 1.6, 0.12, serve.width3d / 2 - 0.2, 1.9, -serve.depth3d / 2 + 0.1, darkMetal, serve.group);
  box(serve.width3d, 0.12, 0.12, 0, 2.7, -serve.depth3d / 2 + 0.1, darkMetal, serve.group);
  badge(serve.group, 0, 3.2, 0, 'SAJI');

  // ---- TRASH ----
  const trash = stationGroup(scene, RECTS.trash);
  cyl(0.7, 0.7, 1.1, 0, 0.55, 0, cabinetGreen, trash.group, 20);
  const lidMat = new THREE.MeshStandardMaterial({ color: 0x4a4a4a, roughness: 0.6 });
  const lid = box(1.5, 0.08, 1.5, 0, 1.2, 0, lidMat, trash.group);
  lid.rotation.z = 0.25;
  lid.rotation.x = 0.1;
  mesh(new THREE.SphereGeometry(0.16, 14, 10), white, 0.5, 1.25, 0.3, trash.group);
  badge(trash.group, 0, 2.2, 0, 'SAMPAH');

  function update(world, frame) {
    const slots = (world && world.grillSlots) || [];
    const pulse = 1.6 + 0.4 * Math.sin(frame * 0.08);
    const glows = [glowL, glowR];
    for (let i = 0; i < 2; i++) {
      const slot = slots[i];
      let intensity = 0;
      if (slot) intensity = slot.burnt ? 0.4 : pulse;
      glows[i].material.emissiveIntensity = intensity;
    }
    const chopSlot = world && world.chopSlot;
    if (chopSlot) {
      const pct = Math.round(Math.min(1, chopSlot.t / 2.5) * 100);
      setBadge(chopBadge, 'POTONG ' + pct + '%');
    } else {
      setBadge(chopBadge, 'POTONG');
    }
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
    const slotL = world.grillSlots ? world.grillSlots[0] : null;
    const slotR = world.grillSlots ? world.grillSlots[1] : null;
    if (slotL && slotL.item) { pattyL.visible = true; pattyL.material = (slotL.t >= 4 || slotL.burnt) ? pattyMatCooked : pattyMat; } else { pattyL.visible = false; }
    if (slotR && slotR.item) { pattyR.visible = true; pattyR.material = (slotR.t >= 4 || slotR.burnt) ? pattyMatCooked : pattyMat; } else { pattyR.visible = false; }
    if (world.chopSlot && world.chopSlot.item) {
      chopVeg.visible = true;
      chopVeg.material.color.setHex(world.chopSlot.item.id === 'tomato' ? 0xe2543e : 0x7bc47f);
    } else { chopVeg.visible = false; }
  }

  return { update };
}
