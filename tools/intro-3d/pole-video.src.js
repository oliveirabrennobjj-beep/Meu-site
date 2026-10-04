/*
 * Renderizador do vídeo do poste (three.js), usado só para GERAR o vídeo.
 * Rode: npm install && npm run video   (ver render-video.py)
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

window.PoleRender = (function () {
  var W = 1080;
  var H = 1920;
  var gl = document.createElement("canvas");
  gl.width = W;
  gl.height = H;
  var renderer = new WebGLRenderer({ canvas: gl, antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1);
  renderer.setSize(W, H, false);
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setClearColor(0x000000, 0);

  var scene = new Scene();
  var camera = new PerspectiveCamera(26, W / H, 0.1, 50);

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
    var target = pmrem.fromScene(env, 0.04, 0.1, 100, { size: 256 });
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
    // faixas diagonais desenhadas com formas 2D (rápido); 2 voltas ao redor = sem emenda
    var size = 2048;
    var canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    var ctx = canvas.getContext("2d");
    var colors = ["#c99a48", "#f0e8d8", "#18130e", "#f0e8d8"];
    var turns = 2;
    var period = size / turns;
    var band = period / colors.length;
    var slope = size * 1.3; // deslocamento horizontal ao longo da altura
    for (var k = -2; k < 21; k++) {
      ctx.fillStyle = colors[((k % 4) + 4) % 4];
      var x0 = k * band;
      ctx.beginPath();
      ctx.moveTo(x0, 0);
      ctx.lineTo(x0 + band + 0.6, 0);
      ctx.lineTo(x0 + band + 0.6 - slope, size);
      ctx.lineTo(x0 - slope, size);
      ctx.closePath();
      ctx.fill();
    }
    var tex = new CanvasTexture(canvas);
    tex.colorSpace = SRGBColorSpace;
    tex.anisotropy = 16;
    return tex;
  }

  /* ---------- peças ---------- */

  var brass = new MeshStandardMaterial({ color: 0xd8b46c, metalness: 1, roughness: 0.2 });
  var darkBrass = new MeshStandardMaterial({ color: 0x8a6a33, metalness: 1, roughness: 0.32 });
  var glass = new MeshStandardMaterial({
    color: 0xffffff,
    metalness: 0.2,
    roughness: 0.04,
    transparent: true,
    opacity: 0.14,
    envMapIntensity: 2.6,
    depthWrite: false,
  });

  var pole = new Group();
  scene.add(pole);

  var TUBE_H = 2.5;
  var TUBE_R = 0.5;

  var stripes = new Mesh(
    new CylinderGeometry(TUBE_R * 0.86, TUBE_R * 0.86, TUBE_H, 160, 1, true),
    new MeshStandardMaterial({ map: stripeTexture(), roughness: 0.42, metalness: 0 })
  );
  pole.add(stripes);

  var tube = new Mesh(new CylinderGeometry(TUBE_R, TUBE_R, TUBE_H, 160, 1, true), glass);
  tube.renderOrder = 2;
  pole.add(tube);

  // perfis girados (torno) para a coroa e a base, como peças de metal usinadas
  function lathe(points, material, y, flip) {
    var pts = points.map(function (p) { return new Vector2(p[0], flip ? -p[1] : p[1]); });
    if (flip) pts.reverse();
    var mesh = new Mesh(new LatheGeometry(pts, 160), material);
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
    var ring = new Mesh(new CylinderGeometry(TUBE_R + 0.035, TUBE_R + 0.035, 0.05, 160), darkBrass);
    ring.position.y = y;
    pole.add(ring);
  });

  var finial = new Mesh(new SphereGeometry(0.15, 64, 40), brass);
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
  var halfTan = Math.tan((camera.fov * Math.PI) / 360);
  camera.position.set(0, 0.35, (POLE_H * 1.3) / 2 / halfTan);
  camera.lookAt(0, 0.05, 0);
  camera.updateProjectionMatrix();

  // fundo de estúdio "assado" no vídeo: foco de luz no centro, bordas na cor exata
  // do fundo da página (#0d0b09) para o vídeo se fundir com ela sem emenda
  var out = document.createElement("canvas");
  out.width = W;
  out.height = H;
  var octx = out.getContext("2d");
  function background() {
    octx.setTransform(1, 0, 0, 1, 0, 0);
    octx.fillStyle = "#0d0b09";
    octx.fillRect(0, 0, W, H);
    octx.setTransform(1, 0, 0, 1.55, W / 2, H * 0.45);
    var g = octx.createRadialGradient(0, 0, 0, 0, 0, W * 0.48);
    g.addColorStop(0, "#4b443c");
    g.addColorStop(0.42, "#2b2621");
    g.addColorStop(0.78, "#15120f");
    g.addColorStop(1, "#0d0b09");
    octx.fillStyle = g;
    octx.fillRect(-W, -H, W * 2, H * 2);
    octx.setTransform(1, 0, 0, 1, 0, 0);
  }

  return {
    size: [W, H],
    frame: function (angle) {
      stripes.rotation.y = -angle;
      renderer.render(scene, camera);
      background();
      octx.drawImage(gl, 0, 0);
      return out.toDataURL("image/png");
    },
  };
})();
