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
  parent.add(mesh);
  return mesh;
}

function sphere(r, x, y, z, mat, parent, sx, sy, sz) {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(r, 18, 14), mat);
  mesh.position.set(x, y, z);
  if (sx !== undefined) mesh.scale.set(sx, sy, sz);
  parent.add(mesh);
  return mesh;
}

function cylinder(r, h, x, y, z, mat, parent) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 24), mat);
  mesh.position.set(x, y, z);
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

  ctx.font = 'bold 30px sans-serif';
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
  sprite.scale.set(2.0, 0.5, 1);
  return sprite;
}

function addIngredient(kind, group, m) {
  if (kind === 'bun') {
    sphere(0.45, 0, 1.0, 0, m.bun, group, 1, 0.6, 1);
    sphere(0.3, 0.35, 0.95, 0.15, m.bun, group);
  } else if (kind === 'patty') {
    cylinder(0.5, 0.18, 0, 1.0, 0, m.patty, group);
    cylinder(0.45, 0.16, 0.1, 1.15, -0.1, m.patty, group);
  } else if (kind === 'lettuce') {
    sphere(0.35, 0, 1.0, 0, m.lettuce, group, 1, 0.55, 1);
    sphere(0.35, 0.3, 1.05, 0.1, m.lettuce, group, 1, 0.55, 1);
    sphere(0.35, -0.28, 1.02, -0.08, m.lettuce, group, 1, 0.55, 1);
  } else if (kind === 'tomato') {
    sphere(0.38, -0.15, 1.0, 0, m.tomato, group);
    sphere(0.38, 0.2, 1.02, 0.05, m.tomato, group);
  } else if (kind === 'cheese') {
    const a = box(0.7, 0.35, 0.5, 0, 1.05, 0, m.cheese, group);
    a.rotation.y = 0.4;
    const b = box(0.5, 0.3, 0.4, -0.2, 1.1, 0.15, m.cheese, group);
    b.rotation.y = -0.3;
  } else if (kind === 'egg') {
    sphere(0.28, -0.25, 1.0, 0, m.egg, group, 1, 1.25, 1);
    sphere(0.28, 0.15, 1.02, 0.1, m.egg, group, 1, 1.25, 1);
    sphere(0.28, 0.0, 1.0, -0.25, m.egg, group, 1, 1.25, 1);
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

    const shadow = new THREE.Mesh(new THREE.CircleGeometry(0.9, 16), shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.02;
    group.add(shadow);

    box(2.0, 0.9, 1.8, 0, 0.45, 0, crateWood, group);

    box(2.0, 0.12, 0.12, 0, 0.95, 0.9, crateWoodDark, group);
    box(2.0, 0.12, 0.12, 0, 0.95, -0.9, crateWoodDark, group);
    box(0.12, 0.12, 1.8, -1.0, 0.95, 0, crateWoodDark, group);
    box(0.12, 0.12, 1.8, 1.0, 0.95, 0, crateWoodDark, group);

    addIngredient(kind, group, mats);

    const label = labelSprite(name);
    label.position.set(0, 2.0, 0);
    group.add(label);
  }

  function update(world, frame) {
    // Crates are static; nothing to animate.
  }

  return { update };
}
