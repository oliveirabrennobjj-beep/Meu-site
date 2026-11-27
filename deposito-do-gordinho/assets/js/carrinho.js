/*
  Carrinho e pedido pelo site (Depósito do Gordinho)
  Ficha do produto -> carrinho -> finalizar -> mensagem pronta no WhatsApp.
  O carrinho fica salvo no navegador do cliente.
*/
(function () {
  "use strict";
  var L = window.LOJA || {};
  var M = window.MODELOS;
  var P = window.PRODUTOS || [];
  if (!M) return;

  var IMG = "assets/img/produtos/";
  var GELADA = ["cervejas", "refrigerantes", "energeticos", "vinhos", "agua-gelo"];
  var esc = M.esc;
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function num(v) { var n = parseFloat(String(v || "").replace(/\./g, "").replace(",", ".")); return isNaN(n) ? null : n; }
  function real(n) { return "R$ " + n.toFixed(2).replace(".", ","); }
  function guarda(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sem armazenamento */ } }
  function le(k, padrao) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? padrao : v; } catch (e) { return padrao; } }

  var porId = {};
  P.forEach(function (p) { porId[M.idDe(p)] = p; });
  function temOpcao(p) { return GELADA.indexOf(p.categoria) > -1 && !/gelo/i.test(p.nome); }

  var cart = le("gordinho-carrinho", []).filter(function (i) { return porId[i.id]; });
  var dados = le("gordinho-cliente", {});
  function salvar() { guarda("gordinho-carrinho", cart); contador(); }

  /* ---------- gaveta (painel lateral / de baixo) ---------- */
  var gav = $("[data-gaveta]");
  var tit = $("[data-gaveta-tit]");
  var corpo = $("[data-gaveta-corpo]");
  var pe = $("[data-gaveta-pe]");
  var antes = null;

  function abrir(titulo) {
    tit.textContent = titulo;
    if (gav.hidden) {
      antes = document.activeElement;
      gav.hidden = false;
      document.documentElement.classList.add("trava");
      requestAnimationFrame(function () { gav.classList.add("aberta"); });
    }
    corpo.scrollTop = 0;
    setTimeout(function () { var f = $("[data-fechar].icone", gav); if (f) f.focus(); }, 60);
  }
  function fechar() {
    gav.classList.remove("aberta");
    document.documentElement.classList.remove("trava");
    setTimeout(function () { gav.hidden = true; if (antes && antes.focus) antes.focus(); }, 280);
  }
  gav.addEventListener("click", function (e) { if (e.target.closest("[data-fechar]")) fechar(); });
  document.addEventListener("keydown", function (e) {
    if (gav.hidden) return;
    if (e.key === "Escape") fechar();
    if (e.key === "Tab") {
      var f = $$("button, a[href], input, textarea, [tabindex='0']", gav).filter(function (x) { return x.offsetParent !== null && !x.disabled; });
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });

  function passo(n, txt) { return "<p class=\"g-passo\"><span>" + n + "</span>" + txt + "</p>"; }
  function stepper(valor, attr) {
    return "<div class=\"qtd\" " + attr + "><button type=\"button\" data-menos aria-label=\"Diminuir\">−</button>" +
      "<span aria-live=\"polite\">" + valor + "</span><button type=\"button\" data-mais aria-label=\"Aumentar\">+</button></div>";
  }

  /* ---------- 1. ficha do produto ---------- */
  function abrirProduto(id) {
    var p = porId[id];
    if (!p) return;
    var qtd = 1;
    var preco = num(p.preco);
    corpo.innerHTML =
      "<div class=\"g-foto\"><img src=\"" + IMG + esc(p.foto) + ".webp\" alt=\"" + esc(p.nome) + "\"></div>" +
      "<p class=\"produto-tam\">" + esc(p.tamanho) + "</p>" +
      "<h3 class=\"g-nome\">" + esc(p.nome) + "</h3>" +
      "<p class=\"g-preco\">" + (preco != null ? real(preco) : "Preço a confirmar no WhatsApp") + "</p>" +
      (temOpcao(p) ?
        "<fieldset class=\"g-grupo\"><legend class=\"g-legenda\">Como você quer?</legend><div class=\"opcoes opcoes-2\">" +
        "<label class=\"opcao\"><input type=\"radio\" name=\"temp\" value=\"Gelada\" checked><span>Gelada</span></label>" +
        "<label class=\"opcao\"><input type=\"radio\" name=\"temp\" value=\"Natural\"><span>Natural</span></label></div></fieldset>" : "") +
      "<label class=\"g-legenda\" for=\"g-obs\">Alguma observação?</label>" +
      "<textarea id=\"g-obs\" class=\"campo\" rows=\"2\" placeholder=\"Ex.: bem gelada, trocar se não tiver\"></textarea>";
    function rodape() {
      pe.innerHTML = "<div class=\"g-pe-linha\">" + stepper(qtd, "data-qtd") +
        "<button type=\"button\" class=\"btn btn-ouro btn-cheio\" data-adicionar>Adicionar" + (preco != null ? " · " + real(preco * qtd) : " ao pedido") + "</button></div>";
    }
    rodape();
    pe.onclick = function (e) {
      if (e.target.closest("[data-menos]")) { qtd = Math.max(1, qtd - 1); rodape(); }
      else if (e.target.closest("[data-mais]")) { qtd = Math.min(99, qtd + 1); rodape(); }
      else if (e.target.closest("[data-adicionar]")) {
        var t = $("input[name=temp]:checked", corpo);
        var item = { id: id, qtd: qtd, opcao: t ? t.value : "", obs: $("#g-obs").value.trim() };
        var igual = cart.filter(function (i) { return i.id === item.id && i.opcao === item.opcao && i.obs === item.obs; })[0];
        if (igual) igual.qtd = Math.min(99, igual.qtd + qtd); else cart.push(item);
        salvar();
        abrirCarrinho(true);
      }
    };
    abrir("Adicionar ao pedido");
  }

  /* ---------- 2. carrinho ---------- */
  function totais() {
    var soma = 0, faltando = 0, itens = 0;
    cart.forEach(function (i) {
      var pr = num(porId[i.id].preco);
      itens += i.qtd;
      if (pr == null) faltando++; else soma += pr * i.qtd;
    });
    return { soma: soma, faltando: faltando, itens: itens };
  }
  function textoTotal(t, taxa) {
    var base = t.soma + (taxa || 0);
    if (t.faltando && !t.soma) return "A confirmar";
    return real(base) + (t.faltando ? " + itens a confirmar" : "");
  }

  function abrirCarrinho(acabouDeAdicionar) {
    var t = totais();
    if (!cart.length) {
      corpo.innerHTML = "<div class=\"g-vazio\"><p class=\"g-nome\">Seu pedido está vazio</p><p>Escolha as bebidas na vitrine e toque em Comprar.</p></div>";
      pe.innerHTML = "<a class=\"btn btn-contorno btn-cheio\" href=\"#bebidas\" data-fechar>Ver bebidas</a>";
      pe.onclick = null;
      abrir("Seu pedido");
      return;
    }
    corpo.innerHTML = (acabouDeAdicionar ? "<p class=\"g-aviso g-aviso-ok\">Adicionado ao pedido.</p>" : "") +
      "<ul class=\"g-itens\">" + cart.map(function (i, k) {
        var p = porId[i.id], pr = num(p.preco);
        return "<li class=\"g-item\" data-k=\"" + k + "\">" +
          "<div class=\"g-item-foto\"><img src=\"" + IMG + esc(p.foto) + ".webp\" alt=\"\"></div>" +
          "<div class=\"g-item-txt\"><p class=\"g-item-nome\">" + esc(p.nome) + "</p>" +
          "<p class=\"g-item-det\">" + esc(p.tamanho) + (i.opcao ? ", " + esc(i.opcao.toLowerCase()) : "") + "</p>" +
          (i.obs ? "<p class=\"g-item-det\">Obs.: " + esc(i.obs) + "</p>" : "") +
          "<div class=\"g-item-acoes\">" + stepper(i.qtd, "data-item=\"" + k + "\"") +
          "<button type=\"button\" class=\"link-mini\" data-tirar=\"" + k + "\">Remover</button></div></div>" +
          "<p class=\"g-item-preco\">" + (pr != null ? real(pr * i.qtd) : "a confirmar") + "</p></li>";
      }).join("") + "</ul>" +
      "<div class=\"g-resumo\"><p><span>" + t.itens + (t.itens === 1 ? " item" : " itens") + "</span><span>" + textoTotal(t, 0) + "</span></p>" +
      "<p class=\"g-resumo-nota\">Taxa de entrega e preços confirmados pelo depósito no WhatsApp.</p></div>";
    pe.innerHTML = "<div class=\"g-pe-col\"><button type=\"button\" class=\"btn btn-ouro btn-cheio\" data-finalizar>Finalizar pedido <span class=\"seta-txt\" aria-hidden=\"true\">→</span></button>" +
      "<button type=\"button\" class=\"link-mini\" data-fechar>Continuar comprando</button></div>";
    pe.onclick = function (e) { if (e.target.closest("[data-finalizar]")) abrirFinalizar(); };
    abrir("Seu pedido");
  }
  corpo.addEventListener("click", function (e) {
    var q = e.target.closest("[data-item]");
    if (q) {
      var k = Number(q.getAttribute("data-item"));
      if (e.target.closest("[data-mais]")) cart[k].qtd = Math.min(99, cart[k].qtd + 1);
      if (e.target.closest("[data-menos]")) { cart[k].qtd -= 1; if (cart[k].qtd < 1) cart.splice(k, 1); }
      salvar(); abrirCarrinho(); return;
    }
    var r = e.target.closest("[data-tirar]");
    if (r) { cart.splice(Number(r.getAttribute("data-tirar")), 1); salvar(); abrirCarrinho(); }
  });

  /* ---------- 3. finalizar ---------- */
  function lojaAberta() {
    if (!L.horario) return true;
    var o = {};
    new Intl.DateTimeFormat("en-US", { timeZone: "America/Sao_Paulo", weekday: "short", hour: "numeric", minute: "numeric", hour12: false })
      .formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    var d = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(o.weekday);
    var h = (parseInt(o.hour, 10) % 24) + parseInt(o.minute, 10) / 60;
    var hoje = L.horario[d];
    return !!(hoje && h >= hoje[0] && h < hoje[1]);
  }

  function abrirFinalizar() {
    var pags = L.pagamentos || ["Pix na entrega", "Cartão de crédito", "Cartão de débito"];
    var taxa = num(L.taxaEntrega);
    corpo.innerHTML =
      (lojaAberta() ? "" : "<p class=\"g-aviso\">O depósito está fechado agora (terça a domingo, das 10h às 22h). Você pode mandar o pedido; ele é atendido na abertura.</p>") +
      "<form class=\"g-form\" data-form novalidate>" +
      passo(1, "Seus dados") +
      "<label class=\"g-legenda\" for=\"f-nome\">Nome</label><input id=\"f-nome\" class=\"campo\" autocomplete=\"name\" placeholder=\"Como podemos te chamar?\" required>" +
      "<label class=\"g-legenda\" for=\"f-zap\">Seu WhatsApp</label><input id=\"f-zap\" class=\"campo\" type=\"tel\" inputmode=\"numeric\" autocomplete=\"tel-national\" placeholder=\"(22) 9 0000-0000\" required>" +
      passo(2, "Como receber") +
      "<div class=\"opcoes\" role=\"radiogroup\" aria-label=\"Como receber\">" +
      "<label class=\"opcao opcao-grande\"><input type=\"radio\" name=\"receber\" value=\"Entrega\"><span><strong>Entrega</strong><small>Em Casimiro de Abreu</small></span><em>" + (taxa != null ? real(taxa) : "Taxa a combinar") + "</em></label>" +
      "<label class=\"opcao opcao-grande\"><input type=\"radio\" name=\"receber\" value=\"Retirar no depósito\"><span><strong>Retirar no depósito</strong><small>R. Padre Francisco Maria Tales, 962</small></span><em>Grátis</em></label></div>" +
      "<div class=\"g-endereco\" data-endereco hidden>" +
      "<label class=\"g-legenda\" for=\"f-rua\">Rua</label>" +
      "<div class=\"auto\"><input id=\"f-rua\" class=\"campo\" role=\"combobox\" aria-autocomplete=\"list\" aria-expanded=\"false\" aria-controls=\"f-rua-lista\" autocomplete=\"off\" placeholder=\"Comece a digitar: Antônio, Padre...\">" +
      "<ul class=\"auto-lista\" id=\"f-rua-lista\" role=\"listbox\" hidden></ul></div>" +
      "<p class=\"g-dica\">Todas as ruas de Casimiro de Abreu. Não achou a sua? Escreva do seu jeito.</p>" +
      "<div class=\"g-duas\"><div><label class=\"g-legenda\" for=\"f-num\">Número</label><input id=\"f-num\" class=\"campo\" inputmode=\"numeric\" placeholder=\"Ex.: 120\"></div>" +
      "<div><label class=\"g-legenda\" for=\"f-bairro\">Bairro</label><div class=\"auto\"><input id=\"f-bairro\" class=\"campo\" role=\"combobox\" aria-autocomplete=\"list\" aria-expanded=\"false\" aria-controls=\"f-bairro-lista\" autocomplete=\"off\" placeholder=\"Ex.: Vila Mataruna\">" +
      "<ul class=\"auto-lista\" id=\"f-bairro-lista\" role=\"listbox\" hidden></ul></div></div></div>" +
      "<label class=\"g-legenda\" for=\"f-ref\">Ponto de referência</label><input id=\"f-ref\" class=\"campo\" placeholder=\"Ex.: casa de muro azul, perto da praça\"></div>" +
      passo(3, "Pagamento") +
      "<div class=\"opcoes\" role=\"radiogroup\" aria-label=\"Pagamento\">" + pags.map(function (x) {
        return "<label class=\"opcao opcao-grande\"><input type=\"radio\" name=\"pag\" value=\"" + esc(x) + "\"><span><strong>" + esc(x) + "</strong><small>" + (/pix/i.test(x) ? "A chave é passada na hora" : "Maquininha com o entregador") + "</small></span></label>";
      }).join("") + "</div>" +
      passo(4, "Observações") +
      "<label class=\"sr\" for=\"f-obs\">Observações</label><textarea id=\"f-obs\" class=\"campo\" rows=\"2\" placeholder=\"Ex.: interfone quebrado, bater palma\"></textarea>" +
      "<p class=\"g-erro\" data-erro role=\"alert\"></p>" +
      "<div class=\"g-resumo\" data-resumo></div>" +
      "<button type=\"button\" class=\"link-mini\" data-voltar>← Voltar e mexer no pedido</button>" +
      "</form>";
    pe.innerHTML = "<button type=\"button\" class=\"btn btn-zap-ouro btn-cheio\" data-enviar><svg class=\"ico-linha\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><use href=\"#i-zap\"/></svg> Enviar pedido no WhatsApp</button>";

    // dados lembrados
    $("#f-nome").value = dados.nome || "";
    $("#f-zap").value = dados.zap || "";
    $("#f-rua").value = dados.rua || "";
    $("#f-num").value = dados.num || "";
    $("#f-bairro").value = dados.bairro || "";
    $("#f-ref").value = dados.ref || "";

    var end = $("[data-endereco]");
    function resumo() {
      var r = ($("input[name=receber]:checked") || {}).value;
      var t = totais();
      var taxaTxt = r === "Entrega" ? (taxa != null ? real(taxa) : "a combinar") : "grátis";
      $("[data-resumo]").innerHTML =
        "<p><span>" + t.itens + (t.itens === 1 ? " item" : " itens") + "</span><span>" + textoTotal(t, 0) + "</span></p>" +
        (r ? "<p><span>" + (r === "Entrega" ? "Entrega" : "Retirada") + "</span><span>" + taxaTxt + "</span></p>" : "") +
        "<p class=\"g-total\"><span>Total</span><span>" + textoTotal(t, r === "Entrega" ? (taxa || 0) : 0) + "</span></p>";
    }
    resumo();
    corpo.querySelector("[data-form]").addEventListener("change", function (e) {
      if (e.target.name === "receber") { end.hidden = e.target.value !== "Entrega"; resumo(); }
    });
    $("#f-zap").addEventListener("input", function (e) {
      var d = e.target.value.replace(/\D/g, "").slice(0, 11);
      var f = d;
      if (d.length > 2) f = "(" + d.slice(0, 2) + ") " + d.slice(2);
      if (d.length > 7) f = "(" + d.slice(0, 2) + ") " + d.slice(2, 3) + " " + d.slice(3, 7) + "-" + d.slice(7);
      e.target.value = f;
    });
    $("[data-voltar]").addEventListener("click", function () { abrirCarrinho(); });
    var bairroAuto = false;
    autocompletar($("#f-rua"), $("#f-rua-lista"), window.RUAS || [], function (r) {
      var b = $("#f-bairro");
      if (r.sub && (!b.value || bairroAuto)) { b.value = r.sub; bairroAuto = true; }
      $("#f-num").focus();
    });
    autocompletar($("#f-bairro"), $("#f-bairro-lista"), (window.BAIRROS || []).map(function (b) { return [b, ""]; }), function () { bairroAuto = false; $("#f-ref").focus(); });
    $("#f-bairro").addEventListener("input", function () { bairroAuto = false; });
    pe.onclick = function (e) { if (e.target.closest("[data-enviar]")) enviar(); };
    abrir("Finalizar pedido");
  }

  /* ---------- busca de rua e de bairro (Casimiro de Abreu inteiro) ---------- */
  var TIPOS = /^(r|rua|av|avenida|tv|trav|travessa|estrada|est|rod|rodovia|al|alameda|pc|praca)\.?$/;
  function autocompletar(input, lista, itens, aoEscolher) {
    var base = itens.map(function (x) { return { n: x[0], sub: x[1] || "", b: M.semAcento(x[0] + " " + (x[1] || "")), nb: M.semAcento(x[0]) }; });
    var achados = [], ativo = -1;
    var pref = lista.id;
    function render() {
      lista.innerHTML = achados.map(function (r, i) {
        return "<li role=\"option\" id=\"" + pref + "-" + i + "\" aria-selected=\"" + (i === ativo) + "\" data-i=\"" + i + "\"><span>" + esc(r.n) + "</span>" +
          (r.sub ? "<small>" + esc(r.sub) + "</small>" : "") + "</li>";
      }).join("");
      lista.hidden = !achados.length;
      input.setAttribute("aria-expanded", String(!!achados.length));
      if (ativo > -1) input.setAttribute("aria-activedescendant", pref + "-" + ativo); else input.removeAttribute("aria-activedescendant");
    }
    function buscar() {
      var q = M.semAcento(input.value.trim());
      ativo = -1;
      if (q.length < 2) { achados = []; render(); return; }
      var w = q.split(/\s+/).filter(function (x) { return !TIPOS.test(x); });
      if (!w.length) w = q.split(/\s+/);
      achados = base.filter(function (r) { return w.every(function (x) { return r.b.indexOf(x) > -1; }); })
        .sort(function (a, b) {
          var ia = a.nb.indexOf(w[0]), ib = b.nb.indexOf(w[0]);
          return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib) || a.n.length - b.n.length;
        })
        .slice(0, 40);
      render();
    }
    function escolher(i) {
      var r = achados[i];
      if (!r) return;
      input.value = r.n;
      achados = []; render();
      if (aoEscolher) aoEscolher(r);
    }
    input.addEventListener("input", buscar);
    input.addEventListener("focus", buscar);
    input.addEventListener("keydown", function (e) {
      if (!achados.length) return;
      if (e.key === "ArrowDown") { e.preventDefault(); ativo = (ativo + 1) % achados.length; render(); }
      else if (e.key === "ArrowUp") { e.preventDefault(); ativo = (ativo - 1 + achados.length) % achados.length; render(); }
      else if (e.key === "Enter" && ativo > -1) { e.preventDefault(); escolher(ativo); }
      else if (e.key === "Escape") { achados = []; render(); }
    });
    lista.addEventListener("mousedown", function (e) { e.preventDefault(); });
    lista.addEventListener("click", function (e) { var li = e.target.closest("[data-i]"); if (li) escolher(Number(li.getAttribute("data-i"))); });
    input.addEventListener("blur", function () { setTimeout(function () { achados = []; render(); }, 150); });
  }

  /* ---------- mensagem e envio ---------- */
  function enviar() {
    var erro = $("[data-erro]");
    var v = function (id) { return ($(id) || {}).value ? $(id).value.trim() : ""; };
    var receber = ($("input[name=receber]:checked") || {}).value;
    var pag = ($("input[name=pag]:checked") || {}).value;
    var falta = [];
    if (!v("#f-nome")) falta.push("seu nome");
    if (v("#f-zap").replace(/\D/g, "").length < 10) falta.push("seu WhatsApp com DDD");
    if (!receber) falta.push("como quer receber");
    if (receber === "Entrega") {
      if (!v("#f-rua")) falta.push("a rua");
      if (!v("#f-num")) falta.push("o número");
      if (!v("#f-bairro")) falta.push("o bairro");
    }
    if (!pag) falta.push("a forma de pagamento");
    if (falta.length) {
      erro.textContent = "Falta preencher: " + falta.join(", ") + ".";
      erro.scrollIntoView({ block: "center", behavior: "smooth" });
      return;
    }
    erro.textContent = "";
    dados = { nome: v("#f-nome"), zap: v("#f-zap"), rua: v("#f-rua"), num: v("#f-num"), bairro: v("#f-bairro"), ref: v("#f-ref") };
    guarda("gordinho-cliente", dados);

    var t = totais();
    var taxa = num(L.taxaEntrega);
    var linhas = ["Olá, Depósito do Gordinho! Pedido pelo site:", "", "*Itens*"];
    cart.forEach(function (i) {
      var p = porId[i.id], pr = num(p.preco);
      linhas.push(i.qtd + "x " + p.nome + " (" + p.tamanho + (i.opcao ? ", " + i.opcao.toLowerCase() : "") + ")" + (pr != null ? " - " + real(pr * i.qtd) : ""));
      if (i.obs) linhas.push("   Obs.: " + i.obs);
    });
    linhas.push("", "*Total:* " + textoTotal(t, receber === "Entrega" ? (taxa || 0) : 0) + (receber === "Entrega" && taxa == null ? " + entrega a combinar" : ""));
    linhas.push("*Receber:* " + receber);
    if (receber === "Entrega") {
      linhas.push("*Endereço:* " + dados.rua + ", " + dados.num + ", " + dados.bairro + ", Casimiro de Abreu");
      if (dados.ref) linhas.push("*Referência:* " + dados.ref);
    }
    linhas.push("*Pagamento:* " + pag);
    linhas.push("*Nome:* " + dados.nome);
    linhas.push("*WhatsApp:* " + dados.zap);
    if (v("#f-obs")) linhas.push("*Observações:* " + v("#f-obs"));
    var msg = linhas.join("\n");

    if (L.previa) {
      corpo.innerHTML = "<p class=\"rotulo\">Prévia do site</p><h3 class=\"g-nome\">Assim o pedido chega no WhatsApp do depósito</h3>" +
        "<pre class=\"g-msg\">" + esc(msg) + "</pre><p class=\"g-resumo-nota\">Nesta prévia nada é enviado. Quando o site estiver no ar, este botão abre o WhatsApp do depósito com a mensagem pronta.</p>";
      pe.innerHTML = "<button type=\"button\" class=\"btn btn-contorno btn-cheio\" data-fechar>Fechar</button>";
      pe.onclick = null;
      tit.textContent = "Pedido pronto";
      corpo.scrollTop = 0;
      return;
    }
    window.open(M.zap(L.whatsapp, msg), "_blank", "noopener");
    cart = []; salvar();
    corpo.innerHTML = "<div class=\"g-vazio\"><p class=\"g-nome\">Pedido enviado</p><p>Termine de mandar a mensagem no WhatsApp. O depósito confirma o valor e a entrega por lá.</p></div>";
    pe.innerHTML = "<button type=\"button\" class=\"btn btn-contorno btn-cheio\" data-fechar>Fechar</button>";
    pe.onclick = null;
  }

  /* ---------- contador no topo ---------- */
  function contador() {
    var n = cart.reduce(function (s, i) { return s + i.qtd; }, 0);
    $$("[data-contador]").forEach(function (el) { el.textContent = n; el.hidden = !n; });
  }
  contador();

  /* ---------- ganchos ---------- */
  document.addEventListener("click", function (e) {
    var a = e.target.closest("[data-add]");
    if (a) { e.preventDefault(); e.stopPropagation(); abrirProduto(a.getAttribute("data-add")); return; }
    if (e.target.closest("[data-abre-carrinho]")) { e.preventDefault(); abrirCarrinho(); }
  }, true);
})();
