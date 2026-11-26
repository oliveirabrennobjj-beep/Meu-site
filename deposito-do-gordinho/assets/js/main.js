/* Depósito do Gordinho: monta as partes que vêm do config.js e cuida dos movimentos */
(function () {
  "use strict";
  var S = window.SITE;
  if (!S) return;

  var reduz = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var IMG = "assets/img/produtos/";

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function linkZap(msg) { return "https://wa.me/" + S.whatsapp + "?text=" + encodeURIComponent(msg || S.mensagemWhatsApp); }
  function msgProduto(p) { return "Olá, Depósito do Gordinho! Quero pedir: " + p.nome + " (" + p.tamanho + "). Meu endereço é: "; }
  function produto(id) { return S.produtos.filter(function (p) { return p.img === id; })[0]; }
  function daCat(id) { return S.produtos.filter(function (p) { return p.cat === id; }); }

  /* ---------- links e dados fixos ---------- */
  $$("[data-zap]").forEach(function (a) { a.href = linkZap(); a.target = "_blank"; a.rel = "noopener"; });
  $$("[data-tel]").forEach(function (a) { a.href = "tel:" + S.telefoneLink; });
  $$("[data-insta]").forEach(function (a) { a.href = S.instagram; a.target = "_blank"; a.rel = "noopener"; });
  $$("[data-mapa]").forEach(function (a) { a.href = S.mapaUrl; a.target = "_blank"; a.rel = "noopener"; });
  $$("[data-avaliacoes-link]").forEach(function (a) { a.href = S.avaliacoesUrl; a.target = "_blank"; a.rel = "noopener"; });

  var horas = $("[data-horario]");
  if (horas) horas.innerHTML = S.horario.map(function (h) { return "<div class=\"hora\"><dt>" + esc(h.dias) + "</dt><dd>" + esc(h.horas) + "</dd></div>"; }).join("");
  var pag = $("[data-pagamento]");
  if (pag) pag.innerHTML = S.pagamento.map(function (p) { return "<li>" + esc(p) + "</li>"; }).join("");

  /* ---------- avaliações em faixa que corre ---------- */
  var revs = $("[data-avaliacoes]");
  if (revs) {
    var cartoes = S.avaliacoes.map(function (r) {
      return "<figure class=\"aval\"><div class=\"aval-estrelas\" aria-hidden=\"true\">★★★★★</div>" +
        "<blockquote>" + esc(r.texto) + "</blockquote><figcaption>" + esc(r.nome) + "</figcaption></figure>";
    }).join("");
    revs.innerHTML = "<div class=\"faixa-trilho\">" + cartoes + "</div>" +
      (reduz ? "" : "<div class=\"faixa-trilho\" aria-hidden=\"true\">" + cartoes + "</div>");
  }

  /* ---------- círculos de categoria ---------- */
  var circ = $("[data-circulos]");
  if (circ) {
    circ.innerHTML = S.categorias.map(function (c) {
      return "<li><button type=\"button\" class=\"circ\" data-ir-cat=\"" + c.id + "\">" +
        "<span class=\"circ-bola\"><img src=\"" + IMG + c.capa + ".webp\" alt=\"\" loading=\"lazy\"></span>" +
        "<span class=\"circ-nome\">" + esc(c.nome) + "</span><span class=\"circ-n\">" + daCat(c.id).length + " itens</span></button></li>";
    }).join("");
  }

  /* ---------- vitrine que passa para o lado ---------- */
  var vit = $("[data-vitrine]");
  var escolherCat = function () {};
  if (vit) {
    var abas = $("[data-abas]", vit);
    var palco = $("[data-palco]", vit);
    var nomeEl = $("[data-prod-nome]", vit);
    var tamEl = $("[data-prod-tam]", vit);
    var precoEl = $("[data-prod-preco]", vit);
    var contEl = $("[data-prod-cont]", vit);
    var pedir = $("[data-prod-pedir]", vit);
    var antes = $("[data-ant]", vit);
    var depois = $("[data-prox]", vit);
    var pontos = $("[data-pontos]", vit);
    var catAtual = S.categorias[0].id;
    var pos = 0;        // posição animada (pode ser fracionada)
    var alvo = 0;       // posição desejada
    var itens = [];
    var raf = 0;

    abas.innerHTML = "<span class=\"aba-marca\" aria-hidden=\"true\"></span>" + S.categorias.map(function (c, i) {
      return "<button type=\"button\" role=\"tab\" class=\"aba\" aria-controls=\"palco\" aria-selected=\"" + (i === 0) + "\" data-cat=\"" + c.id + "\">" +
        "<img src=\"" + IMG + c.capa + ".webp\" alt=\"\" width=\"40\" height=\"40\" loading=\"lazy\">" +
        "<span class=\"aba-nome\">" + esc(c.nome) + "</span><span class=\"aba-n\">" + daCat(c.id).length + "</span></button>";
    }).join("");
    var marca = $(".aba-marca", abas);

    function moverMarca() {
      var b = $(".aba[aria-selected=\"true\"]", abas);
      if (!b) return;
      marca.style.transform = "translate(" + b.offsetLeft + "px," + b.offsetTop + "px)";
      marca.style.width = b.offsetWidth + "px";
      marca.style.height = b.offsetHeight + "px";
    }

    function lista() { return daCat(catAtual); }

    function montar() {
      var ps = lista();
      palco.classList.remove("entra");
      palco.innerHTML = ps.map(function (p, i) {
        var h = Math.min(100, p.cm / 33 * 100);
        return "<button type=\"button\" class=\"prod\" data-i=\"" + i + "\" tabindex=\"-1\" aria-label=\"" + esc(p.nome + ", " + p.tamanho) + "\" style=\"--h:" + h.toFixed(1) + ";--d:" + (i * 60) + "ms\">" +
          "<img src=\"" + IMG + p.img + ".webp\" alt=\"\" draggable=\"false\" loading=\"" + (i < 4 ? "eager" : "lazy") + "\">" +
          "</button>";
      }).join("") + "<span class=\"chao\" aria-hidden=\"true\"></span>";
      itens = $$(".prod", palco);
      itens.forEach(function (el) {
        el.addEventListener("click", function () {
          if (arrastou) return;
          ir(Number(el.getAttribute("data-i")));
        });
      });
      pontos.innerHTML = ps.map(function (p, i) {
        return "<button type=\"button\" class=\"ponto\" data-p=\"" + i + "\" aria-label=\"Ver " + esc(p.nome) + "\"></button>";
      }).join("");
      pos = alvo = 0;
      void palco.offsetWidth;
      palco.classList.add("entra");
      desenhar();
      texto();
    }

    function desenhar() {
      var w = palco.clientWidth;
      var cel = w < 560;
      var passo = cel ? w * 0.36 : Math.min(230, w * 0.2);
      itens.forEach(function (el, i) {
        var r = i - pos;
        var a = Math.abs(r);
        var s = r < 0 ? -1 : 1;
        var x = s * (a < 1 ? a * passo * 1.15 : passo * 1.15 + (a - 1) * passo * 0.78);
        var z = -Math.min(a, 1) * 140 - Math.max(0, a - 1) * 90;
        var rot = -s * Math.min(30, a * 22);
        var esc2 = 1 - Math.min(a, 1) * 0.22 - Math.max(0, a - 1) * 0.06;
        el.style.transform = "translate3d(" + x.toFixed(1) + "px,0," + z.toFixed(0) + "px) rotateY(" + rot.toFixed(1) + "deg) scale(" + esc2.toFixed(3) + ")";
        el.style.opacity = a > 3.2 ? "0" : String(Math.max(0.25, 1 - a * 0.28).toFixed(2));
        el.style.zIndex = String(100 - Math.round(a * 10));
        el.style.filter = a < 0.5 ? "none" : "saturate(" + Math.max(0.55, 1 - a * 0.2).toFixed(2) + ") brightness(" + Math.max(0.8, 1 - a * 0.06).toFixed(2) + ")";
        el.classList.toggle("ativa", a < 0.5);
      });
    }

    function texto() {
      var ps = lista();
      var i = Math.round(alvo);
      var p = ps[i];
      if (!p) return;
      var painel = nomeEl.parentNode;
      painel.classList.remove("troca");
      void painel.offsetWidth;
      painel.classList.add("troca");
      nomeEl.textContent = p.nome;
      tamEl.textContent = p.tamanho;
      precoEl.textContent = p.preco ? p.preco : "Preço no WhatsApp";
      contEl.textContent = (i + 1) + " de " + ps.length;
      pedir.href = linkZap(msgProduto(p));
      pedir.target = "_blank";
      pedir.rel = "noopener";
      antes.disabled = i === 0;
      depois.disabled = i === ps.length - 1;
      $$(".ponto", pontos).forEach(function (b, k) { b.setAttribute("aria-current", String(k === i)); });
      itens.forEach(function (el, k) { el.setAttribute("aria-current", String(k === i)); });
    }

    function animar() {
      var d = alvo - pos;
      if (Math.abs(d) < 0.002 || reduz) { pos = alvo; desenhar(); raf = 0; return; }
      pos += d * 0.16;
      desenhar();
      raf = requestAnimationFrame(animar);
    }
    function mexer() { if (!raf) raf = requestAnimationFrame(animar); }

    function ir(i) {
      var n = lista().length;
      var novo = Math.max(0, Math.min(n - 1, i));
      var mudou = novo !== Math.round(alvo);
      alvo = novo;
      mexer();
      if (mudou) {
        texto();
        var at = itens[novo];
        if (at && !reduz) { at.classList.remove("balanca"); void at.offsetWidth; at.classList.add("balanca"); }
      }
    }

    escolherCat = function (id) {
      var b = $(".aba[data-cat=\"" + id + "\"]", abas);
      if (!b) return;
      catAtual = id;
      $$(".aba", abas).forEach(function (x) { x.setAttribute("aria-selected", String(x === b)); });
      moverMarca();
      montar();
    };

    antes.addEventListener("click", function () { ir(Math.round(alvo) - 1); });
    depois.addEventListener("click", function () { ir(Math.round(alvo) + 1); });
    pontos.addEventListener("click", function (e) { var b = e.target.closest("[data-p]"); if (b) ir(Number(b.getAttribute("data-p"))); });
    abas.addEventListener("click", function (e) { var b = e.target.closest("[data-cat]"); if (b) escolherCat(b.getAttribute("data-cat")); });
    abas.addEventListener("keydown", function (e) {
      var mais = e.key === "ArrowDown" || e.key === "ArrowRight";
      if (!mais && e.key !== "ArrowUp" && e.key !== "ArrowLeft") return;
      e.preventDefault();
      var bs = $$(".aba", abas);
      var i = bs.indexOf(document.activeElement);
      if (i < 0) return;
      var n = bs[(i + (mais ? 1 : -1) + bs.length) % bs.length];
      n.focus();
      n.click();
    });
    palco.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); ir(Math.round(alvo) + 1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); ir(Math.round(alvo) - 1); }
    });

    // arrastar: a vitrine acompanha o dedo
    var x0 = null, p0 = 0, arrastou = false, ultimoX = 0, ultimoT = 0, vel = 0;
    palco.addEventListener("pointerdown", function (e) {
      x0 = e.clientX; p0 = alvo; arrastou = false; ultimoX = e.clientX; ultimoT = performance.now(); vel = 0;
    });
    palco.addEventListener("pointermove", function (e) {
      if (x0 === null) return;
      var dx = e.clientX - x0;
      if (!arrastou && Math.abs(dx) > 8) { arrastou = true; try { palco.setPointerCapture(e.pointerId); } catch (er) { /* */ } }
      if (!arrastou) return;
      var w = palco.clientWidth;
      var passo = w < 560 ? w * 0.36 : Math.min(230, w * 0.2);
      var agora = performance.now();
      vel = (e.clientX - ultimoX) / Math.max(1, agora - ultimoT);
      ultimoX = e.clientX; ultimoT = agora;
      pos = Math.max(-0.4, Math.min(lista().length - 0.6, p0 - dx / passo));
      alvo = pos;
      desenhar();
    });
    function soltar() {
      if (x0 === null) return;
      x0 = null;
      if (arrastou) {
        var jogo = Math.abs(vel) > 0.5 ? -Math.sign(vel) * 0.6 : 0;
        ir(Math.round(pos + jogo));
        texto();
      }
      setTimeout(function () { arrastou = false; }, 0);
    }
    palco.addEventListener("pointerup", soltar);
    palco.addEventListener("pointercancel", soltar);

    var rt;
    window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(function () { desenhar(); moverMarca(); }, 80); });
    montar();
    requestAnimationFrame(moverMarca);
    window.addEventListener("load", moverMarca);
  }

  // círculos levam até a vitrine e já abrem a categoria
  $$("[data-ir-cat]").forEach(function (b) {
    b.addEventListener("click", function () {
      escolherCat(b.getAttribute("data-ir-cat"));
      var alvoEl = document.getElementById("vitrine");
      if (alvoEl) alvoEl.scrollIntoView({ behavior: reduz ? "auto" : "smooth", block: "start" });
    });
  });

  /* ---------- grade de todos os produtos com filtro ---------- */
  var grade = $("[data-grade]");
  var filtros = $("[data-filtros]");
  if (grade && filtros) {
    var cats = [{ id: "todos", nome: "Tudo" }].concat(S.categorias);
    filtros.innerHTML = cats.map(function (c, i) {
      return "<button type=\"button\" class=\"chip\" aria-pressed=\"" + (i === 0) + "\" data-filtro=\"" + c.id + "\">" + esc(c.nome) + "</button>";
    }).join("");
    grade.innerHTML = S.produtos.map(function (p, i) {
      return "<li class=\"card\" data-cat=\"" + p.cat + "\" style=\"--d:" + ((i % 4) * 70) + "ms\">" +
        "<div class=\"card-foto\"><img src=\"" + IMG + p.img + ".webp\" alt=\"" + esc(p.nome) + "\" loading=\"lazy\" style=\"height:" + Math.max(48, Math.min(80, p.cm / 31 * 80)).toFixed(0) + "%\"></div>" +
        "<h3>" + esc(p.nome) + "</h3><p class=\"card-tam\">" + esc(p.tamanho) + "</p>" +
        "<p class=\"card-preco\">" + esc(p.preco || "Preço no WhatsApp") + "</p>" +
        "<a class=\"btn btn-zap btn-card\" target=\"_blank\" rel=\"noopener\" href=\"" + linkZap(msgProduto(p)) + "\">Pedir</a></li>";
    }).join("");
    filtros.addEventListener("click", function (e) {
      var b = e.target.closest("[data-filtro]");
      if (!b) return;
      var f = b.getAttribute("data-filtro");
      $$(".chip", filtros).forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
      $$(".card", grade).forEach(function (c, k) {
        var mostra = f === "todos" || c.getAttribute("data-cat") === f;
        c.hidden = !mostra;
        if (mostra && !reduz) { c.classList.remove("pula"); void c.offsetWidth; c.style.setProperty("--d", (k % 4) * 50 + "ms"); c.classList.add("pula"); }
      });
    });
  }

  /* ---------- garrafas do topo seguem o mouse ---------- */
  var trio = $("[data-trio]");
  if (trio && !reduz && window.matchMedia("(pointer: fine)").matches) {
    var hero = trio.closest(".hero");
    hero.addEventListener("pointermove", function (e) {
      var r = hero.getBoundingClientRect();
      var mx = (e.clientX - r.left) / r.width - 0.5;
      var my = (e.clientY - r.top) / r.height - 0.5;
      trio.style.setProperty("--mx", mx.toFixed(3));
      trio.style.setProperty("--my", my.toFixed(3));
    });
    hero.addEventListener("pointerleave", function () { trio.style.setProperty("--mx", 0); trio.style.setProperty("--my", 0); });
  }

  /* ---------- nota do Google contando ---------- */
  var nota = $("[data-conta]");
  function contar() {
    if (!nota || nota.dataset.feito) return;
    nota.dataset.feito = "1";
    var fim = parseFloat(String(S.notaGoogle).replace(",", "."));
    if (reduz) { nota.textContent = S.notaGoogle; return; }
    var t0 = performance.now();
    (function passo(t) {
      var k = Math.min(1, (t - t0) / 1200);
      var v = fim * (1 - Math.pow(1 - k, 3));
      nota.textContent = v.toFixed(1).replace(".", ",");
      if (k < 1) requestAnimationFrame(passo);
    })(t0);
  }

  /* ---------- coisas aparecem ao rolar ---------- */
  var vistos = $$("[data-aparece]");
  if ("IntersectionObserver" in window && !reduz) {
    document.documentElement.classList.add("anima");
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add("visto");
        if (en.target.querySelector("[data-conta]")) contar();
        io.unobserve(en.target);
      });
    }, { threshold: 0.01, rootMargin: "0px 0px -8% 0px" });
    vistos.forEach(function (el) { io.observe(el); });
  } else {
    vistos.forEach(function (el) { el.classList.add("visto"); });
    contar();
  }

  /* ---------- topo muda ao rolar ---------- */
  var topo = $(".topo");
  var ultimo = 0;
  window.addEventListener("scroll", function () {
    var y = window.scrollY;
    if (topo) topo.classList.toggle("rolou", y > 40);
    ultimo = y;
  }, { passive: true });

  $$("[data-ano]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
