# Gera as duas partes para Stories a partir de placas.mp4 e dos tempos em work/tempo.json.
import json, os, subprocess
AQUI = os.path.dirname(os.path.abspath(__file__))
T = json.load(open(os.path.join(AQUI, "..", "work", "tempo.json")))
src = os.path.join(AQUI, "..", "placas.mp4")
seg = lambda a, b, f=0.35: f"{a:.3f}:{b:.3f}:{f}"
parte1 = [seg(0, T["atualiza"]["b"], 0), seg(T["personalizada"]["a"] + 0.1, T["personalizada"]["b"]), seg(T["valor"]["a"] + 0.1, T["valor"]["b"]), seg(T["cta"]["a"] + 0.1, T["fim"])]
parte2 = [seg(T["wifi"]["a"] + 0.45, T["outras"]["b"], 0), seg(T["cta"]["a"] + 0.1, T["fim"])]
for nome, p in (("stories-1-cardapio.mp4", parte1), ("stories-2-placas.mp4", parte2)):
    subprocess.run(["python3", os.path.join(AQUI, "stories.py"), src, os.path.join(AQUI, "..", nome), ",".join(p)], check=True)
