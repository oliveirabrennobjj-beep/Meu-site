/*
 * Poste de barbeiro em 3D da tela de entrada (three.js).
 * Fonte de assets/js/intro-3d.js. Para regerar: npm install && npm run build
 *
 * Latão polido, tubo de vidro e listras dourado/creme/preto girando dentro.
 * A luz vem de um "estúdio" montado em código (softboxes), sem imagens externas.
 */
import {
  ACESFilmicToneMapping,
  AmbientLight,
  BackSide,
  BoxGeometry,
  CanvasTexture,
  Color,
  CylinderGeometry,
  DirectionalLight,
  Group,
  LatheGeometry,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  Scene,
  SphereGeometry,
  SRGBColorSpace,
  Vector2,
  WebGLRenderer,
} from "three";

(function () {
  var root = document.documentElement;
  var host = document.querySelector("[data-intro-3d]");
  // sem tela de entrada, ou se o poste em CSS já entrou no lugar, não faz nada
  if (!host || !root.classList.contains("intro-open") || root.classList.contains("pole-css")) return;

  function fallback() {
    root.classList.add("pole-css");
  }

  var renderer;
  try {
    renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
  } catch (e) {
    fallback();
    return;
  }

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setClearColor(0x000000, 0);
  host.appendChild(renderer.domElement);

  var scene = new Scene();
  var camera = new PerspectiveCamera(26, 1, 0.1, 50);
  camera.position.set(0, 0.35, 9.2);
  camera.lookAt(0, 0.05, 0);

  /* ---------- estúdio para os reflexos ---------- */

  function studioEnvironment() {
    var env = new Scene();
    var room = new Mesh(new BoxGeometry(14, 10, 14), new MeshBasicMaterial({ color: 0x15120f, side: BackSide }));
    env.add(room);
    function softbox(w, h, x, y, z, color, rotY) {
      var panel = new Mesh(new PlaneGeometry(w, h), new MeshBasicMaterial({ color: color }));
      panel.position.set(x, y, z);
      panel.lookAt(0, y * 0.4, 0);
      if (rotY) panel.rotation.y += rotY;
      env.add(panel);
    }
    // duas faixas altas nas laterais desenham os brilhos verticais no metal e no vidro
    softbox(1.1, 7, -4.2, 0.5, 2.2, new Color(5.5, 5.2, 4.8));
    softbox(0.8, 7, 4.4, 0.5, 1.4, new Color(3.6, 3.3, 3.0));
    // luz de cima, quente
    softbox(4, 3, 0, 4.8, 0.5, new Color(4.2, 3.4, 2.4));
    // rebatedor frontal fraco
    softbox(6, 2, 0, -1, 6, new Color(0.9, 0.8, 0.7));
    var pmrem = new PMREMGenerator(renderer);
    var target = pmrem.fromScene(env, 0.04);
    pmrem.dispose();
    return target.texture;
  }
  scene.environment = studioEnvironment();
  scene.add(new AmbientLight(0xffffff, 0.15));
  var key = new DirectionalLight(0xfff1d6, 1.2);
  key.position.set(-3, 5, 4);
  scene.add(key);

  /* ---------- listras (textura feita em código) ---------- */

  function stripeTexture() {
    var size = 1024;
    var canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    var ctx = canvas.getContext("2d");
    var img = ctx.createImageData(size, size);
    var gold = [201, 154, 72];
    var cream = [240, 232, 216];
    var black = [24, 19, 14];
    var bands = [gold, cream, black, cream];
    for (var y = 0; y < size; y++) {
      for (var x = 0; x < size; x++) {
        // 2 voltas de padrão ao redor (número inteiro = sem emenda)
        var p = (x / size) * 2 + (y / size) * 2.6;
        var f = (p - Math.floor(p)) * 4;
        var i = Math.floor(f);
        var t = f - i;
        var a = bands[i];
        var b = bands[(i + 1) % 4];
        // borda levemente suavizada entre as faixas
        var m = t > 0.96 ? (t - 0.96) / 0.04 : 0;
        var o = (y * size + x) * 4;
        img.data[o] = a[0] + (b[0] - a[0]) * m;
        img.data[o + 1] = a[1] + (b[1] - a[1]) * m;
        img.data[o + 2] = a[2] + (b[2] - a[2]) * m;
        img.data[o + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    var tex = new CanvasTexture(canvas);
    tex.colorSpace = SRGBColorSpace;
    tex.anisotropy = 8;
    return tex;
  }

  /* ---------- peças ---------- */

  var brass = new MeshStandardMaterial({ color: 0xd8b46c, metalness: 1, roughness: 0.2 });
  var darkBrass = new MeshStandardMaterial({ color: 0x8a6a33, metalness: 1, roughness: 0.32 });
  var glass = new MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0,
    roughness: 0.04,
    transparent: true,
    opacity: 0.16,
    clearcoat: 1,
    clearcoatRoughness: 0.03,
    envMapIntensity: 2.4,
    depthWrite: false,
  });

  var pole = new Group();
  scene.add(pole);

  var TUBE_H = 2.5;
  var TUBE_R = 0.5;

  var stripes = new Mesh(
    new CylinderGeometry(TUBE_R * 0.86, TUBE_R * 0.86, TUBE_H, 96, 1, true),
    new MeshStandardMaterial({ map: stripeTexture(), roughness: 0.42, metalness: 0 })
  );
  pole.add(stripes);

  var tube = new Mesh(new CylinderGeometry(TUBE_R, TUBE_R, TUBE_H, 96, 1, true), glass);
  tube.renderOrder = 2;
  pole.add(tube);

  // perfis girados (torno) para a coroa e a base, como peças de metal usinadas
  function lathe(points, material, y, flip) {
    var pts = points.map(function (p) { return new Vector2(p[0], flip ? -p[1] : p[1]); });
    if (flip) pts.reverse();
    var mesh = new Mesh(new LatheGeometry(pts, 96), material);
    mesh.position.y = y;
    pole.add(mesh);
    return mesh;
  }

  var crown = [
    [0.0, 0.0], [0.6, 0.0], [0.62, 0.03], [0.62, 0.1], [0.56, 0.12], [0.56, 0.16],
    [0.64, 0.18], [0.66, 0.24], [0.6, 0.27], [0.5, 0.29], [0.5, 0.34], [0.58, 0.37],
    [0.58, 0.42], [0.46, 0.46], [0.36, 0.56], [0.24, 0.64], [0.14, 0.68], [0.1, 0.72],
    [0.12, 0.75], [0.0, 0.76],
  ];
  lathe(crown, brass, TUBE_H / 2, false);

  var base = [
    [0.0, 0.0], [0.6, 0.0], [0.62, 0.03], [0.62, 0.1], [0.56, 0.12], [0.56, 0.17],
    [0.66, 0.2], [0.68, 0.27], [0.6, 0.3], [0.6, 0.36], [0.72, 0.4], [0.74, 0.5],
    [0.66, 0.54], [0.66, 0.62], [0.78, 0.66], [0.8, 0.74], [0.0, 0.76],
  ];
  lathe(base, brass, -TUBE_H / 2, true);

  // anéis escuros que separam o vidro do metal
  [TUBE_H / 2 + 0.005, -TUBE_H / 2 - 0.005].forEach(function (y) {
    var ring = new Mesh(new CylinderGeometry(TUBE_R + 0.035, TUBE_R + 0.035, 0.05, 96), darkBrass);
    ring.position.y = y;
    pole.add(ring);
  });

  var finial = new Mesh(new SphereGeometry(0.15, 48, 32), brass);
  finial.position.y = TUBE_H / 2 + 0.86;
  pole.add(finial);

  pole.position.y = -0.05;

  // sombra suave no chão, embaixo da base
  var shadowCanvas = document.createElement("canvas");
  shadowCanvas.width = shadowCanvas.height = 256;
  var sctx = shadowCanvas.getContext("2d");
  var grad = sctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0, "rgba(0,0,0,0.75)");
  grad.addColorStop(0.55, "rgba(0,0,0,0.3)");
  grad.addColorStop(1, "rgba(0,0,0,0)");
  sctx.fillStyle = grad;
  sctx.fillRect(0, 0, 256, 256);
  var shadow = new Mesh(
    new PlaneGeometry(2.6, 2.6),
    new MeshBasicMaterial({ map: new CanvasTexture(shadowCanvas), transparent: true, depthWrite: false })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -TUBE_H / 2 - 0.76 - 0.04;
  scene.add(shadow);

  var POLE_H = TUBE_H + 0.76 * 2 + 0.3;
  var BASE_W = 1.6;

  /* ---------- tamanho, movimento e saída ---------- */

  function resize() {
    var w = host.clientWidth;
    var h = host.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // distância para o poste caber inteiro: pela altura (com folga) e, em telas
    // estreitas, pela largura da base
    var halfTan = Math.tan((camera.fov * Math.PI) / 360);
    var byHeight = (POLE_H * 1.14) / 2 / halfTan;
    var byWidth = (BASE_W / 0.72) / (2 * halfTan * camera.aspect);
    camera.position.z = Math.max(byHeight, byWidth);
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener("resize", resize);

  var pointerX = 0;
  var pointerY = 0;
  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    window.addEventListener("pointermove", function (event) {
      pointerX = event.clientX / window.innerWidth - 0.5;
      pointerY = event.clientY / window.innerHeight - 0.5;
    });
  }

  var running = true;
  var last = performance.now();
  var spin = 0;

  function frame(now) {
    if (!running) return;
    var dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    spin += dt * 0.9;
    stripes.rotation.y = -spin;
    // a câmera acompanha o mouse de leve, como quem anda em volta do objeto
    pole.rotation.y += ((pointerX * 0.35) - pole.rotation.y) * 0.05;
    pole.rotation.x += ((pointerY * 0.08) - pole.rotation.x) * 0.05;
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }

  function stop() {
    running = false;
    window.removeEventListener("resize", resize);
    setTimeout(function () {
      renderer.dispose();
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    }, 1500);
  }

  renderer.render(scene, camera);
  // se a montagem demorou e o poste em CSS já apareceu, fica o CSS (sem trocar na frente da pessoa)
  if (root.classList.contains("pole-css")) {
    renderer.dispose();
    host.removeChild(renderer.domElement);
    return;
  }
  root.classList.add("pole-3d");
  if (!reduce) requestAnimationFrame(frame);

  // o main.js remove a tela de entrada do documento ao entrar
  var observer = new MutationObserver(function () {
    if (!root.classList.contains("intro-open") || !document.body.contains(host)) {
      observer.disconnect();
      stop();
    }
  });
  observer.observe(root, { attributes: true, attributeFilter: ["class"] });
  observer.observe(document.body, { childList: true });

  window.addEventListener("pagehide", stop);
})();
