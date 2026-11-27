/*
  Moldes dos cards (usados pelo site e pelo montar.mjs).
  Não precisa mexer aqui para trocar produto: use produtos.js.
*/
var MODELOS = (function () {
  var IMG = "assets/img/produtos/";
  var SETA = "<span class=\"seta-txt\" aria-hidden=\"true\">→</span>";

  function esc(t) {
    return String(t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; });
  }
  function zap(numero, msg) {
    return "https://wa.me/" + numero + "?text=" + encodeURIComponent(msg);
  }
  function semAcento(t) {
    return String(t).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  }
  function desconto(p) {
    var a = parseFloat(String(p.precoAntigo).replace(",", "."));
    var n = parseFloat(String(p.preco).replace(",", "."));
    if (!a || !n || n >= a) return 0;
    return Math.round((1 - n / a) * 100);
  }

  function card(p, numero) {
    var d = desconto(p);
    var preco = p.preco
      ? "<span class=\"preco\">R$ " + esc(p.preco) + "</span>" + (p.precoAntigo ? " <s class=\"preco-antigo\">R$ " + esc(p.precoAntigo) + "</s>" : "")
      : "<span class=\"preco preco-vazio\">Preço a confirmar</span>";
    var msg = "Olá, Depósito do Gordinho! Quero pedir: " + p.nome + " (" + p.tamanho + ").";
    return "<li class=\"produto\" data-cat=\"" + esc(p.categoria) + "\" data-busca=\"" + esc(semAcento(p.nome + " " + p.tamanho + " " + p.categoria)) + "\"" + (p.destaque ? " data-destaque" : " hidden") + ">" +
      "<div class=\"produto-foto\">" + (d ? "<span class=\"selo\">-" + d + "%</span>" : "") +
      "<img src=\"" + IMG + esc(p.foto) + ".webp\" alt=\"" + esc(p.nome + ", " + p.tamanho) + "\" loading=\"lazy\" decoding=\"async\">" +
      "<a class=\"produto-pedir\" href=\"" + zap(numero, msg) + "\" target=\"_blank\" rel=\"noopener\">Pedir no WhatsApp " + SETA + "</a></div>" +
      "<p class=\"produto-tam\">" + esc(p.tamanho) + "</p>" +
      "<h3 class=\"produto-nome\">" + esc(p.nome) + "</h3>" +
      "<p class=\"produto-preco\">" + preco + "</p>" +
      "</li>";
  }

  function circulo(c, qtd) {
    return "<li><a class=\"cat\" href=\"#bebidas\" data-cat=\"" + esc(c.id) + "\">" +
      "<span class=\"cat-foto\"><img src=\"" + IMG + esc(c.foto) + ".webp\" alt=\"\" loading=\"lazy\" decoding=\"async\"></span>" +
      "<span class=\"cat-nome\">" + esc(c.nome) + "</span>" +
      "<span class=\"cat-qtd\">" + qtd + (qtd === 1 ? " produto" : " produtos") + "</span></a></li>";
  }

  function linhaCategoria(c, qtd) {
    return "<li><a href=\"#bebidas\" data-cat=\"" + esc(c.id) + "\"><span>" + esc(c.nome) + "</span><span class=\"lc-qtd\">" + qtd + "</span></a></li>";
  }

  function combo(c, numero) {
    var msg = "Olá, Depósito do Gordinho! Quero o " + c.nome + ": " + c.itens.join(", ") + ".";
    return "<li class=\"combo\">" +
      "<div class=\"combo-fotos\">" + c.fotos.map(function (f, i) {
        return "<img class=\"cf" + (i + 1) + "\" src=\"" + IMG + esc(f) + ".webp\" alt=\"\" loading=\"lazy\" decoding=\"async\">";
      }).join("") + "</div>" +
      "<p class=\"rotulo\">Combo</p>" +
      "<h3 class=\"combo-nome\">" + esc(c.nome) + "</h3>" +
      "<ul class=\"combo-itens\">" + c.itens.map(function (i) { return "<li>" + esc(i) + "</li>"; }).join("") + "</ul>" +
      "<div class=\"combo-rodape\"><p class=\"combo-preco\">" + (c.preco ? "R$ " + esc(c.preco) : "Preço a confirmar") +
      "<span>" + (c.economia ? "Economia de R$ " + esc(c.economia) : "Economia a confirmar") + "</span></p>" +
      "<a class=\"btn btn-contorno\" href=\"" + zap(numero, msg) + "\" target=\"_blank\" rel=\"noopener\">Pedir " + SETA + "</a></div>" +
      "</li>";
  }

  return { card: card, circulo: circulo, linhaCategoria: linhaCategoria, combo: combo, zap: zap, semAcento: semAcento, esc: esc };
})();

if (typeof module !== "undefined") module.exports = MODELOS;
