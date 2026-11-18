#!/usr/bin/env python3
"""Banner do YouTube (2560x1440) no clima de GTA: pôr do sol, cidade, palmeiras, logo e temas do canal.

Tudo que importa fica na área segura de 1546x423 no centro (aparece em celular, PC e TV).
"""
import math
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

from logo_gta import degrade_v, palmeira

W, H = 2560, 1440
SEG = (507, 508, 2053, 931)          # área segura x0, y0, x1, y1
FONTE = '/home/user/Meu-site/cortes/fontes/Anton-Regular.ttf'
FONTE2 = '/home/user/Meu-site/cortes/fontes/Poppins-Black.ttf'
AQUI = Path(__file__).resolve().parent
TEMAS = ['ROCKSTAR GAMES', 'JOGOS', 'CURIOSIDADES', 'NOTÍCIAS', 'GAMEPLAYS']   # 'GTA 6' já é o título


def texto_degrade(txt, fonte, paradas, contorno=22, borda=36, inclina=0.16):
    """Texto com degradê, contorno escuro, borda branca e sombra; devolve RGBA."""
    tmp = ImageDraw.Draw(Image.new('L', (10, 10)))
    x0, y0, x1, y1 = tmp.textbbox((0, 0), txt, font=fonte)
    pad = borda + 60
    w, h = x1 - x0 + pad * 2 + int((y1 - y0) * inclina), y1 - y0 + pad * 2
    def mascara(esp):
        m = Image.new('L', (w, h), 0)
        ImageDraw.Draw(m).text((pad - x0, pad - y0), txt, font=fonte, fill=255, stroke_width=esp, stroke_fill=255)
        m = m.transform(m.size, Image.AFFINE, (1, inclina, -inclina * h * 0.5, 0, 1, 0), resample=Image.BICUBIC)
        return np.array(m).astype(np.float32) / 255
    cheio, cont, bord = mascara(0), mascara(contorno), mascara(borda)
    sombra = cv2.GaussianBlur(np.roll(np.roll(bord, 18, 0), 12, 1), (0, 0), 10)
    grad = degrade_v(h, w, paradas)
    rgb = np.zeros((h, w, 3), np.float32)
    a = np.maximum(sombra * 0.65, bord)
    rgb[:] = (20, 4, 30)
    rgb = rgb * (1 - bord[..., None]) + 255 * bord[..., None]
    rgb = rgb * (1 - cont[..., None]) + np.array([12, 6, 18]) * cont[..., None]
    rgb = rgb * (1 - cheio[..., None]) + grad * cheio[..., None]
    return Image.fromarray(np.dstack([np.clip(rgb, 0, 255), a * 255]).astype(np.uint8), 'RGBA')


def predios(d, horiz, rng):
    x = -20
    while x < W:
        larg = int(rng.integers(50, 150))
        alt = int(rng.integers(60, 330)) * (1.4 if 900 < x < 1700 else 1.0)
        topo = horiz - alt
        d.rectangle([x, topo, x + larg, horiz], fill=(34, 10, 52, 255))
        if rng.random() < 0.25:   # antena
            d.rectangle([x + larg // 2 - 3, topo - 50, x + larg // 2 + 3, topo], fill=(34, 10, 52, 255))
        for jy in range(int(topo) + 14, horiz - 10, 22):
            for jx in range(x + 10, x + larg - 10, 20):
                if rng.random() < 0.18:
                    cor = (255, 196, 110, 255) if rng.random() < 0.7 else (255, 92, 170, 255)
                    d.rectangle([jx, jy, jx + 7, jy + 9], fill=cor)
        x += larg + int(rng.integers(0, 14))


def main():
    rng = np.random.default_rng(11)
    horiz = int(H * 0.69)
    ceu = degrade_v(horiz, W, [(0, (18, 6, 48)), (0.35, (88, 24, 132)), (0.65, (222, 62, 136)),
                               (0.86, (255, 126, 70)), (1, (255, 192, 90))])
    mar = degrade_v(H - horiz, W, [(0, (70, 18, 90)), (0.5, (34, 9, 60)), (1, (12, 4, 26))])
    cena = np.concatenate([ceu, mar], axis=0)

    # sol retrô
    sc, sr = (W * 0.5, horiz - 30), 360
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    dist = np.sqrt((xx - sc[0]) ** 2 + (yy - sc[1]) ** 2)
    m_sol = np.clip((sr - dist) / 2.5, 0, 1) * (yy < horiz)
    rel = (yy - (sc[1] - sr)) / (2 * sr)
    for k in range(6):
        m_sol *= np.clip(np.abs(rel - (0.55 + k * 0.08)) / (0.008 + k * 0.006) - 0.5, 0, 1)
    cor_sol = degrade_v(H, W, [(0, (255, 232, 120)), (0.3, (255, 232, 120)), (0.55, (255, 160, 80)),
                               (0.7, (255, 92, 130)), (1, (255, 92, 130))])
    cena = cena * (1 - m_sol[..., None]) + cor_sol * m_sol[..., None]
    cena += cv2.GaussianBlur(m_sol, (0, 0), 70)[..., None] * np.array([255, 120, 120], np.float32) * 0.4
    for k in range(16):   # reflexo no mar
        y = int(horiz + 14 + k * (k + 5) * 2.6)
        larg = sr * (1.0 - k * 0.055)
        if y >= H or larg < 40:
            break
        x0, x1 = int(sc[0] - larg), int(sc[0] + larg)
        a = 0.5 - k * 0.03
        cena[y:y + 6 + k, x0:x1] = cena[y:y + 6 + k, x0:x1] * (1 - a) + np.array([255, 150, 120]) * a
    img = Image.fromarray(np.clip(cena, 0, 255).astype(np.uint8)).convert('RGBA')

    camada = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(camada)
    predios(d, horiz, rng)
    cor_p = (14, 4, 26, 255)
    for bx, by, alt, lado in ((W * 0.04, H * 1.02, H * 0.95, 1), (W * 0.13, H * 1.04, H * 0.7, 1),
                              (W * 0.95, H * 1.02, H * 0.92, -1), (W * 0.87, H * 1.05, H * 0.62, -1)):
        palmeira(d, bx, by, alt, lado, cor_p)
    img.alpha_composite(camada)

    # escurece o centro para o texto ler bem
    arr = np.array(img).astype(np.float32)
    vinheta = np.exp(-(((xx - W / 2) / (W * 0.33)) ** 2 + ((yy - H / 2) / (H * 0.22)) ** 2))
    arr[..., :3] *= (1 - 0.38 * vinheta[..., None])
    img = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), 'RGBA')

    # logo à esquerda da área segura
    tam_logo = 380
    logo = Image.open(AQUI / 'logo-bn-gta.png').resize((tam_logo, tam_logo), Image.LANCZOS)
    lx, ly = SEG[0] + 6, (SEG[1] + SEG[3]) // 2 - tam_logo // 2
    img.alpha_composite(logo, (lx, ly))

    # coluna da direita: título em duas linhas e a faixa dos temas, tudo pela tinta (sem a folga das imagens)
    col0, col1 = lx + tam_logo + 40, SEG[2]
    centro_x = (col0 + col1) / 2
    t1 = texto_degrade('TUDO SOBRE', ImageFont.truetype(FONTE, 72), [(0, (255, 255, 255)), (1, (255, 255, 255))],
                       contorno=11, borda=18)
    t2 = texto_degrade('GTA 6', ImageFont.truetype(FONTE, 172),
                       [(0, (255, 236, 130)), (0.35, (255, 196, 92)), (0.55, (255, 130, 70)), (0.75, (255, 62, 138)),
                        (1, (255, 62, 138))], contorno=18, borda=30)
    b1, b2 = t1.getchannel('A').getbbox(), t2.getchannel('A').getbbox()
    f3 = ImageFont.truetype(FONTE2, 27)
    sep = '  •  '
    dt = ImageDraw.Draw(img)
    tw = dt.textlength(sep.join(TEMAS), font=f3)
    alt_faixa = 56
    total = (b1[3] - b1[1]) - 14 + (b2[3] - b2[1]) + 2 + alt_faixa
    topo = (SEG[1] + SEG[3]) / 2 - total / 2 - 16
    img.alpha_composite(t1, (int(centro_x - (b1[0] + b1[2]) / 2), int(topo - b1[1])))
    topo += (b1[3] - b1[1]) - 14
    img.alpha_composite(t2, (int(centro_x - (b2[0] + b2[2]) / 2), int(topo - b2[1])))
    topo += (b2[3] - b2[1]) + 2

    # faixa com os temas
    fx0, fy = int(centro_x - tw / 2 - 36), int(topo)
    faixa = Image.new('RGBA', (int(tw + 72), alt_faixa), (0, 0, 0, 0))
    ImageDraw.Draw(faixa).rounded_rectangle([0, 0, faixa.width - 1, alt_faixa - 1], alt_faixa // 2,
                                            fill=(14, 4, 26, 225), outline=(255, 92, 160, 255), width=4)
    img.alpha_composite(faixa, (fx0, fy))
    x = fx0 + 36
    for i, tema in enumerate(TEMAS):
        dt.text((x, fy + 9), tema, font=f3, fill=(255, 255, 255, 255))
        x += dt.textlength(tema, font=f3)
        if i < len(TEMAS) - 1:
            dt.text((x, fy + 9), sep, font=f3, fill=(255, 150, 80, 255))
            x += dt.textlength(sep, font=f3)
    print('coluna', col0, col1, 'faixa', fx0, fx0 + faixa.width, 'altura usada', round(total))

    img.convert('RGB').save(AQUI / 'banner-youtube-gta.png')
    # prévia com as áreas de corte (TV, PC, celular) para conferir
    prev = img.convert('RGB').copy()
    pd = ImageDraw.Draw(prev)
    pd.rectangle(SEG, outline=(0, 255, 120), width=6)
    pd.rectangle((0, 509, 2560, 932), outline=(0, 200, 255), width=4)
    prev.resize((1280, 720), Image.LANCZOS).save(AQUI / 'banner-previa-areas.jpg', quality=88)
    print('ok')


if __name__ == '__main__':
    main()
