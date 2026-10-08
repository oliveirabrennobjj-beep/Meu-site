(function () {
  "use strict";
  var cfg = window.PADARIA || {};
  var contato = cfg.contato || {};
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === "text") node.textContent = attrs[k];
      else node.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) { if (c) node.appendChild(c); });
    return node;
  }

  function priceNode(preco) {
    if (!preco) return el("span", { class: "price-ask", text: "Consulte" });
    var p = el("span", { class: "price" });
    p.appendChild(el("small", { text: "R$" }));
    p.appendChild(document.createTextNode(preco));
    return p;
  }

  /* Links de pedido */
  var instagramUrl = contato.instagram ? "https://www.instagram.com/" + contato.instagram + "/" : "";
  var whatsappUrl = contato.whatsapp
    ? "https://wa.me/" + contato.whatsapp + "?text=" + encodeURIComponent(contato.mensagemWhatsapp || "")
    : "";
  var pedidoUrl = contato.pedidoUrl || whatsappUrl || instagramUrl;

  function openExternal(a, url) {
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener";
  }

  if (pedidoUrl) $$("[data-pedido-principal]").forEach(function (a) { openExternal(a, pedidoUrl); });
  $$("[data-instagram]").forEach(function (a) {
    if (instagramUrl) openExternal(a, instagramUrl); else a.hidden = true;
  });
  if (whatsappUrl && contato.pedidoUrl) {
    $$("[data-whatsapp]").forEach(function (a) { openExternal(a, whatsappUrl); a.hidden = false; });
  }
  if (!contato.pedidoUrl && !whatsappUrl && instagramUrl) {
    var t = $("[data-pedido-texto]");
    if (t) t.textContent = "Mande uma mensagem no nosso Instagram com o que você quer e combinamos a entrega.";
  }
  $$("[data-encomenda]").forEach(function (a) {
    var url = whatsappUrl || contato.pedidoUrl || instagramUrl;
    if (url) openExternal(a, url);
  });

  /* Vitrine */
  var vitrine = $("[data-destaques]");
  (cfg.destaques || []).forEach(function (p) {
    var img = el("img", {
      src: "assets/img/" + p.img + "-480.webp",
      srcset: "assets/img/" + p.img + "-480.webp 480w, assets/img/" + p.img + "-960.webp 960w",
      sizes: "(min-width: 1180px) 280px, (min-width: 560px) 45vw, 92vw",
      alt: p.nome, loading: "lazy", width: "480", height: "408"
    });
    var photo = el("div", { class: "product-photo" }, [img, p.selo ? el("span", { class: "product-badge", text: p.selo }) : null]);
    if (p.preco) photo.setAttribute("data-price", "R$ " + p.preco);
    var add = el("a", { class: "btn btn-ghost product-add", href: "#pedido", text: "Pedir" });
    add.setAttribute("aria-label", "Pedir " + p.nome);
    vitrine.appendChild(el("li", { class: "product" + (p.preco ? " product--price" : "") }, [
      photo,
      el("div", { class: "product-body" }, [
        el("h3", { text: p.nome }),
        el("p", { text: p.desc }),
        el("div", { class: "product-foot" }, [priceNode(p.preco), add])
      ])
    ]));
  });

  /* Cardápio em abas */
  var tabs = $("[data-tabs]");
  var panels = $("[data-panels]");
  var tabButtons = [];
  (cfg.cardapio || []).forEach(function (cat, i) {
    var id = "aba-" + i;
    var btn = el("button", {
      class: "tab", type: "button", role: "tab", id: id + "-btn",
      "aria-controls": id, "aria-selected": i === 0 ? "true" : "false", tabindex: i === 0 ? "0" : "-1",
      text: cat.aba
    });
    tabs.appendChild(btn);
    tabButtons.push(btn);
    var list = el("ul", { class: "menu-list" });
    cat.itens.forEach(function (it) {
      list.appendChild(el("li", { class: "menu-item" }, [
        el("div", { class: "menu-line" }, [
          el("h3", { text: it.nome }),
          el("span", { class: "leader", "aria-hidden": "true" }),
          priceNode(it.preco)
        ]),
        it.desc ? el("p", { text: it.desc }) : null
      ]));
    });
    var panel = el("div", { class: "menu-panel", role: "tabpanel", id: id, "aria-labelledby": id + "-btn", tabindex: "0" }, [list]);
    if (i !== 0) panel.hidden = true;
    panels.appendChild(panel);
  });

  function selectTab(btn, focus) {
    tabButtons.forEach(function (b) {
      var on = b === btn;
      b.setAttribute("aria-selected", on ? "true" : "false");
      b.tabIndex = on ? 0 : -1;
      document.getElementById(b.getAttribute("aria-controls")).hidden = !on;
    });
    if (focus) btn.focus();
  }
  tabs.addEventListener("click", function (e) {
    var b = e.target.closest(".tab");
    if (b) selectTab(b);
  });
  tabs.addEventListener("keydown", function (e) {
    var i = tabButtons.indexOf(document.activeElement);
    if (i < 0) return;
    var n = tabButtons.length;
    var next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: n - 1 }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    selectTab(tabButtons[(next + n) % n], true);
  });

  /* Endereço e horários */
  var end = cfg.endereco || {};
  var endNode = $("[data-endereco]");
  if (endNode) endNode.textContent = end.texto || "Consulte pelo Instagram.";
  if (end.mapaUrl) { var rota = $("[data-rota]"); openExternal(rota, end.mapaUrl); rota.hidden = false; }
  var hours = $("[data-horarios]");
  if (cfg.horarios && cfg.horarios.length) {
    cfg.horarios.forEach(function (h) {
      hours.appendChild(el("li", {}, [el("span", { text: h.dias }), el("span", { text: h.horas })]));
    });
  } else {
    hours.appendChild(el("li", { class: "hours-empty", text: "Consulte os horários do dia pelo Instagram." }));
  }

  var aviso = $("[data-aviso]");
  if (aviso && cfg.avisoEntrega) { aviso.textContent = cfg.avisoEntrega; aviso.hidden = false; }

  var ano = $("[data-ano]");
  if (ano) ano.textContent = new Date().getFullYear();

  /* Menu no celular */
  var toggle = $("[data-menu-toggle]");
  var nav = $("#menu");
  function setMenu(open) {
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.querySelector(".sr-only").textContent = open ? "Fechar menu" : "Abrir menu";
    nav.classList.toggle("is-open", open);
  }
  toggle.addEventListener("click", function () { setMenu(toggle.getAttribute("aria-expanded") !== "true"); });
  nav.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && nav.classList.contains("is-open")) { setMenu(false); toggle.focus(); }
  });

  /* Cabeçalho e botão flutuante reagem à rolagem */
  var header = $("[data-header]");
  var fab = $(".fab");
  var hero = $(".hero");
  var ticking = false;
  function onScroll() {
    ticking = false;
    var y = window.scrollY;
    header.classList.toggle("is-scrolled", y > 8);
    var pastHero = y > hero.offsetTop + hero.offsetHeight - 200;
    var pedido = $("#pedido").getBoundingClientRect();
    var pedidoVisible = pedido.top < window.innerHeight && pedido.bottom > 0;
    fab.classList.toggle("is-visible", pastHero && !pedidoVisible);
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();
})();
