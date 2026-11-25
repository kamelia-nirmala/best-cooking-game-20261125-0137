export function buildEffects(scene) {
  function makeRadialTexture(centerColor, edgeColor) {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, centerColor);
    gradient.addColorStop(1, edgeColor);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(canvas);
  }

  const steamTexture = makeRadialTexture(
    'rgba(255,255,255,0.9)',
    'rgba(255,255,255,0)'
  );
  const sparkleTexture = makeRadialTexture(
    'rgba(255,209,102,1)',
    'rgba(255,209,102,0)'
  );

  const burnerX = [-3.3, -1.5];
  const grillZ = -0.56;

  const puffs = [];
  for (let i = 0; i < 22; i++) {
    const material = new THREE.SpriteMaterial({
      map: steamTexture,
      transparent: true,
      opacity: 0,
      depthWrite: false
    });
    const sprite = new THREE.Sprite(material);
    const burner = i % 2;
    sprite.position.set(burnerX[burner], 1.3, grillZ);
    sprite.scale.set(1.0, 1.0, 1);
    scene.add(sprite);
    puffs.push({
      sprite: sprite,
      phase: i * 0.45,
      burner: burner
    });
  }

  const sparkles = [];
  for (let i = 0; i < 10; i++) {
    const material = new THREE.SpriteMaterial({
      map: sparkleTexture,
      transparent: true,
      opacity: 0,
      depthWrite: false
    });
    const sprite = new THREE.Sprite(material);
    sprite.position.set(3.4, 1.5, 4.3);
    sprite.scale.set(0.4, 0.4, 1);
    scene.add(sprite);
    sparkles.push({
      sprite: sprite,
      angle: i * (Math.PI * 2 / 10),
      radius: 0.5 + (i % 3) * 0.4
    });
  }

  const grillLight = new THREE.PointLight(0xff9a3c, 8, 8, 1.8);
  grillLight.position.set(-2.4, 2.2, -0.56);
  scene.add(grillLight);

  let lastServed = null;
  let sparkleTime = null;

  function update(world, frame) {
    const slots = world.grillSlots;
    const cooking = !!(slots && slots.some(function (slot) {
      return slot && slot.item && !slot.burnt;
    }));

    for (let i = 0; i < puffs.length; i++) {
      const puff = puffs[i];
      if (!cooking) {
        puff.sprite.material.opacity = 0;
        continue;
      }

      const cycle = (frame * 0.02 + puff.phase) % 1;
      const x = burnerX[puff.burner] + Math.sin(frame * 0.03 + puff.phase * 6) * 0.25;
      const y = 1.3 + cycle * 2.6;
      const size = 0.9 + cycle * 1.3;
      const opacity = cycle < 0.2
        ? (cycle / 0.2) * 0.75
        : ((1 - cycle) / 0.8) * 0.75;

      puff.sprite.position.set(x, y, grillZ);
      puff.sprite.scale.set(size, size, 1);
      puff.sprite.material.opacity = opacity;
    }

    if (cooking) {
      grillLight.intensity = 8 + Math.sin(frame * 0.15) * 2.5;
    } else {
      grillLight.intensity = 2;
    }

    const served = world.served || 0;
    if (lastServed === null) {
      lastServed = served;
    }
    if (served > lastServed) {
      sparkleTime = frame;
      lastServed = served;
    }

    if (sparkleTime !== null && frame - sparkleTime < 40) {
      const age = (frame - sparkleTime) / 40;
      const spread = 0.5 + age * 1.5;
      for (let i = 0; i < sparkles.length; i++) {
        const sparkle = sparkles[i];
        const x = 3.4 + Math.cos(sparkle.angle) * sparkle.radius * spread;
        const y = 1.5 + age * 1.2;
        const z = 4.3 + Math.sin(sparkle.angle) * sparkle.radius * spread;
        sparkle.sprite.position.set(x, y, z);
        sparkle.sprite.material.opacity = (1 - age) * 0.9;
        const scale = 0.3 + age * 0.4;
        sparkle.sprite.scale.set(scale, scale, 1);
      }
    } else {
      for (let i = 0; i < sparkles.length; i++) {
        sparkles[i].sprite.material.opacity = 0;
      }
    }
  }

  return { update: update };
}
