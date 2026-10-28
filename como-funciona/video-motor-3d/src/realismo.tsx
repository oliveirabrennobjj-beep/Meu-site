import React, { useMemo } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { RoundedBoxGeometry as RoundedBox } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

/**
 * Acabamento "realista": luz de estúdio refletida nos materiais (RoomEnvironment),
 * sombras macias e texturas feitas no código (sem baixar nada).
 */
const envCache = new WeakMap<THREE.WebGLRenderer, THREE.Texture>();

export const Estudio: React.FC<{ intensity?: number }> = ({ intensity = 0.35 }) => {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  let env = envCache.get(gl);
  if (!env) {
    const pmrem = new THREE.PMREMGenerator(gl);
    env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    envCache.set(gl, env);
  }
  scene.environment = env;
  scene.environmentIntensity = intensity;
  gl.toneMapping = THREE.ACESFilmicToneMapping;
  gl.toneMappingExposure = 0.92;
  gl.shadowMap.type = THREE.PCFSoftShadowMap;
  return null;
};

/** Sol com sombra nítida o bastante e cobrindo a cena toda. */
export const Sol: React.FC<{ p: [number, number, number]; i?: number; area?: number }> = ({ p, i = 2.0, area = 16 }) => (
  <directionalLight
    position={p}
    intensity={i}
    castShadow
    shadow-mapSize-width={2048}
    shadow-mapSize-height={2048}
    shadow-camera-left={-area}
    shadow-camera-right={area}
    shadow-camera-top={area}
    shadow-camera-bottom={-area}
    shadow-camera-near={0.5}
    shadow-camera-far={80}
    shadow-bias={-0.0004}
    shadow-normalBias={0.03}
  />
);

const texCache = new Map<string, THREE.CanvasTexture>();
const rnd = (seed: number) => () => {
  seed = (seed * 16807) % 2147483647;
  return seed / 2147483647;
};

/** Textura em tons de cinza para multiplicar a cor do material (1 = sem mudança). */
const makeTex = (key: string, draw: (g: CanvasRenderingContext2D, r: () => number) => void, repeat: [number, number]) => {
  const k = key + repeat.join("x");
  const hit = texCache.get(k);
  if (hit) return hit;
  const cv = document.createElement("canvas");
  cv.width = cv.height = 256;
  const g = cv.getContext("2d")!;
  g.fillStyle = "#fff";
  g.fillRect(0, 0, 256, 256);
  draw(g, rnd(key.length * 7919 + 13));
  const tex = new THREE.CanvasTexture(cv);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(...repeat);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  texCache.set(k, tex);
  return tex;
};

const speckle = (g: CanvasRenderingContext2D, r: () => number, n: number, a: number, size: number) => {
  for (let i = 0; i < n; i++) {
    const v = Math.floor(255 * (1 - r() * a));
    g.fillStyle = `rgb(${v},${v},${v})`;
    const s = 1 + r() * size;
    g.fillRect(r() * 256, r() * 256, s, s);
  }
};

export type TexName = "concreto" | "asfalto" | "madeira" | "terra" | "grama" | "metal" | "tijolo";

export const textura = (nome: TexName, repeat: [number, number] = [1, 1]) =>
  makeTex(
    nome,
    (g, r) => {
      if (nome === "concreto") speckle(g, r, 2600, 0.18, 2);
      if (nome === "asfalto") speckle(g, r, 5000, 0.35, 2);
      if (nome === "metal") {
        for (let y = 0; y < 256; y++) {
          const v = Math.floor(235 + r() * 20);
          g.fillStyle = `rgb(${v},${v},${v})`;
          g.fillRect(0, y, 256, 1);
        }
      }
      if (nome === "madeira") {
        for (let y = 0; y < 256; y += 2) {
          const v = Math.floor(200 + 55 * (0.5 + 0.5 * Math.sin(y * 0.35 + Math.sin(y * 0.05) * 3)));
          g.fillStyle = `rgb(${v},${v},${v})`;
          g.fillRect(0, y, 256, 2);
        }
        speckle(g, r, 400, 0.25, 3);
      }
      if (nome === "terra") {
        speckle(g, r, 3500, 0.3, 3);
        for (let i = 0; i < 70; i++) {
          const v = Math.floor(150 + r() * 60);
          g.fillStyle = `rgb(${v},${v},${v})`;
          g.beginPath();
          g.ellipse(r() * 256, r() * 256, 2 + r() * 6, 2 + r() * 4, r() * 3, 0, Math.PI * 2);
          g.fill();
        }
      }
      if (nome === "grama") {
        speckle(g, r, 3000, 0.28, 2);
        g.strokeStyle = "rgba(120,120,120,0.35)";
        for (let i = 0; i < 400; i++) {
          const x = r() * 256, y = r() * 256;
          g.beginPath();
          g.moveTo(x, y);
          g.lineTo(x + (r() - 0.5) * 3, y - 3 - r() * 4);
          g.stroke();
        }
      }
      if (nome === "tijolo") {
        g.fillStyle = "#c8c8c8";
        for (let row = 0; row < 8; row++) {
          g.fillRect(0, row * 32, 256, 3);
          for (let col = 0; col < 5; col++) g.fillRect(((row % 2) * 32 + col * 64) % 256, row * 32, 3, 32);
        }
        speckle(g, r, 1200, 0.2, 2);
      }
    },
    repeat,
  );

/** Caixa com cantos arredondados (o que tira a cara de "bloco de brinquedo"). */
export const useRounded = (w: number, h: number, d: number) =>
  useMemo(() => {
    const rad = Math.min(0.05, Math.min(w, h, d) * 0.25);
    return new RoundedBox(w, h, d, 3, rad);
  }, [w, h, d]);

