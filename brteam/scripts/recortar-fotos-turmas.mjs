// Recorta as fotos das turmas dos posts do Instagram (prints de 1080x2340),
// só a parte da foto, sem o texto do post.
// Coordenadas anotadas na escala de 923 px de largura e convertidas aqui.
// Uso: node scripts/recortar-fotos-turmas.mjs <pasta-dos-prints> [pasta-de-saida]
import sharp from "sharp";
const U = process.argv[2];
const OUT = process.argv[3] ?? "public/fotos";
const k = 1080 / 923;
const box = (x1, y1, x2, y2) => ({
  left: Math.round(x1 * k), top: Math.round(y1 * k),
  width: Math.round((x2 - x1) * k), height: Math.round((y2 - y1) * k),
});

const fotos = [
  // [print, recorte, arquivo, largura]
  ["a88a601a-image.jpg", box(0, 568, 923, 1190), "tatame-cheio", 1080],
  ["c18e5c31-image.jpg", box(0, 440, 923, 1038), "turma-kids-1", 1080],
  ["74423a0a-image.jpg", box(0, 456, 923, 1068), "turma-kids-2", 1080],
  ["2d78077f-image.jpg", box(0, 300, 923, 832), "pequenos-gigantes", 1080],
  ["16fee65b-image.jpg", box(0, 417, 923, 1100), "turma-mista", 1080],
  ["94849dab-image.jpg", box(122, 1116, 790, 1472), "familia-br-team", 780],
  ["a7075ebf-image.jpg", box(30, 553, 615, 868), "treino-passagem", 750],
];

for (const [src, b, out, w] of fotos) {
  const info = await sharp(`${U}/${src}`).extract(b).resize({ width: w, withoutEnlargement: true })
    .webp({ quality: 84 }).toFile(`${OUT}/${out}.webp`);
  console.log(out, info.width, info.height);
}
