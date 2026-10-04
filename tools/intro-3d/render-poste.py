"""Gera as camadas do poste da tela de entrada.

Uso (dentro de tools/intro-3d):  npm install && npm run poste
Precisa de: Python com o pacote playwright e um Chromium, e ImageMagick (convert).

Desenha o poste com three.js (dist/poste-camadas.js) num Chromium sem janela e
salva em assets/img/poste/:
  fundo.webp    estúdio (foco de luz; bordas na cor do fundo da página)
  listras.webp  faixa alta de listras, que desliza por trás do vidro
  frente.webp   metal, vidro e sombra, transparente onde as listras aparecem
Também atualiza, em assets/css/styles.css, o bloco entre "poste:inicio" e
"poste:fim" com a posição exata da faixa e o tamanho do passo da espiral.
"""
import base64
import os
import re
import subprocess
import tempfile

from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, "..", ".."))
OUT = os.path.join(ROOT, "assets", "img", "poste")
CSS = os.path.join(ROOT, "assets", "css", "styles.css")
SCALE = 900 / 1080  # as camadas são salvas em 900 x 1600
DURATION = 1.8      # segundos por passo da espiral (meia volta)


def main():
    os.makedirs(OUT, exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(args=["--use-angle=swiftshader", "--enable-unsafe-swiftshader"])
        page = browser.new_page()
        page.set_content("<!doctype html><html><body style='margin:0'></body></html>")
        page.add_script_tag(path=os.path.join(HERE, "dist", "poste-camadas.js"))
        data = page.evaluate("PoleRender.layers()")
        browser.close()

    tmp = tempfile.mkdtemp(prefix="poste-")
    for name, quality in (("fundo", 82), ("listras", 86), ("frente", 86)):
        key = {"fundo": "back", "listras": "strip", "frente": "front"}[name]
        src = os.path.join(tmp, name + ".png")
        with open(src, "wb") as fh:
            fh.write(base64.b64decode(data[key].split(",", 1)[1]))
        subprocess.run(["convert", src, "-resize", f"{SCALE * 100:.4f}%", "-quality", str(quality),
                        "-define", "webp:method=6", "-define", "webp:alpha-quality=95",
                        os.path.join(OUT, name + ".webp")], check=True)

    m = data["meta"]
    W, H = m["frame"]
    r = m["rect"]
    strip_w, strip_h = m["strip"]
    block = f"""/* poste:inicio (gerado por tools/intro-3d/render-poste.py, não edite à mão) */
.pole-stage {{
  --pole-strip-left: {r["x"] / W * 100:.4f}%;
  --pole-strip-top: {r["y"] / H * 100:.4f}%;
  --pole-strip-width: {r["w"] / W * 100:.4f}%;
  --pole-strip-height: {r["h"] / H * 100:.4f}%;
  --pole-strip-tall: {strip_h / r["h"] * 100:.4f}%;
  --pole-strip-step: {-m["periodPx"] / strip_h * 100:.4f}%;
  --pole-strip-duration: {DURATION}s;
}}
/* poste:fim */"""
    css = open(CSS, encoding="utf-8").read()
    pattern = re.compile(r"/\* poste:inicio.*?/\* poste:fim \*/", re.S)
    if pattern.search(css):
        css = pattern.sub(lambda _m: block, css)
    else:
        css = css.rstrip("\n") + "\n\n" + block + "\n"
    open(CSS, "w", encoding="utf-8").write(css)

    for name in ("fundo", "listras", "frente"):
        print(name + ".webp", round(os.path.getsize(os.path.join(OUT, name + ".webp")) / 1024), "KB")
    print(block)


if __name__ == "__main__":
    main()
