# Captura os quadros do vídeo (cada quadro é função pura do tempo).
# Rode um servidor na raiz do repositório:  python3 -m http.server 8765
# uso: python3 capture.py stills <saida> t1 t2 ...   |   python3 capture.py frames <fps> <duracao> <saida>
#      python3 capture.py range <fps> <quadro_ini> <quadro_fim> <saida>
import sys, asyncio, os
from playwright.async_api import async_playwright
URL = "http://localhost:8765/bn-digital/video-placas/fonte/index.html"
async def main():
    mode = sys.argv[1]
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=os.environ.get("CHROME", "/opt/pw-browsers/chromium"), args=["--no-sandbox"])
        pg = await b.new_page(viewport={"width": 1080, "height": 1920})
        errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
        await pg.goto(URL, wait_until="networkidle")
        await pg.evaluate("window.ready")
        stage = await pg.query_selector("#stage")
        if mode == "stills":
            out = sys.argv[2]; os.makedirs(out, exist_ok=True)
            for t in sys.argv[3:]:
                await pg.evaluate(f"window.render({t})")
                await stage.screenshot(path=f"{out}/t{float(t):05.2f}.png")
        elif mode == "range":  # refaz só um trecho: range <fps> <quadro_ini> <quadro_fim> <saida>
            fps, i0, i1, out = int(sys.argv[2]), int(sys.argv[3]), int(sys.argv[4]), sys.argv[5]
            for i in range(i0, i1):
                await pg.evaluate(f"window.render({i / fps})")
                await stage.screenshot(path=f"{out}/f{i:05d}.jpg", type="jpeg", quality=92)
        else:
            fps, dur, out = int(sys.argv[2]), float(sys.argv[3]), sys.argv[4]; os.makedirs(out, exist_ok=True)
            n = round(fps * dur)
            for i in range(n):
                await pg.evaluate(f"window.render({i / fps})")
                await stage.screenshot(path=f"{out}/f{i:05d}.jpg", type="jpeg", quality=92)
                if i % 150 == 0: print("quadro", i, "/", n, flush=True)
        print("erros:", errs)
        await b.close()
asyncio.run(main())
