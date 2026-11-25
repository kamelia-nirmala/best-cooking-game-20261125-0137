// game/src/ingredients3d.js
// 3D ingredient crates for Dapur Sizzle.
// Uses the global THREE build (r186, IIFE) — no imports.

const INGREDIENTS = [
  ['bun', 'Roti'],
  ['patty', 'Daging'],
  ['lettuce', 'Selada'],
  ['tomato', 'Tomat'],
  ['cheese', 'Keju'],
  ['egg', 'Telur']
];

function box(w, h, d, x, y, z, mat, parent) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function sphere(r, x, y, z, mat, parent, sx, sy, sz) {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(r, 18, 14), mat);
  mesh.position.set(x, y, z);
  if (sx !== undefined) mesh.scale.set(sx, sy, sz);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function cylinder(r, h, x, y, z, mat, parent) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 24), mat);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function labelSprite(text) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  const x = 4;
  const y = 4;
  const w = 248;
  const h = 56;
  const r = 14;
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
  ctx.fillStyle = 'rgba(20,16,12,0.85)';
  ctx.fill();
  ctx.strokeStyle = '#d4a017';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.font = 'bold 26px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffd166';
  ctx.fillText(text, 128, 34);
  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false
  });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(1.2, 0.3, 1);
  sprite.renderOrder = 20;
  return sprite;
}

function addIngredient(kind, group, m) {
  if (kind === 'bun') {
    const a = sphere(0.5, -0.5, 1.25, 0, m.bun, group, 1, 0.6, 1);
    a.rotation.y = 0.3;
    const b = sphere(0.5, 0.4, 1.4, -0.2, m.bun, group, 1, 0.6, 1);
    b.rotation.y = -0.4;
    const c = sphere(0.5, 0, 1.3, 0.3, m.bun, group, 1, 0.6, 1);
    c.rotation.y = 0.6;
  } else if (kind === 'patty') {
    cylinder(0.55, 0.2, 0, 1.2, 0, m.patty, group);
    cylinder(0.55, 0.2, 0.08, 1.4, -0.08, m.patty, group);
    cylinder(0.55, 0.2, -0.06, 1.6, 0.1, m.patty, group);
  } else if (kind === 'lettuce') {
    const a = sphere(0.45, -0.55, 1.28, 0.15, m.lettuce, group, 1, 0.5, 1);
    a.rotation.y = 0.4;
    const b = sphere(0.45, 0.5, 1.32, -0.2, m.lettuce, group, 1, 0.5, 1);
    b.rotation.y = -0.5;
    const c = sphere(0.45, 0, 1.48, 0.1, m.lettuce, group, 1, 0.5, 1);
    c.rotation.y = 0.9;
    const d = sphere(0.45, -0.1, 1.3, -0.45, m.lettuce, group, 1, 0.5, 1);
    d.rotation.y = 0.2;
  } else if (kind === 'tomato') {
    sphere(0.42, -0.6, 1.3, 0.1, m.tomato, group);
    sphere(0.42, 0.55, 1.32, 0.25, m.tomato, group);
    sphere(0.42, 0, 1.46, -0.25, m.tomato, group);
    sphere(0.42, 0.05, 1.6, 0.15, m.tomato, group);
  } else if (kind === 'cheese') {
    const a = box(0.8, 0.4, 0.6, 0, 1.25, 0, m.cheese, group);
    a.rotation.y = 0.35;
    const b = box(0.8, 0.4, 0.6, -0.3, 1.35, 0.25, m.cheese, group);
    b.rotation.y = -0.4;
    b.rotation.z = 0.1;
    const c = box(0.8, 0.4, 0.6, 0.35, 1.5, -0.15, m.cheese, group);
    c.rotation.y = 0.7;
    c.rotation.z = -0.08;
  } else if (kind === 'egg') {
    const a = sphere(0.32, -0.5, 1.3, 0.15, m.egg, group, 1, 1.3, 1);
    a.rotation.z = 0.12;
    const b = sphere(0.32, 0.5, 1.32, -0.1, m.egg, group, 1, 1.3, 1);
    b.rotation.z = -0.15;
    const c = sphere(0.32, 0, 1.45, 0.3, m.egg, group, 1, 1.3, 1);
    c.rotation.z = 0.2;
    const d = sphere(0.32, -0.05, 1.42, -0.35, m.egg, group, 1, 1.3, 1);
    d.rotation.z = -0.1;
  }
}

export function buildIngredients(scene) {
  const crateWood = new THREE.MeshStandardMaterial({ color: 0x7a5230, roughness: 0.85 });
  const crateWoodDark = new THREE.MeshStandardMaterial({ color: 0x5f3d22, roughness: 0.85 });
  const bunMat = new THREE.MeshStandardMaterial({ color: 0xe8b45a, roughness: 0.7 });
  const pattyMat = new THREE.MeshStandardMaterial({ color: 0x8a4a2a, roughness: 0.75 });
  const lettuceMat = new THREE.MeshStandardMaterial({ color: 0x7bc47f, roughness: 0.8 });
  const tomatoMat = new THREE.MeshStandardMaterial({ color: 0xe2543e, roughness: 0.5 });
  const cheeseMat = new THREE.MeshStandardMaterial({ color: 0xffd166, roughness: 0.6 });
  const eggMat = new THREE.MeshStandardMaterial({ color: 0xfff2cc, roughness: 0.5 });
  const shadowMat = new THREE.MeshStandardMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.25
  });
  const mats = {
    bun: bunMat,
    patty: pattyMat,
    lettuce: lettuceMat,
    tomato: tomatoMat,
    cheese: cheeseMat,
    egg: eggMat
  };
  for (let i = 0; i < INGREDIENTS.length; i++) {
    const kind = INGREDIENTS[i][0];
    const name = INGREDIENTS[i][1];
    const gameX = 110 + i * 140;
    const X3d = (gameX - 640) / 64;
    const Z3d = (225 - 400) / 45;
    const group = new THREE.Group();
    group.position.set(X3d, 0, Z3d);
    scene.add(group);
    const shadow = new THREE.Mesh(new THREE.CircleGeometry(1.1, 20), shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.02;
    shadow.castShadow = false;
    shadow.receiveShadow = true;
    group.add(shadow);
    box(2.6, 1.1, 2.2, 0, 0.55, 0, crateWood, group);
    box(2.6, 0.14, 0.14, 0, 1.03, 1.03, crateWoodDark, group);
    box(2.6, 0.14, 0.14, 0, 1.03, -1.03, crateWoodDark, group);
    box(0.14, 0.14, 2.2, -1.23, 1.03, 0, crateWoodDark, group);
    box(0.14, 0.14, 2.2, 1.23, 1.03, 0, crateWoodDark, group);
    addIngredient(kind, group, mats);
    const label = labelSprite(name);
    label.position.set(0, 0.55, 1.15);
    group.add(label);
  }
  function update(world, frame) {
  }
  return { update };
}
