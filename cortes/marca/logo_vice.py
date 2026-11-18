#!/usr/bin/env python3
"""Logo BN minimalista no clima do GTA 6: fundo preto, o monograma BN vira uma janela para o
pôr do sol de Vice City (céu, sol, prédios e palmeira dentro das letras), "BN" branco em itálico
e "Digital" rosa em pincel por cima. Gera logo-bn-vice.png (1080x1080).
"""
import math
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

from logo_gta import degrade_v, mascaras_monograma, palmeira

S = 2160
AQUI = Path(__file__).resolve().parent
FONTES = AQUI.parent / 'fontes'


def cena(w, h, rng):
    """Pôr do sol com sol, prédios e palmeira, do tamanho da janela."""
    img = degrade_v(h, w, [(0, (70, 14, 120)), (0.32, (170, 30, 150)), (0.58, (255, 70, 140)),
                           (0.80, (255, 140, 80)), (1, (255, 190, 100))])
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    sc, sr = (w * 0.56, h * 0.70), h * 0.30
    m_sol = np.clip((sr - np.sqrt((xx - sc[0]) ** 2 + (yy - sc[1]) ** 2)) / 2, 0, 1)
    cor_sol = degrade_v(h, w, [(0, (255, 236, 140)), (0.55, (255, 236, 140)), (0.8, (255, 120, 120)), (1, (255, 120, 120))])
    img = img * (1 - m_sol[..., None]) + cor_sol * m_sol[..., None]
    pil = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).convert('RGBA')
    d = ImageDraw.Draw(pil)
    sil = (40, 6, 56, 255)
    chao = int(h * 0.86)
    x = int(w * 0.30)
    while x < w:   # prédios à direita, a roda-gigante e o chão
        lw = int(rng.integers(40, 110))
        alt = int(rng.integers(int(h * 0.12), int(h * 0.42)))
        d.rectangle([x, chao - alt, x + lw, chao], fill=sil)
        x += lw + int(rng.integers(0, 10))
    rx, ry, rr = w * 0.86, chao - h * 0.20, h * 0.16
    d.ellipse([rx - rr, ry - rr, rx + rr, ry + rr], outline=sil, width=12)
    for k in range(12):
        a = k * math.pi / 6
        d.line([(rx, ry), (rx + rr * math.cos(a), ry + rr * math.sin(a))], fill=sil, width=6)
    d.rectangle([0, chao, w, h], fill=sil)
    palmeira(d, w * 0.18, h * 1.02, h * 0.92, 1, sil)
    # helicóptero pequeno no céu
    hx, hy = w * 0.80, h * 0.16
    d.ellipse([hx - 30, hy - 14, hx + 30, hy + 14], fill=sil)
    d.line([(hx + 20, hy), (hx + 80, hy - 6)], fill=sil, width=8)
    d.line([(hx - 60, hy - 22), (hx + 60, hy - 22)], fill=sil, width=5)
    return pil


def texto(txt, fonte, cor, contorno, inclina=0.0, sombra=True):
    tmp = ImageDraw.Draw(Image.new('L', (10, 10)))
    x0, y0, x1, y1 = tmp.textbbox((0, 0), txt, font=fonte, stroke_width=contorno)
    pad = 60
    w, h = x1 - x0 + pad * 2 + int((y1 - y0) * abs(inclina)), y1 - y0 + pad * 2
    im = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    if sombra:
        d.text((pad - x0 + 10, pad - y0 + 14), txt, font=fonte, fill=(0, 0, 0, 200), stroke_width=contorno,
               stroke_fill=(0, 0, 0, 200))
    d.text((pad - x0, pad - y0), txt, font=fonte, fill=cor, stroke_width=contorno, stroke_fill=(8, 2, 12, 255))
    if inclina:
        im = im.transform(im.size, Image.AFFINE, (1, inclina, -inclina * h * 0.5, 0, 1, 0), resample=Image.BICUBIC)
    return im.crop(im.getchannel('A').getbbox())


def main():
    rng = np.random.default_rng(5)
    base = Image.new('RGBA', (S, S), (0, 0, 0, 255))

    branco, azul = mascaras_monograma()
    uniao = np.maximum(branco, azul)
    ys, xs = np.where(uniao > 20)
    y0, y1, x0, x1 = ys.min(), ys.max(), xs.min(), xs.max()
    larg = int(S * 0.70)
    esc = larg / (x1 - x0)
    alt = int((y1 - y0) * esc)
    def ajusta(mm):
        return cv2.resize(mm[y0:y1, x0:x1], (larg, alt), interpolation=cv2.INTER_AREA)
    mb, ma = ajusta(branco), ajusta(azul)
    # separa as duas partes com um vão preto, para o B e o N continuarem legíveis
    k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (17, 17))
    mb, ma = cv2.erode(mb, k), cv2.erode(ma, k)
    m = np.maximum(mb, ma)
    mx, my = (S - larg) // 2, int(S * 0.12)

    janela = cena(larg, alt, rng)
    # brilho rosa só por fora da silhueta (não entra nos vãos)
    sil = cv2.morphologyEx(m, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (61, 61)))
    pad = 120
    silp = cv2.copyMakeBorder(sil, pad, pad, pad, pad, cv2.BORDER_CONSTANT, value=0).astype(np.float32) / 255
    brilho = np.clip(cv2.GaussianBlur(silp, (0, 0), 45) * 0.8 - silp, 0, 1)
    neon = np.zeros(silp.shape + (4,), np.uint8)
    neon[..., 0], neon[..., 1], neon[..., 2] = 255, 40, 150
    neon[..., 3] = (brilho * 255).astype(np.uint8)
    base.alpha_composite(Image.fromarray(neon, 'RGBA'), (mx - pad, my - pad))
    letras = Image.new('RGBA', (larg, alt), (0, 0, 0, 0))
    letras.paste(janela, (0, 0), Image.fromarray(m))
    # a parte que era azul ganha um tom mais frio, como na logo original de duas cores
    frio = np.array(letras).astype(np.float32)
    fa = (ma.astype(np.float32) / 255)[..., None]
    frio[..., :3] = frio[..., :3] * (1 - fa * 0.35) + np.array([60, 200, 255]) * fa * 0.35
    letras = Image.fromarray(np.clip(frio, 0, 255).astype(np.uint8), 'RGBA')
    base.alpha_composite(letras, (mx, my))

    # "BN" branco em itálico e "Digital" rosa em pincel, encavalados na base do monograma
    t_bn = texto('BN', ImageFont.truetype(str(FONTES / 'Anton-Regular.ttf'), 300), (255, 255, 255, 255), 14, 0.18)
    t_dig = texto('Digital', ImageFont.truetype(str(FONTES / 'KaushanScript-Regular.ttf'), 420),
                  (255, 46, 150, 255), 16)
    t_dig = t_dig.rotate(6, resample=Image.BICUBIC, expand=True)
    y_base = my + alt
    y_bn = y_base - int(t_bn.height * 0.70)
    base.alpha_composite(t_bn, (S // 2 - t_bn.width // 2, y_bn))
    y_dig = y_bn + int(t_bn.height * 0.78)
    base.alpha_composite(t_dig, (S // 2 - t_dig.width // 2 + 30, y_dig))
    # traço de pincel curto embaixo do "Digital"
    d = ImageDraw.Draw(base)
    yt = y_dig + int(t_dig.height * 0.92)
    d.line([(S * 0.40, yt + 14), (S * 0.66, yt - 8)], fill=(255, 46, 150, 255), width=18)

    base.convert('RGB').resize((1080, 1080), Image.LANCZOS).save(AQUI / 'logo-bn-vice.png')
    print('ok')


if __name__ == '__main__':
    main()
