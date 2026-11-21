# Prints dos sites de exemplo, com os nomes trocados por nomes fictícios.
import asyncio, json
from playwright.async_api import async_playwright
ACAI_LOGO = "data:image/svg+xml;utf8," + """<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'><circle cx='60' cy='60' r='60' fill='%238b55f0'/><path d='M30 52c8-14 22-20 30-20s22 6 30 20' fill='none' stroke='%23f2e33b' stroke-width='6' stroke-linecap='round'/><circle cx='60' cy='38' r='7' fill='%23f2e33b'/><text x='60' y='76' text-anchor='middle' font-family='Arial Black,Arial' font-weight='900' font-size='19' fill='%23f2e33b'>AÇAÍ</text><text x='60' y='96' text-anchor='middle' font-family='Arial Black,Arial' font-weight='900' font-size='13' fill='%23ffffff'>DA ORLA</text></svg>"""
PAD_LOGO = "data:image/svg+xml;utf8," + """<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 506 334'><ellipse cx='253' cy='167' rx='245' ry='158' fill='%23f6e7cf' stroke='%237a4a24' stroke-width='12'/><ellipse cx='253' cy='167' rx='215' ry='130' fill='none' stroke='%23c08a4a' stroke-width='4' stroke-dasharray='10 8'/><text x='253' y='140' text-anchor='middle' font-family='Georgia,serif' font-style='italic' font-size='46' fill='%237a4a24'>Padaria</text><text x='253' y='215' text-anchor='middle' font-family='Georgia,serif' font-weight='700' font-size='82' fill='%235a3418'>Trigal</text></svg>"""
RENAME = {
  "acai": [[r"a[çc]a[ií] ?do ?rei", "Açaí da Orla"], [r"acaidoreideliverycasimiro", "acaidaorla"]],
  "padaria": [[r"padaria ?bnh", "Padaria Trigal"], [r"bnh\.padaria", "padariatrigal"], [r"\bbnh\b", "Trigal"]],
  "navalha": [[r"quero um site assim", "Agendar horário"]],
}
LOGOS = {"acai": ["logo.svg", ACAI_LOGO], "padaria": ["logo-bnh", PAD_LOGO]}
JS = """([rules, logo, hideDemo]) => {
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let n; while ((n = w.nextNode())) { let s = n.nodeValue; for (const [re, to] of rules) s = s.replace(new RegExp(re, 'gi'), to); n.nodeValue = s; }
  document.querySelectorAll('[alt],[aria-label],[title]').forEach(el => { for (const a of ['alt','aria-label','title']) if (el.getAttribute(a)) { let s = el.getAttribute(a); for (const [re, to] of rules) s = s.replace(new RegExp(re,'gi'), to); el.setAttribute(a, s); } });
  if (logo) document.querySelectorAll('img').forEach(im => { if ((im.getAttribute('src') || '').includes(logo[0])) { im.removeAttribute('srcset'); im.src = logo[1]; } });
  if (hideDemo) document.querySelectorAll('body *').forEach(el => { if (el.children.length < 3 && /^\\s*site de exemplo/i.test(el.textContent || '') && el.getBoundingClientRect().top < 80) el.style.display = 'none'; });
}"""
SITES = {"acai": "acai-do-rei/index.html", "padaria": "padaria/index.html", "navalha": "barbearia-modelo/index.html", "burgeria": "hamburgueria-modelo/index.html"}
async def grab(b, k, u, mode, vp, dsf, maxh, out=None):
    pg = await b.new_page(viewport=vp, device_scale_factor=dsf)
    await pg.goto("http://localhost:8765/" + u, wait_until="networkidle")
    await pg.wait_for_timeout(1200)
    for y in range(0, maxh + 1200, 300):
        await pg.evaluate(f"window.scrollTo(0,{y})"); await pg.wait_for_timeout(100)
    await pg.wait_for_timeout(700); await pg.evaluate("window.scrollTo(0,0)"); await pg.wait_for_timeout(1000)
    await pg.evaluate(JS, [RENAME.get(k, []), LOGOS.get(k), k == "navalha"])
    await pg.wait_for_timeout(600)
    info = await pg.evaluate("() => { const c = document.getElementById('cardapio'); return c ? c.getBoundingClientRect().top + scrollY : null }")
    await pg.screenshot(path=out or f"full-{k}-{mode}.png", clip={"x": 0, "y": 0, "width": vp["width"], "height": maxh}, full_page=True)
    await pg.close(); return info
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path="/opt/pw-browsers/chromium", args=["--no-sandbox"])
        res = {}
        for k, u in SITES.items():
            await grab(b, k, u, "desk", {"width": 1440, "height": 900}, 1, 2000)
            res[k] = await grab(b, k, u, "mob", {"width": 390, "height": 844}, 2, 1700 if k != "burgeria" else 3600)
        print(json.dumps(res))
        await b.close()
asyncio.run(main())
