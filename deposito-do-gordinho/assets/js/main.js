/* Depósito do Gordinho: busca, categorias, carrossel, aberto/fechado e modo prévia */
(function () {
  "use strict";
  var L = window.LOJA || {};
  var M = window.MODELOS;
  var reduz = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function $(sel, r) { return (r || document).querySelector(sel); }
  function $$(sel, r) { return Array.prototype.slice.call((r || document).querySelectorAll(sel)); }

  /* ---------- 1. lista de produtos sempre igual ao produtos.js ---------- */
  var lista = $("[data-produtos]");
  if (M && window.PRODUTOS && lista) {
    lista.innerHTML = window.PRODUTOS.map(function (p) { return M.card(p, L.whatsapp); }).join("");
    var cats = $("[data-categorias]");
    if (cats && window.CATEGORIAS) {
      cats.innerHTML = window.CATEGORIAS.map(function (c) {
        return M.circulo(c, window.PRODUTOS.filter(function (p) { return p.categoria === c.id; }).length);
      }).join("");
    }
    var combos = $("[data-combos]");
    if (combos && window.COMBOS) combos.innerHTML = window.COMBOS.map(function (c) { return M.combo(c, L.whatsapp); }).join("");
  }

  /* ---------- mensagens prontas nos botões gerais ---------- */
  $$("[data-zap]").forEach(function (a) {
    var msg = a.getAttribute("data-msg") || L.mensagemWhatsApp;
    if (M && L.whatsapp) a.href = M.zap(L.whatsapp, msg);
  });

  /* ---------- 2. aberto agora / fechado (horário de Brasília) ---------- */
  var DIAS = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
  function agoraBrasilia() {
    var p = new Intl.DateTimeFormat("en-US", { timeZone: "America/Sao_Paulo", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
    var o = {};
    p.forEach(function (x) { o[x.type] = x.value; });
    var dia = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(o.weekday);
    return { dia: dia, h: (parseInt(o.hour, 10) % 24) + parseInt(o.minute, 10) / 60 };
  }
  function status() {
    var el = $("[data-status]");
    if (!el || !L.horario) return;
    var a = agoraBrasilia();
    var hoje = L.horario[a.dia];
    var aberto = !!(hoje && a.h >= hoje[0] && a.h < hoje[1]);
    var txt;
    if (aberto) txt = "Aberto agora, até as " + hoje[1] + "h";
    else if (hoje && a.h < hoje[0]) txt = "Fechado. Abre hoje às " + hoje[0] + "h";
    else {
      for (var k = 1; k <= 7; k++) {
        var d = (a.dia + k) % 7;
        if (L.horario[d]) { txt = "Fechado. Abre " + (k === 1 ? "amanhã" : DIAS[d]) + " às " + L.horario[d][0] + "h"; break; }
      }
    }
    el.classList.toggle("aberto", aberto);
    el.classList.toggle("fechado", !aberto);
    $("[data-status-txt]", el).textContent = txt;
    $$("[data-horas] tr").forEach(function (tr) { tr.classList.toggle("hoje", Number(tr.getAttribute("data-dia")) === a.dia); });
  }
  status();
  setInterval(status, 60000);

  /* ---------- 3. busca e categorias ---------- */
  var titulo = $("[data-vitrine-titulo]");
  var limpar = $("[data-limpar]");
  var vazio = $("[data-vazio]");
  var campo = $("[data-busca]");
  var secao = document.getElementById("mais-pedidos");

  function mostrar(filtro, rotulo) {
    var achou = 0;
    $$(".produto", lista).forEach(function (li) {
      var ok = filtro(li);
      li.hidden = !ok;
      if (ok) achou++;
    });
    titulo.textContent = rotulo;
    limpar.hidden = rotulo === "Mais pedidos";
    vazio.hidden = achou > 0;
  }
  function maisPedidos() {
    mostrar(function (li) { return li.hasAttribute("data-destaque"); }, "Mais pedidos");
    $$("[data-cat].cat").forEach(function (a) { a.removeAttribute("aria-current"); });
  }
  function porCategoria(id) {
    var c = (window.CATEGORIAS || []).filter(function (x) { return x.id === id; })[0];
    if (!c) return;
    if (campo) campo.value = "";
    mostrar(function (li) { return li.getAttribute("data-cat") === id; }, c.nome);
    $$(".cat").forEach(function (a) { a.setAttribute("aria-current", String(a.getAttribute("data-cat") === id)); });
  }
  function buscar(q) {
    var t = M.semAcento(q.trim());
    if (!t) { maisPedidos(); return; }
    var palavras = t.split(/\s+/);
    mostrar(function (li) {
      var b = li.getAttribute("data-busca");
      return palavras.every(function (w) { return b.indexOf(w) > -1; });
    }, "Busca: " + q.trim());
    var perg = $("[data-msg-busca]");
    if (perg) perg.href = M.zap(L.whatsapp, "Olá, Depósito do Gordinho! Vocês têm " + q.trim() + "?");
  }

  document.addEventListener("click", function (e) {
    var a = e.target.closest("[data-cat]");
    if (!a || a.matches("li")) return;
    e.preventDefault();
    porCategoria(a.getAttribute("data-cat"));
    secao.scrollIntoView({ behavior: reduz ? "auto" : "smooth" });
  });
  if (limpar) limpar.addEventListener("click", function () { if (campo) campo.value = ""; maisPedidos(); });
  if (campo) {
    var tb;
    campo.addEventListener("input", function () {
      clearTimeout(tb);
      tb = setTimeout(function () { buscar(campo.value); }, 150);
    });
    $("[data-busca-form]").addEventListener("submit", function (e) {
      e.preventDefault();
      buscar(campo.value);
      campo.blur();
      secao.scrollIntoView({ behavior: reduz ? "auto" : "smooth" });
    });
  }

  /* ---------- 4. carrossel do banner ---------- */
  var trilho = $("[data-banner]");
  var ctr = $("[data-banner-controles]");
  if (trilho && ctr) {
    var slides = $$(".slide", trilho);
    var pontos = $("[data-banner-pontos]");
    ctr.hidden = false;
    pontos.innerHTML = slides.map(function (s, i) {
      return "<button type=\"button\" class=\"ponto\" aria-label=\"Destaque " + (i + 1) + "\"></button>";
    }).join("");
    var bolas = $$(".ponto", pontos);
    var atual = 0;
    function marcar() {
      var i = Math.round(trilho.scrollLeft / trilho.clientWidth);
      atual = Math.max(0, Math.min(slides.length - 1, i));
      bolas.forEach(function (b, k) { b.setAttribute("aria-current", String(k === atual)); });
    }
    function ir(i) {
      var n = (i + slides.length) % slides.length;
      trilho.scrollTo({ left: n * trilho.clientWidth, behavior: reduz ? "auto" : "smooth" });
    }
    bolas.forEach(function (b, k) { b.addEventListener("click", function () { parar(); ir(k); }); });
    $("[data-banner-ant]").addEventListener("click", function () { parar(); ir(atual - 1); });
    $("[data-banner-prox]").addEventListener("click", function () { parar(); ir(atual + 1); });
    var tm;
    trilho.addEventListener("scroll", function () { clearTimeout(tm); tm = setTimeout(marcar, 60); }, { passive: true });
    marcar();
    // passa sozinho a cada 7 s; para de vez quando a pessoa mexe
    var auto = reduz ? null : setInterval(function () {
      if (document.hidden) return;
      ir(atual + 1);
    }, 7000);
    function parar() { if (auto) { clearInterval(auto); auto = null; } }
    ["pointerdown", "touchstart", "keydown", "wheel"].forEach(function (ev) { trilho.addEventListener(ev, parar, { passive: true }); });
  }

  /* ---------- 5. aparecer ao rolar (leve; sem JS tudo já aparece) ---------- */
  if ("IntersectionObserver" in window && !reduz) {
    var alvos = $$(".titulo, .cats > li, .produto, .combo, .promo, .aval, .loja-fotos > *");
    document.documentElement.classList.add("anima");
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("visto"); io.unobserve(en.target); }
      });
    }, { threshold: 0.01, rootMargin: "0px 0px -5% 0px" });
    alvos.forEach(function (el) { io.observe(el); });
    // garantia: nada fica escondido se o observador falhar
    setTimeout(function () { alvos.forEach(function (el) { el.classList.add("visto"); }); }, 4000);
  }

  /* ---------- 6. modo prévia: nada chega no WhatsApp nem no telefone do dono ---------- */
  if (L.previa) {
    var aviso = $("[data-aviso-previa]");
    var ta;
    document.addEventListener("click", function (e) {
      var a = e.target.closest("a[href*='wa.me'], a[href^='tel:']");
      if (!a) return;
      e.preventDefault();
      aviso.textContent = "Prévia do site: quando estiver no ar, este botão abre o WhatsApp do depósito.";
      aviso.classList.add("mostra");
      clearTimeout(ta);
      ta = setTimeout(function () { aviso.classList.remove("mostra"); }, 3200);
    }, true);
  }
})();
