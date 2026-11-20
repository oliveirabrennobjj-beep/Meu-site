#!/usr/bin/env python3
"""Editor de cortes verticais (1080x1920) com reenquadramento, legenda e título.

Para cada corte:
  1. acha as trocas de câmera e os rostos de cada plano (YuNet, via OpenCV);
  2. escolhe o enquadramento do plano: "solo" (um rosto, tela cheia), "dupla"
     (dois rostos, um em cima do outro) ou "geral" (quadro inteiro sobre fundo desfocado);
  3. desenha a legenda palavra por palavra, o título e a barra de progresso;
  4. codifica com o áudio original normalizado.

Uso:
  editar.py --video trecho.mp4 --ini 8 --fim 52 --palavras palavras.json \
            --titulo "O ARGUMENTO DOS ÓCULOS" --saida corte.mp4
  editar.py --lote lote.json          # vários cortes: lista de objetos com esses campos
"""
import argparse
import json
import math
import re
import subprocess
import sys
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

AQUI = Path(__file__).resolve().parent
LARG, ALT, FPS = 1080, 1920, 30
MODELO_ROSTO = AQUI / 'modelos' / 'yunet_n_640_640.onnx'
FONTE_LEGENDA = AQUI / 'fontes' / 'Poppins-Black.ttf'
FONTE_TITULO = AQUI / 'fontes' / 'Anton-Regular.ttf'
FONTE_CREDITO = AQUI / 'fontes' / 'Poppins-Bold.ttf'

FONTE_SERIFA = AQUI / 'fontes' / 'LiberationSerif-Bold.ttf'
FONTE_EMOJI = next((c for c in [AQUI / 'fontes' / 'NotoColorEmoji.ttf',
                                Path('/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf')] if c.exists()), None)

# Estilo "ref" (corte clássico de debate): fundo preto, vídeo inteiro no meio,
# título em caixa branca acima, nome de quem fala abaixo, legenda no rodapé.
REF_TOPO_VIDEO = 600
REF_NOME_Y = 1385
REF_LEGENDA_Y = 1640

# Estilo "game" (corte de live): faixa preta com título, câmera do streamer, jogo embaixo.
GAME_LAYOUT = {
    'game': {'topo_cam': 0, 'alt_cam': 730},          # tela cheia: câmera em cima, jogo embaixo (referência)
    'game-titulo': {'topo_cam': 260, 'alt_cam': 640},  # faixa preta com título em cima
    'game-amarelo': {'topo_cam': 0, 'alt_cam': 730},   # câmera em cima, título amarelo fixo na emenda, jogo embaixo
}
AMARELO_LEGENDA_Y = 1400   # estilo game-amarelo: legenda no meio do jogo
GAME_TOPO_CAM, GAME_ALT_CAM = 0, 730
GAME_TOPO_JOGO = GAME_TOPO_CAM + GAME_ALT_CAM
GAME_GANCHO_S = 3.0        # no estilo tela cheia, o gancho aparece só nos primeiros segundos


def usar_layout(estilo):
    global GAME_TOPO_CAM, GAME_ALT_CAM, GAME_TOPO_JOGO
    lay = GAME_LAYOUT.get(estilo, GAME_LAYOUT['game'])
    GAME_TOPO_CAM, GAME_ALT_CAM = lay['topo_cam'], lay['alt_cam']
    GAME_TOPO_JOGO = GAME_TOPO_CAM + GAME_ALT_CAM

AMARELO = (255, 225, 60)
BRANCO = (255, 255, 255)
PRETO = (12, 12, 14)

Y_LEGENDA = {'solo': 1270, 'dupla': 960, 'geral': 1240}   # centro vertical da legenda por modo
Y_TITULO = 170            # topo da caixa do título
Y_GERAL = 800             # centro do quadro inteiro no modo "geral" (abaixo do título)
LARGURA_TEXTO = 940       # largura máxima da legenda e do título


# ---------------------------------------------------------------- leitura do vídeo

def sondar(video):
    r = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries',
                        'stream=width,height', '-of', 'csv=p=0', str(video)],
                       capture_output=True, text=True, check=True)
    w, h = (int(x) for x in r.stdout.strip().split(',')[:2])
    return w, h


def quadros(video, ini, dur, fps, larg, alt):
    """Gera quadros BGR do trecho, já na taxa e no tamanho pedidos."""
    cmd = ['ffmpeg', '-v', 'error', '-ss', f'{ini:.3f}', '-t', f'{dur:.3f}', '-i', str(video),
           '-vf', f'fps={fps},scale={larg}:{alt}', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-']
    proc = subprocess.Popen(cmd, stdout=subprocess.PIPE)
    tam = larg * alt * 3
    try:
        while True:
            dados = proc.stdout.read(tam)
            if len(dados) < tam:
                break
            yield np.frombuffer(dados, np.uint8).reshape(alt, larg, 3)
    finally:
        proc.stdout.close()
        proc.wait()


# ---------------------------------------------------------------- planos e rostos

FPS_ANALISE = 6
AN_L, AN_A = 640, 360


def assinatura(quadro):
    """Histograma de cor por região; muda bastante quando a câmera troca."""
    hsv = cv2.cvtColor(cv2.resize(quadro, (160, 90)), cv2.COLOR_BGR2HSV)
    partes = []
    for linha in np.array_split(hsv, 3, axis=0):
        for bloco in np.array_split(linha, 3, axis=1):
            h = cv2.calcHist([bloco], [0, 2], None, [8, 8], [0, 180, 0, 256]).flatten()
            partes.append(h / (h.sum() + 1e-6))
    return np.concatenate(partes)


def analisar(video, ini, dur):
    """Devolve os planos do trecho: [{'t0', 't1', 'rostos': [(cx, cy, w, h, presença)]}]."""
    detector = cv2.FaceDetectorYN.create(str(MODELO_ROSTO), '', (AN_L, AN_A), 0.6, 0.3, 50)
    amostras = []
    anterior = None
    for i, q in enumerate(quadros(video, ini, dur, FPS_ANALISE, AN_L, AN_A)):
        a = assinatura(q)
        troca = anterior is not None and float(np.abs(a - anterior).sum()) / 9 > 0.55
        anterior = a
        _, achados = detector.detect(q)
        rostos = []
        for f in (achados if achados is not None else []):
            x, y, w, h = f[:4]
            if h >= AN_A * 0.07:
                rostos.append(((x + w / 2) / AN_L, (y + h / 2) / AN_A, w / AN_L, h / AN_A))
        amostras.append({'t': i / FPS_ANALISE, 'troca': troca, 'rostos': rostos})

    planos, atual = [], []
    for am in amostras:
        if am['troca'] and len(atual) >= 3:   # planos com menos de meio segundo grudam no anterior
            planos.append(atual)
            atual = []
        atual.append(am)
    if atual:
        planos.append(atual)

    saida = []
    for grupo in planos:
        grupos_rosto = []   # agrupa o mesmo rosto ao longo do plano pela posição
        for am in grupo:
            for r in am['rostos']:
                for g in grupos_rosto:
                    m = np.median(np.array(g), axis=0)
                    if abs(m[0] - r[0]) < 0.09 and abs(m[1] - r[1]) < 0.14:
                        g.append(r)
                        break
                else:
                    grupos_rosto.append([r])
        rostos = []
        for g in grupos_rosto:
            presenca = len(g) / len(grupo)
            if presenca >= 0.4:
                m = np.median(np.array(g), axis=0)
                rostos.append((float(m[0]), float(m[1]), float(m[2]), float(m[3]), presenca))
        rostos.sort(key=lambda r: -r[3])
        saida.append({'t0': grupo[0]['t'], 't1': grupo[-1]['t'] + 1 / FPS_ANALISE, 'rostos': rostos})
    if saida:
        saida[0]['t0'] = 0.0
        saida[-1]['t1'] = dur + 1
    return saida


def enquadrar(plano, w, h):
    """Escolhe o modo do plano e os recortes, em pixels do vídeo original."""
    rostos = plano['rostos']
    grandes = [r for r in rostos if r[3] >= 0.11]
    if len(grandes) >= 2 and grandes[0][3] / grandes[1][3] < 1.6 and abs(grandes[0][0] - grandes[1][0]) >= 0.28:
        a, b = sorted(grandes[:2], key=lambda r: r[0])
        lc = min(w * 0.5, h * 1.125)
        ac = lc / 1.125

        def recorte(r):
            x = min(max(r[0] * w - lc / 2, 0), w - lc)
            y = min(max(r[1] * h - ac * 0.40, 0), h - ac)
            return int(x), int(y), int(lc), int(ac)
        return {'modo': 'dupla', 'recortes': [recorte(a), recorte(b)]}
    if grandes and (len(rostos) == 1 or grandes[0][3] / rostos[1][3] >= 1.5):
        r = grandes[0]
        lc = h * LARG / ALT
        x = min(max(r[0] * w - lc / 2, 0), w - lc)
        return {'modo': 'solo', 'recortes': [(int(x), 0, int(lc), h)]}
    return {'modo': 'geral', 'recortes': []}


def detectar_camera(video, ini, dur, rosto):
    """Acha a moldura da câmera do streamer em volta do rosto.

    Bordas de sobreposição ficam paradas enquanto o jogo se mexe, então usa o mínimo
    do gradiente em vários quadros. Devolve (x0, y0, x1, y1) normalizado, ou None.
    """
    amostras = []
    for k in range(6):
        t = ini + dur * (k + 0.5) / 6
        r = subprocess.run(['ffmpeg', '-v', 'error', '-ss', f'{t:.2f}', '-i', str(video), '-frames:v', '1',
                            '-vf', f'scale={AN_L}:{AN_A}', '-f', 'rawvideo', '-pix_fmt', 'gray', '-'],
                           capture_output=True)
        if len(r.stdout) == AN_L * AN_A:
            amostras.append(np.frombuffer(r.stdout, np.uint8).reshape(AN_A, AN_L).astype(np.float32))
    if len(amostras) < 3:
        return None
    ex = np.min([np.abs(cv2.Sobel(a, cv2.CV_32F, 1, 0, ksize=3)) for a in amostras], axis=0)
    ey = np.min([np.abs(cv2.Sobel(a, cv2.CV_32F, 0, 1, ksize=3)) for a in amostras], axis=0)
    fx, fy, fw, fh = rosto[0] * AN_L, rosto[1] * AN_A, rosto[2] * AN_L, rosto[3] * AN_A
    y_a, y_b = int(max(fy - 1.3 * fh, 0)), int(min(fy + 1.3 * fh, AN_A))

    def melhor(perfil, faixa, borda):
        faixa = [i for i in faixa if 0 <= i < len(perfil)]
        if not faixa:
            return borda
        i = max(faixa, key=lambda k: perfil[k])
        return i if perfil[i] > 18 else borda

    col = ex[y_a:y_b].mean(axis=0)
    x0 = melhor(col, range(int(fx - 0.45 * AN_L), int(fx - 0.9 * fw)), 0)
    x1 = melhor(col, range(int(fx + 0.9 * fw), int(fx + 0.45 * AN_L)), AN_L)
    lin = ey[:, x0:x1].mean(axis=1) if x1 - x0 > 10 else ey.mean(axis=1)
    y0 = melhor(lin, range(int(fy - 0.45 * AN_A), int(fy - 0.9 * fh)), 0)
    y1 = melhor(lin, range(int(fy + 0.9 * fh), int(fy + 0.5 * AN_A)), AN_A)
    if (x1 - x0) < 2.2 * fw or (y1 - y0) < 2.0 * fh:
        return None
    if (x1 - x0) > 0.5 * AN_L or (y1 - y0) > 0.6 * AN_A:   # pegou a borda da tela, não a moldura da câmera
        return None
    m = 2   # tira a linha da borda
    return ((x0 + m) / AN_L, (y0 + m) / AN_A, (x1 - m) / AN_L, (y1 - m) / AN_A)


def faixas_pretas(video, ini, dur):
    """Linhas (normalizadas) onde começa e termina a imagem do jogo, sem as faixas pretas da live."""
    perfis = []
    for k in range(5):
        t = ini + dur * (k + 0.5) / 5
        r = subprocess.run(['ffmpeg', '-v', 'error', '-ss', f'{t:.2f}', '-i', str(video), '-frames:v', '1',
                            '-vf', f'scale={AN_L}:{AN_A}', '-f', 'rawvideo', '-pix_fmt', 'gray', '-'],
                           capture_output=True)
        if len(r.stdout) == AN_L * AN_A:
            q = np.frombuffer(r.stdout, np.uint8).reshape(AN_A, AN_L)
            perfis.append(np.median(q[:, int(AN_L * 0.3):int(AN_L * 0.7)], axis=1))   # centro: sem chat nem câmera
    if not perfis:
        return 0.0, 1.0
    claro = np.max(perfis, axis=0) > 14
    linhas = np.flatnonzero(claro)
    if len(linhas) == 0:
        return 0.0, 1.0
    y0, y1 = linhas[0] / AN_A, (linhas[-1] + 1) / AN_A
    if y1 - y0 < 0.6:   # tela quase toda escura: não confia
        return 0.0, 1.0
    return y0, y1


def enquadrar_game(plano, w, h):
    """Live: câmera no canto + jogo, só câmera (just chatting) ou só jogo."""
    rostos = [r for r in plano['rostos'] if r[4] >= 0.5]
    m = plano.get('camera_fixa')
    if m:   # moldura conhecida: rosto fora dela é personagem do jogo, não o streamer
        rostos = [r for r in rostos if m[0] - 0.03 <= r[0] <= m[2] + 0.03 and m[1] - 0.03 <= r[1] <= m[3] + 0.03]
        plano['camera'] = m
        if not rostos:   # streamer saiu do quadro: mantém a moldura da câmera
            rostos = [((m[0] + m[2]) / 2, (m[1] + m[3]) / 2, 0.0, 0.1, 1.0)]
    if rostos:
        r = max(rostos, key=lambda x: x[3])
        if r[3] >= 0.16 and not m:   # rosto grande: só câmera, recorte vertical no rosto
            lc = h * LARG / ALT
            x = min(max(r[0] * w - lc / 2, 0), w - lc)
            return {'modo': 'solo', 'recortes': [(int(x), 0, int(lc), h)]}
        # câmera no canto: usa a moldura detectada e recorta dentro dela na proporção do painel
        mold = plano.get('camera')
        if mold:
            bx0, by0, bx1, by1 = mold[0] * w, mold[1] * h, mold[2] * w, mold[3] * h
        else:
            ac0 = r[3] * h * 2.2
            bx0, bx1 = r[0] * w - ac0 * 0.9, r[0] * w + ac0 * 0.9
            by0, by1 = r[1] * h - ac0 * 0.45, r[1] * h + ac0 * 0.55
        bw, bh = bx1 - bx0, by1 - by0
        prop = LARG / GAME_ALT_CAM
        if bw / bh > prop:   # moldura mais larga que o painel: corta dos lados, centrado no rosto
            lc, ac = bh * prop, bh
            x = min(max(r[0] * w - lc / 2, bx0), bx1 - lc)
            y = by0
        else:                # mais alta: corta em cima e embaixo
            lc, ac = bw, bw / prop
            x = bx0
            y = min(max(r[1] * h - ac * 0.45, by0), by1 - ac)
        cam = (int(x), int(y), int(lc), int(ac))
        # jogo: recorte central na proporção do painel de baixo, sem as faixas pretas
        b0, b1 = plano.get('barras', (0.0, 1.0))
        yj, hj = int(b0 * h), int((b1 - b0) * h)
        aj = (ALT - GAME_TOPO_JOGO) / LARG
        lj = min(w, hj / aj)
        jogo = (int((w - lj) / 2), yj, int(lj), hj)
        return {'modo': 'game', 'recortes': [cam, jogo]}
    return {'modo': 'geral', 'recortes': []}


def compor_game(quadro, enq):
    if enq['modo'] != 'game':
        return compor(quadro, enq)
    tela = np.zeros((ALT, LARG, 3), np.uint8)
    (x, y, lc, ac), (xj, yj, lj, aj) = enq['recortes']
    tela[GAME_TOPO_CAM:GAME_TOPO_JOGO] = nitidez(cv2.resize(quadro[y:y + ac, x:x + lc], (LARG, GAME_ALT_CAM),
                                                            interpolation=cv2.INTER_CUBIC))
    tela[GAME_TOPO_JOGO:] = cv2.resize(quadro[yj:yj + aj, xj:xj + lj], (LARG, ALT - GAME_TOPO_JOGO),
                                      interpolation=cv2.INTER_AREA)
    return tela


# ---------------------------------------------------------------- composição do quadro

def nitidez(img):
    borrado = cv2.GaussianBlur(img, (0, 0), 1.2)
    return cv2.addWeighted(img, 1.35, borrado, -0.35, 0)


def compor(quadro, enq):
    h, w = quadro.shape[:2]
    if enq['modo'] == 'solo':
        x, y, lc, ac = enq['recortes'][0]
        return nitidez(cv2.resize(quadro[y:y + ac, x:x + lc], (LARG, ALT), interpolation=cv2.INTER_CUBIC))
    if enq['modo'] == 'dupla':
        tela = np.empty((ALT, LARG, 3), np.uint8)
        for i, (x, y, lc, ac) in enumerate(enq['recortes']):
            parte = cv2.resize(quadro[y:y + ac, x:x + lc], (LARG, ALT // 2), interpolation=cv2.INTER_CUBIC)
            tela[i * ALT // 2:(i + 1) * ALT // 2] = nitidez(parte)
        tela[ALT // 2 - 3:ALT // 2 + 3] = PRETO[::-1]
        return tela
    # geral: fundo = o próprio quadro ampliado, desfocado e escurecido
    pequeno = cv2.resize(quadro, (96, 54))
    lado = int(54 * LARG / ALT)
    fundo = pequeno[:, (96 - lado) // 2:(96 - lado) // 2 + lado]
    fundo = cv2.GaussianBlur(cv2.resize(fundo, (LARG // 4, ALT // 4)), (0, 0), 14)
    tela = (cv2.resize(fundo, (LARG, ALT), interpolation=cv2.INTER_LINEAR) * 0.42).astype(np.uint8)
    alt_v = int(LARG * h / w)
    if alt_v >= ALT * 0.8:   # o vídeo já é vertical: ocupa a tela toda
        larg_v = int(ALT * w / h)
        cheio = cv2.resize(quadro, (max(larg_v, LARG), ALT), interpolation=cv2.INTER_AREA)
        x0 = (cheio.shape[1] - LARG) // 2
        return np.ascontiguousarray(cheio[:, x0:x0 + LARG])
    y0 = max(Y_GERAL - alt_v // 2, 0)
    tela[y0:y0 + alt_v] = cv2.resize(quadro, (LARG, alt_v), interpolation=cv2.INTER_AREA)
    return tela


def colar(tela, sprite, cx, cy, escala=1.0, opacidade=1.0):
    """Cola um sprite RGBA (numpy, canais BGRA) centrado em (cx, cy)."""
    if escala != 1.0:
        sprite = cv2.resize(sprite, None, fx=escala, fy=escala, interpolation=cv2.INTER_LINEAR)
    sh, sw = sprite.shape[:2]
    x0, y0 = int(cx - sw / 2), int(cy - sh / 2)
    xa, ya = max(x0, 0), max(y0, 0)
    xb, yb = min(x0 + sw, tela.shape[1]), min(y0 + sh, tela.shape[0])
    if xa >= xb or ya >= yb:
        return
    rec = sprite[ya - y0:yb - y0, xa - x0:xb - x0]
    alfa = rec[:, :, 3:4].astype(np.float32) * (opacidade / 255.0)
    area = tela[ya:yb, xa:xb]
    area[:] = (rec[:, :, :3] * alfa + area * (1 - alfa)).astype(np.uint8)


def para_bgra(img):
    return cv2.cvtColor(np.array(img), cv2.COLOR_RGBA2BGRA)


# ---------------------------------------------------------------- legenda

def limpar(texto):
    t = re.sub(r'[^\w\s?!%$ºª\'-]', '', texto, flags=re.UNICODE).strip()
    return t.upper()


def paginas(palavras):
    """Agrupa as palavras em telas de até 3 palavras, quebrando em pausas e pontuação."""
    pags, atual = [], []
    for p in palavras:
        txt = limpar(p['texto'])
        if not txt:
            continue
        item = {'texto': txt, 't0': p['t0'], 't1': max(p['t1'], p['t0'] + 0.08)}
        pausa = atual and item['t0'] - atual[-1]['t1'] > 0.45
        cheio = atual and (len(atual) >= 3 or sum(len(x['texto']) for x in atual) + len(txt) > 17)
        if pausa or cheio:
            pags.append(atual)
            atual = []
        atual.append(item)
        if re.search(r'[.?!]$', p['texto'].strip()):
            pags.append(atual)
            atual = []
    if atual:
        pags.append(atual)
    saida = []
    for i, pg in enumerate(pags):
        fim = pg[-1]['t1'] + 0.30
        if i + 1 < len(pags):
            fim = min(fim, pags[i + 1][0]['t0'])
        saida.append({'palavras': pg, 't0': pg[0]['t0'], 't1': max(fim, pg[-1]['t1'])})
    return saida


class Legenda:
    def __init__(self, palavras, fonte=FONTE_LEGENDA, tam=96):
        self.pags = paginas(palavras)
        self.cache = {}
        self.fonte, self.tam = fonte, tam

    def _desenhar(self, i, ativa):
        chave = (i, ativa)
        if chave in self.cache:
            return self.cache[chave]
        textos = [p['texto'] for p in self.pags[i]['palavras']]
        tam = self.tam
        while True:
            fonte = ImageFont.truetype(str(self.fonte), tam)
            espaco = fonte.getlength(' ')
            largs = [fonte.getlength(t) for t in textos]
            total = sum(largs) + espaco * (len(textos) - 1)
            if total <= LARGURA_TEXTO or tam <= 54:
                break
            tam -= 6
        borda = max(8, tam // 9)
        alt = int(tam * 1.35) + borda * 2
        img = Image.new('RGBA', (int(total) + borda * 4 + 12, alt + 16), (0, 0, 0, 0))
        d = ImageDraw.Draw(img)
        x = borda * 2
        for k, t in enumerate(textos):
            d.text((x + 5, borda + 9), t, font=fonte, fill=(0, 0, 0, 150), stroke_width=borda,
                   stroke_fill=(0, 0, 0, 150))
            x += largs[k] + espaco
        x = borda * 2
        for k, t in enumerate(textos):
            cor = AMARELO if k == ativa else BRANCO
            d.text((x, borda), t, font=fonte, fill=cor + (255,), stroke_width=borda, stroke_fill=PRETO + (255,))
            x += largs[k] + espaco
        self.cache[chave] = para_bgra(img)
        return self.cache[chave]

    def aplicar(self, tela, t, y=1270):
        for i, pg in enumerate(self.pags):
            if pg['t0'] <= t < pg['t1']:
                ativa = -1
                for k, p in enumerate(pg['palavras']):
                    if t >= p['t0']:
                        ativa = k
                entrada = min((t - pg['t0']) / 0.10, 1.0)
                escala = 0.86 + 0.14 * (1 - (1 - entrada) ** 3)
                colar(tela, self._desenhar(i, ativa), LARG / 2, y, escala)
                return


# ---------------------------------------------------------------- título e crédito

def quebrar(texto, fonte, largura):
    linhas, atual = [], ''
    for palavra in texto.split():
        teste = (atual + ' ' + palavra).strip()
        if fonte.getlength(teste) <= largura or not atual:
            atual = teste
        else:
            linhas.append(atual)
            atual = palavra
    if atual:
        linhas.append(atual)
    return linhas


def sprite_titulo(texto, credito):
    tam = 84
    while True:
        fonte = ImageFont.truetype(str(FONTE_TITULO), tam)
        linhas = quebrar(texto, fonte, LARGURA_TEXTO - 70)
        if len(linhas) <= 2 or tam <= 60:
            break
        tam -= 6
    alt_linha = int(tam * 1.22)
    larg = int(max(fonte.getlength(l) for l in linhas)) + 70
    alt = alt_linha * len(linhas) + 34
    extra = 62 if credito else 0
    img = Image.new('RGBA', (max(larg, 420) + 24, alt + extra + 24), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    x0 = (img.width - larg) // 2
    d.rounded_rectangle((x0 + 6, 16, x0 + larg + 6, alt + 16), 22, fill=(0, 0, 0, 110))
    d.rounded_rectangle((x0, 8, x0 + larg, alt + 8), 22, fill=AMARELO + (255,))
    for k, linha in enumerate(linhas):
        lw = fonte.getlength(linha)
        d.text(((img.width - lw) / 2, 8 + 12 + k * alt_linha), linha, font=fonte, fill=PRETO + (255,))
    if credito:
        f2 = ImageFont.truetype(str(FONTE_CREDITO), 32)
        cw = f2.getlength(credito)
        d.text(((img.width - cw) / 2, alt + 26), credito, font=f2, fill=BRANCO + (235,),
               stroke_width=4, stroke_fill=PRETO + (220,))
    return para_bgra(img)


def sprite_titulo_amarelo(texto):
    """Caixa amarela com texto preto condensado (estilo game-amarelo)."""
    texto, tam = texto.upper(), 70
    while ImageFont.truetype(str(FONTE_TITULO), tam).getlength(texto) > 960 and tam > 52:
        tam -= 2
    fonte = ImageFont.truetype(str(FONTE_TITULO), tam)
    linhas = [texto]
    if fonte.getlength(texto) > 960:   # não coube: duas linhas equilibradas
        pal = texto.split()
        k = min(range(1, len(pal)), key=lambda i: abs(fonte.getlength(' '.join(pal[:i])) - fonte.getlength(' '.join(pal[i:]))))
        linhas = [' '.join(pal[:k]), ' '.join(pal[k:])]
    alt_linha = int(tam * 1.18)
    larg = int(max(fonte.getlength(l) for l in linhas)) + 56
    alt = alt_linha * len(linhas) + 26
    img = Image.new('RGBA', (larg + 16, alt + 16), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle((6, 10, larg + 6, alt + 10), 16, fill=(0, 0, 0, 120))
    d.rounded_rectangle((2, 4, larg + 2, alt + 4), 16, fill=AMARELO + (255,))
    for k, linha in enumerate(linhas):
        lw = fonte.getlength(linha)
        d.text((2 + (larg - lw) / 2, 4 + 10 + k * alt_linha), linha, font=fonte, fill=PRETO + (255,))
    return para_bgra(img)


# ---------------------------------------------------------------- caixas brancas com emoji (estilo "ref")

def _eh_emoji(ch):
    o = ord(ch)
    return o >= 0x1F000 or 0x2600 <= o <= 0x27BF or 0x2B00 <= o <= 0x2BFF or o in (0x200D, 0xFE0F, 0x203C, 0x2049)


def _corridas(texto):
    """Divide o texto em pedaços de texto comum e de emoji."""
    partes, atual, tipo = [], '', None
    for ch in texto:
        t = _eh_emoji(ch)
        if tipo is not None and t != tipo:
            partes.append((tipo, atual))
            atual = ''
        atual += ch
        tipo = t
    if atual:
        partes.append((tipo, atual))
    return partes


_cache_emoji = {}


def _emoji(seq, tam):
    chave = (seq, tam)
    if chave not in _cache_emoji:
        img = None
        if FONTE_EMOJI:
            f = ImageFont.truetype(str(FONTE_EMOJI), 109)
            tela = Image.new('RGBA', (160 * max(len(seq), 1), 160), (0, 0, 0, 0))
            ImageDraw.Draw(tela).text((0, 10), seq, font=f, embedded_color=True)
            caixa = tela.getbbox()
            if caixa:
                img = tela.crop(caixa)
                img = img.resize((max(1, int(img.width * tam / img.height)), tam), Image.LANCZOS)
        _cache_emoji[chave] = img
    return _cache_emoji[chave]


def _largura(texto, fonte, tam_emoji):
    total = 0
    for eh, parte in _corridas(texto):
        if eh:
            e = _emoji(parte.replace('\ufe0f', ''), tam_emoji)
            total += (e.width if e else 0) + int(tam_emoji * 0.12)
        else:
            total += fonte.getlength(parte)
    return total


def _escrever(img, x, y, texto, fonte, cor, tam_emoji):
    d = ImageDraw.Draw(img)
    for eh, parte in _corridas(texto):
        if eh:
            e = _emoji(parte.replace('\ufe0f', ''), tam_emoji)
            if e:
                asc = fonte.getmetrics()[0]
                img.alpha_composite(e, (int(x + tam_emoji * 0.06), int(y + asc - tam_emoji * 0.92)))
                x += e.width + int(tam_emoji * 0.12)
        else:
            d.text((x, y), parte, font=fonte, fill=cor)
            x += fonte.getlength(parte)


def sprite_caixa(texto, tam=66, max_linhas=3, largura=980, raio=22, pad=(26, 14)):
    """Caixa branca arredondada com texto preto em serifa (e emoji colorido)."""
    while True:
        fonte = ImageFont.truetype(str(FONTE_SERIFA), tam)
        te = int(tam * 0.82)
        linhas, atual = [], ''
        for palavra in texto.split():
            teste = (atual + ' ' + palavra).strip()
            if _largura(teste, fonte, te) <= largura - 2 * pad[0] or not atual:
                atual = teste
            else:
                linhas.append(atual)
                atual = palavra
        if atual:
            linhas.append(atual)
        if len(linhas) <= max_linhas or tam <= 34:
            break
        tam -= 4
    alt_linha = int(tam * 1.06)
    larg_txt = max(_largura(l, fonte, te) for l in linhas)
    w, h = int(larg_txt + 2 * pad[0]), int(alt_linha * len(linhas) + 2 * pad[1] + tam * 0.12)
    img = Image.new('RGBA', (w + 8, h + 8), (0, 0, 0, 0))
    ImageDraw.Draw(img).rounded_rectangle((0, 0, w, h), raio, fill=(255, 255, 255, 255))
    for k, l in enumerate(linhas):
        lw = _largura(l, fonte, te)
        _escrever(img, (w - lw) / 2, pad[1] + k * alt_linha, l, fonte, (0, 0, 0, 255), te)
    return para_bgra(img)


def sprite_arroba(texto):
    fonte = ImageFont.truetype(str(FONTE_SERIFA), 28)
    w = int(fonte.getlength(texto)) + 12
    img = Image.new('RGBA', (w, 40), (0, 0, 0, 0))
    ImageDraw.Draw(img).text((4, 2), texto, font=fonte, fill=(255, 255, 255, 235))
    return para_bgra(img)


def compor_ref(quadro):
    h, w = quadro.shape[:2]
    if h > w:   # fonte vertical: não cabe no layout de faixa
        return compor(quadro, {'modo': 'geral', 'recortes': []})
    tela = np.zeros((ALT, LARG, 3), np.uint8)
    alt_v = int(LARG * h / w)
    tela[REF_TOPO_VIDEO:REF_TOPO_VIDEO + alt_v] = cv2.resize(quadro, (LARG, alt_v), interpolation=cv2.INTER_AREA)
    return tela


# ---------------------------------------------------------------- render

def editar(video, ini, fim, palavras, titulo, saida, credito='', planos=None, zoom=1.0,
           estilo='padrao', nome='', arroba='', legenda=True, teaser_s=0.0, camera=None):
    """Renderiza um corte. `palavras` usa tempos relativos ao início do corte."""
    dur = fim - ini
    w, h = sondar(video)
    ref = estilo == 'ref'
    game = estilo.startswith('game')
    faixa = estilo == 'game-titulo'
    amarelo = estilo == 'game-amarelo'
    if game:
        usar_layout(estilo)
    if ref:
        planos = [{'t0': 0.0, 't1': dur + 1, 'modo': 'ref', 'rostos': []}]
    else:
        planos = planos or analisar(video, ini, dur)
        barras = faixas_pretas(video, ini, dur) if game else None
        for p in planos:
            if barras:
                p['barras'] = barras
            if game and not camera:
                cand = [r for r in p['rostos'] if r[4] >= 0.5 and r[3] < 0.16]
                if cand:
                    p['camera'] = detectar_camera(video, ini + p['t0'], min(p['t1'], dur) - p['t0'],
                                                  max(cand, key=lambda x: x[3]))
            if not game:
                p.update(enquadrar(p, w, h))
        if game:
            achadas = [p['camera'] for p in planos if p.get('camera')]
            fixa = camera or (achadas[0] if achadas else None)   # moldura informada vale para o corte todo
            for p in planos:
                if fixa and (camera or not p.get('camera')):
                    p['camera_fixa'] = fixa
                p.update(enquadrar_game(p, w, h))
    leg_pal = [p for p in palavras if p['t1'] > 0 and p['t0'] < dur]
    if not legenda:
        leg = None
    elif amarelo:
        leg = Legenda(leg_pal, FONTE_TITULO, 112)
    else:
        leg = Legenda(leg_pal)
    if amarelo:
        titulo_img = sprite_titulo_amarelo(titulo) if titulo else None
        nome_img = None
        arroba_img = sprite_arroba(arroba) if arroba else None
    elif game:
        titulo_img = sprite_caixa(titulo, 58, 2, raio=20, pad=(24, 10)) if titulo else None
        nome_img = sprite_caixa(nome, 40, 1, raio=14, pad=(18, 6)) if nome else None
        arroba_img = sprite_arroba(arroba) if arroba else None
    elif ref:
        titulo_img = sprite_caixa(titulo, 66, 3) if titulo else None
        nome_img = sprite_caixa(nome, 54, 1, raio=18, pad=(24, 9)) if nome else None
        arroba_img = sprite_arroba(arroba) if arroba else None
    else:
        titulo_img = sprite_titulo(titulo, credito) if titulo else None

    saida = Path(saida)
    saida.parent.mkdir(parents=True, exist_ok=True)
    cod = subprocess.Popen(
        ['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{LARG}x{ALT}',
         '-r', str(FPS), '-i', '-', '-ss', f'{ini:.3f}', '-t', f'{dur:.3f}', '-i', str(video),
         '-map', '0:v', '-map', '1:a?', '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11',
         '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p',
         '-c:a', 'aac', '-b:a', '160k', '-ar', '48000', '-shortest', '-movflags', '+faststart', str(saida)],
        stdin=subprocess.PIPE)
    n = 0
    for n, quadro in enumerate(quadros(video, ini, dur, FPS, w, h)):
        t = n / FPS
        plano = next((p for p in planos if p['t0'] <= t < p['t1']), planos[-1])
        tela = compor_ref(quadro) if ref else compor_game(quadro, plano) if game else compor(quadro, plano)
        if zoom != 1.0:   # aproximação lenta e contínua
            z = 1 + (zoom - 1) * min(t / max(dur, 0.1), 1.0)
            m = cv2.getRotationMatrix2D((LARG / 2, ALT * 0.42), 0, z)
            tela = cv2.warpAffine(tela, m, (LARG, ALT), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
        if game:
            if plano['modo'] == 'game' and amarelo:
                if titulo_img is not None:   # título fixo na emenda câmera/jogo
                    colar(tela, titulo_img, LARG / 2, GAME_TOPO_JOGO)
                y_leg = AMARELO_LEGENDA_Y
            elif plano['modo'] == 'game':
                if titulo_img is not None and faixa:
                    colar(tela, titulo_img, LARG / 2, GAME_TOPO_CAM / 2)
                mostrando_gancho = (not faixa and titulo_img is not None and t < GAME_GANCHO_S + teaser_s)
                if mostrando_gancho:   # gancho rápido na emenda
                    op = min(1.0, (GAME_GANCHO_S + teaser_s - t) / 0.3)
                    colar(tela, titulo_img, LARG / 2, GAME_TOPO_JOGO, opacidade=op)
                if nome_img is not None and not mostrando_gancho:
                    colar(tela, nome_img, 30 + nome_img.shape[1] / 2, GAME_TOPO_JOGO - 18 - nome_img.shape[0] / 2)
                y_leg = GAME_TOPO_JOGO + 190
            else:
                if titulo_img is not None:
                    colar(tela, titulo_img, LARG / 2, Y_TITULO + titulo_img.shape[0] / 2)
                    if nome_img is not None:   # nome de quem fala logo abaixo do título
                        colar(tela, nome_img, LARG / 2, Y_TITULO + titulo_img.shape[0] + 14 + nome_img.shape[0] / 2)
                y_leg = Y_LEGENDA.get(plano['modo'], 1270)
            if arroba_img is not None:
                colar(tela, arroba_img, LARG - 30 - arroba_img.shape[1] / 2, ALT - 60)
            if leg:
                leg.aplicar(tela, t, y_leg)
            if amarelo:   # barra de progresso amarela no rodapé
                tela[ALT - 12:, :int(LARG * min(t / dur, 1.0))] = AMARELO[::-1]
        elif ref:
            if titulo_img is not None:   # título fixo, logo acima do vídeo
                colar(tela, titulo_img, LARG / 2, REF_TOPO_VIDEO - 22 - titulo_img.shape[0] / 2)
            if nome_img is not None:
                colar(tela, nome_img, LARG / 2, REF_NOME_Y)
                if arroba_img is not None:
                    xr = LARG / 2 + nome_img.shape[1] / 2 - arroba_img.shape[1] / 2
                    colar(tela, arroba_img, xr, REF_NOME_Y + nome_img.shape[0] / 2 + 22)
            if leg:
                leg.aplicar(tela, t, REF_LEGENDA_Y)
        else:
            if titulo_img is not None:
                entrada = min(t / 0.35, 1.0)
                suave = 1 - (1 - entrada) ** 3
                colar(tela, titulo_img, LARG / 2, Y_TITULO + titulo_img.shape[0] / 2 - 40 * (1 - suave),
                      opacidade=suave)
            if leg:
                leg.aplicar(tela, t, Y_LEGENDA[plano['modo']])
            barra = int(LARG * min(t / dur, 1.0))
            tela[0:10, :barra] = AMARELO[::-1]
        cod.stdin.write(tela.tobytes())
    cod.stdin.close()
    if cod.wait() != 0:
        raise RuntimeError(f'ffmpeg falhou em {saida}')
    return {'saida': str(saida), 'quadros': n + 1,
            'planos': [{'t0': round(p['t0'], 2), 't1': round(p['t1'], 2), 'modo': p['modo'],
                        'camera': [round(v, 3) for v in p['camera']] if p.get('camera') else None,
                        'rostos': len(p['rostos'])} for p in planos]}


# ---------------------------------------------------------------- teaser (abre com o clímax)

def _norm(t):
    return re.sub(r'[^a-z0-9à-ú]', '', t.lower())


def achar_frase(palavras, frase):
    """Acha a frase nas palavras transcritas; devolve (t0, t1) ou None."""
    alvo = [_norm(w) for w in frase.split() if _norm(w)]
    toks = [_norm(p['texto']) for p in palavras]
    if not alvo or len(toks) < len(alvo):
        return None
    melhor, onde = 0.0, None
    for i in range(len(toks) - len(alvo) + 1):
        janela = toks[i:i + len(alvo)]
        nota = sum(1 for a, b in zip(alvo, janela) if a == b) / len(alvo)
        if nota > melhor:
            melhor, onde = nota, i
    if melhor < 0.6:
        return None
    return palavras[onde]['t0'], palavras[onde + len(alvo) - 1]['t1']


def editar_com_teaser(video, ini, fim, palavras, titulo, saida, credito='', teaser=None, pasta_tmp=None,
                      **estilo):
    """Abre o corte com o trecho `teaser` (tempos relativos ao corte), um flash branco e o corte inteiro."""
    if not teaser:
        return editar(video, ini, fim, palavras, titulo, saida, credito, **estilo)
    a, b = max(teaser[0] - 0.25, 0), min(teaser[1] + 0.45, fim - ini)
    tmp = Path(pasta_tmp or Path(saida).parent)
    p1, p2 = tmp / (Path(saida).stem + '_teaser.mp4'), tmp / (Path(saida).stem + '_corpo.mp4')
    pal_t = [dict(p, t0=p['t0'] - a, t1=p['t1'] - a) for p in palavras]
    r1 = editar(video, ini + a, ini + b, pal_t, titulo, p1, credito, zoom=1.10, **estilo)
    r2 = editar(video, ini, fim, palavras, titulo, p2, credito, teaser_s=-99, **estilo)
    d1 = b - a
    flash = 0.18
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(p1), '-i', str(p2), '-filter_complex',
                    f'[0:v][1:v]xfade=transition=fadewhite:duration={flash}:offset={d1 - flash:.3f}[v];'
                    f'[0:a][1:a]acrossfade=d={flash}[a]',
                    '-map', '[v]', '-map', '[a]', '-c:v', 'libx264', '-preset', 'medium', '-crf', '20',
                    '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', str(saida)],
                   check=True)
    p1.unlink()
    p2.unlink()
    return {'saida': str(saida), 'teaser': [round(a, 2), round(b, 2)], 'planos': r2['planos']}


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--lote', help='JSON com uma lista de cortes')
    ap.add_argument('--video')
    ap.add_argument('--ini', type=float, default=0.0)
    ap.add_argument('--fim', type=float)
    ap.add_argument('--palavras', help='JSON: [{"texto", "t0", "t1"}], tempos relativos ao corte')
    ap.add_argument('--titulo', default='')
    ap.add_argument('--credito', default='')
    ap.add_argument('--saida')
    ap.add_argument('--teaser', help='frase do clímax para abrir o corte')
    ap.add_argument('--estilo', default='ref', choices=['ref', 'game', 'game-titulo', 'game-amarelo', 'padrao'])
    ap.add_argument('--nome', default='', help='nome de quem fala (estilo ref)')
    ap.add_argument('--arroba', default='', help='@ do canal (estilo ref)')
    ap.add_argument('--sem-legenda', action='store_true')
    a = ap.parse_args()
    if a.lote:
        cortes = json.loads(Path(a.lote).read_text())
    else:
        if not (a.video and a.fim and a.saida):
            ap.error('informe --lote ou --video, --fim e --saida')
        cortes = [{'video': a.video, 'ini': a.ini, 'fim': a.fim, 'palavras': a.palavras,
                   'titulo': a.titulo, 'credito': a.credito, 'saida': a.saida, 'teaser': a.teaser,
                   'estilo': a.estilo, 'nome': a.nome, 'arroba': a.arroba, 'legenda': not a.sem_legenda}]
    for c in cortes:
        palavras = c.get('palavras') or []
        if isinstance(palavras, str):
            palavras = json.loads(Path(palavras).read_text())
        teaser = c.get('teaser')
        if isinstance(teaser, str):
            teaser = achar_frase(palavras, teaser)
        r = editar_com_teaser(c['video'], c['ini'], c['fim'], palavras, c.get('titulo', ''), c['saida'],
                              c.get('credito', ''), teaser, estilo=c.get('estilo', 'padrao'),
                              nome=c.get('nome', ''), arroba=c.get('arroba', ''), legenda=c.get('legenda', True))
        print(json.dumps(r, ensure_ascii=False), flush=True)


if __name__ == '__main__':
    main()
