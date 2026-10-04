"""Testes do site da Barber Club (Playwright, Python).

Uso:  .venv/bin/python tests/test_site.py [--shots pasta]

Sobe um servidor estático temporário, testa o site com os dados atuais de
site-config.js e, depois, com uma configuração de exemplo (fotos de teste,
WhatsApp, endereço e avaliações fictícios) para exercitar a galeria e o fluxo
de WhatsApp. Os dados de exemplo existem só dentro do teste.
"""
import argparse
import functools
import http.server
import json
import os
import socketserver
import sys
import threading
from urllib.parse import unquote

from playwright.sync_api import expect, sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WIDTHS = [320, 375, 390, 768, 1024, 1440]
FAILURES = []


def check(cond, msg):
    print(("  ok   " if cond else "  FALHA ") + msg)
    if not cond:
        FAILURES.append(msg)


def start_server():
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *args):
            pass

    handler = functools.partial(Quiet, directory=ROOT)
    httpd = socketserver.TCPServer(("127.0.0.1", 0), handler)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd, f"http://127.0.0.1:{httpd.server_address[1]}/"


TEST_SVG = """<svg xmlns="http://www.w3.org/2000/svg" width="600" height="750" viewBox="0 0 600 750">
<rect width="600" height="750" fill="{c}"/><text x="300" y="390" font-size="48" text-anchor="middle"
fill="#fff" font-family="sans-serif">FOTO DE TESTE {n}</text></svg>"""

SAMPLE_OVERRIDES = """
(function () {
  var c = window.BARBER_CLUB;
  c.contato.whatsappAgendamento = "55 (22) 90000-0000";
  c.endereco.confirmado = true;
  c.endereco.texto = "Endereço de teste, 1";
  c.endereco.mapaEmbedUrl = "about:blank";
  c.endereco.rotaUrl = "https://maps.google.com/?q=teste";
  c.horarios = [{ dias: "Dia de teste", horas: "9h às 18h" }];
  c.google.perfilUrl = "https://example.com/google";
  c.avaliacoes = [{ nome: "Cliente de teste", texto: "Depoimento de teste." }];
  c.servicos[0].preco = "R$ 0,00";
  c.imagens.resultados = [
    { src: "assets/img/teste-1.svg", alt: "Foto de teste 1" },
    { src: "assets/img/teste-2.svg", alt: "Foto de teste 2" },
    { src: "assets/img/teste-3.svg", alt: "Foto de teste 3" }
  ];
})();
"""


PENDING_OVERRIDES = """
(function () {
  var c = window.BARBER_CLUB;
  c.endereco.confirmado = false;
  c.google.perfilUrl = "";
  c.avaliacoes = [];
  c.imagens.resultados = [];
})();
"""


def new_page(browser, base, width=390, height=844, sample=False, pending=False, intro=False, **kw):
    ctx = browser.new_context(viewport={"width": width, "height": height}, **kw)
    if not intro:
        # pula a tela de entrada, como numa segunda página vista na mesma visita
        ctx.add_init_script("try { sessionStorage.setItem('bc-entrada', '1') } catch (e) {}")
    page = ctx.new_page()
    errors = []
    page.on("pageerror", lambda e: errors.append(str(e)))
    page.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
    # o Google Maps não carrega no ambiente de teste; o iframe recebe uma página vazia
    page.route("https://www.google.com/**", lambda r: r.fulfill(body="<html></html>", content_type="text/html"))
    if sample or pending:
        extra = SAMPLE_OVERRIDES if sample else PENDING_OVERRIDES
        def config(route):
            original = open(os.path.join(ROOT, "assets/js/site-config.js"), encoding="utf-8").read()
            route.fulfill(body=original + extra, content_type="application/javascript")
        page.route("**/assets/js/site-config.js", config)
        for n, color in [(1, "#5a3b22"), (2, "#2d3a4a"), (3, "#3e2d4a")]:
            page.route(f"**/assets/img/teste-{n}.svg",
                       lambda r, *_, n=n, color=color: r.fulfill(body=TEST_SVG.format(c=color, n=n), content_type="image/svg+xml"))
    page.goto(base)
    page.wait_for_load_state("networkidle")
    return ctx, page, errors


def test_layout(browser, base):
    print("\nLargura e rolagem horizontal")
    for w in WIDTHS:
        ctx, page, errors = new_page(browser, base, width=w)
        sw = page.evaluate("document.documentElement.scrollWidth")
        check(sw <= w, f"{w}px: sem rolagem horizontal (scrollWidth={sw})")
        check(not errors, f"{w}px: sem erros no console {errors if errors else ''}")
        ctx.close()


def test_default(browser, base, shots):
    print("\nDados atuais")
    ctx, page, _ = new_page(browser, base, permissions=["clipboard-read", "clipboard-write"])
    body = page.inner_text("body")

    check(page.locator('a[href*="wa.me"]').count() == 0, "nenhum link de WhatsApp enquanto o número não é cadastrado")
    check("R. Pastor Luís Laurentino da Silva, 957" in body, "endereço confirmado aparece")
    check("aberto agora" not in body.lower(), "não exibe 'aberto agora'")
    check("agendamento confirmado" not in body.lower(), "não exibe 'agendamento confirmado'")
    check("R$" not in body, "nenhum preço exibido")
    check(page.locator("iframe[title^='Mapa']").count() == 1, "mapa do endereço confirmado")
    check(page.get_by_role("link", name="Como chegar").get_attribute("href") == "https://maps.app.goo.gl/kbnvWGg5mPYj4y746",
          "'Como chegar' abre o perfil no Google Maps")
    check(page.locator("[data-google-link]").get_attribute("href") == "https://maps.app.goo.gl/kbnvWGg5mPYj4y746",
          "link 'Ver avaliações no Google'")
    names = page.locator(".testimonial-name").all_inner_texts()
    check(names == ["Marcos Cesar", "Jim Torres"], f"depoimentos reais com o nome exibido: {names}")
    check("“Melhor barbearia da cidade, qualidade e talento no atendimento.”" in body, "texto do depoimento preservado")
    check("Em breve" in page.inner_text("[data-info-list]"), "horários seguem pendentes, sem inventar")
    check(page.locator(".brand-logo").count() == 1 and page.locator(".footer-logo").count() == 1, "logo no cabeçalho e no rodapé")
    check("4,9" in body and "33 avaliações no Google" in body, "nota 4,9 e 33 avaliações exibidas")
    check("registrados em" in body, "nota identificada como registro, sem atualização ao vivo")
    check(page.locator('a[href="tel:+5531997803143"]').count() >= 1, "telefone com link tel:")
    check(page.locator('a[href="https://www.instagram.com/barber_club.oficial_/"]').count() >= 2, "links do Instagram")
    check(page.locator('a[href="https://linktr.ee/barber_club_123"]').count() >= 1, "link da bio")
    check(page.locator("h1").count() == 1, "um único h1")
    check(page.locator("[data-gallery=resultados] .gallery-btn").count() == 2, "galeria com as 2 fotos de cortes")
    check(page.locator("[data-gallery=espaco] .gallery-btn").count() == 2, "2 fotos extras em Nosso espaço")
    check(page.locator(".gallery-more a").get_attribute("href") == "https://www.instagram.com/barber_club.oficial_/",
          "galeria termina com link para o Instagram")
    alts = page.evaluate("[...document.querySelectorAll('.space-frame img')].map(i => i.alt)")
    check(len(alts) == 1 and alts[0], "foto do espaço com texto alternativo")

    # pular para o conteúdo
    page.keyboard.press("Tab")
    check(page.evaluate("document.activeElement.className") == "skip-link", "primeiro Tab foca 'Pular para o conteúdo'")

    # menu móvel
    toggle = page.locator("[data-menu-toggle]")
    check(page.locator("[data-nav]").is_hidden(), "menu fechado ao carregar")
    toggle.click()
    check(toggle.get_attribute("aria-expanded") == "true", "menu abre (aria-expanded=true)")
    check(page.locator("[data-nav]").is_visible(), "menu visível")
    if shots:
        page.screenshot(path=os.path.join(shots, "celular-menu-aberto.png"))
    page.keyboard.press("Escape")
    check(toggle.get_attribute("aria-expanded") == "false", "Esc fecha o menu")
    check(page.evaluate("document.activeElement.hasAttribute('data-menu-toggle')"), "foco volta ao botão do menu")
    toggle.click()
    page.locator("[data-nav]").get_by_role("link", name="Serviços").click()
    page.wait_for_timeout(700)
    check(toggle.get_attribute("aria-expanded") == "false", "clicar num link fecha o menu")
    check(page.url.endswith("#servicos"), "link 'Serviços' leva à seção")
    top = page.evaluate("document.getElementById('servicos').getBoundingClientRect().top")
    check(0 <= top < 120, f"seção Serviços visível abaixo do cabeçalho (top={top:.0f})")

    # serviço -> agendamento
    page.get_by_role("link", name="Consultar serviço: Barba").click()
    page.wait_for_timeout(700)
    check(page.locator("#servico").input_value() == "barba", "'Consultar serviço' seleciona Barba")
    check(page.evaluate("document.activeElement.id") == "servico", "foco vai para o campo de serviço")
    msg = page.inner_text("[data-message-preview]")
    check(msg == "Olá, Barber Club! Gostaria de consultar um horário para fazer a barba.", f"mensagem pronta: {msg}")
    page.select_option("#servico", "infantil")
    check("um corte infantil" in page.inner_text("[data-message-preview]"), "mensagem acompanha o serviço escolhido")

    page.get_by_role("button", name="Copiar mensagem").click()
    page.wait_for_timeout(200)
    check("copiada" in page.inner_text("[data-booking-status]"), "copiar mensagem confirma via aria-live")
    clip = page.evaluate("navigator.clipboard.readText()")
    check("corte infantil" in clip, "mensagem foi para a área de transferência")
    if shots:
        page.locator("#contato").screenshot(path=os.path.join(shots, "celular-agendamento.png"))

    # botão principal de agendamento
    page.evaluate("window.scrollTo(0, 0)")
    page.locator(".hero [data-agendar]").click()
    page.wait_for_timeout(700)
    check(page.url.endswith("#contato"), "'Agendar horário' leva ao contato")
    check(page.evaluate("document.activeElement.id") == "servico", "foco no campo de serviço após 'Agendar horário'")
    ctx.close()

    # desktop: botão do cabeçalho
    ctx, page, _ = new_page(browser, base, width=1440, height=900)
    check(page.locator("[data-menu-toggle]").is_hidden(), "desktop: botão de menu oculto")
    page.locator(".site-header [data-agendar]").click()
    page.wait_for_timeout(700)
    check(page.url.endswith("#contato"), "desktop: 'Agendar horário' do cabeçalho leva ao contato")
    ctx.close()


def test_pending(browser, base):
    print("\nDados não confirmados (simulação)")
    ctx, page, errors = new_page(browser, base, pending=True)
    body = page.inner_text("body")
    check("Laurentino" not in body, "endereço não confirmado não aparece")
    check(page.locator("iframe").count() == 0, "mapa não é carregado sem endereço confirmado")
    check(page.get_by_role("button", name="Como chegar").is_disabled(), "botão de rota desabilitado")
    check(page.locator("[data-google-link]").is_hidden(), "link do Google oculto sem URL cadastrada")
    check(page.locator("[data-testimonials]").is_hidden(), "sem depoimentos cadastrados, nada é inventado")
    check(page.locator(".gallery-empty").count() == 1, "sem fotos de cortes, aparece o aviso com link do Instagram")
    check(not errors, f"sem erros no console {errors if errors else ''}")
    ctx.close()


def test_sample(browser, base, shots):
    print("\nConfiguração de exemplo (WhatsApp, fotos, endereço)")
    ctx, page, errors = new_page(browser, base, sample=True)

    hero_cta = page.locator(".hero [data-agendar]")
    href = unquote(hero_cta.get_attribute("href"))
    check(href.startswith("https://wa.me/5522900000000?text="), f"WhatsApp com número normalizado: {href[:40]}")
    check("consultar um horário para um atendimento" in href, "mensagem genérica no botão principal")
    svc = unquote(page.get_by_role("link", name="Consultar serviço: Corte infantil (abre o WhatsApp)").get_attribute("href"))
    check("para um corte infantil." in svc, "mensagem do serviço no WhatsApp")
    check(page.get_by_role("link", name="Enviar pelo WhatsApp").count() == 1, "formulário oferece WhatsApp")
    check(page.get_by_role("link", name="Como chegar").count() == 1, "rota habilitada com destino confirmado")
    check(page.locator("iframe[title^='Mapa']").count() == 1, "mapa carregado com endereço confirmado")
    check(page.locator("[data-google-link]").is_visible(), "link do Google aparece quando cadastrado")
    check(page.locator(".testimonial").count() == 1, "depoimentos cadastrados aparecem")
    check("R$ 0,00" in page.inner_text("#servico-corte"), "preço aparece só quando cadastrado")
    check("R$" not in page.inner_text("#servico-barba"), "serviço sem preço não mostra campo vazio")

    # galeria por teclado
    loaded = page.evaluate("[...document.querySelectorAll('.gallery-btn img')].every(i => i.complete && i.naturalWidth > 0)")
    check(loaded, "fotos da galeria carregam")
    first = page.get_by_role("button", name="Ampliar foto: Foto de teste 1")
    first.focus()
    page.keyboard.press("Enter")
    dialog = page.locator("[data-lightbox]")
    expect(dialog).to_be_visible()
    check(True, "Enter abre a foto ampliada")
    check(page.evaluate("document.activeElement.hasAttribute('data-lightbox-close')"), "foco vai para 'Fechar foto'")
    check(page.inner_text("[data-lightbox-count]") == "1 de 3", "contador 1 de 3")
    page.keyboard.press("ArrowRight")
    check(page.inner_text("[data-lightbox-count]") == "2 de 3", "seta direita avança")
    page.keyboard.press("ArrowLeft")
    page.keyboard.press("ArrowLeft")
    check(page.inner_text("[data-lightbox-count]") == "3 de 3", "seta esquerda volta (com ciclo)")
    check(page.get_attribute("[data-lightbox-img]", "alt") == "Foto de teste 3", "imagem ampliada tem texto alternativo")
    page.wait_for_function("document.querySelector('[data-lightbox-img]').naturalWidth > 0")
    check(True, "foto ampliada carrega")
    inside = []
    for key in ["Tab", "Tab", "Tab", "Tab", "Shift+Tab", "Shift+Tab"]:
        page.keyboard.press(key)
        inside.append(page.evaluate("document.querySelector('[data-lightbox]').contains(document.activeElement)"))
    check(all(inside), "Tab e Shift+Tab ficam dentro da foto ampliada")
    if shots:
        page.screenshot(path=os.path.join(shots, "teste-foto-ampliada.png"))
    page.keyboard.press("Escape")
    expect(dialog).to_be_hidden()
    check(True, "Esc fecha a foto ampliada")
    check(page.evaluate("document.activeElement.getAttribute('aria-label')") == "Ampliar foto: Foto de teste 1",
          "foco volta para a foto que abriu")

    # fechar pelo botão e pelo fundo
    page.get_by_role("button", name="Ampliar foto: Foto de teste 2").click()
    page.get_by_role("button", name="Fechar foto").click()
    expect(dialog).to_be_hidden()
    check(True, "botão 'Fechar foto' fecha")
    page.get_by_role("button", name="Ampliar foto: Foto de teste 2").click()
    page.mouse.click(5, 400)
    expect(dialog).to_be_hidden()
    check(True, "tocar fora da foto fecha")
    try:
        page.wait_for_function("!document.documentElement.classList.contains('is-locked')", timeout=2000)
        unlocked = True
    except Exception:
        unlocked = False
    check(unlocked, "rolagem liberada após fechar")
    check(not errors, f"sem erros no console {errors if errors else ''}")
    ctx.close()


def test_intro(browser, base, shots):
    print("\nTela de entrada")
    ctx, page, errors = new_page(browser, base, intro=True)
    intro = page.locator("[data-intro]")
    check(intro.is_visible(), "aparece na primeira abertura")
    txt = intro.inner_text().lower()
    check("barber club" in txt and "entrar" in txt, "mostra o nome e o botão Entrar")
    check(page.evaluate("document.activeElement.hasAttribute('data-intro-enter')"), "foco no botão Entrar")
    check(page.evaluate("document.querySelector('main').inert"), "conteúdo por trás fica inativo")
    page.keyboard.press("Tab")
    check(page.evaluate("document.activeElement.hasAttribute('data-intro-enter')"), "Tab não sai da tela de entrada")
    if shots:
        page.wait_for_timeout(1200)
        page.screenshot(path=os.path.join(shots, "celular-entrada.png"))
    page.keyboard.press("Enter")
    page.wait_for_selector("[data-intro]", state="detached", timeout=3000)
    check(True, "Entrar fecha a tela de entrada")
    check(not page.evaluate("document.querySelector('main').inert"), "conteúdo volta a ficar ativo")
    check(page.evaluate("getComputedStyle(document.documentElement).overflow") != "hidden", "rolagem liberada")
    page.reload()
    page.wait_for_load_state("networkidle")
    check(page.locator("[data-intro]").count() == 0, "não reaparece na mesma visita")
    check(not errors, f"sem erros no console {errors if errors else ''}")
    ctx.close()

    ctx, page, errors = new_page(browser, base, intro=True)
    page.wait_for_function("(v => v && !v.paused && v.currentTime > 0)(document.querySelector('[data-intro-video]'))", timeout=8000)
    check(True, "poste em vídeo tocando na entrada")
    check(page.evaluate("document.querySelector('[data-intro-video]').loop"), "vídeo em loop")
    check(page.evaluate("document.querySelector('[data-intro-video]').muted"), "vídeo sem som")
    check(not errors, f"sem erros no console {errors if errors else ''}")
    ctx.close()

    # navegador que não deixa vídeo tocar sozinho (como o de alguns apps)
    ctx = browser.new_context(viewport={"width": 390, "height": 844})
    ctx.add_init_script("HTMLMediaElement.prototype.play = function () { return Promise.reject(new DOMException('bloqueado', 'NotAllowedError')); };")
    page = ctx.new_page()
    page.goto(base)
    page.wait_for_function("(i => i && i.tagName === 'IMG' && i.complete && i.naturalWidth > 0)(document.querySelector('.intro-video'))", timeout=8000)
    check(page.evaluate("document.querySelector('.intro-video').src.endsWith('poste-anim.webp')"),
          "sem vídeo automático, o poste gira como imagem animada")
    check(page.locator("video").count() == 0, "o vídeo parado sai de cena")
    ctx.close()

    ctx, page, _ = new_page(browser, base, intro=True)
    page.keyboard.press("Escape")
    page.wait_for_selector("[data-intro]", state="detached", timeout=3000)
    check(True, "Esc também entra no site")
    ctx.close()

    ctx = browser.new_context(viewport={"width": 390, "height": 844})
    page = ctx.new_page()
    page.goto(base + "#contato")
    page.wait_for_load_state("networkidle")
    check(page.locator("[data-intro]").count() == 0, "link direto para uma seção pula a entrada")
    ctx.close()

    ctx, page, _ = new_page(browser, base, intro=True, reduced_motion="reduce")
    page.wait_for_function("(v => v && (v.tagName === 'IMG' || (!v.paused && v.currentTime > 0)))(document.querySelector('.intro-video'))", timeout=8000)
    check(True, "poste gira também com movimento reduzido (movimento pequeno, no lugar)")
    page.click("[data-intro-enter]")
    check(page.evaluate("getComputedStyle(document.querySelector('[data-intro]')).transform") == "none",
          "com movimento reduzido, a entrada esmaece em vez de subir")
    page.wait_for_selector("[data-intro]", state="detached", timeout=3000)
    check(True, "e some em seguida")
    ctx.close()


def test_reduced_motion(browser, base):
    print("\nMovimento reduzido")
    ctx, page, _ = new_page(browser, base, reduced_motion="reduce")
    dur = page.evaluate("getComputedStyle(document.querySelector('.hero-title .line-inner')).animationName")
    check(dur == "none", f"sem animação de entrada com movimento reduzido (animation-name={dur})")
    check(page.evaluate("document.documentElement.classList.contains('motion-calm')"), "modo calmo ativo")
    moved = page.evaluate("[...document.querySelectorAll('[data-reveal]')].filter(n => getComputedStyle(n).transform !== 'none').length")
    check(moved == 0, f"nada desliza ao aparecer, só esmaece ({moved} com deslocamento)")
    check(page.evaluate("getComputedStyle(document.querySelector('.marquee-track')).animationName") == "none", "faixa rolando parada")
    page.evaluate("window.scrollTo(0, 400)")
    page.wait_for_timeout(300)
    check(page.evaluate("document.querySelector('.hero-media').style.transform") == "", "sem parallax")
    page.locator("#resultados").scroll_into_view_if_needed()
    page.wait_for_timeout(1500)
    check(page.locator("[data-gallery=resultados] .gallery-item.is-revealed").count() >= 2, "fotos aparecem (esmaecendo) ao rolar")
    sb = page.evaluate("getComputedStyle(document.documentElement).scrollBehavior")
    check(sb == "auto", "rolagem suave desligada")
    ctx.close()
    ctx, page, _ = new_page(browser, base)
    name = page.evaluate("getComputedStyle(document.querySelector('.hero-title .line-inner')).animationName")
    check(name == "line-up", "título sobe linha por linha quando o movimento é permitido")
    check(page.evaluate("document.documentElement.classList.contains('motion')"), "efeitos de rolagem ativos")
    page.locator("#resultados").scroll_into_view_if_needed()
    page.wait_for_timeout(1600)
    check(page.locator("[data-gallery=resultados] .gallery-item.is-revealed").count() >= 2, "fotos aparecem ao rolar até a galeria")
    ctx.close()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--shots", help="pasta para salvar capturas de tela")
    args = ap.parse_args()
    if args.shots:
        os.makedirs(args.shots, exist_ok=True)
    httpd, base = start_server()
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        test_layout(browser, base)
        test_intro(browser, base, args.shots)
        test_default(browser, base, args.shots)
        test_pending(browser, base)
        test_sample(browser, base, args.shots)
        test_reduced_motion(browser, base)
        browser.close()
    httpd.shutdown()
    print(f"\n{len(FAILURES)} falha(s)" if FAILURES else "\nTodos os testes passaram.")
    sys.exit(1 if FAILURES else 0)


if __name__ == "__main__":
    main()
