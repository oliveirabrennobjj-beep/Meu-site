// Fotos em boa qualidade tiradas do PDF "Apresentação BRTEAM Jiu-Jitsu" (recortes com fundo transparente,
// extraídos com `pdfimages` e montados com a máscara de cada imagem em scripts/fontes-pdf/)
// e novas fotos do Instagram @brteambjj (prints de 1080x2340; coordenadas na escala de 923 px).
// Uso: node scripts/fotos-pdf-e-instagram.mjs <pasta-dos-prints>
import sharp from "sharp";
const U = process.argv[2];

const pdf = [
  ["ok-002.png", "professor-bruno", 640],
  ["ok-026.png", "aluno-faixa-branca", 600],
  ["ok-034.png", "treino-meninas", 640],
  ["ok-046.png", "amigos-kids", 560],
  ["ok-052.png", "professor-cumprimento", 520],
];
for (const [src, out, w] of pdf) {
  await sharp(`scripts/fontes-pdf/${src}`).trim({ threshold: 1 }).resize({ width: w, withoutEnlargement: true })
    .webp({ quality: 84, alphaQuality: 90 }).toFile(`public/fotos/${out}.webp`);
}

const k = 1080 / 923;
const box = (x1, y1, x2, y2) => ({ left: Math.round(x1 * k), top: Math.round(y1 * k), width: Math.round((x2 - x1) * k), height: Math.round((y2 - y1) * k) });
const insta = [
  ["5f7f839f-image.jpg", box(310, 245, 613, 650), "professores-e-alunos"],
  ["5f7f839f-image.jpg", box(619, 245, 923, 650), "turma-feminina-kids"],
  ["5f7f839f-image.jpg", box(310, 657, 613, 1060), "aula-no-tatame"],
  ["5f7f839f-image.jpg", box(619, 657, 923, 1060), "kids-kimono-azul"],
  ["5f7f839f-image.jpg", box(0, 1478, 304, 1883), "adultos-kimono-azul"],
  ["5f7f839f-image.jpg", box(619, 1478, 923, 1883), "kids-kimono-branco"],
];
for (const [src, b, out] of insta) {
  await sharp(`${U}/${src}`).extract(b).webp({ quality: 84 }).toFile(`public/fotos/${out}.webp`);
}
console.log("ok");
