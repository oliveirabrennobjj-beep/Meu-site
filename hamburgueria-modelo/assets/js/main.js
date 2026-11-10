(function () {
  var S = window.SITE || {};
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  document.documentElement.classList.add("m-enter");

  function linkWa(texto) {
    if (!S.whatsapp) return "";
    var msg = encodeURIComponent(texto || S.mensagemWhatsapp || "");
    return "https://wa.me/" + S.whatsapp + "?text=" + msg;
  }

  // Nome, frase e textos
  $$("[data-nome], [data-nome-rodape]").forEach(function (el) { el.textContent = S.nome || ""; });
  if (S.frase) {
    var a = $("[data-frase-a]"), b = $("[data-frase-b]"), c = $("[data-frase-c]");
    if (a) a.textContent = S.frase.a;
    if (b) b.textContent = S.frase.b;
    if (c) c.textContent = S.frase.c;
  }
  if ($("[data-lead]") && S.lead) $("[data-lead]").textContent = S.lead;
  if ($("[data-delivery-texto]") && S.entrega) $("[data-delivery-texto]").textContent = S.entrega;
  document.title = (S.nome || "Hamburgueria") + (S.cidade ? " | " + S.cidade : "") + " | Hamburgueria artesanal";

  // Botões de WhatsApp: sem número, ficam como "Consulte pelo WhatsApp" e levam ao cardápio
  $$("[data-wa]").forEach(function (el) {
    var href = linkWa();
    if (href) {
      el.href = href; el.target = "_blank"; el.rel = "noopener";
    } else if (el.classList.contains("btn") || el.classList.contains("pedir-topo")) {
      el.classList.add("is-off");
      el.textContent = "Consulte pelo WhatsApp";
      el.removeAttribute("href");
    } else {
      el.href = "#cardapio";
    }
  });

  // Endereço, horários e mapa
  if ($("[data-endereco]") && S.endereco) $("[data-endereco]").textContent = S.endereco + (S.cidade ? " · " + S.cidade : "");
  if ($("[data-horarios]") && S.horarios) $("[data-horarios]").textContent = S.horarios;
  var acao = $("[data-mapa-acao]");
  if (acao) {
    if (S.mapa) {
      acao.innerHTML = '<a class="btn btn-escuro" href="' + S.mapa + '" target="_blank" rel="noopener">Abrir no Google Maps</a>';
    } else {
      acao.remove();
    }
  }

  // Cardápio
  var grade = $("[data-cardapio]");
  if (grade && Array.isArray(S.cardapio)) {
    S.cardapio.forEach(function (item) {
      var card = document.createElement("article");
      card.className = "card";
      var selo = item.destaque ? '<span class="selo-card">' + item.destaque + "</span>" : "";
      var preco = item.preco ? "R$ " + item.preco : "Consulte";
      var msg = "Oi! Quero pedir: " + item.nome + ".";
      var botao = S.whatsapp
        ? '<a class="btn btn-amarelo pill" href="' + linkWa(msg) + '" target="_blank" rel="noopener">Pedir no WhatsApp</a>'
        : '<span class="btn btn-amarelo pill is-off">Consulte pelo WhatsApp</span>';
      card.innerHTML =
        '<div class="card-topo">' + selo + "</div>" +
        "<h3></h3><p class=\"card-desc\"></p>" +
        '<div class="card-base"><strong class="preco"></strong>' + botao + "</div>";
      card.querySelector("h3").textContent = item.nome;
      card.querySelector(".card-desc").textContent = item.descricao;
      card.querySelector(".preco").textContent = preco;
      grade.appendChild(card);
    });
  }

  // Menu do celular
  var abre = $(".abre-menu"), menu = $("#menu");
  if (abre && menu) {
    abre.addEventListener("click", function () {
      var aberto = document.body.classList.toggle("menu-aberto");
      abre.setAttribute("aria-expanded", String(aberto));
      abre.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
    });
    $$("a", menu).forEach(function (l) {
      l.addEventListener("click", function () {
        document.body.classList.remove("menu-aberto");
        abre.setAttribute("aria-expanded", "false");
      });
    });
  }
})();
