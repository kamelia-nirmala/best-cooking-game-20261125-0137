export function createKitchen() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf5e9d0);
  scene.fog = new THREE.Fog(0xf5e9d0, 24, 45);

  const camera = new THREE.PerspectiveCamera(50, 1280 / 720, 0.1, 100);
  camera.position.set(0, 11.5, 14.5);
  camera.lookAt(0, 0, -1);

  // ---------------------------------------------------------------- Lights
  // Bright warm sky bounce — this is the main fill for the whole room.
  const hemiLight = new THREE.HemisphereLight(0xfff8ec, 0xd9c9a8, 1.1);
  hemiLight.position.set(0, 20, 0);
  scene.add(hemiLight);

  // Gentle ambient so shadows never go pitch black.
  scene.add(new THREE.AmbientLight(0xfff2dd, 0.35));

  // Warm sun from the TOP-LEFT, casts station / chef shadows on the floor.
  const sunLight = new THREE.DirectionalLight(0xffe0b3, 2.2);
  sunLight.position.set(-6, 12, 8);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.set(2048, 2048);
  sunLight.shadow.camera.left = -12;
  sunLight.shadow.camera.right = 12;
  sunLight.shadow.camera.top = 12;
  sunLight.shadow.camera.bottom = -12;
  sunLight.shadow.camera.near = 1;
  sunLight.shadow.camera.far = 30;
  sunLight.shadow.bias = -0.0005;
  sunLight.target.position.set(0, 0, 0);
  scene.add(sunLight);
  scene.add(sunLight.target);

  // Warm glow near the stove.
  const stoveLight = new THREE.PointLight(0xff9a3c, 20, 12);
  stoveLight.position.set(-3.5, 2.5, -2);
  scene.add(stoveLight);

  // ------------------------------------------------------- Floor tile texture
  // Cream / light tiles with thin grout and a small gold diamond motif.
  const tileCanvas = document.createElement('canvas');
  tileCanvas.width = 256;
  tileCanvas.height = 256;
  const ctx = tileCanvas.getContext('2d');

  // Base cream.
  ctx.fillStyle = '#e8dcc0';
  ctx.fillRect(0, 0, 256, 256);

  // Alternate tiles, slightly deeper cream.
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 2; col++) {
      if ((row + col) % 2 === 1) {
        ctx.fillStyle = '#dfd2b0';
        ctx.fillRect(col * 128, row * 128, 128, 128);
      }
    }
  }

  // Thin grout lines.
  ctx.strokeStyle = '#b8a888';
  ctx.lineWidth = 2;
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 2; col++) {
      ctx.strokeRect(col * 128 + 1, row * 128 + 1, 126, 126);
    }
  }

  // Small gold diamond motif in every tile center.
  ctx.fillStyle = 'rgba(212,160,23,0.55)';
  for (const [cx, cy] of [[64, 64], [192, 64], [64, 192], [192, 192]]) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(Math.PI / 4);
    ctx.fillRect(-5, -5, 10, 10);
    ctx.restore();
  }

  const floorTexture = new THREE.CanvasTexture(tileCanvas);
  floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
  floorTexture.repeat.set(5, 4);
  floorTexture.colorSpace = THREE.SRGBColorSpace;

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(22, 15),
    new THREE.MeshStandardMaterial({
      map: floorTexture,
      color: 0xffffff,
      roughness: 0.85
    })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, 0, 0);
  floor.receiveShadow = true;
  scene.add(floor);

  // ------------------------------------------------------- Shared materials
  const woodMaterial = new THREE.MeshStandardMaterial({ color: 0xb07a4a, roughness: 0.8 });
  const darkFrameMaterial = new THREE.MeshStandardMaterial({ color: 0x5a4432, roughness: 0.85 });
  const darkMetalMaterial = new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.55, metalness: 0.45 });
  const goldMaterial = new THREE.MeshStandardMaterial({ color: 0xd4a017, roughness: 0.45, metalness: 0.35 });

  function addBox(width, height, depth, x, y, z, material) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    return mesh;
  }

  // ------------------------------------------------------ Back wall + wainscot
  const wall = new THREE.Mesh(
    new THREE.BoxGeometry(22, 5, 0.4),
    new THREE.MeshStandardMaterial({ color: 0xf0e6d0, roughness: 0.95 })
  );
  wall.position.set(0, 2.5, -7.2);
  wall.receiveShadow = true;
  scene.add(wall);

  const wainscot = new THREE.Mesh(
    new THREE.BoxGeometry(22, 1.2, 0.45),
    new THREE.MeshStandardMaterial({ color: 0xdcc9a8, roughness: 0.95 })
  );
  wainscot.position.set(0, 0.6, -7.18);
  wainscot.receiveShadow = true;
  scene.add(wainscot);

  // ------------------------------------------------------------- Glowing window
  const windowGlow = new THREE.Mesh(
    new THREE.PlaneGeometry(3.4, 2.2),
    new THREE.MeshStandardMaterial({
      color: 0xffe8b8,
      emissive: 0xffd98a,
      emissiveIntensity: 0.85,
      roughness: 0.4
    })
  );
  windowGlow.position.set(6.5, 2.6, -6.95);
  scene.add(windowGlow);

  addBox(3.7, 0.16, 0.14, 6.5, 3.7, -6.92, darkFrameMaterial);
  addBox(3.7, 0.16, 0.14, 6.5, 1.5, -6.92, darkFrameMaterial);
  addBox(0.16, 2.4, 0.14, 4.8, 2.6, -6.92, darkFrameMaterial);
  addBox(0.16, 2.4, 0.14, 8.2, 2.6, -6.92, darkFrameMaterial);
  addBox(0.12, 2.2, 0.1, 6.5, 2.6, -6.93, darkFrameMaterial);
  addBox(3.4, 0.12, 0.1, 6.5, 2.6, -6.93, darkFrameMaterial);

  // ---------------------------------------------------------------- Spice rack
  addBox(4.5, 0.18, 0.6, -6, 2.2, -6.9, woodMaterial);

  const jarColors = [0xc0392b, 0x27ae60, 0xd4a017];
  const jarXs = [-7.4, -6, -4.6];
  for (let i = 0; i < jarXs.length; i++) {
    const jar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.32, 0.32, 0.7, 12),
      new THREE.MeshStandardMaterial({ color: jarColors[i], roughness: 0.5 })
    );
    jar.position.set(jarXs[i], 2.65, -6.9);
    jar.castShadow = true;
    jar.receiveShadow = true;
    scene.add(jar);

    const lid = new THREE.Mesh(
      new THREE.CylinderGeometry(0.34, 0.34, 0.12, 12),
      darkMetalMaterial
    );
    lid.position.set(jarXs[i], 3.05, -6.9);
    lid.castShadow = true;
    scene.add(lid);
  }

  // ------------------------------------------------------- Hanging pots and pan
  const potMaterial = new THREE.MeshStandardMaterial({
    color: 0x4a4640,
    roughness: 0.55,
    metalness: 0.45
  });
  const hookMaterial = new THREE.MeshStandardMaterial({
    color: 0x9a9a9a,
    roughness: 0.4,
    metalness: 0.7
  });

  for (const x of [-1.5, 0, 1.5]) {
    const pot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.45, 0.38, 0.5, 14),
      potMaterial
    );
    pot.position.set(x, 3.0, -6.9);
    pot.castShadow = true;
    pot.receiveShadow = true;
    scene.add(pot);

    const hook = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 0.5, 6),
      hookMaterial
    );
    hook.position.set(x, 3.5, -6.9);
    hook.castShadow = true;
    scene.add(hook);
  }

  addBox(0.9, 0.08, 0.12, 0.7, 3.0, -6.9, potMaterial);

  // --------------------------------------------------------------- Potted plants
  const plantPotMaterial = new THREE.MeshStandardMaterial({ color: 0xc97b3f, roughness: 0.8 });
  const leafMaterial = new THREE.MeshStandardMaterial({ color: 0x6d9455, roughness: 0.9 });
  const leafOffsets = [[0, 1.2, 0], [0.35, 1.0, 0.2], [-0.3, 1.3, 0.25]];

  for (const x of [-8.5, 8.5]) {
    const plant = new THREE.Group();
    plant.position.set(x, 0, 5.5);

    const plantPot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.55, 0.42, 0.7, 12),
      plantPotMaterial
    );
    plantPot.position.y = 0.35;
    plantPot.castShadow = true;
    plantPot.receiveShadow = true;
    plant.add(plantPot);

    for (const [lx, ly, lz] of leafOffsets) {
      const leaf = new THREE.Mesh(
        new THREE.SphereGeometry(0.45, 10, 8),
        leafMaterial
      );
      leaf.position.set(lx, ly, lz);
      leaf.castShadow = true;
      leaf.receiveShadow = true;
      plant.add(leaf);
    }

    scene.add(plant);
  }

  // ------------------------------------------------------------- Bright red rug
  const rug = new THREE.Mesh(
    new THREE.CircleGeometry(2.6, 24),
    new THREE.MeshStandardMaterial({ color: 0xa83a4a, roughness: 0.95 })
  );
  rug.rotation.x = -Math.PI / 2;
  rug.position.set(0, 0.02, 1.5);
  rug.receiveShadow = true;
  scene.add(rug);

  const rugRing = new THREE.Mesh(
    new THREE.RingGeometry(2.3, 2.6, 24),
    goldMaterial
  );
  rugRing.rotation.x = -Math.PI / 2;
  rugRing.position.set(0, 0.03, 1.5);
  scene.add(rugRing);

  for (const x of [-1.6, -0.8, 0, 0.8, 1.6]) {
    const diamond = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 0.02, 0.22),
      goldMaterial
    );
    diamond.rotation.y = Math.PI / 4;
    diamond.position.set(x, 0.04, 1.5);
    scene.add(diamond);
  }

  return { scene, camera };
}
