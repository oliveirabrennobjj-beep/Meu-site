// Recorta logo e fotos reais dos prints do Instagram da BR Team (1080x2340).
// Coordenadas anotadas na escala de 923 px de largura e convertidas aqui.
// Uso: node scripts/recortar-fotos.mjs <pasta-dos-prints>
import sharp from "sharp";
const U = process.argv[2];
const k = 1080 / 923;
const box = (x1, y1, x2, y2) => ({
  left: Math.round(x1 * k), top: Math.round(y1 * k),
  width: Math.round((x2 - x1) * k), height: Math.round((y2 - y1) * k),
});

const fotos = [
  // [print, recorte, arquivo, largura]
  ["9b2bca0e-image.jpg", box(0, 250, 923, 850), "turma-kids", 1080],
  ["b937f323-image.jpg", box(0, 770, 470, 1608), "professor-bruno", 560],
  ["dd9d8452-image.jpg", box(545, 560, 923, 1380), "aluno-faixa-branca", 440],
  ["07199404-image.jpg", box(28, 840, 395, 1225), "treino-meninas", 440],
  ["07199404-image.jpg", box(28, 1420, 285, 1735), "amigos-kids", 300],
  ["2c12000c-image.jpg", box(632, 905, 893, 1302), "professor-cumprimento", 300],
  ["9a11025d-image.jpg", box(0, 1080, 304, 1437), "turma-tatame", 360],
  ["9a11025d-image.jpg", box(0, 1443, 304, 1848), "podio-rio-winter-open", 360],
  ["9a11025d-image.jpg", box(310, 1443, 613, 1848), "troca-de-faixa-turma", 360],
  ["9a11025d-image.jpg", box(619, 1443, 923, 1848), "troca-de-faixa-kids-ii", 360],
  ["2fd22bb3-image.jpg", box(0, 695, 304, 1052), "bruno-e-marina", 360],
  ["2fd22bb3-image.jpg", box(619, 1059, 923, 1463), "competicao", 360],
  ["2fd22bb3-image.jpg", box(0, 1517, 304, 1873), "turma-geral", 360],
  ["2fd22bb3-image.jpg", box(619, 1517, 923, 1873), "graduacao-adultos", 360],
];
// Foto do espaço (capa do perfil do WhatsApp Business), levemente clareada
await sharp(`${U}/bffbf009-image.jpg`).extract(box(75, 68, 848, 270)).modulate({ brightness: 1.12 })
  .webp({ quality: 84 }).toFile("public/fotos/espaco-tatame.webp");

for (const [src, b, out, w] of fotos) {
  await sharp(`${U}/${src}`).extract(b).resize({ width: w, withoutEnlargement: true })
    .webp({ quality: 84 }).toFile(`public/fotos/${out}.webp`);
}

// Logo circular (avatar do perfil) — centro (461, 999), raio 304 na escala 923
const r = Math.round(300 * k), cx = Math.round(461 * k), cy = Math.round(999 * k);
const mask = Buffer.from(`<svg width="${r * 2}" height="${r * 2}"><circle cx="${r}" cy="${r}" r="${r}" fill="#fff"/></svg>`);
const circ = await sharp(`${U}/10f22fa5-image.jpg`)
  .extract({ left: cx - r, top: cy - r, width: r * 2, height: r * 2 })
  .composite([{ input: mask, blend: "dest-in" }]).png().toBuffer();
await sharp(circ).resize(512).png().toFile("public/logo-br-team.png");
await sharp(circ).resize(64).png().toFile("public/favicon.png");
await sharp(circ).resize(180).png().toFile("public/apple-touch-icon.png");

// Símbolo "bR" em branco com fundo transparente: alfa = inverso do cinza
async function knockout(src, b, out, invert) {
  let g = sharp(`${U}/${src}`).extract(b).greyscale();
  if (invert) g = g.negate();
  const { data, info } = await g.raw().toBuffer({ resolveWithObject: true });
  const rgba = Buffer.alloc(info.width * info.height * 4);
  for (let i = 0; i < data.length; i++) {
    const a = Math.max(0, Math.min(255, (data[i] - 30) * 1.25));
    rgba[i * 4] = rgba[i * 4 + 1] = rgba[i * 4 + 2] = 255; rgba[i * 4 + 3] = a;
  }
  await sharp(rgba, { raw: { width: info.width, height: info.height, channels: 4 } })
    .trim().png().toFile(out);
}
await knockout("7cf34003-image.jpg", box(296, 500, 625, 918), "public/simbolo-br.png", true);
await knockout("a91fb507-image.jpg", box(230, 610, 695, 810), "public/marca-br-team.png", false);
console.log("ok");
