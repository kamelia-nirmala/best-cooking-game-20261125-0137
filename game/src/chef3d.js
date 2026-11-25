// Chef 3D model built from three.js primitives (global THREE, IIFE r186 build).
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
  const shadowMat = new THREE.MeshStandardMaterial({ color: 0x000000, transparent: true, opacity: 0.3 });

  const chef = new THREE.Group();
  chef.scale.set(1.25, 1.25, 1.25);
  chef.name = 'chef';

  // Floor shadow
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(0.55, 20), shadowMat);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.02;
  chef.add(shadow);

  // Legs (each pivoted at its top so it can swing)
  function makeLeg(x) {
    const leg = new THREE.Group();
    leg.position.set(x, 0.5, 0);

    const legMesh = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.5, 0.22), pants);
    legMesh.position.set(0, -0.25, 0);
    leg.add(legMesh);

    const shoeMesh = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.12, 0.36), shoe);
    shoeMesh.position.set(0, -0.5, 0.05);
    leg.add(shoeMesh);

    chef.add(leg);
    return leg;
  }
  const legL = makeLeg(-0.16);
  const legR = makeLeg(0.16);

  // Body (white jacket)
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.7, 0.5), white);
  body.position.set(0, 0.85, 0);
  chef.add(body);

  // Apron on the front of the body
  const apron = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.55, 0.06), apronRed);
  apron.position.set(0, 0.8, 0.26);
  chef.add(apron);

  // Gold buttons
  const buttonGeo = new THREE.SphereGeometry(0.05, 10, 8);
  const buttonL = new THREE.Mesh(buttonGeo, gold);
  buttonL.position.set(-0.12, 0.95, 0.28);
  chef.add(buttonL);
  const buttonR = new THREE.Mesh(buttonGeo, gold);
  buttonR.position.set(0.12, 0.95, 0.28);
  chef.add(buttonR);

  // Arms (each pivoted at the shoulder)
  function makeArm(x) {
    const arm = new THREE.Group();
    arm.position.set(x, 1.1, 0);

    const sleeve = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.55, 0.18), white);
    sleeve.position.set(0, -0.27, 0);
    arm.add(sleeve);

    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 8), skin);
    hand.position.set(0, -0.55, 0);
    arm.add(hand);

    chef.add(arm);
    return arm;
  }
  const armL = makeArm(-0.5);
  const armR = makeArm(0.5);

  // Head
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 12), skin);
  head.position.set(0, 1.45, 0);
  chef.add(head);

  // Eyes
  const eyeGeo = new THREE.SphereGeometry(0.045, 8, 6);
  const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
  eyeL.position.set(-0.12, 1.48, 0.28);
  chef.add(eyeL);
  const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
  eyeR.position.set(0.12, 1.48, 0.28);
  chef.add(eyeR);

  // Cheeks
  const cheekGeo = new THREE.SphereGeometry(0.06, 8, 6);
  const cheekL = new THREE.Mesh(cheekGeo, cheekMat);
  cheekL.position.set(-0.2, 1.38, 0.26);
  chef.add(cheekL);
  const cheekR = new THREE.Mesh(cheekGeo, cheekMat);
  cheekR.position.set(0.2, 1.38, 0.26);
  chef.add(cheekR);

  // Hat (toque)
  const hatCyl = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.28, 16), white);
  hatCyl.position.set(0, 1.75, 0);
  chef.add(hatCyl);

  const band = new THREE.Mesh(new THREE.CylinderGeometry(0.31, 0.31, 0.1, 16), bandMat);
  band.position.set(0, 1.62, 0);
  chef.add(band);

  const puffGeo = new THREE.SphereGeometry(0.16, 12, 8);
  const puffPos = [[-0.18, 1.92, 0], [0, 1.96, 0], [0.18, 1.92, 0]];
  for (let i = 0; i < puffPos.length; i++) {
    const puff = new THREE.Mesh(puffGeo, white);
    puff.position.set(puffPos[i][0], puffPos[i][1], puffPos[i][2]);
    chef.add(puff);
  }

  // Tray held in front of the body
  const tray = new THREE.Group();
  tray.position.set(0, 1.0, 0.55);
  tray.visible = false;

  const trayTop = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.05, 0.5), trayMat);
  tray.add(trayTop);

  const trayItems = [];
  for (let i = 0; i < 3; i++) {
    const itemMat = new THREE.MeshStandardMaterial({ color: 0xe8b45a, roughness: 0.6 });
    const item = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.16, 0.22), itemMat);
    item.position.set(-0.2 + i * 0.2, 0.12, 0);
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
    chef.position.set((world.chef.x - 640) / 64, 0, (world.chef.y - 400) / 45);

    // The chef's front (apron, tray) is +Z. Rotate sideways to face left/right.
    chef.rotation.y = world.chef.dir >= 0 ? -Math.PI / 2 : Math.PI / 2;

    if (world.chef.moving) {
      const swing = Math.sin(frame * 0.35) * 0.5;
      legL.rotation.x = swing;
      legR.rotation.x = -swing;
      armL.rotation.x = -swing * 0.7;
      armR.rotation.x = swing * 0.7;
      chef.position.y = Math.abs(Math.sin(frame * 0.35)) * 0.05;
    } else {
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
