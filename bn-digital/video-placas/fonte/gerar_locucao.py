# Gera com o Gemini TTS as falas de locucao.json que ainda não existem em work/vo/<cena>.wav.
# Respeita o limite por minuto do plano grátis. Se a cota do dia acabar, rode de novo no dia seguinte.
# (Também dá para colocar ali um WAV/MP3 gravado ou gerado em outro lugar, com o nome da cena.)
import json, subprocess, os, time
AQUI = os.path.dirname(os.path.abspath(__file__))
cfg = json.load(open(os.path.join(AQUI, "locucao.json")))
base = os.path.join(AQUI, "..", "work", "vo"); os.makedirs(base, exist_ok=True)
for tentativa in range(40):
    faltam = [k for k in cfg["falas"] if not any(os.path.exists(f"{base}/{k}.{e}") for e in ("wav", "mp3"))]
    if not faltam: print("todas prontas"); break
    k = faltam[0]
    r = subprocess.run(["python3", os.path.join(AQUI, "tts.py"), cfg["voz_gemini"], f"{base}/{k}.wav", cfg["falas"][k]], capture_output=True, text=True)
    print(k, "ok" if r.returncode == 0 else r.stderr.strip()[:80], flush=True)
    time.sleep(22 if r.returncode == 0 else 35)
