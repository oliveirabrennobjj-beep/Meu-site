(function () {
  "use strict";
  var cfg = window.KITANDA || {};
  var lojas = cfg.lojas || [];

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function waLink(loja, msg) {
    if (loja.semWhatsApp) return "";
    if (!loja.whatsapp) return cfg.listaWhatsApp || cfg.instagram || "#";
    return "https://wa.me/" + loja.whatsapp + "?text=" + encodeURIComponent(msg || cfg.mensagemWhatsApp || "");
  }
  function nomeLoja(l) { return l.cidade + (l.unidade ? " – " + l.unidade : ""); }
  function foneLoja(l) { return l.telefone || "Abrir WhatsApp"; }
  function icon(id) {
    return '<svg class="ic" aria-hidden="true"><use href="#' + id + '"/></svg>';
  }
  function img(name, alt, pos, w, h) {
    return '<img src="assets/img/' + esc(name) + '.webp" alt="' + esc(alt) + '" loading="lazy" decoding="async" width="' + (w || 540) + '" height="' + (h || 540) + '"' +
      (pos ? ' style="object-position:' + esc(pos) + '"' : "") + ">";
  }

  // Links externos
  document.querySelectorAll("[data-insta]").forEach(function (a) {
    a.href = cfg.instagram || "#"; a.target = "_blank"; a.rel = "noopener";
  });
  document.querySelectorAll("[data-face]").forEach(function (a) {
    a.href = cfg.facebook || "#"; a.target = "_blank"; a.rel = "noopener";
  });
  document.querySelectorAll("[data-ano]").forEach(function (n) { n.textContent = new Date().getFullYear(); });

  // Categorias
  var cat = document.querySelector("[data-categorias]");
  (cfg.categorias || []).forEach(function (c) {
    var li = el("li", "cat-card");
    li.innerHTML = '<a href="#vitrine"><span class="cat-img">' + img(c.img, "", c.pos) + "</span>" +
      '<span class="cat-text"><span class="cat-name">' + esc(c.nome) + '</span><span class="cat-desc">' + esc(c.desc) + "</span></span></a>";
    cat && cat.appendChild(li);
  });

  // Produtos
  var prod = document.querySelector("[data-produtos]");
  (cfg.produtos || []).forEach(function (p) {
    var li = el("li", "prod-card");
    li.innerHTML = '<span class="prod-img">' + img(p.img, p.nome, p.pos) + "</span>" +
      '<span class="prod-body"><span class="prod-name">' + esc(p.nome) + '</span>' +
      '<span class="prod-unit">Vendido ' + esc(p.unidade) + "</span>" +
      '<a class="btn btn-leaf btn-sm" href="#pedido">' + icon("i-wa") + "Consultar</a></span>";
    prod && prod.appendChild(li);
  });

  // Uma loja só ou várias: muda o layout de pedido e de lojas
  var unica = lojas.length === 1;
  document.documentElement.classList.toggle("loja-unica", unica);
  document.documentElement.setAttribute("data-qtd-lojas", String(lojas.length));
  function tituloLoja(l) { return l.unidade ? "Loja " + l.unidade : l.cidade; }

  // Botões de pedido por loja
  var botoes = document.querySelector("[data-pedido-botoes]");
  lojas.filter(function (l) { return !l.semWhatsApp; }).forEach(function (l, i, arr) {
    var unica = arr.length === 1;
    var titulo = unica ? "Pedir pelo WhatsApp" : tituloLoja(l);
    var sub = l.telefone || (unica ? "Loja " + nomeLoja(l) : l.cidade);
    var a = el("a", "btn btn-orange order-btn", icon("i-wa") + "<span><strong>" + esc(titulo) + "</strong><small>" + esc(sub) + "</small></span>");
    a.setAttribute("aria-label", "WhatsApp da Kitanda " + nomeLoja(l));
    a.href = waLink(l); a.target = "_blank"; a.rel = "noopener";
    botoes && botoes.appendChild(a);
    if (unica && botoes) botoes.closest(".order-card").classList.add("um-botao");
  });

  // Lojas
  var lista = document.querySelector("[data-lojas]");
  lojas.forEach(function (l) {
    var li = el("li", "store-card");
    var end = l.endereco
      ? "<p>" + icon("i-pin") + "<span>" + esc(l.endereco) + "</span></p>"
      : '<p class="store-pending">' + icon("i-pin") + "<span>Endereço em breve no site</span></p>";
    var hora = l.horario ? "<p>" + icon("i-clock") + "<span>" + esc(l.horario) + "</span></p>" : "";
    var mapa = l.mapaUrl ? '<a class="btn btn-ghost btn-sm" href="' + esc(l.mapaUrl) + '" target="_blank" rel="noopener">' + icon("i-pin") + "Como chegar</a>" : "";
    var foto = l.foto
      ? '<figure class="store-photo">' + img(l.foto, "", l.fotoPos, 960, 1196) + "</figure>"
      : "";
    li.innerHTML = foto + '<div class="store-info">' +
      '<h3><svg class="store-pear" viewBox="0 0 40 40" aria-hidden="true"><use href="#i-pear"/></svg><span>' + esc(tituloLoja(l)) +
      "<small>" + esc(l.unidade ? l.cidade : "Kitanda Hortifruti") + "</small></span></h3>" +
      end + hora +
      (l.telefone ? "<p>" + icon("i-wa") + "<span>" + esc(l.telefone) + "</span></p>" : "") +
      (l.semWhatsApp ? '<p class="store-pending">' + icon("i-wa") + "<span>WhatsApp desta loja em breve</span></p>" : "") +
      '<div class="store-actions">' +
      (l.semWhatsApp ? "" : '<a class="btn btn-orange btn-sm" href="' + waLink(l) + '" target="_blank" rel="noopener">' + icon("i-wa") + "Chamar no WhatsApp</a>") +
      mapa + "</div></div>";
    lista && lista.appendChild(li);
  });

  // Rodapé
  var fl = document.querySelector("[data-footer-lojas]");
  lojas.filter(function (l) { return !l.semWhatsApp; }).forEach(function (l) {
    var a = el("a", "", "<span>" + esc(tituloLoja(l)) + "</span><strong>" + esc(foneLoja(l)) + "</strong>");
    a.href = waLink(l); a.target = "_blank"; a.rel = "noopener";
    fl && fl.appendChild(a);
  });

  // Receitas e dicas (posts do Instagram) + foto ampliada
  var grade = document.querySelector("[data-posts]");
  var dlg = document.querySelector("[data-post-dialog]");
  (cfg.posts || []).forEach(function (p, i) {
    var li = el("li", "post" + (i === 0 ? " post-destaque" : ""));
    var base = "assets/img/posts/" + p.img;
    li.innerHTML = '<button type="button" class="post-btn" aria-haspopup="dialog">' +
      '<img src="' + esc(base) + '-540.webp" srcset="' + esc(base) + "-540.webp 540w, " + esc(base) + '-1080.webp 1080w" sizes="' + (i === 0 ? "(min-width: 860px) 50vw, 92vw" : "(min-width: 860px) 25vw, 46vw") + '" alt="' + esc(p.alt) + '" loading="lazy" decoding="async" width="540" height="' + (p.alto ? 720 : 540) + '">' +
      '<span class="post-title">' + esc(p.titulo) + "</span></button>";
    li.querySelector("button").addEventListener("click", function () {
      if (!dlg || !dlg.showModal) { window.open(base + "-1080.webp", "_blank"); return; }
      var im = dlg.querySelector("img");
      im.src = base + "-1080.webp"; im.alt = p.alt;
      dlg.querySelector("[data-post-titulo]").textContent = p.titulo;
      dlg.showModal();
    });
    grade && grade.appendChild(li);
  });
  if (dlg) {
    dlg.querySelector("[data-post-fechar]").addEventListener("click", function () { dlg.close(); });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
  }

  // Menu mobile
  var toggle = document.querySelector("[data-menu-toggle]");
  var header = document.querySelector("[data-header]");
  var menu = document.getElementById("menu");
  function setMenu(open) {
    header.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.querySelector(".sr-only").textContent = open ? "Fechar menu" : "Abrir menu";
  }
  if (toggle) {
    toggle.addEventListener("click", function () { setMenu(!header.classList.contains("is-open")); });
    menu.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && header.classList.contains("is-open")) { setMenu(false); toggle.focus(); }
    });
  }

  // Cabeçalho com sombra ao rolar + item ativo do menu
  var onScroll = function () { header.classList.toggle("is-scrolled", window.scrollY > 8); };
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  if ("IntersectionObserver" in window) {
    var links = Array.prototype.slice.call(menu.querySelectorAll('a[href^="#"]'));
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) {
          if (a.getAttribute("href") === "#" + en.target.id) a.setAttribute("aria-current", "page");
          else a.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    links.forEach(function (a) { var s = document.querySelector(a.getAttribute("href")); if (s) io.observe(s); });
  }
})();
