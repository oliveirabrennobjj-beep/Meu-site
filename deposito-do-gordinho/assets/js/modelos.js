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
  function idDe(p) {
    return semAcento(p.nome + " " + p.tamanho).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
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
      "<a class=\"produto-pedir\" data-add=\"" + esc(idDe(p)) + "\" href=\"" + zap(numero, msg) + "\" target=\"_blank\" rel=\"noopener\">Comprar " + SETA + "</a></div>" +
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

  return { idDe: idDe, card: card, circulo: circulo, linhaCategoria: linhaCategoria, zap: zap, semAcento: semAcento, esc: esc };
})();

if (typeof module !== "undefined") module.exports = MODELOS;
