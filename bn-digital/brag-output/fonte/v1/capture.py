# Captura quadros da composição (cada quadro é função pura do tempo).
# uso: capture.py stills t1 t2 ...   |   capture.py frames <fps> <dur> <outdir>
import sys, asyncio, os
from playwright.async_api import async_playwright
URL = "http://localhost:8765/brag-output/work/index.html"
async def main():
    mode = sys.argv[1]
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={"width": 1080, "height": 1920})
        errs = []; pg.on("pageerror", lambda e: errs.append(str(e))); pg.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
        await pg.goto(URL, wait_until="networkidle")
        await pg.evaluate("window.ready")
        stage = await pg.query_selector("#stage")
        if mode == "stills":
            out = os.path.dirname(os.path.abspath(__file__)) + "/stills"; os.makedirs(out, exist_ok=True)
            for t in sys.argv[2:]:
                await pg.evaluate(f"window.render({t})")
                await stage.screenshot(path=f"{out}/t{float(t):05.2f}.png")
        else:
            fps, dur, out = int(sys.argv[2]), float(sys.argv[3]), sys.argv[4]; os.makedirs(out, exist_ok=True)
            n = round(fps * dur)
            for i in range(n):
                await pg.evaluate(f"window.render({i / fps})")
                await stage.screenshot(path=f"{out}/f{i:05d}.jpg", type="jpeg", quality=93)
                if i % 60 == 0: print("frame", i, "/", n, flush=True)
        print("errors:", errs)
        await b.close()
asyncio.run(main())
