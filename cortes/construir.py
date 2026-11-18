#!/usr/bin/env python3
"""Vídeo "do projeto à realidade" a partir de uma foto da casa pronta (9:16, 12 s, 30 fps).

0–3 s   planta: fundo azul com grade, as linhas da casa se desenham de baixo para cima
3–4 s   a grade some, ficam as linhas
4–6,5 s a obra sobe: a casa aparece em cimento cru (sem cor), do chão ao telhado
6–8 s   o acabamento sobe: entra a cor
8–12 s  as luzes acendem (brilho quente nas luminárias) e a câmera fecha devagar
Uso: construir.py <foto> <saida.mp4> [--texto "DO PROJETO À REALIDADE"]
"""
import argparse
import subprocess
import sys
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

sys.path.insert(0, str(Path(__file__).resolve().parent))
import editar  # caixas com emoji e colar()

L, A, FPS, DUR = 1080, 1920, 30, 12.0


def suave(x):
    x = np.clip(x, 0, 1)
    return x * x * (3 - 2 * x)


def recortar_foto(caminho):
    img = cv2.imread(str(caminho))
    # tira as faixas lisas (barra do app) em cima e embaixo
    var = img.astype(np.float32).std(axis=(1, 2))
    linhas = np.where(var > 18)[0]
    blocos, ini = [], linhas[0]
    for a, b in zip(linhas, linhas[1:]):
        if b != a + 1:
            blocos.append((ini, a))
            ini = b
    blocos.append((ini, linhas[-1]))
    y0, y1 = max(blocos, key=lambda x: x[1] - x[0])
    img = img[y0 + 2:y1 - 2]
    h, w = img.shape[:2]
    nh = int(h * L / w)
    img = cv2.resize(img, (L, nh), interpolation=cv2.INTER_LANCZOS4)
    if nh >= A:
        y = (nh - A) // 2
        return img[y:y + A]
    tela = cv2.resize(cv2.GaussianBlur(img, (0, 0), 30), (L, A), interpolation=cv2.INTER_LINEAR)
    tela = (tela * 0.85).astype(np.uint8)
    y = (A - nh) // 2
    tela[y:y + nh] = img
    # emenda suave entre a foto e a extensão
    for k in range(40):
        f = k / 40
        tela[y + k] = (img[k] * f + tela[y + k] * (1 - f)).astype(np.uint8) if y > 0 else tela[y + k]
        tela[y + nh - 1 - k] = (img[nh - 1 - k] * f + tela[y + nh - 1 - k] * (1 - f)).astype(np.uint8) if y > 0 else tela[y + nh - 1 - k]
    return tela


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('foto')
    ap.add_argument('saida')
    ap.add_argument('--texto', default='DO PROJETO À REALIDADE ✨')
    a = ap.parse_args()

    foto = recortar_foto(a.foto).astype(np.float32)
    cinza = cv2.cvtColor(foto.astype(np.uint8), cv2.COLOR_BGR2GRAY)
    # linhas da planta
    bordas = cv2.Canny(cv2.GaussianBlur(cinza, (5, 5), 0), 40, 110)
    bordas = cv2.dilate(bordas, np.ones((2, 2), np.uint8)).astype(np.float32) / 255
    brilho_borda = cv2.GaussianBlur(bordas, (0, 0), 6)
    # cimento cru: sem cor, contraste baixo, levemente frio
    cru = cv2.cvtColor(cinza, cv2.COLOR_GRAY2BGR).astype(np.float32)
    cru = cru * 0.75 + 45
    cru[..., 0] += 6
    # luminárias: pixels claros e quentes
    hsv = cv2.cvtColor(foto.astype(np.uint8), cv2.COLOR_BGR2HSV).astype(np.float32)
    quente = ((hsv[..., 2] > 200) & (hsv[..., 0] > 8) & (hsv[..., 0] < 32) & (hsv[..., 1] > 70)).astype(np.float32)
    halo = cv2.GaussianBlur(quente, (0, 0), 28)
    halo = halo / (halo.max() + 1e-6)
    noite = foto * 0.82   # antes de acender, a casa fica um pouco mais escura

    # planta: azul com grade
    planta = np.zeros((A, L, 3), np.float32)
    planta[:] = (92, 52, 18)   # azul escuro (BGR)
    grade = np.zeros((A, L), np.float32)
    grade[::54, :] = 1
    grade[:, ::54] = 1
    grade = cv2.GaussianBlur(grade, (3, 3), 0)

    yy = np.linspace(0, 1, A, dtype=np.float32)[:, None] * np.ones((1, L), np.float32)   # 0 em cima, 1 embaixo
    ruido = cv2.GaussianBlur(np.random.default_rng(7).random((A, L)).astype(np.float32), (0, 0), 60)
    ruido = (ruido - ruido.min()) / (ruido.max() - ruido.min())
    ordem = 1 - yy * 0.92 - ruido * 0.08    # menor = aparece primeiro (embaixo)

    texto_img = editar.sprite_caixa(a.texto, 72, 2) if a.texto else None

    saida = Path(a.saida)
    cod = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{L}x{A}',
                            '-r', str(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18',
                            '-pix_fmt', 'yuv420p', '-movflags', '+faststart', str(saida)], stdin=subprocess.PIPE)
    n = int(DUR * FPS)
    for i in range(n):
        t = i / FPS
        # 1) planta com as linhas se desenhando
        p_linhas = suave((t - 0.3) / 2.6)
        mostra_linha = (ordem < p_linhas * 1.05).astype(np.float32)
        frente = np.clip(1 - np.abs(ordem - p_linhas * 1.05) / 0.025, 0, 1) * (p_linhas < 1)
        g = grade * (1 - suave((t - 3.0) / 1.0)) * 0.25
        quadro = planta.copy()
        quadro += g[..., None] * np.array([255, 200, 120], np.float32)
        linha = np.clip(bordas * mostra_linha + brilho_borda * mostra_linha * 0.35 + frente * brilho_borda * 2.5, 0, 1)
        quadro = quadro * (1 - linha[..., None]) + linha[..., None] * np.array([255, 238, 190], np.float32)
        # 2) obra subindo em cimento cru
        p_obra = suave((t - 4.0) / 2.5)
        m_obra = np.clip((p_obra * 1.15 - ordem) / 0.08, 0, 1)
        quadro = quadro * (1 - m_obra[..., None]) + cru * m_obra[..., None]
        # as linhas continuam um pouco por cima da obra, sumindo
        resto = linha * m_obra * (1 - suave((t - 5.5) / 1.5)) * 0.5
        quadro = quadro * (1 - resto[..., None]) + resto[..., None] * 255
        # 3) acabamento com cor
        p_cor = suave((t - 6.0) / 2.0)
        m_cor = np.clip((p_cor * 1.15 - ordem) / 0.10, 0, 1)
        base = noite if t < 8.0 else noite + (foto - noite) * suave((t - 8.0) / 1.2)
        quadro = quadro * (1 - m_cor[..., None]) + base * m_cor[..., None]
        # 4) luzes acendendo (com uma piscada no começo)
        if t >= 8.0:
            k = suave((t - 8.0) / 1.0)
            if 8.15 < t < 8.35:
                k *= 0.3
            quadro = quadro + halo[..., None] * np.array([60, 150, 255], np.float32) * 0.55 * k
        # câmera fechando devagar
        z = 1 + 0.07 * suave(t / DUR)
        m = cv2.getRotationMatrix2D((L / 2, A * 0.55), 0, z)
        quadro = cv2.warpAffine(np.clip(quadro, 0, 255).astype(np.uint8), m, (L, A), flags=cv2.INTER_LINEAR,
                                borderMode=cv2.BORDER_REFLECT)
        # texto: aparece no começo e volta no fim
        if texto_img is not None:
            op = max(suave((t - 0.4) / 0.5) * (1 - suave((t - 3.2) / 0.5)), suave((t - 9.3) / 0.6))
            if op > 0.01:
                editar.colar(quadro, texto_img, L / 2, 150, opacidade=op)
        cod.stdin.write(quadro.tobytes())
    cod.stdin.close()
    cod.wait()
    print('ok', saida)


if __name__ == '__main__':
    main()
