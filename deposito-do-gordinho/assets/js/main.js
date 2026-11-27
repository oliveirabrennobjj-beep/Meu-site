/* Depósito do Gordinho: busca, categorias, menu, aberto/fechado e modo prévia */
(function () {
  "use strict";
  var L = window.LOJA || {};
  var M = window.MODELOS;
  var reduz = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function $(sel, r) { return (r || document).querySelector(sel); }
  function $$(sel, r) { return Array.prototype.slice.call((r || document).querySelectorAll(sel)); }
  function contar(id) { return (window.PRODUTOS || []).filter(function (p) { return p.categoria === id; }).length; }

  /* ---------- lista sempre igual ao produtos.js ---------- */
  var lista = $("[data-produtos]");
  if (M && window.PRODUTOS && lista) {
    lista.innerHTML = window.PRODUTOS.map(function (p) { return M.card(p, L.whatsapp); }).join("");
    var cats = $("[data-categorias]");
    if (cats && window.CATEGORIAS) cats.innerHTML = window.CATEGORIAS.map(function (c) { return M.circulo(c, contar(c.id)); }).join("");
    var linhas = $("[data-linhas]");
    if (linhas && window.CATEGORIAS) linhas.innerHTML = window.CATEGORIAS.map(function (c) { return M.linhaCategoria(c, contar(c.id)); }).join("");
  }

  /* ---------- produtos esgotados (marcados no painel do dono) ---------- */
  // Hoje: campo disponivel:false no produtos.js ou o painel de prévia (salvo neste aparelho).
  // Quando o painel for ligado à internet, o estoque passa a vir de lá para todos.
  function estoque() {
    var o = {};
    try { o = JSON.parse(localStorage.getItem("gordinho-estoque")) || {}; } catch (e) { o = {}; }
    (window.PRODUTOS || []).forEach(function (p) { if (p.disponivel === false && !(M.idDe(p) in o)) o[M.idDe(p)] = false; });
    return o;
  }
  function marcarEsgotados() {
    var est = estoque();
    $$(".produto").forEach(function (li) {
      var a = li.querySelector("[data-add]");
      if (!a) return;
      var acabou = est[a.getAttribute("data-add")] === false;
      li.classList.toggle("esgotado", acabou);
      var foto = li.querySelector(".produto-foto");
      var selo = foto.querySelector(".selo-esgotado");
      if (acabou && !selo) foto.insertAdjacentHTML("afterbegin", "<span class=\"selo-esgotado\">Esgotado</span>");
      if (!acabou && selo) selo.remove();
      a.setAttribute("aria-disabled", String(acabou));
      a.innerHTML = acabou ? "Esgotado no momento" : "Comprar <span class=\"seta-txt\" aria-hidden=\"true\">→</span>";
    });
  }
  if (M) { marcarEsgotados(); window.addEventListener("storage", function (e) { if (e.key === "gordinho-estoque") marcarEsgotados(); }); }

  /* ---------- mensagens prontas ---------- */
  $$("[data-zap]").forEach(function (a) {
    if (M && L.whatsapp) a.href = M.zap(L.whatsapp, a.getAttribute("data-msg") || L.mensagemWhatsApp);
  });

  /* ---------- aberto / fechado (horário de Brasília) ---------- */
  var DIAS = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
  function agora() {
    var o = {};
    new Intl.DateTimeFormat("en-US", { timeZone: "America/Sao_Paulo", weekday: "short", hour: "numeric", minute: "numeric", hour12: false })
      .formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { dia: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(o.weekday), h: (parseInt(o.hour, 10) % 24) + parseInt(o.minute, 10) / 60 };
  }
  function status() {
    var el = $("[data-status]");
    if (!el || !L.horario) return;
    var a = agora();
    var hoje = L.horario[a.dia];
    var aberto = !!(hoje && a.h >= hoje[0] && a.h < hoje[1]);
    var txt;
    if (aberto) txt = "Aberto agora, até as " + hoje[1] + "h";
    else if (hoje && a.h < hoje[0]) txt = "Fechado, abre hoje às " + hoje[0] + "h";
    else {
      for (var k = 1; k <= 7; k++) {
        var d = (a.dia + k) % 7;
        if (L.horario[d]) { txt = "Fechado, abre " + (k === 1 ? "amanhã" : DIAS[d]) + " às " + L.horario[d][0] + "h"; break; }
      }
    }
    el.classList.toggle("aberto", aberto);
    $("[data-status-txt]", el).textContent = txt;
    $$("[data-horas] tr").forEach(function (tr) { tr.classList.toggle("hoje", Number(tr.getAttribute("data-dia")) === a.dia); });
  }
  status();
  setInterval(status, 60000);

  /* ---------- menu do celular ---------- */
  var menu = $("#menu");
  var bMenu = $("[data-abre-menu]");
  function fecharMenu() { document.body.classList.remove("menu-aberto"); bMenu.setAttribute("aria-expanded", "false"); bMenu.setAttribute("aria-label", "Abrir menu"); }
  if (bMenu) {
    bMenu.addEventListener("click", function () {
      var abre = !document.body.classList.contains("menu-aberto");
      document.body.classList.toggle("menu-aberto", abre);
      bMenu.setAttribute("aria-expanded", String(abre));
      bMenu.setAttribute("aria-label", abre ? "Fechar menu" : "Abrir menu");
    });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", fecharMenu); });
  }

  /* ---------- busca no topo ---------- */
  var painel = $("[data-busca-painel]");
  var bBusca = $("[data-abre-busca]");
  var campo = $("[data-busca]");
  if (bBusca && painel) {
    bBusca.addEventListener("click", function () {
      var abre = !painel.classList.contains("aberto");
      painel.classList.toggle("aberto", abre);
      bBusca.setAttribute("aria-expanded", String(abre));
      if (abre) setTimeout(function () { campo.focus(); }, 50);
    });
  }

  /* ---------- vitrine: mais pedidos, categoria, busca, todos ---------- */
  var rotulo = $("[data-vitrine-rotulo]");
  var titulo = $("[data-vitrine-titulo]");
  var vazio = $("[data-vazio]");
  var secao = document.getElementById("bebidas");
  function irVitrine() { secao.scrollIntoView({ behavior: reduz ? "auto" : "smooth" }); }

  function mostrar(filtro, rot, tit) {
    var n = 0;
    $$(".produto", lista).forEach(function (li) { var ok = filtro(li); li.hidden = !ok; if (ok) n++; });
    rotulo.textContent = rot;
    titulo.textContent = tit;
    vazio.hidden = n > 0;
  }
  function porCategoria(id) {
    var c = (window.CATEGORIAS || []).filter(function (x) { return x.id === id; })[0];
    if (!c) return;
    mostrar(function (li) { return li.getAttribute("data-cat") === id; }, "Categoria", c.nome);
    $$("[data-cat]").forEach(function (a) { if (!a.matches("li")) a.setAttribute("aria-current", String(a.getAttribute("data-cat") === id)); });
  }
  function todos() {
    mostrar(function () { return true; }, "Catálogo", "Todas as bebidas");
  }
  function buscar(q) {
    var t = M.semAcento(q.trim());
    if (!t) { mostrar(function (li) { return li.hasAttribute("data-destaque"); }, "Mais pedidos", "Os preferidos da casa"); return; }
    var w = t.split(/\s+/);
    mostrar(function (li) { var b = li.getAttribute("data-busca"); return w.every(function (x) { return b.indexOf(x) > -1; }); }, "Busca", "“" + q.trim() + "”");
    var perg = $("[data-msg-busca]");
    if (perg) perg.href = M.zap(L.whatsapp, "Olá, Depósito do Gordinho! Vocês têm " + q.trim() + "?");
  }

  document.addEventListener("click", function (e) {
    var a = e.target.closest("[data-cat]");
    if (a && !a.matches("li")) { e.preventDefault(); porCategoria(a.getAttribute("data-cat")); irVitrine(); return; }
    var t = e.target.closest("[data-ver-todos]");
    if (t) { e.preventDefault(); todos(); irVitrine(); }
  });
  if (campo) {
    var tb;
    campo.addEventListener("input", function () { clearTimeout(tb); tb = setTimeout(function () { buscar(campo.value); }, 150); });
    $("[data-busca-form]").addEventListener("submit", function (e) { e.preventDefault(); buscar(campo.value); campo.blur(); irVitrine(); });
  }

  /* ---------- fade suave ao rolar (sem JS, tudo já aparece) ---------- */
  if ("IntersectionObserver" in window && !reduz) {
    var alvos = $$(".cab, .cats > li, .produto, .passos > li, .vant-lista > li, .promo, .avals > li, .metade > *, .onde > *, .difs-lista > li");
    document.documentElement.classList.add("anima");
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("visto"); io.unobserve(en.target); } });
    }, { threshold: 0.01, rootMargin: "0px 0px -6% 0px" });
    alvos.forEach(function (el) { io.observe(el); });
    setTimeout(function () { alvos.forEach(function (el) { el.classList.add("visto"); }); }, 4000);
  }

  /* ---------- modo prévia: nada chega no WhatsApp nem no telefone do dono ---------- */
  if (L.previa) {
    var aviso = $("[data-aviso-previa]");
    var ta;
    document.addEventListener("click", function (e) {
      var a = e.target.closest("a[href*='wa.me']:not([data-add]), a[href^='tel:']");
      if (!a) return;
      e.preventDefault();
      aviso.textContent = "Prévia do site: quando estiver no ar, este botão abre o WhatsApp do depósito.";
      aviso.classList.add("mostra");
      clearTimeout(ta);
      ta = setTimeout(function () { aviso.classList.remove("mostra"); }, 3200);
    }, true);
  }
})();
