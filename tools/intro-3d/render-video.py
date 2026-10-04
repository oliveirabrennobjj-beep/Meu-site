"""Gera o vídeo em loop do poste 3D da tela de entrada.

Uso (dentro de tools/intro-3d):  npm install && npm run video
Precisa de: Python com o pacote playwright e um Chromium, e ffmpeg.

Desenha cada quadro com three.js (dist/pole-video.js) num Chromium sem janela
e monta os arquivos em assets/video/:
  poste.mp4   H.264, toca em qualquer celular
  poste.webm  VP9, menor, para navegadores que aceitam
  poste.webp  primeiro quadro, aparece na hora enquanto o vídeo carrega
  poste-anim.webp  WebP animado: usado onde o navegador não deixa vídeo tocar
                   sozinho (navegadores internos de apps, como o do Instagram)
"""
import base64
import os
import shutil
import subprocess
import tempfile

from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.normpath(os.path.join(HERE, "..", "..", "assets", "video"))
FPS = 30
# As listras dão 2 voltas no tubo: girar meia volta (pi) repete a imagem.
# 54 quadros a 30 fps = meia volta em 1,8 s, e o loop fecha sem emenda.
FRAMES = 54
SIZE = "900:1600"
ANIM_SIZE = "720:1280"


def main():
    os.makedirs(OUT, exist_ok=True)
    frames_dir = tempfile.mkdtemp(prefix="poste-")
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(args=["--use-angle=swiftshader", "--enable-unsafe-swiftshader"])
            page = browser.new_page()
            page.set_content("<!doctype html><html><body style='margin:0;background:#000'></body></html>")
            page.add_script_tag(path=os.path.join(HERE, "dist", "pole-video.js"))
            for i in range(FRAMES):
                data = page.evaluate(f"PoleRender.frame({i} * Math.PI / {FRAMES})")
                with open(os.path.join(frames_dir, f"f{i:03d}.png"), "wb") as fh:
                    fh.write(base64.b64decode(data.split(",", 1)[1]))
                print(f"quadro {i + 1}/{FRAMES}", end="\r", flush=True)
            browser.close()
        print()

        src = ["-framerate", str(FPS), "-i", os.path.join(frames_dir, "f%03d.png")]
        scale = ["-vf", f"scale={SIZE}:flags=lanczos"]
        run(["ffmpeg", "-y", *src, *scale, "-c:v", "libx264", "-preset", "veryslow", "-crf", "20",
             "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an", os.path.join(OUT, "poste.mp4")])
        run(["ffmpeg", "-y", *src, *scale, "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", "34",
             "-row-mt", "1", "-pix_fmt", "yuv420p", "-an", os.path.join(OUT, "poste.webm")])
        run(["ffmpeg", "-y", "-i", os.path.join(frames_dir, "f000.png"), *scale,
             "-quality", "82", os.path.join(OUT, "poste.webp")])
        run(["ffmpeg", "-y", *src, "-vf", f"scale={ANIM_SIZE}:flags=lanczos", "-c:v", "libwebp_anim",
             "-lossless", "0", "-quality", "70", "-compression_level", "6", "-loop", "0",
             os.path.join(OUT, "poste-anim.webp")])
    finally:
        shutil.rmtree(frames_dir, ignore_errors=True)
    for name in ("poste.mp4", "poste.webm", "poste.webp", "poste-anim.webp"):
        print(name, round(os.path.getsize(os.path.join(OUT, name)) / 1024), "KB")


def run(cmd):
    subprocess.run(["ffmpeg", "-loglevel", "error", *cmd[1:]], check=True)


if __name__ == "__main__":
    main()
