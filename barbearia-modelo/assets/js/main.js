(function () {
  var S = window.SITE || {};
  var BN = "https://oliveirabrennobjj-beep.github.io/Meu-site/";
  var $ = function (s) { return document.querySelector(s); };
  var txt = function (el, v) { if (el) el.textContent = v; };

  var msg = "Olá! Vim pelo site e quero agendar um horário.";
  var wa = S.whatsapp ? "https://wa.me/" + S.whatsapp + "?text=" + encodeURIComponent(msg) : BN;
  document.querySelectorAll("[data-wa]").forEach(function (a) {
    a.href = wa;
    if (!S.whatsapp && S.exemplo) a.textContent = a.dataset.waExemplo || "Quero um site assim";
  });

  document.querySelectorAll("[data-nome]").forEach(function (el) { txt(el, S.nome); });
  var topo = $(".topo"); if (topo) topo.setAttribute("data-marca", (S.nome || "").split(" ")[0]);
  txt($("#frase"), S.frase);
  txt($("#sub"), S.sub);
  txt($("#cidade"), S.cidade);
  if (!S.exemplo) { var av = $("#aviso"); if (av) av.hidden = true; }

  var lista = $("#servicos");
  (S.servicos || []).forEach(function (s, i) {
    var li = document.createElement("li");
    li.innerHTML = '<span class="n"></span><div><h3></h3><p></p></div><span class="p"></span>';
    li.querySelector(".n").textContent = String(i + 1).padStart(2, "0");
    li.querySelector("h3").textContent = s.nome;
    li.querySelector("p").textContent = s.desc;
    li.querySelector(".p").textContent = s.preco || "Consulte";
    lista.appendChild(li);
  });

  var dif = $("#diferenciais");
  (S.diferenciais || []).forEach(function (d) {
    var div = document.createElement("div");
    div.className = "dif";
    div.innerHTML = "<h3></h3><p></p>";
    div.querySelector("h3").textContent = d[0];
    div.querySelector("p").textContent = d[1];
    dif.appendChild(div);
  });

  var onde = $("#onde-info");
  var temEnd = S.endereco && S.endereco.texto;
  var temHor = S.horarios && S.horarios.length;
  if (!temEnd && !temHor) {
    onde.innerHTML = "<p>Endereço e horários: consulte pelo WhatsApp.</p>";
  } else {
    if (temEnd) {
      var p = document.createElement("p"); p.textContent = S.endereco.texto; onde.appendChild(p);
      if (S.endereco.mapaUrl) {
        var a = document.createElement("a"); a.className = "btn ghost"; a.href = S.endereco.mapaUrl;
        a.target = "_blank"; a.rel = "noopener"; a.textContent = "Abrir no Google Maps"; onde.appendChild(a);
      }
    }
    if (temHor) {
      var dl = document.createElement("dl");
      S.horarios.forEach(function (h) {
        var dt = document.createElement("dt"); dt.textContent = h[0];
        var dd = document.createElement("dd"); dd.textContent = h[1];
        dl.append(dt, dd);
      });
      onde.appendChild(dl);
    }
  }
  if (S.instagram) { var ig = $("#ig"); ig.href = "https://instagram.com/" + S.instagram; ig.hidden = false; }
})();
