// Lê o config.js e monta os links e as partes que mudam por loja. Sem framework.
(function () {
  var S = window.SITE || {};
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var insta = S.instagram ? "https://www.instagram.com/" + S.instagram + "/" : "";

  // Botões de WhatsApp: cada um leva a mensagem pronta da sua parte. Sem número, vai para o Instagram ou some.
  $$("[data-wa]").forEach(function (a) {
    if (S.whatsapp) {
      var msg = (S.mensagens && (S.mensagens[a.dataset.wa] || S.mensagens.geral)) || "";
      a.href = "https://wa.me/" + S.whatsapp + "?text=" + encodeURIComponent(msg);
      a.target = "_blank";
      a.rel = "noopener";
    } else if (insta) {
      a.href = insta;
      a.target = "_blank";
      a.rel = "noopener";
    } else {
      a.hidden = true;
    }
  });

  // Nota do Google, só se estiver no config.
  var nota = $("[data-nota]");
  if (nota && S.nota) {
    var forte = $("strong", nota);
    forte.textContent = String(S.nota).replace(".", ",");
    forte.parentNode.appendChild(document.createTextNode(" no Google" + (S.avaliacoes ? " (" + S.avaliacoes + " avaliações)" : "")));
    nota.hidden = false;
  }

  // Cardápio: com itens no config mostra a lista dentro do cartão.
  var temItens = false;
  $$("[data-itens]").forEach(function (ul) {
    var lista = (S.cardapio && S.cardapio[ul.dataset.itens]) || [];
    lista.forEach(function (item) {
      temItens = true;
      var li = document.createElement("li");
      var nome = document.createElement("span");
      nome.textContent = item.nome;
      li.appendChild(nome);
      if (item.preco) {
        var preco = document.createElement("strong");
        preco.textContent = item.preco;
        li.appendChild(preco);
      }
      ul.appendChild(li);
    });
  });
  var lead = $("[data-cardapio-lead]");
  if (lead && temItens) lead.textContent = "Chame no WhatsApp para pedir ou tirar dúvidas sobre os sabores.";

  // Delivery
  var area = $("[data-area]");
  if (area && S.areaEntrega) { area.textContent = S.areaEntrega; area.hidden = false; }
  var anota = $("[data-anotaai]");
  if (anota && S.linkAnotaAi) { anota.href = S.linkAnotaAi; anota.hidden = false; }

  // Onde fica
  var maps = $("[data-maps]");
  if (maps) maps.href = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(S.endereco || (S.nome + " " + S.cidade));
  var end = $("[data-endereco]");
  if (end && S.endereco) { end.textContent = S.endereco; end.hidden = false; }
  var hor = $("[data-horarios]");
  if (hor && S.horarios) hor.textContent = S.horarios;
  var ig = $("[data-insta]");
  if (ig) { if (insta) ig.href = insta; else ig.hidden = true; }
  // O botão flutuante do celular só aparece depois que os botões do topo saem da tela.
  var flut = $(".zap-flutuante");
  var alvo = $(".hero .acoes");
  if (flut && alvo && "IntersectionObserver" in window) {
    new IntersectionObserver(function (e) { flut.classList.toggle("visivel", !e[0].isIntersecting); }).observe(alvo);
  } else if (flut) {
    flut.classList.add("visivel");
  }
  var zv = $("[data-zap-visivel]");
  if (zv) zv.textContent = S.whatsappVisivel || "";
})();
