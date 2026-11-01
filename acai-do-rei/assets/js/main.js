(function () {
  var S = window.SITE || {};
  var c = S.contato || {};

  function el(tag, classe, texto) {
    var e = document.createElement(tag);
    if (classe) e.className = classe;
    if (texto) e.textContent = texto;
    return e;
  }

  var whatsUrl = c.whatsapp
    ? "https://wa.me/" + c.whatsapp + "?text=" + encodeURIComponent(c.mensagemWhatsapp || "")
    : "";
  var instaUrl = c.instagram ? "https://www.instagram.com/" + c.instagram + "/" : "";

  // Links de pedido: WhatsApp; sem número, Instagram; sem os dois, some.
  document.querySelectorAll("[data-whats]").forEach(function (a) {
    var url = whatsUrl || instaUrl;
    if (!url) { a.hidden = true; return; }
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener";
  });
  document.querySelectorAll("[data-instagram]").forEach(function (a) {
    if (!instaUrl) { a.hidden = true; return; }
    a.href = instaUrl;
    a.target = "_blank";
    a.rel = "noopener";
  });

  // Queridinhos
  var lista = document.querySelector("[data-destaques]");
  (S.destaques || []).forEach(function (d) {
    var li = el("li", "cartao");
    var foto = el("div", "cartao-foto");
    var img = el("img");
    img.src = "assets/img/" + d.img + ".webp";
    img.alt = d.nome;
    img.width = 352;
    img.height = 352;
    img.loading = "lazy";
    foto.appendChild(img);
    if (d.selo) foto.appendChild(el("span", "cartao-selo", d.selo));
    li.appendChild(foto);
    var corpo = el("div", "cartao-corpo");
    corpo.appendChild(el("h3", "", d.nome));
    corpo.appendChild(el("p", "", d.desc));
    corpo.appendChild(el("p", "cartao-preco", d.preco ? "R$ " + d.preco : "Consulte no WhatsApp"));
    if (whatsUrl) {
      var a = el("a", "botao botao-amarelo botao-pequeno", "Pedir este");
      a.href = "https://wa.me/" + c.whatsapp + "?text=" + encodeURIComponent("Olá, Açaí do Rei! Quero o " + d.nome + " 👑");
      a.target = "_blank";
      a.rel = "noopener";
      a.setAttribute("aria-label", "Pedir " + d.nome + " no WhatsApp");
      corpo.appendChild(a);
    }
    li.appendChild(corpo);
    lista.appendChild(li);
  });

  // Promoções
  var promos = document.querySelector("[data-promocoes]");
  var secaoPromo = document.getElementById("promocoes");
  if (!(S.promocoes || []).length) {
    secaoPromo.hidden = true;
  } else {
    S.promocoes.forEach(function (p) {
      var li = el("li", "promo");
      li.appendChild(el("span", "promo-coroa", "👑"));
      li.appendChild(el("h3", "", p.nome));
      li.appendChild(el("p", "promo-tamanho", p.tamanho));
      var preco = el("p", "promo-preco");
      preco.appendChild(el("small", "", "por apenas"));
      preco.appendChild(document.createTextNode("R$ " + p.preco));
      li.appendChild(preco);
      promos.appendChild(li);
    });
    document.querySelector("[data-aviso-promo]").textContent = S.avisoPromocoes || "";
  }

  // Adicionais
  var chips = document.querySelector("[data-adicionais]");
  (S.adicionais || []).forEach(function (t) { chips.appendChild(el("li", "", t)); });

  // Onde fica
  var local = S.local || {};
  var end = document.querySelector("[data-endereco]");
  if (local.texto) end.textContent = local.texto; else end.hidden = true;
  var mapa = document.querySelector("[data-mapa]");
  if (local.mapaUrl) mapa.href = local.mapaUrl; else mapa.hidden = true;

  var dl = document.querySelector("[data-horarios]");
  var hs = S.horarios || [];
  if (!hs.length) {
    dl.appendChild(el("dd", "", "Consulte no WhatsApp"));
  } else {
    hs.forEach(function (h) {
      dl.appendChild(el("dt", "", h.dias));
      dl.appendChild(el("dd", "", h.horas));
    });
    var curto = document.querySelector("[data-horario-curto]");
    if (curto) curto.textContent = hs[0].horas;
  }

  // Menu do celular
  var botao = document.querySelector(".menu-botao");
  var menu = document.getElementById("menu");
  function fechar() {
    botao.setAttribute("aria-expanded", "false");
    menu.classList.remove("aberto");
  }
  botao.addEventListener("click", function () {
    var aberto = botao.getAttribute("aria-expanded") === "true";
    botao.setAttribute("aria-expanded", String(!aberto));
    menu.classList.toggle("aberto", !aberto);
  });
  menu.addEventListener("click", function (e) { if (e.target.closest("a")) fechar(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") { fechar(); botao.focus(); } });

  // Entrada suave ao rolar
  if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("visivel"); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    document.querySelectorAll(".secao-topo, .cartao, .promo, .monte-card, .adicionais, .alerta, .onde-grade > *").forEach(function (n) {
      n.classList.add("revelar");
      io.observe(n);
    });
  }
})();
