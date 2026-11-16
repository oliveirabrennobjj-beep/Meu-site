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
    def __init__(self, palavras):
        self.pags = paginas(palavras)
        self.cache = {}

    def _desenhar(self, i, ativa):
        chave = (i, ativa)
        if chave in self.cache:
            return self.cache[chave]
        textos = [p['texto'] for p in self.pags[i]['palavras']]
        tam = 96
        while True:
            fonte = ImageFont.truetype(str(FONTE_LEGENDA), tam)
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


# ---------------------------------------------------------------- render

def editar(video, ini, fim, palavras, titulo, saida, credito='', planos=None, zoom=1.0):
    """Renderiza um corte. `palavras` usa tempos relativos ao início do corte."""
    dur = fim - ini
    w, h = sondar(video)
    planos = planos or analisar(video, ini, dur)
    for p in planos:
        p.update(enquadrar(p, w, h))
    legenda = Legenda([p for p in palavras if p['t1'] > 0 and p['t0'] < dur])
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
        tela = compor(quadro, plano)
        if zoom != 1.0:   # aproximação lenta e contínua
            z = 1 + (zoom - 1) * min(t / max(dur, 0.1), 1.0)
            m = cv2.getRotationMatrix2D((LARG / 2, ALT * 0.42), 0, z)
            tela = cv2.warpAffine(tela, m, (LARG, ALT), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
        if titulo_img is not None:
            entrada = min(t / 0.35, 1.0)
            suave = 1 - (1 - entrada) ** 3
            colar(tela, titulo_img, LARG / 2, Y_TITULO + titulo_img.shape[0] / 2 - 40 * (1 - suave),
                  opacidade=suave)
        legenda.aplicar(tela, t, Y_LEGENDA[plano['modo']])
        barra = int(LARG * min(t / dur, 1.0))
        tela[0:10, :barra] = AMARELO[::-1]
        cod.stdin.write(tela.tobytes())
    cod.stdin.close()
    if cod.wait() != 0:
        raise RuntimeError(f'ffmpeg falhou em {saida}')
    return {'saida': str(saida), 'quadros': n + 1,
            'planos': [{'t0': round(p['t0'], 2), 't1': round(p['t1'], 2), 'modo': p['modo'],
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


def editar_com_teaser(video, ini, fim, palavras, titulo, saida, credito='', teaser=None, pasta_tmp=None):
    """Abre o corte com o trecho `teaser` (tempos relativos ao corte), um flash branco e o corte inteiro."""
    if not teaser:
        return editar(video, ini, fim, palavras, titulo, saida, credito)
    a, b = max(teaser[0] - 0.25, 0), min(teaser[1] + 0.45, fim - ini)
    tmp = Path(pasta_tmp or Path(saida).parent)
    p1, p2 = tmp / (Path(saida).stem + '_teaser.mp4'), tmp / (Path(saida).stem + '_corpo.mp4')
    pal_t = [dict(p, t0=p['t0'] - a, t1=p['t1'] - a) for p in palavras]
    r1 = editar(video, ini + a, ini + b, pal_t, titulo, p1, credito, zoom=1.10)
    r2 = editar(video, ini, fim, palavras, titulo, p2, credito)
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
    a = ap.parse_args()
    if a.lote:
        cortes = json.loads(Path(a.lote).read_text())
    else:
        if not (a.video and a.fim and a.saida):
            ap.error('informe --lote ou --video, --fim e --saida')
        cortes = [{'video': a.video, 'ini': a.ini, 'fim': a.fim, 'palavras': a.palavras,
                   'titulo': a.titulo, 'credito': a.credito, 'saida': a.saida, 'teaser': a.teaser}]
    for c in cortes:
        palavras = c.get('palavras') or []
        if isinstance(palavras, str):
            palavras = json.loads(Path(palavras).read_text())
        teaser = c.get('teaser')
        if isinstance(teaser, str):
            teaser = achar_frase(palavras, teaser)
        r = editar_com_teaser(c['video'], c['ini'], c['fim'], palavras, c.get('titulo', ''), c['saida'],
                              c.get('credito', ''), teaser)
        print(json.dumps(r, ensure_ascii=False), flush=True)


if __name__ == '__main__':
    main()
