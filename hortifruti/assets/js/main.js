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
    return "https://wa.me/" + loja.whatsapp + "?text=" + encodeURIComponent(msg || cfg.mensagemWhatsApp || "");
  }
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

  // Botões de pedido por loja
  var botoes = document.querySelector("[data-pedido-botoes]");
  lojas.forEach(function (l) {
    if (!l.whatsapp) return;
    var a = el("a", "btn btn-orange order-btn", icon("i-wa") + "<span><strong>" + esc(l.cidade) + "</strong><small>" + esc(l.telefone) + "</small></span>");
    a.href = waLink(l); a.target = "_blank"; a.rel = "noopener";
    botoes && botoes.appendChild(a);
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
    li.innerHTML = '<h3><svg class="store-pear" viewBox="0 0 40 40" aria-hidden="true"><use href="#i-pear"/></svg>' + esc(l.cidade) + "</h3>" +
      end + hora +
      "<p>" + icon("i-wa") + "<span>" + esc(l.telefone) + "</span></p>" +
      '<div class="store-actions"><a class="btn btn-orange btn-sm" href="' + waLink(l) + '" target="_blank" rel="noopener">' + icon("i-wa") + "Chamar no WhatsApp</a>" + mapa + "</div>";
    lista && lista.appendChild(li);
  });

  // Rodapé
  var fl = document.querySelector("[data-footer-lojas]");
  lojas.forEach(function (l) {
    var a = el("a", "", "<span>" + esc(l.cidade) + "</span><strong>" + esc(l.telefone) + "</strong>");
    a.href = waLink(l); a.target = "_blank"; a.rel = "noopener";
    fl && fl.appendChild(a);
  });

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
