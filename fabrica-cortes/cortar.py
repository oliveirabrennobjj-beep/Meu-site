#!/usr/bin/env python3
"""Fábrica de cortes: vídeo longo (live) -> cortes verticais 1080x1920 com título e legenda em português.

Uso:
  python3 cortar.py entrada/live.mp4                      # acha os melhores momentos sozinho
  python3 cortar.py entrada/live.mp4 --momentos 02:14:07,05:41:22   # você diz onde foi
  python3 cortar.py entrada/live.mp4 --so-listar          # só mostra os momentos, sem gerar vídeo

Precisa de: ffmpeg. Para legenda e título automáticos: chave do Gemini em GEMINI_API_KEY
(na nuvem do Claude a chave já é injetada). Sem a chave, os cortes saem sem legenda.
"""
import argparse
import base64
import json
import os
import re
import statistics
import subprocess
import sys
import tempfile
import time
import urllib.error
import urllib.request
from pathlib import Path

MODELOS = [m for m in os.environ.get("GEMINI_MODEL", "gemini-3.6-flash,gemini-3.5-flash,gemini-3.5-flash-lite,gemini-3.8-flash").split(",") if m]
AQUI = Path(__file__).resolve().parent


def hms(seg):
    seg = int(max(0, seg))
    return f"{seg // 3600:02d}:{seg % 3600 // 60:02d}:{seg % 60:02d}"


def para_seg(texto):
    partes = [float(p) for p in texto.strip().split(":")]
    seg = 0.0
    for p in partes:
        seg = seg * 60 + p
    return seg


def duracao_de(video):
    saida = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(video)],
        capture_output=True, text=True, check=True).stdout.strip()
    return float(saida)


def volume_por_segundo(video):
    """Volume (dB) de cada segundo do vídeo, medido pelo ffmpeg."""
    filtro = ("aresample=8000,asetnsamples=8000,astats=metadata=1:reset=1,"
              "ametadata=print:key=lavfi.astats.Overall.RMS_level:file=-")
    proc = subprocess.run(
        ["ffmpeg", "-hide_banner", "-loglevel", "error", "-i", str(video), "-vn", "-ac", "1",
         "-af", filtro, "-f", "null", "-"], capture_output=True, text=True)
    if proc.returncode != 0:
        sys.exit("ffmpeg não conseguiu ler o áudio:\n" + proc.stderr[-400:])
    niveis = []
    for linha in proc.stdout.splitlines():
        if "RMS_level=" in linha:
            valor = linha.split("=", 1)[1]
            try:
                db = float(valor)
            except ValueError:
                db = -90.0
            niveis.append(max(db, -90.0))
    return niveis


def achar_momentos(niveis, quantos, duracao, total):
    """Picos de volume (grito, risada, susto) viram candidatos a corte."""
    if not niveis:
        return []
    janela = 5
    suave = []
    for i in range(len(niveis)):
        trecho = niveis[max(0, i - janela // 2): i + janela // 2 + 1]
        suave.append(sum(trecho) / len(trecho))
    base = statistics.median(suave)
    ordem = sorted(range(len(suave)), key=lambda i: suave[i], reverse=True)
    picos = []
    distancia = max(duracao * 1.5, 45)
    for i in ordem:
        if suave[i] - base < 3:          # menos de 3 dB acima do normal não é destaque
            break
        if all(abs(i - p) >= distancia for p in picos):
            picos.append(i)
        if len(picos) >= quantos:
            break
    momentos = []
    for p in sorted(picos):
        inicio = max(0.0, p - duracao * 0.6)   # pega o que levou ao pico
        fim = min(total, inicio + duracao)
        momentos.append({"pico": p, "inicio": inicio, "fim": fim, "forca_db": round(suave[p] - base, 1)})
    return momentos


def gemini(audio_mp3, duracao):
    """Transcreve o trecho, traduz para português e sugere título. Devolve dict ou None."""
    pedido = (
        "Você recebe o áudio de um trecho de live de um streamer. Responda em JSON com:\n"
        '"idioma": idioma falado (ex.: "en", "pt");\n'
        '"falas": lista de {"inicio": segundos, "fim": segundos, "pt": fala em português do Brasil}, '
        "em blocos curtos de até 7 palavras, na ordem, com os tempos relativos ao começo do áudio "
        f"(o áudio tem {duracao:.0f} segundos). Se a fala já for em português, transcreva; se não, traduza "
        "do jeito que um brasileiro falaria. Não invente fala que não existe; sem fala, lista vazia;\n"
        '"titulo": título de até 60 caracteres para um Short, dizendo o que acontece, sem clickbait falso;\n'
        '"descricao": uma frase de descrição;\n'
        '"nota": 0 a 10 para o potencial do trecho como corte (engraçado, surpreendente, emocionante);\n'
        '"motivo": por que deu essa nota, em uma frase.'
    )
    corpo = {
        "contents": [{"parts": [
            {"inlineData": {"mimeType": "audio/mp3", "data": base64.b64encode(audio_mp3).decode()}},
            {"text": pedido}]}],
        "generationConfig": {"responseMimeType": "application/json", "temperature": 0.2},
    }
    chave = os.environ.get("GEMINI_API_KEY", "dummy")
    erro = ""
    for tentativa in range(4):
        for modelo in MODELOS:
            req = urllib.request.Request(
                f"https://generativelanguage.googleapis.com/v1beta/models/{modelo}:generateContent",
                data=json.dumps(corpo).encode(),
                headers={"Content-Type": "application/json", "x-goog-api-key": chave})
            try:
                resposta = json.load(urllib.request.urlopen(req, timeout=180))
                texto = resposta["candidates"][0]["content"]["parts"][0]["text"]
                dados = json.loads(texto)
                if isinstance(dados, list) and dados and isinstance(dados[0], dict):
                    dados = dados[0]
                if isinstance(dados, dict):
                    return dados
                erro = f"{modelo}: resposta fora do formato ({texto[:80]})"
            except urllib.error.HTTPError as e:
                erro = f"{modelo}: HTTP {e.code} {e.read()[:160].decode(errors='replace')}"
                if e.code not in (429, 500, 503):
                    break
            except Exception as e:  # resposta fora do formato, rede etc.
                erro = f"{modelo}: {e}"
        time.sleep(6 * (tentativa + 1))
    print("   IA indisponível para este trecho (" + erro[:200] + ")")
    return None


def limpa_ass(texto):
    return re.sub(r"[{}\\]", "", str(texto)).replace("\n", " ").strip()


def tempo_ass(seg):
    seg = max(0.0, seg)
    return f"{int(seg // 3600)}:{int(seg % 3600 // 60):02d}:{seg % 60:05.2f}"


def escreve_ass(caminho, titulo, falas, duracao, canal):
    linhas = [
        "[Script Info]", "ScriptType: v4.00+", "PlayResX: 1080", "PlayResY: 1920", "WrapStyle: 0", "",
        "[V4+ Styles]",
        "Format: Name, Fontname, Fontsize, PrimaryColour, OutlineColour, BackColour, Bold, BorderStyle, "
        "Outline, Shadow, Alignment, MarginL, MarginR, MarginV",
        "Style: Titulo,Inter,66,&H00FFFFFF,&H00000000,&H00000000,1,1,5,2,8,70,70,170",
        "Style: Fala,Inter,60,&H0000E6FF,&H00000000,&H00000000,1,1,5,2,8,80,80,1210",
        "Style: Canal,Inter,36,&H00FFFFFF,&H00000000,&H00000000,1,1,3,1,2,70,70,110",
        "", "[Events]", "Format: Layer, Start, End, Style, Text",
    ]
    if titulo:
        linhas.append(f"Dialogue: 0,{tempo_ass(0)},{tempo_ass(duracao)},Titulo,{limpa_ass(titulo)}")
    if canal:
        linhas.append(f"Dialogue: 0,{tempo_ass(0)},{tempo_ass(duracao)},Canal,{limpa_ass(canal)}")
    for f in falas or []:
        try:
            ini, fim = float(f["inicio"]), float(f["fim"])
        except (KeyError, TypeError, ValueError):
            continue
        texto = limpa_ass(f.get("pt", ""))
        if texto and fim > ini and ini < duracao:
            linhas.append(f"Dialogue: 1,{tempo_ass(ini)},{tempo_ass(min(fim, duracao))},Fala,{texto}")
    Path(caminho).write_text("\n".join(linhas) + "\n", encoding="utf-8")


def renderiza(video, inicio, duracao, ass, saida):
    """Vertical 1080x1920: fundo desfocado, vídeo original no meio, título em cima, legenda embaixo."""
    ass_filtro = str(ass).replace("\\", "/").replace(":", "\\:").replace("'", "\\'")
    filtro = (
        "[0:v]split=2[a][b];"
        "[a]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=24:4,eq=brightness=-0.28[bg];"
        "[b]scale=1080:-2[fg];"
        "[bg][fg]overlay=(W-w)/2:(H-h)/2-110[v1];"
        f"[v1]ass='{ass_filtro}'[v]"
    )
    cmd = ["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-ss", f"{inicio:.2f}", "-t", f"{duracao:.2f}",
           "-i", str(video), "-filter_complex", filtro, "-map", "[v]", "-map", "0:a?",
           "-r", "30", "-c:v", "libx264", "-preset", "veryfast", "-crf", "21", "-pix_fmt", "yuv420p",
           "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", str(saida)]
    proc = subprocess.run(cmd, capture_output=True, text=True)
    if proc.returncode != 0:
        print("   ffmpeg falhou neste corte:\n" + proc.stderr[-500:])
        return False
    return True


def main():
    ap = argparse.ArgumentParser(description="Transforma uma live em cortes verticais.")
    ap.add_argument("video")
    ap.add_argument("--quantos", type=int, default=10, help="máximo de cortes (padrão 10)")
    ap.add_argument("--duracao", type=float, default=40, help="segundos de cada corte (padrão 40)")
    ap.add_argument("--momentos", default="", help="tempos escolhidos por você, ex.: 02:14:07,05:41:22")
    ap.add_argument("--canal", default="", help="nome do canal, aparece embaixo")
    ap.add_argument("--sem-ia", action="store_true", help="não usa o Gemini (sem legenda nem título)")
    ap.add_argument("--so-listar", action="store_true", help="mostra os momentos e para")
    ap.add_argument("--saida", default=str(AQUI / "prontos"))
    args = ap.parse_args()

    video = Path(args.video)
    if not video.is_file():
        sys.exit(f"Não achei o vídeo: {video}")
    total = duracao_de(video)
    print(f"Vídeo: {video.name} ({hms(total)})")

    if args.momentos:
        momentos = []
        for t in args.momentos.split(","):
            pico = para_seg(t)
            inicio = max(0.0, pico - args.duracao * 0.6)
            momentos.append({"pico": pico, "inicio": inicio, "fim": min(total, inicio + args.duracao), "forca_db": None})
    else:
        print("Medindo o volume da live inteira (picos = grito, risada, susto)...")
        momentos = achar_momentos(volume_por_segundo(video), args.quantos, args.duracao, total)
    if not momentos:
        sys.exit("Não achei nenhum momento que se destaque. Passe os tempos com --momentos.")

    print(f"{len(momentos)} momento(s):")
    for i, m in enumerate(momentos, 1):
        forca = f" (+{m['forca_db']} dB)" if m["forca_db"] is not None else ""
        print(f"  {i:02d}. {hms(m['inicio'])} até {hms(m['fim'])}{forca}")
    if args.so_listar:
        return

    saida = Path(args.saida)
    saida.mkdir(parents=True, exist_ok=True)
    base = re.sub(r"[^a-zA-Z0-9]+", "-", video.stem).strip("-").lower() or "corte"
    relatorio = [f"# Cortes de {video.name}", ""]
    feitos = 0
    with tempfile.TemporaryDirectory() as tmp:
        for i, m in enumerate(momentos, 1):
            dur = m["fim"] - m["inicio"]
            if dur < 5:
                continue
            print(f"Corte {i:02d}: {hms(m['inicio'])}")
            info = None
            if not args.sem_ia:
                mp3 = Path(tmp) / f"{i}.mp3"
                subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-ss", f"{m['inicio']:.2f}",
                                "-t", f"{dur:.2f}", "-i", str(video), "-vn", "-ac", "1", "-ar", "16000",
                                "-b:a", "48k", str(mp3)], check=False)
                if mp3.is_file() and mp3.stat().st_size > 0:
                    info = gemini(mp3.read_bytes(), dur)
            info = info or {}
            ass = Path(tmp) / f"{i}.ass"
            escreve_ass(ass, info.get("titulo", ""), info.get("falas", []), dur, args.canal)
            destino = saida / f"{base}-{i:02d}.mp4"
            if renderiza(video, m["inicio"], dur, ass, destino):
                feitos += 1
                relatorio += [
                    f"## {destino.name}",
                    f"- Trecho da live: {hms(m['inicio'])} até {hms(m['fim'])}",
                    f"- Título: {info.get('titulo') or '(escrever)'}",
                    f"- Descrição: {info.get('descricao') or '(escrever)'}",
                    f"- Nota da IA: {info.get('nota', 'sem IA')}  {info.get('motivo', '')}".rstrip(),
                    f"- Legenda: {'sim, ' + str(len(info.get('falas') or [])) + ' falas' if info.get('falas') else 'não'}",
                    "",
                ]
    (saida / f"{base}.md").write_text("\n".join(relatorio), encoding="utf-8")
    print(f"Pronto: {feitos} corte(s) em {saida}. Títulos e notas em {saida / (base + '.md')}")


if __name__ == "__main__":
    main()
