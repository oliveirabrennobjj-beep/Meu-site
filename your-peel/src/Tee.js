import * as THREE from 'three';

// Camiseta preta oversized com uma grade de partículas Verlet.
// Os ombros ficam presos a um "corpo" que anda; bainha e mangas balançam e atrasam.
export function createTee(container, { onReady } = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
  camera.position.set(0, 0, 7.4);

  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(2.5, 3, 4);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xa0b527, 0.9); // rim em lime
  rim.position.set(-3, 1, -2);
  scene.add(rim);

  // Grade de partículas (34 x 34 = 1156)
  const NX = 34;
  const NY = 34;
  const W = 2.0;
  const H = 2.6;
  const count = NX * NY;
  const pos = new Float32Array(count * 3);
  const prev = new Float32Array(count * 3);
  const rest = new Float32Array(count * 3);
  const pinned = new Uint8Array(count);

  for (let j = 0; j < NY; j++) {
    for (let i = 0; i < NX; i++) {
      const u = i / (NX - 1);
      const v = j / (NY - 1);
      // Ombros mais largos no topo, afunilando até a bainha
      const shoulder = Math.max(0, 1 - v * 2.4);
      const sleeve = 1 + shoulder * 0.28;
      const x = (u - 0.5) * W * sleeve;
      const y = (0.5 - v) * H;
      const k = j * NX + i;
      rest[k * 3] = x;
      rest[k * 3 + 1] = y;
      rest[k * 3 + 2] = 0;
      pos[k * 3] = prev[k * 3] = x;
      pos[k * 3 + 1] = prev[k * 3 + 1] = y;
      pos[k * 3 + 2] = prev[k * 3 + 2] = 0;
      // Fixa a gola e a costura do ombro
      if (j <= 1 && (i < 9 || i > NX - 10)) pinned[k] = 1;
      if (j === 0) pinned[k] = 1;
    }
  }

  // Restrições de distância (estrutura + cisalhamento)
  const links = [];
  const addLink = (a, b) => {
    const dx = rest[a * 3] - rest[b * 3];
    const dy = rest[a * 3 + 1] - rest[b * 3 + 1];
    links.push([a, b, Math.hypot(dx, dy)]);
  };
  for (let j = 0; j < NY; j++) {
    for (let i = 0; i < NX; i++) {
      const k = j * NX + i;
      if (i < NX - 1) addLink(k, k + 1);
      if (j < NY - 1) addLink(k, k + NX);
      if (i < NX - 1 && j < NY - 1) {
        addLink(k, k + NX + 1);
        if (i > 0) addLink(k, k + NX - 1);
      }
    }
  }

  // Geometria e índices
  const indices = [];
  for (let j = 0; j < NY - 1; j++) {
    for (let i = 0; i < NX - 1; i++) {
      const a = j * NX + i;
      const b = a + 1;
      const c = a + NX;
      const d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  }
  const uvs = new Float32Array(count * 2);
  for (let j = 0; j < NY; j++) {
    for (let i = 0; i < NX; i++) {
      const k = j * NX + i;
      uvs[k * 2] = i / (NX - 1);
      uvs[k * 2 + 1] = 1 - j / (NY - 1);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  // Textura: tecido preto + print "couro" BLCK PEEL
  const texCanvas = document.createElement('canvas');
  texCanvas.width = 1024;
  texCanvas.height = 1024;
  const g = texCanvas.getContext('2d');
  g.fillStyle = '#141414';
  g.fillRect(0, 0, 1024, 1024);
  for (let y = 0; y < 1024; y += 2) {
    g.fillStyle = `rgba(255,255,255,${Math.random() * 0.025})`;
    g.fillRect(0, y, 1024, 1);
  }
  g.save();
  g.translate(512, 330);
  g.fillStyle = '#101010';
  g.strokeStyle = 'rgba(160,181,39,0.85)';
  g.lineWidth = 6;
  g.fillRect(-300, -90, 600, 180);
  g.strokeRect(-300, -90, 600, 180);
  g.fillStyle = '#A0B527';
  g.font = '900 96px Inter, Arial, sans-serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText('BLCK PEEL', 0, -4);
  g.restore();
  g.fillStyle = 'rgba(222,222,222,0.7)';
  g.font = '500 30px Inter, Arial, sans-serif';
  g.textAlign = 'center';
  g.fillText('· 1st Collection 2024©', 512, 470);

  const colorTex = new THREE.CanvasTexture(texCanvas);
  colorTex.colorSpace = THREE.SRGBColorSpace;
  colorTex.anisotropy = 4;

  // Relevo do tecido (bump) a partir de ruído
  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = 256;
  bumpCanvas.height = 256;
  const bg = bumpCanvas.getContext('2d');
  const img = bg.createImageData(256, 256);
  for (let p = 0; p < img.data.length; p += 4) {
    const n = 110 + Math.random() * 60 + ((p / 4) % 256 < 128 ? 8 : 0);
    img.data[p] = img.data[p + 1] = img.data[p + 2] = n;
    img.data[p + 3] = 255;
  }
  bg.putImageData(img, 0, 0);
  const bumpTex = new THREE.CanvasTexture(bumpCanvas);
  bumpTex.wrapS = bumpTex.wrapT = THREE.RepeatWrapping;
  bumpTex.repeat.set(6, 6);

  const material = new THREE.MeshStandardMaterial({
    map: colorTex,
    bumpMap: bumpTex,
    bumpScale: 0.6,
    roughness: 0.78,
    metalness: 0.0,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geometry, material);
  const group = new THREE.Group();
  group.add(mesh);
  scene.add(group);

  // Interação: arrasta para girar, com overshoot de mola
  let targetRot = 0;
  let rot = 0;
  let rotVel = 0;
  let dragging = false;
  let lastX = 0;
  const el = renderer.domElement;
  el.style.touchAction = 'pan-y';
  el.style.cursor = 'grab';
  const down = (e) => {
    dragging = true;
    lastX = e.clientX;
    el.style.cursor = 'grabbing';
    el.setPointerCapture?.(e.pointerId);
  };
  const move = (e) => {
    if (!dragging) return;
    const dx = e.clientX - lastX;
    lastX = e.clientX;
    targetRot += dx * 0.012;
    rotVel += dx * 0.004;
  };
  const up = () => {
    dragging = false;
    el.style.cursor = 'grab';
  };
  el.addEventListener('pointerdown', down);
  el.addEventListener('pointermove', move);
  el.addEventListener('pointerup', up);
  el.addEventListener('pointercancel', up);

  // Tamanho
  const resize = () => {
    const w = container.clientWidth || 1;
    const h = container.clientHeight || 1;
    renderer.setSize(w, h, false);
    el.style.width = `${w}px`;
    el.style.height = `${h}px`;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(container);
  resize();

  // Simulação
  const GRAVITY = -6;
  const DAMP = 0.985;
  const ITER = 4;
  const DT = 1 / 60;
  let t = 0;
  let last = performance.now();
  let raf = 0;
  let running = true;

  const step = (dt) => {
    t += dt;
    // Corpo que anda: ombros seguem um balanço suave
    const bodyX = Math.sin(t * 1.6) * 0.09;
    const bodyY = Math.sin(t * 3.2) * 0.035;
    const bodyRot = Math.sin(t * 1.6) * 0.04;
    const cos = Math.cos(bodyRot);
    const sin = Math.sin(bodyRot);

    for (let k = 0; k < count; k++) {
      const x = pos[k * 3];
      const y = pos[k * 3 + 1];
      if (pinned[k]) {
        // Pino acompanha o corpo (rotação leve + translação)
        const rx = rest[k * 3];
        const ry = rest[k * 3 + 1];
        pos[k * 3] = rx * cos - ry * sin + bodyX;
        pos[k * 3 + 1] = rx * sin + ry * cos + 0.0 + bodyY;
        pos[k * 3 + 2] = Math.sin(t * 2 + k) * 0.01;
        prev[k * 3] = pos[k * 3];
        prev[k * 3 + 1] = pos[k * 3 + 1];
        prev[k * 3 + 2] = pos[k * 3 + 2];
        continue;
      }
      const vx = (x - prev[k * 3]) * DAMP;
      const vy = (y - prev[k * 3 + 1]) * DAMP;
      const vz = (pos[k * 3 + 2] - prev[k * 3 + 2]) * DAMP;
      // Aceleração: gravidade, inércia do corpo (x'' = -x·ω²) e vento leve
      const wind = Math.sin(t * 2.3 + j_hash(k)) * 0.5;
      const ax = -bodyX * 2.56 + wind;
      const ay = GRAVITY - bodyY * 10.24;
      prev[k * 3] = x;
      prev[k * 3 + 1] = y;
      prev[k * 3 + 2] = pos[k * 3 + 2];
      pos[k * 3] = x + vx + ax * dt * dt;
      pos[k * 3 + 1] = y + vy + ay * dt * dt;
      pos[k * 3 + 2] = pos[k * 3 + 2] + vz + Math.sin(t * 1.8 + k * 0.07) * 0.5 * dt * dt;
    }

    for (let it = 0; it < ITER; it++) {
      for (let l = 0; l < links.length; l++) {
        const [a, b, len] = links[l];
        const ax = pos[a * 3];
        const ay = pos[a * 3 + 1];
        const az = pos[a * 3 + 2];
        const dx = pos[b * 3] - ax;
        const dy = pos[b * 3 + 1] - ay;
        const dz = pos[b * 3 + 2] - az;
        const d = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1e-6;
        const diff = ((d - len) / d) * 0.5;
        const ox = dx * diff;
        const oy = dy * diff;
        const oz = dz * diff;
        if (!pinned[a]) {
          pos[a * 3] += ox;
          pos[a * 3 + 1] += oy;
          pos[a * 3 + 2] += oz;
        }
        if (!pinned[b]) {
          pos[b * 3] -= ox;
          pos[b * 3 + 1] -= oy;
          pos[b * 3 + 2] -= oz;
        }
      }
    }

    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();
  };

  // Hash estável por vértice (variação de fase)
  function j_hash(k) {
    return ((k * 9301 + 49297) % 233280) / 233280 * Math.PI * 2;
  }

  // Aquecimento: deixa o tecido assentar antes de aparecer
  for (let s = 0; s < 120; s++) step(DT);
  onReady?.();

  const frame = (now) => {
    if (!running) return;
    const dt = Math.min((now - last) / 1000, 1 / 30);
    last = now;
    // Mola de rotação (overshoot ao soltar)
    const k = 90;
    const c = 9;
    rotVel += (-(rot - targetRot) * k - rotVel * c) * dt;
    rot += rotVel * dt;
    group.rotation.y = rot;
    group.rotation.x = Math.sin(t * 0.8) * 0.02;

    // Sub-passos para estabilidade
    const sub = 2;
    for (let s = 0; s < sub; s++) step(dt / sub);
    renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);

  return {
    dispose() {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
      geometry.dispose();
      material.dispose();
      colorTex.dispose();
      bumpTex.dispose();
      renderer.dispose();
      el.remove();
    },
  };
}
