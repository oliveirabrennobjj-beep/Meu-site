#!/usr/bin/env python3
"""Logo BN Digital no clima de GTA (pôr do sol de Vice City, palmeiras, letras em degradê com contorno).

Gera logo-bn-gta.png (círculo, fundo transparente) e logo-bn-gta-quadrado.png, 1080x1080.
O monograma sai da logo original (vetorizado), o resto é desenhado.
"""
import math
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

S = 2160                       # desenha em 2x e reduz no fim
ORIGEM = '/home/user/Meu-site/bn-digital/public/logo-bn-digital.webp'
FONTE = '/home/user/Meu-site/cortes/fontes/Anton-Regular.ttf'
AQUI = Path(__file__).resolve().parent


def degrade_v(h, w, paradas):
    """Degradê vertical: paradas = [(posição 0..1, (r, g, b)), ...]."""
    ys = np.linspace(0, 1, h)
    out = np.zeros((h, w, 3), np.float32)
    for c in range(3):
        canal = np.interp(ys, [p for p, _ in paradas], [cor[c] for _, cor in paradas])
        out[..., c] = canal[:, None]
    return out


def mascaras_monograma():
    im = np.array(Image.open(ORIGEM).convert('RGBA')).astype(int)
    r, g, b, a = im[..., 0], im[..., 1], im[..., 2], im[..., 3]
    branco = (np.minimum(np.minimum(r, g), b) > 170) & (a > 200)
    azul = (b > 185) & (g > 95) & (r < 140) & ~branco & (a > 200)
    corte = np.zeros_like(branco)
    corte[55:156] = True   # só o monograma, sem o texto de baixo
    saida = []
    for m in (branco & corte, azul & corte):
        m8 = (m * 255).astype(np.uint8)
        m8 = cv2.morphologyEx(m8, cv2.MORPH_CLOSE, np.ones((3, 3), np.uint8))
        cs, hier = cv2.findContours(m8, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_NONE)
        E = 10
        alta = np.zeros((256 * E, 256 * E), np.uint8)
        for i, c in enumerate(cs):
            if cv2.contourArea(c) < 12:
                continue
            ap = cv2.approxPolyDP(c.astype(np.float32), 0.8, True)
            buraco = hier is not None and hier[0][i][3] >= 0
            cv2.fillPoly(alta, [(ap * E).astype(np.int32)], 0 if buraco else 255, lineType=cv2.LINE_AA)
        saida.append(alta)
    return saida


def colocar(masc, larg_alvo, cx, cy):
    """Recorta a caixa conjunta e escala para larg_alvo, centrado em (cx, cy) num canvas SxS."""
    uniao = np.maximum(masc[0], masc[1])
    ys, xs = np.where(uniao > 20)
    x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
    esc = larg_alvo / (x1 - x0)
    res = []
    for m in masc:
        rec = m[y0:y1, x0:x1]
        rec = cv2.resize(rec, (int((x1 - x0) * esc), int((y1 - y0) * esc)), interpolation=cv2.INTER_AREA)
        tela = np.zeros((S, S), np.uint8)
        h, w = rec.shape
        ox, oy = int(cx - w / 2), int(cy - h / 2)
        tela[oy:oy + h, ox:ox + w] = rec
        res.append(tela.astype(np.float32) / 255)
    return res


def palmeira(d, base_x, base_y, altura, lado, cor):
    """Silhueta de palmeira: tronco curvo e folhas em arco."""
    pts = []
    for k in range(41):
        t = k / 40
        x = base_x + lado * (math.sin(t * 1.3) * altura * 0.18)
        y = base_y - t * altura
        pts.append((x, y))
    for k in range(len(pts) - 1):
        larg = 34 * (1 - k / 40) + 14
        d.line([pts[k], pts[k + 1]], fill=cor, width=int(larg))
    topo = pts[-1]
    for ang in (-160, -130, -100, -70, -40, -10, 15, 200):
        a = math.radians(ang)
        comp = altura * (0.42 + 0.08 * math.sin(ang))
        folha = []
        for k in range(21):
            t = k / 20
            x = topo[0] + math.cos(a) * comp * t
            y = topo[1] + math.sin(a) * comp * t + (t ** 2) * comp * 0.45
            folha.append((x, y))
        # espessura da folha: lado de cima e de baixo
        cima = [(x, y - 26 * math.sin(math.pi * k / 20)) for k, (x, y) in enumerate(folha)]
        baixo = [(x, y + 18 * math.sin(math.pi * k / 20)) for k, (x, y) in enumerate(folha)]
        d.polygon(cima + baixo[::-1], fill=cor)
    d.ellipse([topo[0] - 30, topo[1] - 24, topo[0] + 30, topo[1] + 30], fill=cor)


def main():
    # ---------------- céu e mar
    horiz = int(S * 0.64)
    ceu = degrade_v(horiz, S, [(0, (22, 8, 58)), (0.35, (96, 26, 140)), (0.62, (226, 64, 138)),
                               (0.85, (255, 128, 72)), (1.0, (255, 196, 92))])
    mar = degrade_v(S - horiz, S, [(0, (74, 20, 92)), (0.4, (38, 10, 66)), (1, (14, 4, 30))])
    cena = np.concatenate([ceu, mar], axis=0)

    # ---------------- sol retrô com faixas
    sol_c, sol_r = (S / 2, horiz - S * 0.02), S * 0.27
    yy, xx = np.mgrid[0:S, 0:S].astype(np.float32)
    dist = np.sqrt((xx - sol_c[0]) ** 2 + (yy - sol_c[1]) ** 2)
    m_sol = np.clip((sol_r - dist) / 3, 0, 1) * (yy < horiz)
    rel = (yy - (sol_c[1] - sol_r)) / (2 * sol_r)       # 0 no topo do sol, 1 embaixo
    faixas = np.ones_like(rel)
    for k in range(6):   # cortes horizontais que engrossam para baixo
        centro = 0.55 + k * 0.08
        esp = 0.008 + k * 0.006
        faixas *= np.clip(np.abs(rel - centro) / esp - 0.5, 0, 1)
    m_sol *= faixas
    cor_sol = degrade_v(S, S, [(0, (255, 232, 120)), (0.45, (255, 170, 80)), (0.62, (255, 92, 130)), (1, (255, 92, 130))])
    cena = cena * (1 - m_sol[..., None]) + cor_sol * m_sol[..., None]
    halo = cv2.GaussianBlur(m_sol, (0, 0), 60)
    cena += halo[..., None] * np.array([255, 120, 120], np.float32) * 0.35

    # reflexo do sol no mar
    for k in range(14):
        y = horiz + 18 + k * (k + 6) * 3.2
        larg = sol_r * (0.9 - k * 0.05)
        if y > S or larg < 40:
            break
        a = 0.55 - k * 0.035
        x0, x1 = int(sol_c[0] - larg), int(sol_c[0] + larg)
        cena[int(y):int(y) + 8 + k, x0:x1] = cena[int(y):int(y) + 8 + k, x0:x1] * (1 - a) + np.array([255, 150, 120]) * a

    img = Image.fromarray(np.clip(cena, 0, 255).astype(np.uint8)).convert('RGBA')

    # ---------------- palmeiras
    camada = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(camada)
    cor_palma = (16, 5, 28, 255)
    palmeira(d, S * 0.12, S * 1.02, S * 0.62, 1, cor_palma)
    palmeira(d, S * 0.22, S * 1.05, S * 0.44, 1, cor_palma)
    palmeira(d, S * 0.89, S * 1.02, S * 0.58, -1, cor_palma)
    img.alpha_composite(camada)

    # ---------------- monograma
    branco, azul = mascaras_monograma()
    m_b, m_a = colocar([branco, azul], S * 0.52, S * 0.5, S * 0.43)
    uniao = np.maximum(m_b, m_a)
    u8 = (uniao * 255).astype(np.uint8)
    contorno = cv2.dilate(u8, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (52, 52))).astype(np.float32) / 255
    contorno = cv2.GaussianBlur(contorno, (0, 0), 1.5)
    borda_branca = cv2.dilate(u8, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (76, 76))).astype(np.float32) / 255
    borda_branca = cv2.GaussianBlur(borda_branca, (0, 0), 1.5)
    sombra = cv2.GaussianBlur(np.roll(np.roll(borda_branca, 26, 0), 14, 1), (0, 0), 18)

    base = np.array(img).astype(np.float32)
    rgb, alfa = base[..., :3], base[..., 3:]
    rgb = rgb * (1 - sombra[..., None] * 0.6) + np.array([20, 4, 30]) * sombra[..., None] * 0.6
    rgb = rgb * (1 - borda_branca[..., None]) + 255 * borda_branca[..., None]
    rgb = rgb * (1 - contorno[..., None]) + np.array([12, 6, 18]) * contorno[..., None]
    quente = degrade_v(S, S, [(0, (255, 236, 130)), (0.30, (255, 214, 102)), (0.45, (255, 140, 66)),
                              (0.56, (255, 62, 138)), (1, (255, 62, 138))])
    neon = degrade_v(S, S, [(0, (110, 245, 255)), (0.4, (62, 200, 255)), (0.6, (60, 110, 255)), (1, (60, 110, 255))])
    rgb = rgb * (1 - m_b[..., None]) + quente * m_b[..., None]
    rgb = rgb * (1 - m_a[..., None]) + neon * m_a[..., None]
    # brilho no topo das letras
    luz = cv2.GaussianBlur(np.clip(uniao - np.roll(uniao, 22, 0), 0, 1), (0, 0), 6) * uniao
    rgb = rgb + luz[..., None] * 90
    img = Image.fromarray(np.dstack([np.clip(rgb, 0, 255), alfa]).astype(np.uint8), 'RGBA')

    # ---------------- texto BN DIGITAL
    fonte = ImageFont.truetype(FONTE, 250)
    txt = Image.new('RGBA', (S, 420), (0, 0, 0, 0))
    dt = ImageDraw.Draw(txt)
    p1, p2 = 'BN ', 'DIGITAL'
    w1, w2 = dt.textlength(p1, font=fonte), dt.textlength(p2, font=fonte)
    x = (S - (w1 + w2)) / 2
    for dx, dy, cor, esp in ((10, 16, (20, 4, 30, 200), 34), (0, 0, (255, 255, 255, 255), 34), (0, 0, (12, 6, 18, 255), 20)):
        dt.text((x + dx, 60 + dy), p1 + p2, font=fonte, fill=cor, stroke_width=esp, stroke_fill=cor)
    dt.text((x, 60), p1, font=fonte, fill=(255, 255, 255, 255))
    dt.text((x + w1, 60), p2, font=fonte, fill=(255, 92, 160, 255))
    txt = txt.transform(txt.size, Image.AFFINE, (1, 0.16, -0.16 * 210, 0, 1, 0), resample=Image.BICUBIC)   # itálico
    img.alpha_composite(txt, (0, int(S * 0.665)))

    # ---------------- grão leve
    arr = np.array(img).astype(np.float32)
    grao = np.random.default_rng(3).normal(0, 5, (S, S, 1))
    arr[..., :3] = np.clip(arr[..., :3] + grao, 0, 255)
    img = Image.fromarray(arr.astype(np.uint8), 'RGBA')

    quadrado = img.resize((1080, 1080), Image.LANCZOS)
    quadrado.save(AQUI / 'logo-bn-gta-quadrado.png')

    # ---------------- versão círculo com aro
    m = Image.new('L', (S, S), 0)
    ImageDraw.Draw(m).ellipse([24, 24, S - 24, S - 24], fill=255)
    redondo = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    redondo.paste(img, (0, 0), m)
    aro = ImageDraw.Draw(redondo)
    aro.ellipse([24, 24, S - 24, S - 24], outline=(12, 6, 18, 255), width=36)
    aro.ellipse([44, 44, S - 44, S - 44], outline=(255, 92, 160, 255), width=10)
    redondo.resize((1080, 1080), Image.LANCZOS).save(AQUI / 'logo-bn-gta.png')
    print('ok')


if __name__ == '__main__':
    main()
