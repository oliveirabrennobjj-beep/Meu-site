// Recorta a logo (perfil do Instagram) e as fotos reais das placas NFC.
import sharp from "sharp";
const U = process.argv[2];

// logo: círculo centrado em (540, 1169) com raio ~356 px no print de 1080x2340
const r = 352, cx = 540, cy = 1169;
const mask = Buffer.from(`<svg width="${r * 2}" height="${r * 2}"><circle cx="${r}" cy="${r}" r="${r}" fill="#fff"/></svg>`);
const logo = await sharp(`${U}/91fbcf09-image.jpg`)
  .extract({ left: cx - r, top: cy - r, width: r * 2, height: r * 2 })
  .composite([{ input: mask, blend: "dest-in" }]).png().toBuffer();
await sharp(logo).resize(256).webp({ quality: 90 }).toFile("public/logo-bn-digital.webp");
await sharp(logo).resize(192).png().toFile("public/logo-bn-digital.png");

// fotos das placas: área da foto vai de y=710 a y=1787 nos prints de 1080x2340
const fotos = [
  ["f365a2b7-image.jpg", "placas-nfc-preta-e-azul"],
  ["0df582e5-image.jpg", "placa-nfc-azul-no-balcao"],
  ["7c41b5dd-image.jpg", "placa-nfc-preta-no-balcao"],
];
for (const [src, out] of fotos) {
  await sharp(`${U}/${src}`).extract({ left: 0, top: 712, width: 1078, height: 1074 })
    .resize(900).webp({ quality: 82 }).toFile(`public/nfc/${out}.webp`);
}
console.log("ok");
