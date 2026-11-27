/* Painel do dono: marca o que tem e o que acabou.
   Prévia: guarda no navegador (chave gordinho-estoque), que o site lê no mesmo aparelho.
   Versão final: trocar ler()/gravar() por um banco online (ex.: Supabase) com login do dono. */
(function () {
  "use strict";
  var M = window.MODELOS, P = window.PRODUTOS || [], C = window.CATEGORIAS || [];
  var IMG = "../assets/img/produtos/";
  var CHAVE = "gordinho-estoque";
  function $(s) { return document.querySelector(s); }
  function ler() { try { return JSON.parse(localStorage.getItem(CHAVE)) || {}; } catch (e) { return {}; } }
  function gravar(o) { try { localStorage.setItem(CHAVE, JSON.stringify(o)); } catch (e) { /* sem armazenamento */ } }

  var est = ler();
  P.forEach(function (p) { var id = M.idDe(p); if (p.disponivel === false && !(id in est)) est[id] = false; });
  var filtro = "todos", busca = "";
  var lista = $("[data-p-lista]");

  function tem(id) { return est[id] !== false; }

  $("[data-p-filtros]").innerHTML = [{ id: "todos", nome: "Tudo" }, { id: "acabou", nome: "Esgotados" }].concat(C).map(function (c, i) {
    return "<button type=\"button\" class=\"chip-reto\" aria-pressed=\"" + (i === 0) + "\" data-f=\"" + c.id + "\">" + M.esc(c.nome) + "</button>";
  }).join("");

  function contar() {
    var acabou = P.filter(function (p) { return !tem(M.idDe(p)); }).length;
    $("[data-n-tem]").textContent = P.length - acabou;
    $("[data-n-acabou]").textContent = acabou;
    $("[data-n-total]").textContent = P.length;
  }

  function render() {
    var q = M.semAcento(busca.trim());
    var vis = P.filter(function (p) {
      var id = M.idDe(p);
      if (filtro === "acabou" && tem(id)) return false;
      if (filtro !== "todos" && filtro !== "acabou" && p.categoria !== filtro) return false;
      return !q || M.semAcento(p.nome + " " + p.tamanho).indexOf(q) > -1;
    });
    lista.innerHTML = vis.map(function (p) {
      var id = M.idDe(p), ok = tem(id);
      return "<li class=\"p-item" + (ok ? "" : " p-acabou") + "\">" +
        "<div class=\"p-foto\"><img src=\"" + IMG + M.esc(p.foto) + ".webp\" alt=\"\" loading=\"lazy\"></div>" +
        "<div class=\"p-txt\"><p class=\"p-nome\">" + M.esc(p.nome) + "</p><p class=\"p-tam\">" + M.esc(p.tamanho) + "</p>" +
        "<p class=\"p-estado\">" + (ok ? "Aparece no site" : "Esgotado no site") + "</p></div>" +
        "<div class=\"p-troca\" role=\"group\" aria-label=\"" + M.esc(p.nome) + "\">" +
        "<button type=\"button\" data-id=\"" + id + "\" data-v=\"1\" aria-pressed=\"" + ok + "\">Tem</button>" +
        "<button type=\"button\" data-id=\"" + id + "\" data-v=\"0\" aria-pressed=\"" + !ok + "\">Acabou</button></div></li>";
    }).join("");
    $("[data-p-vazio]").hidden = vis.length > 0;
    contar();
  }

  var tt;
  function aviso(txt) {
    var t = $("[data-p-toast]");
    t.textContent = txt;
    t.classList.add("mostra");
    clearTimeout(tt);
    tt = setTimeout(function () { t.classList.remove("mostra"); }, 2200);
  }

  lista.addEventListener("click", function (e) {
    var b = e.target.closest("[data-id]");
    if (!b) return;
    var id = b.getAttribute("data-id"), v = b.getAttribute("data-v") === "1";
    if (v) delete est[id]; else est[id] = false;
    gravar(est);
    render();
    var p = P.filter(function (x) { return M.idDe(x) === id; })[0];
    aviso(p.nome + (v ? " voltou para o site." : " marcado como esgotado."));
  });
  $("[data-p-filtros]").addEventListener("click", function (e) {
    var b = e.target.closest("[data-f]");
    if (!b) return;
    filtro = b.getAttribute("data-f");
    Array.prototype.forEach.call(document.querySelectorAll(".chip-reto"), function (x) { x.setAttribute("aria-pressed", String(x === b)); });
    render();
  });
  $("[data-p-busca]").addEventListener("input", function (e) { busca = e.target.value; render(); });
  $("[data-p-tudo]").addEventListener("click", function () { est = {}; gravar(est); render(); aviso("Tudo marcado como disponível."); });

  render();
})();
