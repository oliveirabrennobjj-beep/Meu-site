/* Depósito do Gordinho: monta as partes que vêm do config.js */
(function () {
  "use strict";
  var S = window.SITE;
  if (!S) return;

  var reduz = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  function linkZap(msg) {
    return "https://wa.me/" + S.whatsapp + "?text=" + encodeURIComponent(msg || S.mensagemWhatsApp);
  }

  /* ---------- links e dados fixos ---------- */
  $$("[data-zap]").forEach(function (a) { a.href = linkZap(); a.target = "_blank"; a.rel = "noopener"; });
  $$("[data-tel]").forEach(function (a) { a.href = "tel:" + S.telefoneLink; });
  $$("[data-tel-texto]").forEach(function (el) { el.textContent = S.telefone; });
  $$("[data-insta]").forEach(function (a) { a.href = S.instagram; a.target = "_blank"; a.rel = "noopener"; });
  $$("[data-mapa]").forEach(function (a) { a.href = S.mapaUrl; a.target = "_blank"; a.rel = "noopener"; });
  $$("[data-avaliacoes-link]").forEach(function (a) { a.href = S.avaliacoesUrl; a.target = "_blank"; a.rel = "noopener"; });
  $$("[data-endereco]").forEach(function (el) { el.textContent = S.endereco; });
  $$("[data-cidade]").forEach(function (el) { el.textContent = S.cidade; });

  var horas = $("[data-horario]");
  if (horas) {
    horas.innerHTML = S.horario.map(function (h) {
      return "<div class=\"hora\"><dt>" + esc(h.dias) + "</dt><dd>" + esc(h.horas) + "</dd></div>";
    }).join("");
  }
  var pag = $("[data-pagamento]");
  if (pag) pag.innerHTML = S.pagamento.map(function (p) { return "<li>" + esc(p) + "</li>"; }).join("");

  var revs = $("[data-avaliacoes]");
  if (revs) {
    revs.innerHTML = S.avaliacoes.map(function (r) {
      return "<figure class=\"aval\"><div class=\"aval-estrelas\" aria-label=\"5 estrelas\">★★★★★</div>" +
        "<blockquote>" + esc(r.texto) + "</blockquote><figcaption>" + esc(r.nome) + "</figcaption></figure>";
    }).join("");
  }

  /* ---------- desenho das garrafas (SVG) ---------- */
  var uid = 0;
  var B = 296; // base

  function vidro(x0, x1, n0, n1, top, neckEnd, shoulderEnd) {
    var sh = shoulderEnd - neckEnd;
    return "M" + n0 + "," + (top + 4) + " L" + n0 + "," + neckEnd +
      " C" + n0 + "," + (neckEnd + sh * 0.55) + " " + x0 + "," + (shoulderEnd - sh * 0.4) + " " + x0 + "," + shoulderEnd +
      " L" + x0 + "," + (B - 7) + " Q" + x0 + "," + B + " " + (x0 + 7) + "," + B +
      " L" + (x1 - 7) + "," + B + " Q" + x1 + "," + B + " " + x1 + "," + (B - 7) +
      " L" + x1 + "," + shoulderEnd +
      " C" + x1 + "," + (shoulderEnd - sh * 0.4) + " " + n1 + "," + (neckEnd + sh * 0.55) + " " + n1 + "," + neckEnd +
      " L" + n1 + "," + (top + 4) + " Z";
  }

  function forma(p) {
    var t = p.tipo;
    // medidas em proporção real (300 unidades ≈ 33 cm)
    var m = {
      garrafa: { h: 261, w: 64, n: 17, neck: 70, sh: 52 },
      longneck: { h: 207, w: 52, n: 15, neck: 66, sh: 40 },
      vinho: { h: 270, w: 64, n: 17, neck: 82, sh: 30 },
      alta: { h: 266, w: 66, n: 18, neck: 56, sh: 34 },
      quadrada: { h: 250, w: 76, n: 20, neck: 34, sh: 18 },
      agua: { h: 189, w: 58, n: 20, neck: 20, sh: 34 },
      pet: { h: 292, w: 92, n: 24, neck: 22, sh: 70 },
      lata: { h: 110, w: 60 },
      latao: { h: 141, w: 60 },
      saco: { h: 150, w: 86 },
      caixa: { h: 92, w: 80 }
    }[t] || { h: 261, w: 64, n: 17, neck: 70, sh: 52 };
    var top = B - m.h, x0 = 50 - m.w / 2, x1 = 50 + m.w / 2;
    if (t === "saco") {
      var z = "", k;
      for (k = 0; k <= 10; k++) z += " L" + (x0 + 4 + k * (m.w - 8) / 10).toFixed(1) + "," + (top + (k % 2 ? 0 : 5));
      var ds = "M" + (x0 + 4) + "," + (top + 5) + z + " L" + (x1 - 4) + "," + (top + 12) +
        " C" + (x1 + 2) + "," + (top + 40) + " " + (x1 + 2) + "," + (B - 40) + " " + (x1 - 3) + "," + (B - 10) +
        " L" + (x1 - 3) + "," + B + " L" + (x0 + 3) + "," + B + " L" + (x0 + 3) + "," + (B - 10) +
        " C" + (x0 - 2) + "," + (B - 40) + " " + (x0 - 2) + "," + (top + 40) + " " + (x0 + 4) + "," + (top + 12) + " Z";
      return { d: ds, top: top, x0: x0, x1: x1, corpo: top + 14, lata: true, pacote: true, w: m.w, h: m.h };
    }
    if (t === "caixa") {
      var dc = "M" + (x0 + 3) + "," + top + " H" + (x1 - 3) + " Q" + x1 + "," + top + " " + x1 + "," + (top + 3) +
        " V" + (B - 3) + " Q" + x1 + "," + B + " " + (x1 - 3) + "," + B + " H" + (x0 + 3) + " Q" + x0 + "," + B + " " + x0 + "," + (B - 3) +
        " V" + (top + 3) + " Q" + x0 + "," + top + " " + (x0 + 3) + "," + top + " Z";
      return { d: dc, top: top, x0: x0, x1: x1, corpo: top + 12, lata: true, pacote: true, w: m.w, h: m.h };
    }
    if (t === "lata" || t === "latao") {
      var d = "M" + (x0 + 5) + "," + top + " L" + (x1 - 5) + "," + top +
        " Q" + x1 + "," + (top + 2) + " " + x1 + "," + (top + 10) +
        " L" + x1 + "," + (B - 8) + " Q" + x1 + "," + (B - 1) + " " + (x1 - 6) + "," + B +
        " L" + (x0 + 6) + "," + B + " Q" + x0 + "," + (B - 1) + " " + x0 + "," + (B - 8) +
        " L" + x0 + "," + (top + 10) + " Q" + x0 + "," + (top + 2) + " " + (x0 + 5) + "," + top + " Z";
      return { d: d, top: top, x0: x0, x1: x1, corpo: top + 12, lata: true, w: m.w, h: m.h };
    }
    var n0 = 50 - m.n / 2, n1 = 50 + m.n / 2;
    var neckEnd = top + m.neck, shoulderEnd = neckEnd + m.sh;
    return { d: vidro(x0, x1, n0, n1, top, neckEnd, shoulderEnd), top: top, x0: x0, x1: x1, n0: n0, n1: n1, corpo: shoulderEnd, w: m.w, h: m.h, neckEnd: neckEnd };
  }

  function quebra(nome) {
    var p = nome.split(" ");
    if (p.length === 1 || nome.length <= 9) return [nome];
    var meio = Math.ceil(p.length / 2);
    return [p.slice(0, meio).join(" "), p.slice(meio).join(" ")];
  }

  function garrafaSVG(p, gelada) {
    uid += 1;
    var id = "g" + uid;
    var f = forma(p);
    var claro = p.tipo === "alta" || p.tipo === "quadrada" && /#d|#e/i.test(p.cor) || p.tipo === "agua";
    var corpoH = B - f.corpo;
    var lY, lH;
    if (f.pacote) { gelada = false; lY = f.top + f.h * 0.3; lH = f.h * 0.42; }
    else if (f.lata) { lY = f.top + f.h * 0.22; lH = f.h * 0.56; }
    else { lY = f.corpo + corpoH * (p.tipo === "pet" ? 0.16 : 0.2); lH = corpoH * (p.tipo === "pet" ? 0.34 : 0.42); }
    var linhas = quebra(p.nome);
    var fs = Math.min(f.w * 0.27, 15);
    var maior = linhas.reduce(function (a, b) { return a.length > b.length ? a : b; });
    fs = Math.min(fs, (f.w - 10) / (maior.length * 0.5));
    var meio = lY + lH / 2;
    var txt = linhas.map(function (l, i) {
      var y = meio + (i - (linhas.length - 1) / 2) * fs * 1.02 + fs * 0.34;
      return "<text x=\"50\" y=\"" + y.toFixed(1) + "\" font-size=\"" + fs.toFixed(1) + "\" fill=\"" + p.letra + "\" text-anchor=\"middle\">" + esc(l) + "</text>";
    }).join("");

    var tampa = "";
    if (!f.lata) {
      var tw = (f.n1 - f.n0) + 3;
      var th = p.tipo === "quadrada" || p.tipo === "alta" || p.tipo === "pet" || p.tipo === "agua" || p.tipo === "vinho" ? 14 : 7;
      if (p.tipo === "vinho") th = 30;
      tampa = "<rect x=\"" + (50 - tw / 2) + "\" y=\"" + (f.top - 3) + "\" width=\"" + tw + "\" height=\"" + th + "\" rx=\"2\" fill=\"" + (p.tampa || "#c9a54c") + "\"/>" +
        "<rect x=\"" + (50 - tw / 2) + "\" y=\"" + (f.top - 3) + "\" width=\"" + tw + "\" height=\"" + th + "\" rx=\"2\" fill=\"url(#" + id + "c)\"/>";
    } else if (f.pacote) {
      tampa = "";
    } else {
      tampa = "<ellipse cx=\"50\" cy=\"" + (f.top + 3) + "\" rx=\"" + (f.w / 2 - 6) + "\" ry=\"3\" fill=\"#d7dadd\"/>" +
        "<ellipse cx=\"50\" cy=\"" + (f.top + 3) + "\" rx=\"" + (f.w / 2 - 12) + "\" ry=\"1.6\" fill=\"#aeb3b8\"/>";
    }

    var rotulo = f.pacote
      ? "<rect x=\"" + (f.x0 + 7) + "\" y=\"" + lY.toFixed(1) + "\" width=\"" + (f.w - 14) + "\" height=\"" + lH.toFixed(1) + "\" rx=\"8\" fill=\"" + p.rotulo + "\"/>"
      : f.lata
      ? ""
      : "<rect x=\"0\" y=\"" + lY.toFixed(1) + "\" width=\"100\" height=\"" + lH.toFixed(1) + "\" fill=\"" + p.rotulo + "\"/>" +
        "<rect x=\"0\" y=\"" + (lY + 3).toFixed(1) + "\" width=\"100\" height=\"1\" fill=\"" + p.letra + "\" opacity=\".45\"/>" +
        "<rect x=\"0\" y=\"" + (lY + lH - 4).toFixed(1) + "\" width=\"100\" height=\"1\" fill=\"" + p.letra + "\" opacity=\".45\"/>";
    var gotas = gelada
      ? "<rect x=\"0\" y=\"0\" width=\"100\" height=\"300\" fill=\"url(#" + id + "d)\"/>"
      : "";
    var pet = p.tipo === "pet"
      ? "<path d=\"M" + f.x0 + "," + (B - 40) + " H" + f.x1 + " M" + f.x0 + "," + (B - 46) + " H" + f.x1 + "\" stroke=\"#000\" stroke-opacity=\".18\" stroke-width=\"1.2\"/>"
      : "";

    return "<svg class=\"garrafa-svg\" viewBox=\"0 -8 100 308\" aria-hidden=\"true\" focusable=\"false\">" +
      "<defs>" +
      "<clipPath id=\"" + id + "k\"><path d=\"" + f.d + "\"/></clipPath>" +
      "<linearGradient id=\"" + id + "v\" x1=\"0\" x2=\"1\"><stop offset=\"0\" stop-color=\"#000\" stop-opacity=\".45\"/><stop offset=\".18\" stop-color=\"#fff\" stop-opacity=\"" + (f.lata ? ".35" : ".18") + "\"/><stop offset=\".28\" stop-color=\"#fff\" stop-opacity=\".04\"/><stop offset=\".7\" stop-color=\"#000\" stop-opacity=\".08\"/><stop offset=\"1\" stop-color=\"#000\" stop-opacity=\".5\"/></linearGradient>" +
      "<linearGradient id=\"" + id + "c\" x1=\"0\" x2=\"1\"><stop offset=\"0\" stop-color=\"#000\" stop-opacity=\".3\"/><stop offset=\".3\" stop-color=\"#fff\" stop-opacity=\".35\"/><stop offset=\"1\" stop-color=\"#000\" stop-opacity=\".35\"/></linearGradient>" +
      "<pattern id=\"" + id + "d\" width=\"14\" height=\"16\" patternUnits=\"userSpaceOnUse\"><circle cx=\"3\" cy=\"4\" r=\".7\" fill=\"#fff\" opacity=\".22\"/><circle cx=\"10\" cy=\"11\" r=\".5\" fill=\"#fff\" opacity=\".18\"/></pattern>" +
      "</defs>" +
      "<ellipse cx=\"50\" cy=\"" + (B + 2) + "\" rx=\"" + (f.w / 2 + 4) + "\" ry=\"3.4\" fill=\"#000\" opacity=\".35\"/>" +
      "<path d=\"" + f.d + "\" fill=\"" + p.cor + "\" opacity=\"" + (claro ? ".82" : "1") + "\"/>" +
      "<g clip-path=\"url(#" + id + "k)\">" + rotulo + (f.lata ? "" : "") + gotas + pet +
      "<g font-family=\"Archivo, sans-serif\" font-weight=\"800\" font-stretch=\"75%\">" + txt + "</g>" +
      "<rect x=\"0\" y=\"-10\" width=\"100\" height=\"320\" fill=\"url(#" + id + "v)\"/>" +
      (f.lata ? "" : "<rect x=\"" + (f.x0 + f.w * 0.16) + "\" y=\"" + (f.corpo + 6) + "\" width=\"3\" height=\"" + (corpoH * 0.7) + "\" rx=\"1.5\" fill=\"#fff\" opacity=\".28\"/>") +
      "</g>" + tampa + "</svg>";
  }

  /* ---------- a geladeira ---------- */
  var gel = $("[data-geladeira]");
  if (gel) {
    var abas = $("[data-abas]", gel);
    var palco = $("[data-palco]", gel);
    var nomeEl = $("[data-prod-nome]", gel);
    var tamEl = $("[data-prod-tam]", gel);
    var precoEl = $("[data-prod-preco]", gel);
    var contEl = $("[data-prod-cont]", gel);
    var pedir = $("[data-prod-pedir]", gel);
    var antes = $("[data-ant]", gel);
    var depois = $("[data-prox]", gel);
    var catAtual = S.categorias[0].id;
    var atual = 0;
    var itens = [];

    var ICONES = {
      "cervejas": "M5 9h10v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2zM15 11h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2M5 9c0-2.5 1.6-3.6 3.2-3.2.6-1.6 2.6-2 3.6-.9 1.4-.6 3.2.4 3.2 2.4V9M9 13v4M12 13v4",
      "destilados": "M10 2h4v4l2 3v12a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V9l2-3zM8 13h8M8 18h8",
      "vinhos": "M8 2h8l-.6 6.5a3.4 3.4 0 0 1-6.8 0zM12 12v8M8 21h8M8.4 6h7.2",
      "sem-alcool": "M6 8h12l-1.4 13a1 1 0 0 1-1 .9H8.4a1 1 0 0 1-1-.9zM12 8l2-6h3M6.5 12h11",
      "petiscos": "M9 9a4.5 4.5 0 1 0 6 6 4.5 4.5 0 0 0-6-6zM9 9 5.5 5.5 3 6l1-3M15 15l3.5 3.5L21 18l-1 3M10 13l3-3"
    };
    abas.innerHTML = S.categorias.map(function (c, i) {
      var n = S.produtos.filter(function (p) { return p.cat === c.id; }).length;
      return "<button type=\"button\" role=\"tab\" class=\"aba\" id=\"aba-" + c.id + "\" aria-controls=\"palco\" aria-selected=\"" + (i === 0) + "\" data-cat=\"" + c.id + "\">" +
        "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"" + (ICONES[c.id] || ICONES.destilados) + "\"/></svg>" +
        "<span class=\"aba-nome\">" + esc(c.nome) + "</span><span class=\"aba-n\">" + n + "</span></button>";
    }).join("");

    function lista() { return S.produtos.filter(function (p) { return p.cat === catAtual; }); }

    function montar() {
      var ps = lista();
      palco.innerHTML = ps.map(function (p, i) {
        return "<button type=\"button\" class=\"garrafa\" data-i=\"" + i + "\" aria-label=\"" + esc(p.nome + ", " + p.tamanho) + "\" tabindex=\"-1\">" +
          garrafaSVG(p, p.cat !== "destilados") + "</button>";
      }).join("") + "<div class=\"prateleira\" aria-hidden=\"true\"></div>";
      itens = $$(".garrafa", palco);
      itens.forEach(function (el) {
        el.addEventListener("click", function () {
          if (arrastou) return;
          ir(Number(el.getAttribute("data-i")));
        });
      });
      atual = 0;
      pintar();
    }

    function largura() { return palco.clientWidth; }

    function pintar() {
      var ps = lista();
      var w = largura();
      var celular = w < 560;
      var passo = celular ? w * 0.27 : Math.min(150, w * 0.13);
      itens.forEach(function (el, i) {
        var r = i - atual;
        var a = Math.abs(r);
        var lado = r < 0 ? -1 : 1;
        var x = r === 0 ? 0 : lado * (passo * 1.05 + (a - 1) * passo * 0.82);
        var z = r === 0 ? 60 : -a * 110;
        var rot = r === 0 ? 0 : -lado * Math.min(34, 16 + a * 6);
        var esc2 = r === 0 ? 1.08 : Math.max(0.6, 0.86 - (a - 1) * 0.08);
        var lim = celular ? 2 : 3;
        el.style.transform = "translateX(" + x.toFixed(1) + "px) translateZ(" + z + "px) rotateY(" + rot + "deg) scale(" + esc2.toFixed(3) + ")";
        el.style.opacity = a > lim ? "0" : String(r === 0 ? 1 : Math.max(0.35, 1 - a * 0.2));
        el.style.zIndex = String(100 - a);
        el.style.visibility = a > lim + 1 ? "hidden" : "visible";
        el.classList.toggle("ativa", r === 0);
        el.setAttribute("aria-current", r === 0 ? "true" : "false");
      });
      var p = ps[atual];
      if (!p) return;
      nomeEl.textContent = p.nome;
      tamEl.textContent = p.tamanho;
      precoEl.textContent = p.preco ? p.preco : "Preço no WhatsApp";
      contEl.textContent = (atual + 1) + " de " + ps.length;
      pedir.href = linkZap("Olá, Depósito do Gordinho! Quero pedir: " + p.nome + " (" + p.tamanho + "). Meu endereço é: ");
      pedir.target = "_blank";
      pedir.rel = "noopener";
      antes.disabled = atual === 0;
      depois.disabled = atual === ps.length - 1;
    }

    function ir(i) {
      var n = lista().length;
      atual = Math.max(0, Math.min(n - 1, i));
      pintar();
    }

    antes.addEventListener("click", function () { ir(atual - 1); });
    depois.addEventListener("click", function () { ir(atual + 1); });

    abas.addEventListener("click", function (e) {
      var b = e.target.closest("[data-cat]");
      if (!b) return;
      catAtual = b.getAttribute("data-cat");
      $$(".aba", abas).forEach(function (x) { x.setAttribute("aria-selected", String(x === b)); });
      montar();
    });
    abas.addEventListener("keydown", function (e) {
      var mais = e.key === "ArrowDown" || e.key === "ArrowRight";
      if (!mais && e.key !== "ArrowUp" && e.key !== "ArrowLeft") return;
      e.preventDefault();
      var bs = $$(".aba", abas);
      var i = bs.indexOf(document.activeElement);
      if (i < 0) return;
      var n = bs[(i + (mais ? 1 : -1) + bs.length) % bs.length];
      n.focus();
      n.click();
    });
    palco.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); ir(atual + 1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); ir(atual - 1); }
    });

    // arrastar com o dedo
    var x0 = null, arrastou = false;
    palco.addEventListener("pointerdown", function (e) { x0 = e.clientX; arrastou = false; });
    palco.addEventListener("pointermove", function (e) { if (x0 !== null && Math.abs(e.clientX - x0) > 12) arrastou = true; });
    palco.addEventListener("pointerup", function (e) {
      if (x0 === null) return;
      var dx = e.clientX - x0;
      x0 = null;
      if (Math.abs(dx) > 40) ir(atual + (dx < 0 ? 1 : -1));
      setTimeout(function () { arrastou = false; }, 0);
    });
    palco.addEventListener("pointercancel", function () { x0 = null; arrastou = false; });

    var rt;
    window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(pintar, 80); });
    if (reduz) gel.classList.add("sem-movimento");
    montar();
  }

  /* ---------- lista completa ---------- */
  var tudo = $("[data-lista]");
  if (tudo) {
    tudo.innerHTML = S.categorias.map(function (c) {
      var ps = S.produtos.filter(function (p) { return p.cat === c.id; });
      return "<div class=\"lista-grupo\"><h3>" + esc(c.nome) + "</h3><ul>" + ps.map(function (p) {
        return "<li class=\"item\"><span class=\"item-img\">" + garrafaSVG(p, false) + "</span>" +
          "<span class=\"item-txt\"><strong>" + esc(p.nome) + "</strong><span>" + esc(p.tamanho) + "</span></span>" +
          "<a class=\"btn btn-zap btn-pq\" target=\"_blank\" rel=\"noopener\" href=\"" +
          linkZap("Olá, Depósito do Gordinho! Quero pedir: " + p.nome + " (" + p.tamanho + "). Meu endereço é: ") +
          "\">Pedir</a></li>";
      }).join("") + "</ul></div>";
    }).join("");
  }

  /* ano do rodapé */
  $$("[data-ano]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
