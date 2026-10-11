// Recorta os prints (remove barra de status e do navegador) e gera WebP.
import sharp from "sharp";
const U = process.argv[2];
const jobs = [
  ["15fbda61-image.jpg", "x-coco-lanches", 232, 1915],
  ["64477366-image.jpg", "parada-do-pastel", 236, 1810],
  ["ca932a52-image.png", "vertice-barbearia-entrada", 180, 1780],
  ["cf6e0cf3-image.png", "vertice-barbearia", 180, 1300],
  ["c739313b-image.png", "otica-lumera", 216, 1770],
  ["161a6bbf-image.png", "grao-e-prosa", 216, 1770],
];
for (const [src, out, top, bottom] of jobs) {
  const img = sharp(`${U}/${src}`);
  const { width, height } = await img.metadata();
  // coordenadas medidas na escala de 2000 px (prints JPG) ou 1846 px (prints PNG)
  const k = height / (src.endsWith(".jpg") ? 2000 : 1846);
  const t = Math.round(top * k);
  await img.extract({ left: 0, top: t, width, height: Math.round(bottom * k) - t })
    .resize({ width: 640 }).webp({ quality: 82 }).toFile(`public/trabalhos/${out}.webp`);
  console.log(out);
}
