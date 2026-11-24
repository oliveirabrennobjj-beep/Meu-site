// Lê o config.js, monta os links de WhatsApp e cuida do pedido (carrinho). Sem framework.
(function () {
  var S = window.SITE || {};
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var insta = S.instagram ? "https://www.instagram.com/" + S.instagram + "/" : "";
  var msgs = S.mensagens || {};

  function linkZap(texto) {
    return "https://wa.me/" + S.whatsapp + "?text=" + encodeURIComponent(texto || msgs.geral || "");
  }

  // ---------- Botões de WhatsApp (cada um com a mensagem da sua parte) ----------
  $$("[data-wa]").forEach(function (a) {
    if (S.whatsapp) {
      a.href = linkZap(msgs[a.dataset.wa] || msgs.geral);
      a.target = "_blank";
      a.rel = "noopener";
      if (a.dataset.wa === "geral") {
        a.addEventListener("click", function () { aviso("Abrindo o WhatsApp…"); });
      }
    } else if (insta) {
      a.href = insta;
      a.target = "_blank";
      a.rel = "noopener";
    } else {
      a.hidden = true;
    }
  });

  // ---------- Aviso curto no pé da tela ----------
  var caixaAviso = $("[data-aviso]");
  var tAviso;
  function aviso(texto) {
    if (!caixaAviso) return;
    caixaAviso.textContent = texto;
    caixaAviso.classList.add("ligado");
    clearTimeout(tAviso);
    tAviso = setTimeout(function () { caixaAviso.classList.remove("ligado"); }, 2200);
  }

  // ---------- Dados da loja na página ----------
  var nota = $("[data-nota]");
  if (nota && S.nota) {
    $("[data-nota-valor]", nota).textContent = String(S.nota).replace(".", ",");
    $("[data-nota-texto]", nota).textContent = "nota no Google" + (S.avaliacoes ? ", " + S.avaliacoes + " avaliações de clientes" : "");
    nota.hidden = false;
  }
  var maps = $("[data-maps]");
  if (maps) maps.href = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(S.endereco ? S.endereco : S.nome + " " + S.cidade);
  var ig = $("[data-insta]");
  if (ig) { if (insta) ig.href = insta; else ig.hidden = true; }
  var anota = $("[data-anotaai]");
  if (anota && S.linkAnotaAi) { anota.href = S.linkAnotaAi; anota.hidden = false; }
  function preencher(sel, texto, link) {
    var li = $(sel);
    if (!li || !texto) return;
    var alvo = link ? $("a", li) : $("span", li);
    alvo.textContent = texto;
    if (link) alvo.href = link;
    li.hidden = false;
  }
  preencher("[data-endereco]", S.endereco);
  preencher("[data-telefone]", S.whatsappVisivel, S.whatsapp ? "tel:+" + S.whatsapp : "");
  preencher("[data-email]", S.email, S.email ? "mailto:" + S.email : "");
  preencher("[data-horarios]", S.horarios);

  // ---------- Itens em destaque: nome, descrição e preço vêm do config ----------
  var itens = S.itens || {};
  $$("[data-item]").forEach(function (card) {
    var d = itens[card.dataset.item];
    if (!d) return;
    $("[data-nome]", card).textContent = d.nome;
    if (d.descricao) { var de = $("[data-desc]", card); de.textContent = d.descricao; de.hidden = false; }
    if (d.preco) {
      var pr = $("[data-preco]", card); pr.textContent = d.preco; pr.hidden = false;
      $("[data-consulte]", card).hidden = true;
    }
  });

  // ---------- Cabeçalho: ganha fundo ao rolar ----------
  var cabeca = $(".cabeca");
  function aoRolar() {
    cabeca.classList.toggle("rolou", window.scrollY > 40);
  }
  aoRolar();
  window.addEventListener("scroll", aoRolar, { passive: true });

  // ---------- Menu do celular ----------
  var menuCel = $("#menu-celular");
  var btnMenu = $("[data-abrir-menu]");
  function menuAbre(abrir) {
    menuCel.hidden = !abrir;
    btnMenu.setAttribute("aria-expanded", String(abrir));
    document.body.classList.toggle("travado", abrir);
    if (abrir) $("[data-fechar-menu]").focus(); else btnMenu.focus();
  }
  btnMenu.addEventListener("click", function () { menuAbre(true); });
  $("[data-fechar-menu]").addEventListener("click", function () { menuAbre(false); });
  $$("#menu-celular a").forEach(function (a) { a.addEventListener("click", function () { menuAbre(false); }); });

  // ---------- Pedido (carrinho): guarda no aparelho e envia pelo WhatsApp ----------
  var pedido = {};
  try { pedido = JSON.parse(localStorage.getItem("bestbull-pedido") || "{}") || {}; } catch (e) { pedido = {}; }
  function guardar() { try { localStorage.setItem("bestbull-pedido", JSON.stringify(pedido)); } catch (e) { /* sem armazenamento */ } }
  function total() { return Object.keys(pedido).reduce(function (n, k) { return n + pedido[k]; }, 0); }
  function nomeDe(id) { return (itens[id] && itens[id].nome) || id; }

  var gaveta = $("#gaveta"), veu = $("[data-veu]"), lista = $("[data-linhas]");
  var vazio = $("[data-vazio]"), obsRotulo = $("[data-obs-rotulo]"), obs = $("[data-obs]");
  var enviar = $("[data-enviar]"), limpar = $("[data-limpar]");

  function desenhar() {
    var ids = Object.keys(pedido).filter(function (k) { return pedido[k] > 0; });
    lista.textContent = "";
    ids.forEach(function (id) {
      var li = document.createElement("li");
      var nome = document.createElement("span");
      nome.className = "nome";
      nome.textContent = nomeDe(id);
      var qtd = document.createElement("div");
      qtd.className = "qtd";
      qtd.appendChild(botaoQtd(id, -1));
      var o = document.createElement("output");
      o.textContent = pedido[id];
      qtd.appendChild(o);
      qtd.appendChild(botaoQtd(id, 1));
      li.appendChild(nome);
      li.appendChild(qtd);
      lista.appendChild(li);
    });
    var n = total();
    vazio.hidden = n > 0;
    obsRotulo.hidden = n === 0;
    limpar.hidden = n === 0;
    enviar.setAttribute("aria-disabled", String(n === 0));
    enviar.href = n === 0 || !S.whatsapp ? "#" : linkZap(texto());
    $$("[data-contagem]").forEach(function (c) { c.textContent = n; c.hidden = n === 0; });
    var inline = $("[data-contagem-inline]");
    if (inline) { inline.textContent = n; inline.hidden = n === 0; }
  }
  function botaoQtd(id, delta) {
    var b = document.createElement("button");
    b.type = "button";
    b.setAttribute("aria-label", (delta > 0 ? "Mais um " : "Menos um ") + nomeDe(id));
    b.innerHTML = '<svg class="ic" aria-hidden="true"><use href="#i-' + (delta > 0 ? "mais" : "menos") + '"/></svg>';
    b.addEventListener("click", function () { mudar(id, delta); });
    return b;
  }
  function texto() {
    var linhas = Object.keys(pedido).filter(function (k) { return pedido[k] > 0; }).map(function (k) { return "- " + pedido[k] + "x " + nomeDe(k); });
    var t = (msgs.pedido || "Olá! Quero fazer um pedido:") + "\n" + linhas.join("\n");
    if (obs.value.trim()) t += "\nObservações: " + obs.value.trim();
    return t + "\nPodem confirmar valores e prazo?";
  }
  function mudar(id, delta) {
    pedido[id] = Math.max(0, (pedido[id] || 0) + delta);
    if (pedido[id] === 0) delete pedido[id];
    guardar();
    desenhar();
  }
  var ultimoFoco = null;
  function gavetaAbre(abrir) {
    gaveta.hidden = !abrir;
    veu.hidden = !abrir;
    document.body.classList.toggle("travado", abrir);
    if (abrir && caixaAviso) caixaAviso.classList.remove("ligado");
    if (abrir) { ultimoFoco = document.activeElement; $("[data-fechar-carrinho]").focus(); }
    else if (ultimoFoco) ultimoFoco.focus();
  }
  $$("[data-abrir-carrinho]").forEach(function (b) { b.addEventListener("click", function () { gavetaAbre(true); }); });
  $("[data-fechar-carrinho]").addEventListener("click", function () { gavetaAbre(false); });
  veu.addEventListener("click", function () { gavetaAbre(false); });
  limpar.addEventListener("click", function () { pedido = {}; guardar(); desenhar(); });
  obs.addEventListener("input", desenhar);
  enviar.addEventListener("click", function (e) {
    if (enviar.getAttribute("aria-disabled") === "true") e.preventDefault();
    else aviso("Abrindo o WhatsApp…");
  });
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (!gaveta.hidden) gavetaAbre(false);
    else if (!menuCel.hidden) menuAbre(false);
  });
  $$("[data-add]").forEach(function (b) {
    b.addEventListener("click", function () {
      var id = b.closest("[data-item]").dataset.item;
      mudar(id, 1);
      b.classList.add("ok");
      setTimeout(function () { b.classList.remove("ok"); }, 900);
      aviso(nomeDe(id) + " no pedido (" + total() + ")");
    });
  });
  desenhar();

  // ---------- Galeria: setas rolam as fotos ----------
  var trilho = $(".galeria-trilho");
  $$("[data-galeria]").forEach(function (b) {
    b.addEventListener("click", function () {
      trilho.scrollBy({ left: Number(b.dataset.galeria) * trilho.clientWidth * 0.8, behavior: "smooth" });
    });
  });

  // ---------- Barra do celular: aparece depois do topo ----------
  var barra = $("[data-flutuante]");
  var alvo = $(".hero .acoes");
  if (barra && alvo && "IntersectionObserver" in window) {
    new IntersectionObserver(function (e) { barra.classList.toggle("visivel", !e[0].isIntersecting); }).observe(alvo);
  } else if (barra) {
    barra.classList.add("visivel");
  }
})();
