#!/usr/bin/env python3
"""Prepara uma historinha: voz por cena (Gemini TTS pelo proxy), tempos, legenda e trilha.

Uso: python3 -I scripts/preparar.py roteiros/<nome>.json
Saída: public/<nome>/tempos.json (props do Remotion) + falas .wav + trilha.wav
"""
import base64, hashlib, json, os, re, subprocess, sys, time, urllib.error, urllib.request, wave

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
API = "https://generativelanguage.googleapis.com/v1beta/models/{}:generateContent"
LEAD_MS = 120      # respiro antes de cada fala
PAUSA_MS = 280     # silêncio depois de cada fala
TAXA = 24000


class CotaDiaria(Exception):
    pass


# Plano grátis do Gemini: ~10 falas por dia por modelo. Acabou um, passa pro próximo (mesma voz).
RESERVAS = ["gemini-3.1-flash-tts-preview", "gemini-2.5-flash-preview-tts"]
esgotados = set()


def tts_com_reserva(texto, modelo, voz):
    for m in [modelo] + [r for r in RESERVAS if r != modelo]:
        if m in esgotados:
            continue
        try:
            return tts(texto, m, voz)
        except CotaDiaria:
            print(f"  cota diária de {m} acabou, usando o próximo modelo")
            esgotados.add(m)
    sys.exit("Todas as cotas diárias de voz acabaram. Tente amanhã ou ative pagamento no Google AI Studio.")


def sh(*cmd):
    return subprocess.run(cmd, capture_output=True, text=True)


def tts(texto, modelo, voz):
    corpo = {
        "contents": [{"parts": [{"text": texto}]}],
        "generationConfig": {
            "responseModalities": ["AUDIO"],
            "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": voz}}},
        },
    }
    # A chave real é injetada pelo proxy da sessão; fora dela use GEMINI_API_KEY.
    chave = os.environ.get("GEMINI_API_KEY", "proxy")
    for tentativa in range(6):
        req = urllib.request.Request(
            API.format(modelo),
            data=json.dumps(corpo).encode(),
            headers={"Content-Type": "application/json", "x-goog-api-key": chave},
        )
        try:
            r = json.load(urllib.request.urlopen(req, timeout=240))
            cand = (r.get("candidates") or [{}])[0]
            partes = cand.get("content", {}).get("parts", [])
            if not partes or "inlineData" not in partes[0]:
                # às vezes o modelo devolve vazio (finishReason OTHER); tenta de novo
                if tentativa < 5:
                    print(f"  TTS sem áudio ({cand.get('finishReason')}), tentando de novo")
                    time.sleep(3)
                    continue
                sys.exit(f"TTS sem áudio: {json.dumps(r)[:300]}")
            dados = base64.b64decode(partes[0]["inlineData"]["data"])
            if dados[:4] == b"RIFF":
                return dados, True
            return dados, False
        except urllib.error.HTTPError as e:
            msg = e.read()[:2000]
            if e.code == 429 and b"per day" in msg:
                raise CotaDiaria(modelo)
            msg = msg[:200]
            if e.code in (429, 500, 503) and tentativa < 5:
                espera = 15 * (tentativa + 1)
                print(f"  TTS {e.code}, tentando de novo em {espera}s")
                time.sleep(espera)
                continue
            sys.exit(f"TTS falhou ({e.code}): {msg}")


def gerar_fala(cena, i, roteiro, pasta):
    voz = roteiro["voz"]
    tom = cena.get("tom", voz["tom"])
    chave = hashlib.sha1(f'{voz["modelo"]}|{voz["nome"]}|{tom}|{cena["fala"]}'.encode()).hexdigest()[:8]
    nome = f"fala-{i:02d}-{chave}.wav"
    destino = os.path.join(pasta, nome)
    if not os.path.exists(destino):
        print(f"  voz cena {i + 1}: {cena['fala']}")
        dados, eh_wav = tts_com_reserva(f"{tom} {cena['fala']}", voz["modelo"], voz["nome"])
        bruto = destino + ".bruto.wav"
        if eh_wav:
            open(bruto, "wb").write(dados)
        else:
            with wave.open(bruto, "wb") as w:
                w.setnchannels(1)
                w.setsampwidth(2)
                w.setframerate(TAXA)
                w.writeframes(dados)
        # corta silêncio do começo e do fim
        filtro = (
            "silenceremove=start_periods=1:start_threshold=-42dB:start_silence=0.05,"
            "areverse,silenceremove=start_periods=1:start_threshold=-42dB:start_silence=0.08,areverse"
        )
        r = sh("ffmpeg", "-nostdin", "-y", "-loglevel", "error", "-i", bruto, "-af", filtro, "-ar", str(TAXA), "-ac", "1", destino)
        if r.returncode:
            sys.exit(r.stderr)
        os.remove(bruto)
    vel = float(roteiro.get("velocidade", 1.0))
    if abs(vel - 1.0) > 0.001:
        rapido = nome.replace(".wav", f".v{round(vel * 100)}.wav")
        if not os.path.exists(os.path.join(pasta, rapido)):
            r = sh("ffmpeg", "-nostdin", "-y", "-loglevel", "error", "-i", destino, "-af", f"atempo={vel}", os.path.join(pasta, rapido))
            if r.returncode:
                sys.exit(r.stderr)
        nome, destino = rapido, os.path.join(pasta, rapido)
    with wave.open(destino) as w:
        dur = w.getnframes() / w.getframerate()
    return nome, dur


def silencios(caminho, dur):
    r = sh("ffmpeg", "-nostdin", "-hide_banner", "-i", caminho, "-af", "silencedetect=n=-36dB:d=0.16", "-f", "null", "-")
    ini = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", r.stderr)]
    fim = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", r.stderr)]
    return [(a, b) for a, b in zip(ini, fim) if a > 0.05 and b < dur - 0.05]


def legendas_da_fala(fala, dur, sil, inicio_ms):
    palavras = fala.split()
    # trechos terminam em pontuação; se o número de pausas bater, cada trecho ganha seu intervalo
    trechos, atual = [], []
    for p in palavras:
        atual.append(p)
        if re.search(r"[,.;:!?…]$", p):
            trechos.append(atual)
            atual = []
    if atual:
        trechos.append(atual)
    if len(sil) == len(trechos) - 1:
        limites = [0.0] + [x for s in sil for x in s] + [dur]
        spans = [(limites[2 * k], limites[2 * k + 1]) for k in range(len(trechos))]
    else:
        trechos, spans = [palavras], [(0.0, dur)]
    caps = []
    for trecho, (a, b) in zip(trechos, spans):
        pesos = [len(re.sub(r"\W", "", w)) + 1.5 for w in trecho]
        total, acc = sum(pesos), a
        for w, pw in zip(trecho, pesos):
            d = (b - a) * pw / total
            caps.append({
                "text": " " + w,
                "startMs": round(inicio_ms + acc * 1000),
                "endMs": round(inicio_ms + (acc + d) * 1000),
                "timestampMs": None,
                "confidence": None,
            })
            acc += d
    return caps


def sfx(pasta_sfx):
    os.makedirs(pasta_sfx, exist_ok=True)
    sons = {
        "sino": ("aevalsrc=exprs='exp(-0.9*t)*(0.45*sin(2*PI*196*t)+0.3*sin(2*PI*392.6*t)+0.22*sin(2*PI*587*t)+0.15*sin(2*PI*466*t)+0.1*sin(2*PI*988*t))':s=44100:d=5", "aecho=0.8:0.7:180|420:0.35|0.2,volume=0.9"),
        "grave": ("aevalsrc=exprs='exp(-2.2*t)*sin(2*PI*(58-22*t)*t)*0.9':s=44100:d=2.5", "lowpass=f=180,volume=1.6"),
        "arranhao": ("aevalsrc=exprs='(random(0)*2-1)*lt(mod(t\\,0.62)\\,0.38)*(0.6+0.4*sin(2*PI*9*t))':s=44100:d=2.4", "bandpass=f=2600:width_type=h:w=1800,highpass=f=900,volume=1.2"),
    }
    for nome, (fonte, filtro) in sons.items():
        destino = os.path.join(pasta_sfx, f"{nome}.wav")
        if not os.path.exists(destino):
            r = sh("ffmpeg", "-nostdin", "-y", "-loglevel", "error", "-f", "lavfi", "-i", fonte, "-af", filtro, destino)
            if r.returncode:
                sys.exit(r.stderr)


def trilha(destino, segundos):
    drone = (
        f"aevalsrc=exprs='0.22*sin(2*PI*55*t)*(0.6+0.4*sin(2*PI*0.09*t))"
        f"+0.16*sin(2*PI*82.4*t+2*sin(2*PI*0.05*t))+0.08*sin(2*PI*110.6*t)*(0.5+0.5*sin(2*PI*0.13*t))"
        f"+0.05*sin(2*PI*164.8*t)*(0.5+0.5*sin(2*PI*0.21*t))':s=44100:d={segundos:.2f}"
    )
    ruido = f"anoisesrc=color=brown:amplitude=0.22:d={segundos:.2f}:r=44100"
    filtro = (
        f"[1]lowpass=f=320[r];[0][r]amix=inputs=2:normalize=0,"
        f"afade=t=in:d=1.5,afade=t=out:st={max(0, segundos - 2.5):.2f}:d=2.5,volume=0.9"
    )
    r = sh("ffmpeg", "-nostdin", "-y", "-loglevel", "error", "-f", "lavfi", "-i", drone, "-f", "lavfi", "-i", ruido,
           "-filter_complex", filtro, destino)
    if r.returncode:
        sys.exit(r.stderr)


def main():
    caminho = sys.argv[1] if len(sys.argv) > 1 else "roteiros/o-vigia.json"
    roteiro = json.load(open(os.path.join(RAIZ, caminho) if not os.path.isabs(caminho) else caminho))
    nome = roteiro["nome"]
    pasta = os.path.join(RAIZ, "public", nome)
    os.makedirs(pasta, exist_ok=True)
    sfx(os.path.join(RAIZ, "public", "sfx"))

    cenas, legendas, cursor = [], [], 0
    for i, cena in enumerate(roteiro["cenas"]):
        arquivo, dur = gerar_fala(cena, i, roteiro, pasta)
        inicio_fala = cursor + LEAD_MS
        fim = inicio_fala + round(dur * 1000) + PAUSA_MS + cena.get("finalMs", 0)
        legendas += legendas_da_fala(cena["fala"], dur, silencios(os.path.join(pasta, arquivo), dur), inicio_fala)
        cenas.append({
            "fala": cena["fala"],
            "tomadas": cena["tomadas"],
            "som": cena.get("som"),
            "audio": f"{nome}/{arquivo}",
            "inicioMs": cursor,
            "falaMs": inicio_fala,
            "fimMs": fim,
        })
        cursor = fim

    trilha(os.path.join(pasta, "trilha.wav"), cursor / 1000 + 0.5)
    saida = {"nome": nome, "historia": roteiro["historia"], "duracaoMs": cursor, "cenas": cenas, "legendas": legendas}
    json.dump(saida, open(os.path.join(pasta, "tempos.json"), "w"), ensure_ascii=False, indent=1)
    print(f"Pronto: {len(cenas)} cenas, {cursor / 1000:.1f} s -> public/{nome}/tempos.json")


if __name__ == "__main__":
    main()
