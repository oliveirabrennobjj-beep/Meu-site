// Filtro por ramo. O ramo fica no endereço (ex.: portfolio/#barbearia),
// então dá para mandar ao cliente o link já filtrado.
(function () {
  var chips = Array.prototype.slice.call(document.querySelectorAll("[data-filtro]"));
  var obras = Array.prototype.slice.call(document.querySelectorAll(".obra"));
  var lista = document.querySelector("[data-obras]");
  var contagem = document.getElementById("contagem");
  var nomes = {};
  chips.forEach(function (c) { nomes[c.dataset.filtro] = c.firstChild.textContent.trim().toLowerCase(); });
  var reduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function valido(ramo) { return Object.prototype.hasOwnProperty.call(nomes, ramo) ? ramo : "todos"; }

  function mostrar(ramo) {
    var n = 0;
    obras.forEach(function (o) {
      var ver = ramo === "todos" || o.dataset.ramo === ramo;
      o.hidden = !ver;
      if (ver) n++;
    });
    chips.forEach(function (c) { c.setAttribute("aria-pressed", String(c.dataset.filtro === ramo)); });
    contagem.textContent = ramo === "todos"
      ? "Mostrando os " + n + " sites."
      : "Mostrando " + n + (n === 1 ? " site" : " sites") + " de " + nomes[ramo] + ".";
  }

  function aplicar(ramo) {
    ramo = valido(ramo);
    if (reduzido) { mostrar(ramo); return; }
    lista.classList.add("trocando");
    setTimeout(function () { mostrar(ramo); lista.classList.remove("trocando"); }, 180);
  }

  chips.forEach(function (c) {
    c.addEventListener("click", function () {
      var ramo = c.dataset.filtro;
      history.replaceState(null, "", ramo === "todos" ? location.pathname : "#" + ramo);
      aplicar(ramo);
    });
  });

  window.addEventListener("hashchange", function () { aplicar(location.hash.slice(1)); });
  mostrar(valido(location.hash.slice(1)));
})();
