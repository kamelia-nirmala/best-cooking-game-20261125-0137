export function createKitchen() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x241610);
  scene.fog = new THREE.Fog(0x241610, 24, 40);

  const camera = new THREE.PerspectiveCamera(50, 1280 / 720, 0.1, 100);
  camera.position.set(0, 10.5, 13.5);
  camera.lookAt(0, 0.2, -1.5);

  // Lights
  scene.add(new THREE.AmbientLight(0xfff2dd, 0.55));

  const sunLight = new THREE.DirectionalLight(0xffe0b3, 1.4);
  sunLight.position.set(5, 10, 6);
  scene.add(sunLight);

  const stoveLight = new THREE.PointLight(0xff9a3c, 25, 14, 1.8);
  stoveLight.position.set(-3.5, 2.5, -2);
  scene.add(stoveLight);

  // Floor tile texture
  const tileCanvas = document.createElement('canvas');
  tileCanvas.width = 256;
  tileCanvas.height = 256;
  const ctx = tileCanvas.getContext('2d');

  ctx.fillStyle = '#5a3d2b';
  ctx.fillRect(0, 0, 256, 256);

  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 2; col++) {
      if ((row + col) % 2 === 1) {
        ctx.fillStyle = '#4e3423';
        ctx.fillRect(col * 128, row * 128, 128, 128);
      }
    }
  }

  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.lineWidth = 2;
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 2; col++) {
      ctx.strokeRect(col * 128 + 1, row * 128 + 1, 126, 126);
    }
  }

  ctx.fillStyle = 'rgba(255,209,102,0.5)';
  for (const [cx, cy] of [[64, 64], [192, 192]]) {
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
    new THREE.MeshStandardMaterial({ map: floorTexture, roughness: 0.9 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, 0, 0);
  scene.add(floor);

  // Shared materials
  const woodMaterial = new THREE.MeshStandardMaterial({ color: 0x8a5a34, roughness: 0.8 });
  const darkFrameMaterial = new THREE.MeshStandardMaterial({ color: 0x2c1c10, roughness: 0.85 });
  const darkMetalMaterial = new THREE.MeshStandardMaterial({ color: 0x2c2c2c, roughness: 0.6, metalness: 0.4 });
  const goldMaterial = new THREE.MeshStandardMaterial({ color: 0xd4a017, roughness: 0.5, metalness: 0.3 });

  function addBox(width, height, depth, x, y, z, material) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
    mesh.position.set(x, y, z);
    scene.add(mesh);
    return mesh;
  }

  // Back wall and wainscot
  const wall = new THREE.Mesh(
    new THREE.BoxGeometry(22, 5, 0.4),
    new THREE.MeshStandardMaterial({ color: 0x4a2f1d, roughness: 0.95 })
  );
  wall.position.set(0, 2.5, -7.2);
  scene.add(wall);

  const wainscot = new THREE.Mesh(
    new THREE.BoxGeometry(22, 1.2, 0.45),
    new THREE.MeshStandardMaterial({ color: 0x3a2416, roughness: 0.95 })
  );
  wainscot.position.set(0, 0.6, -7.18);
  scene.add(wainscot);

  // Glowing window
  const windowGlow = new THREE.Mesh(
    new THREE.PlaneGeometry(3.4, 2.2),
    new THREE.MeshStandardMaterial({
      color: 0xffd98a,
      emissive: 0xffc861,
      emissiveIntensity: 0.9,
      roughness: 0.4
    })
  );
  windowGlow.position.set(6.5, 3.1, -6.95);
  scene.add(windowGlow);

  addBox(3.7, 0.16, 0.14, 6.5, 4.2, -6.92, darkFrameMaterial);
  addBox(3.7, 0.16, 0.14, 6.5, 2.0, -6.92, darkFrameMaterial);
  addBox(0.16, 2.4, 0.14, 4.8, 3.1, -6.92, darkFrameMaterial);
  addBox(0.16, 2.4, 0.14, 8.2, 3.1, -6.92, darkFrameMaterial);
  addBox(0.12, 2.2, 0.1, 6.5, 3.1, -6.93, darkFrameMaterial);
  addBox(3.4, 0.12, 0.1, 6.5, 3.1, -6.93, darkFrameMaterial);

  // Spice rack
  addBox(4.5, 0.18, 0.6, -6, 2.6, -6.9, woodMaterial);

  const jarColors = [0xc0392b, 0x27ae60, 0xd4a017];
  const jarXs = [-7.4, -6, -4.6];
  for (let i = 0; i < jarXs.length; i++) {
    const jar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.32, 0.32, 0.7, 12),
      new THREE.MeshStandardMaterial({ color: jarColors[i], roughness: 0.5 })
    );
    jar.position.set(jarXs[i], 3.05, -6.9);
    scene.add(jar);

    const lid = new THREE.Mesh(
      new THREE.CylinderGeometry(0.34, 0.34, 0.12, 12),
      darkMetalMaterial
    );
    lid.position.set(jarXs[i], 3.45, -6.9);
    scene.add(lid);
  }

  // Hanging pots and pan
  const potMaterial = new THREE.MeshStandardMaterial({
    color: 0x2f2c2a,
    roughness: 0.6,
    metalness: 0.4
  });
  const hookMaterial = new THREE.MeshStandardMaterial({
    color: 0x8a8a8a,
    roughness: 0.4,
    metalness: 0.7
  });

  for (const x of [-1.5, 0, 1.5]) {
    const pot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.45, 0.38, 0.5, 14),
      potMaterial
    );
    pot.position.set(x, 3.4, -6.9);
    scene.add(pot);

    const hook = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 0.5, 6),
      hookMaterial
    );
    hook.position.set(x, 3.9, -6.9);
    scene.add(hook);
  }

  addBox(0.9, 0.08, 0.12, 0.7, 3.4, -6.9, potMaterial);

  // Potted plants
  const plantPotMaterial = new THREE.MeshStandardMaterial({ color: 0xc97b3f, roughness: 0.8 });
  const leafMaterial = new THREE.MeshStandardMaterial({ color: 0x5a7d4a, roughness: 0.9 });
  const leafOffsets = [[0, 1.2, 0], [0.35, 1.0, 0.2], [-0.3, 1.3, 0.25]];

  for (const x of [-8.5, 8.5]) {
    const plant = new THREE.Group();
    plant.position.set(x, 0, 5.5);

    const plantPot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.55, 0.42, 0.7, 12),
      plantPotMaterial
    );
    plantPot.position.y = 0.35;
    plant.add(plantPot);

    for (const [lx, ly, lz] of leafOffsets) {
      const leaf = new THREE.Mesh(
        new THREE.SphereGeometry(0.45, 10, 8),
        leafMaterial
      );
      leaf.position.set(lx, ly, lz);
      plant.add(leaf);
    }

    scene.add(plant);
  }

  // Batik rug
  const rug = new THREE.Mesh(
    new THREE.CircleGeometry(2.6, 24),
    new THREE.MeshStandardMaterial({ color: 0x7a2a3a, roughness: 0.95 })
  );
  rug.rotation.x = -Math.PI / 2;
  rug.position.set(0, 0.02, 1.5);
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
