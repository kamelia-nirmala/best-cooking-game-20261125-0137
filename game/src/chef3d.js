// Chef 3D model built from three.js primitives (global THREE, IIFE r186 build).
// Chibi chef: rounded shapes only (spheres + capsules), big head, faces the camera when idle.
// Plain ES module - no imports; THREE is expected to exist as a global.

const ITEM_COLORS = {
  bun: 0xe8b45a,
  patty: 0x8a4a2a,
  lettuce: 0x7bc47f,
  tomato: 0xe2543e,
  cheese: 0xffd166,
  egg: 0xfff2cc
};

function itemColor(id) {
  const c = ITEM_COLORS[id];
  return c === undefined ? 0xcccccc : c;
}

export function buildChef(scene) {
  const skin = new THREE.MeshStandardMaterial({ color: 0xf2c89b, roughness: 0.7 });
  const white = new THREE.MeshStandardMaterial({ color: 0xf5f5f0, roughness: 0.7 });
  const apronRed = new THREE.MeshStandardMaterial({ color: 0xd9534f, roughness: 0.75 });
  const pants = new THREE.MeshStandardMaterial({ color: 0x2c2c34, roughness: 0.8 });
  const shoe = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.6 });
  const gold = new THREE.MeshStandardMaterial({ color: 0xd4a017, roughness: 0.4, metalness: 0.4 });
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.4 });
  const cheekMat = new THREE.MeshStandardMaterial({ color: 0xff9d9d, roughness: 0.8 });
  const bandMat = new THREE.MeshStandardMaterial({ color: 0xe8e8e0, roughness: 0.7 });
  const trayMat = new THREE.MeshStandardMaterial({ color: 0xc9a06a, roughness: 0.6 });
  const shadowMat = new THREE.MeshStandardMaterial({ color: 0x000000, transparent: true, opacity: 0.25, depthWrite: false });

  function makeMesh(geo, mat) {
    const m = new THREE.Mesh(geo, mat);
    m.castShadow = true;
    return m;
  }

  const chef = new THREE.Group();
  chef.scale.set(1.6, 1.6, 1.6);
  chef.name = 'chef';

  // Fake floor shadow blob.
  const shadow = makeMesh(new THREE.CircleGeometry(0.55, 20), shadowMat);
  shadow.castShadow = false;
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.02;
  chef.add(shadow);

  // ---- Legs (capsules pivoted at the top so they can swing) ----
  function makeLeg(x) {
    const leg = new THREE.Group();
    leg.position.set(x, 0.5, 0);

    const legMesh = makeMesh(new THREE.CapsuleGeometry(0.11, 0.25, 6, 12), pants);
    legMesh.position.set(0, -0.235, 0);
    leg.add(legMesh);

    const shoeMesh = makeMesh(new THREE.SphereGeometry(0.14, 12, 10), shoe);
    shoeMesh.scale.set(1, 0.5, 1.5);
    shoeMesh.position.set(0, -0.45, 0.05);
    leg.add(shoeMesh);

    chef.add(leg);
    return leg;
  }
  const legL = makeLeg(-0.16);
  const legR = makeLeg(0.16);

  // ---- Body (white jacket): upright capsule + rounded belly ----
  const outlineMat = new THREE.MeshBasicMaterial({ color: 0x2a2018, side: THREE.BackSide });
  const body = makeMesh(new THREE.CapsuleGeometry(0.42, 0.35, 8, 16), white);
  body.position.set(0, 0.85, 0);
  chef.add(body);
  const bodyOutline = new THREE.Mesh(new THREE.CapsuleGeometry(0.46, 0.38, 8, 16), outlineMat);
  bodyOutline.position.set(0, 0.85, 0);
  chef.add(bodyOutline);

  const belly = makeMesh(new THREE.SphereGeometry(0.44, 18, 14), white);
  belly.scale.set(1, 0.9, 0.8);
  belly.position.set(0, 0.8, 0);
  chef.add(belly);

  // ---- Apron (red): flattened sphere on the front ----
  const apron = makeMesh(new THREE.SphereGeometry(0.45, 18, 14), apronRed);
  apron.scale.set(0.75, 0.7, 0.35);
  apron.position.set(0, 0.78, 0.3);
  chef.add(apron);

  // ---- Gold buttons on the apron ----
  const buttonGeo = new THREE.SphereGeometry(0.05, 10, 8);
  const buttonL = makeMesh(buttonGeo, gold);
  buttonL.position.set(-0.12, 0.95, 0.42);
  chef.add(buttonL);
  const buttonR = makeMesh(buttonGeo, gold);
  buttonR.position.set(0.12, 0.95, 0.42);
  chef.add(buttonR);

  // ---- Arms (capsules pivoted at the shoulder) ----
  function makeArm(x) {
    const arm = new THREE.Group();
    arm.position.set(x, 1.1, 0);

    const sleeve = makeMesh(new THREE.CapsuleGeometry(0.09, 0.3, 6, 12), white);
    sleeve.position.set(0, -0.24, 0);
    arm.add(sleeve);

    const hand = makeMesh(new THREE.SphereGeometry(0.11, 12, 10), skin);
    hand.position.set(0, -0.5, 0);
    arm.add(hand);

    chef.add(arm);
    return arm;
  }
  const armL = makeArm(-0.5);
  const armR = makeArm(0.5);

  // ---- Head: big chibi sphere ----
  const head = makeMesh(new THREE.SphereGeometry(0.38, 24, 18), skin);
  head.position.set(0, 1.5, 0);
  chef.add(head);
  const headOutline = new THREE.Mesh(new THREE.SphereGeometry(0.42, 24, 18), outlineMat);
  headOutline.position.set(0, 1.5, 0);
  chef.add(headOutline);

  // ---- Eyes ----
  const eyeGeo = new THREE.SphereGeometry(0.05, 10, 8);
  const eyeL = makeMesh(eyeGeo, eyeMat);
  eyeL.position.set(-0.14, 1.55, 0.32);
  chef.add(eyeL);
  const eyeR = makeMesh(eyeGeo, eyeMat);
  eyeR.position.set(0.14, 1.55, 0.32);
  chef.add(eyeR);

  // ---- Smile: half torus, arc rotated to open upward ----
  const smile = makeMesh(new THREE.TorusGeometry(0.09, 0.015, 8, 16, Math.PI), eyeMat);
  smile.rotation.x = Math.PI;
  smile.position.set(0, 1.42, 0.33);
  chef.add(smile);

  // ---- Cheeks ----
  const cheekGeo = new THREE.SphereGeometry(0.07, 10, 8);
  const cheekL = makeMesh(cheekGeo, cheekMat);
  cheekL.position.set(-0.24, 1.44, 0.28);
  chef.add(cheekL);
  const cheekR = makeMesh(cheekGeo, cheekMat);
  cheekR.position.set(0.24, 1.44, 0.28);
  chef.add(cheekR);

  // ---- Toque (tall chef hat) ----
  const hatCyl = makeMesh(new THREE.CylinderGeometry(0.32, 0.32, 0.3, 20), white);
  hatCyl.position.set(0, 1.82, 0);
  chef.add(hatCyl);

  const band = makeMesh(new THREE.CylinderGeometry(0.33, 0.33, 0.1, 20), bandMat);
  band.position.set(0, 1.68, 0);
  chef.add(band);

  const puffGeo = new THREE.SphereGeometry(0.18, 14, 10);
  const puffPos = [[-0.18, 2.0, 0], [0, 2.0, 0], [0.18, 2.0, 0]];
  for (let i = 0; i < puffPos.length; i++) {
    const puff = makeMesh(puffGeo, white);
    puff.position.set(puffPos[i][0], puffPos[i][1], puffPos[i][2]);
    chef.add(puff);
  }

  // ---- Tray (kept from before: top + up to 3 item boxes) ----
  const tray = new THREE.Group();
  tray.position.set(0, 1.0, 0.55);
  tray.visible = false;

  const trayTop = makeMesh(new THREE.BoxGeometry(0.7, 0.05, 0.5), trayMat);
  tray.add(trayTop);

  const trayItems = [];
  for (let i = 0; i < 3; i++) {
    const itemMat = new THREE.MeshStandardMaterial({ color: 0xe8b45a, roughness: 0.6 });
    const item = makeMesh(new THREE.BoxGeometry(0.32, 0.24, 0.32), itemMat);
    item.position.set(-0.28 + i * 0.28, 0.16, 0);
    item.visible = false;
    tray.add(item);
    trayItems.push(item);
  }
  chef.add(tray);

  scene.add(chef);

  function update(world, frame) {
    if (!world || !world.chef) {
      chef.visible = false;
      return;
    }
    chef.visible = true;
    chef.position.set((world.chef.x - 640) / 64, 0, (world.chef.y - 400) / 45 + 1.2);

    if (world.chef.moving) {
      // Face the direction of travel.
      chef.rotation.y = world.chef.dir >= 0 ? -Math.PI / 2 : Math.PI / 2;

      const swing = Math.sin(frame * 0.35) * 0.5;
      legL.rotation.x = swing;
      legR.rotation.x = -swing;
      armL.rotation.x = -swing * 0.7;
      armR.rotation.x = swing * 0.7;
      chef.position.y = Math.abs(Math.sin(frame * 0.35)) * 0.05;
    } else {
      // Idle at a station: face the camera (front is +Z, camera is at +Z).
      chef.rotation.y = 0;

      legL.rotation.x = 0;
      legR.rotation.x = 0;
      armL.rotation.x = 0;
      armR.rotation.x = 0;
      chef.position.y = 0;
    }

    const items = world.tray;
    const count = items ? items.length : 0;
    for (let i = 0; i < 3; i++) {
      const it = items && items[i];
      if (it) {
        trayItems[i].visible = true;
        trayItems[i].material.color.setHex(itemColor(it.id));
      } else {
        trayItems[i].visible = false;
      }
    }
    tray.visible = count > 0;
  }

  return { update };
}
