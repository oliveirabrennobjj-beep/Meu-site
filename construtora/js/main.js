/* =====================================================================
   Prumo Construtora — comportamento do site
   Lê os dados de js/config.js (window.SITE) e cuida das interações.
   ===================================================================== */
(function () {
  "use strict";

  var SITE = window.SITE || {};
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };
  var menosMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Lê "empresa.cidade" dentro do objeto SITE */
  function ler(caminho) {
    return caminho.split(".").reduce(function (o, k) { return o ? o[k] : undefined; }, SITE);
  }
  function texto(valor) { return (valor === undefined || valor === null) ? "" : String(valor).trim(); }

  /* ---------- 1. Preenche os dados da empresa ---------- */
  $$("[data-c]").forEach(function (el) {
    var v = texto(ler(el.getAttribute("data-c")));
    if (v) { el.textContent = v; el.classList.remove("falta"); }
    else { el.classList.add("falta"); }
  });

  var contato = SITE.contato || {};
  var zapNumero = texto(contato.whatsapp).replace(/\D/g, "");
  var insta = texto(contato.instagram).replace(/^@/, "");
  var email = texto(contato.email);

  function linkZap(mensagem) {
    var base = zapNumero ? "https://wa.me/" + zapNumero : "https://wa.me/";
    return base + "?text=" + encodeURIComponent(mensagem || "Olá! Vim pelo site e quero um orçamento.");
  }

  $$("[data-link]").forEach(function (el) {
    var tipo = el.getAttribute("data-link");
    var a = document.createElement("a");
    if (tipo === "email" && email) {
      a.href = "mailto:" + email; a.textContent = email;
    } else if (tipo === "instagram" && insta) {
      a.href = "https://instagram.com/" + insta; a.textContent = "@" + insta;
      a.target = "_blank"; a.rel = "noopener";
    } else if (tipo === "whatsapp-texto" && zapNumero) {
      a.href = linkZap(); a.textContent = "WhatsApp";
      a.target = "_blank"; a.rel = "noopener";
    } else {
      el.classList.add("falta");
      return;
    }
    el.textContent = "";
    el.appendChild(a);
  });

  var zap = $("[data-zap]");
  if (zap && zapNumero) {
    zap.href = linkZap();
    zap.target = "_blank";
    zap.rel = "noopener";
  }

  var ano = $("[data-ano]");
  if (ano) ano.textContent = new Date().getFullYear();

  /* Mapa: só aparece com endereço preenchido */
  var mapa = $("[data-mapa]");
  if (mapa && texto(contato.endereco)) {
    mapa.innerHTML = "";
    var f = document.createElement("iframe");
    f.title = "Mapa com o endereço da construtora";
    f.loading = "lazy";
    f.referrerPolicy = "no-referrer-when-downgrade";
    f.src = "https://www.google.com/maps?q=" + encodeURIComponent(contato.endereco) + "&output=embed";
    mapa.appendChild(f);
    mapa.classList.add("tem-mapa");
  }

  /* ---------- 2. Cabeçalho: sólido ao rolar + menu em tela cheia ---------- */
  var topo = $("[data-topo]");
  var botaoMenu = $("[data-abrir-menu]");
  var menuCheio = $("[data-menu-cheio]");

  function atualizaTopo() {
    topo.classList.toggle("is-solido", window.scrollY > 40 || topo.classList.contains("is-aberto"));
  }
  function fechaMenu() {
    topo.classList.remove("is-aberto");
    botaoMenu.setAttribute("aria-expanded", "false");
    botaoMenu.querySelector(".sr").textContent = "Abrir menu";
    menuCheio.hidden = true;
    document.body.style.overflow = "";
    atualizaTopo();
  }
  botaoMenu.addEventListener("click", function () {
    var abrir = menuCheio.hidden;
    if (!abrir) { fechaMenu(); return; }
    menuCheio.hidden = false;
    topo.classList.add("is-aberto");
    botaoMenu.setAttribute("aria-expanded", "true");
    botaoMenu.querySelector(".sr").textContent = "Fechar menu";
    document.body.style.overflow = "hidden";
    atualizaTopo();
    var primeiro = $("a", menuCheio);
    if (primeiro) primeiro.focus();
  });
  $$("a", menuCheio).forEach(function (a) { a.addEventListener("click", fechaMenu); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !menuCheio.hidden) { fechaMenu(); botaoMenu.focus(); }
  });

  /* ---------- 3. Hero: vídeo que avança com a rolagem ---------- */
  var hero = $("[data-hero]");
  var video = $(".hero__video", hero);
  var cota = $("[data-cota]", hero);
  var etapas = $$(".cota__etapas li", hero);
  var podeScrub = window.matchMedia("(min-width: 900px) and (pointer: fine)").matches;

  function mostraProgresso(p) {
    p = Math.max(0, Math.min(1, p));
    cota.style.setProperty("--p", p.toFixed(4));
    var feitas = Math.round(p * (etapas.length - 1));
    etapas.forEach(function (li, i) { li.classList.toggle("is-feita", i <= feitas); });
  }

  /* Sem vídeo: a régua se completa uma vez ao abrir a página */
  function reguaSemVideo() {
    if (menosMovimento) { mostraProgresso(1); return; }
    var inicio = null, duracao = 2600;
    function passo(t) {
      if (!inicio) inicio = t;
      var x = Math.min(1, (t - inicio) / duracao);
      mostraProgresso(1 - Math.pow(1 - x, 3));
      if (x < 1) requestAnimationFrame(passo);
    }
    setTimeout(function () { requestAnimationFrame(passo); }, 500);
  }

  function ligaScrub() {
    hero.classList.add("is-scrub", "has-video");
    video.pause();
    var alvo = 0, atual = 0, rodando = false;

    function progressoRolagem() {
      var total = hero.offsetHeight - window.innerHeight;
      return total > 0 ? (window.scrollY - hero.offsetTop) / total : 0;
    }
    function quadro() {
      atual += (alvo - atual) * 0.14;
      if (Math.abs(alvo - atual) < 0.0005) atual = alvo;
      if (video.duration) video.currentTime = atual * (video.duration - 0.05);
      mostraProgresso(atual);
      if (atual !== alvo) requestAnimationFrame(quadro); else rodando = false;
    }
    function aoRolar() {
      alvo = Math.max(0, Math.min(1, progressoRolagem()));
      if (!rodando) { rodando = true; requestAnimationFrame(quadro); }
    }
    window.addEventListener("scroll", aoRolar, { passive: true });
    window.addEventListener("resize", aoRolar);
    aoRolar();
  }

  function ligaAutoplay() {
    video.loop = true;
    video.autoplay = true;
    video.addEventListener("timeupdate", function () {
      if (video.duration) mostraProgresso(video.currentTime / video.duration);
    });
    var tocar = video.play();
    if (tocar && tocar.then) {
      tocar.then(function () { hero.classList.add("has-video"); }).catch(reguaSemVideo);
    } else {
      hero.classList.add("has-video");
    }
  }

  if (!menosMovimento && video && video.dataset.src) {
    var falhou = false;
    video.addEventListener("error", function () { falhou = true; reguaSemVideo(); }, { once: true });
    video.addEventListener("loadedmetadata", function () {
      if (falhou) return;
      if (podeScrub) ligaScrub(); else ligaAutoplay();
    }, { once: true });
    video.preload = podeScrub ? "auto" : "metadata";
    video.src = video.dataset.src;
    video.load();
  } else {
    reguaSemVideo();
  }

  /* ---------- 4. Obras: galeria, filtro e lightbox ---------- */
  var obras = SITE.obras || [];
  var galeria = $("[data-galeria]");
  var nomesCat = { residencial: "Residencial", comercial: "Comercial", reforma: "Reforma" };

  obras.forEach(function (obra, i) {
    if (!obra.fotos || !obra.fotos.length) return;
    var li = document.createElement("li");
    li.className = obra.formato || "normal";
    li.dataset.cat = obra.categoria;
    var capa = obra.fotos[0];
    li.innerHTML =
      '<button class="obra" type="button" data-obra="' + i + '">' +
        '<span class="obra__img"><img loading="lazy" width="1400" height="1000"></span>' +
        '<span class="obra__legenda">' +
          '<span class="sr">Ver fotos: </span>' +
          '<span class="obra__titulo"></span>' +
          '<span class="obra__tipo"></span>' +
        "</span>" +
      "</button>";
    var img = $("img", li);
    img.src = capa.src;
    img.alt = capa.alt || obra.titulo;
    $(".obra__titulo", li).textContent = obra.titulo;
    $(".obra__tipo", li).textContent = nomesCat[obra.categoria] || "";
    galeria.appendChild(li);
  });

  /* Filtro com contagem por categoria */
  var filtro = $("[data-filtro]");
  $$("button", filtro).forEach(function (b) {
    var cat = b.dataset.cat;
    var n = cat === "todas" ? obras.length : obras.filter(function (o) { return o.categoria === cat; }).length;
    var sup = document.createElement("sup");
    sup.textContent = n;
    sup.setAttribute("aria-label", n + " obras");
    b.appendChild(sup);
    b.addEventListener("click", function () {
      $$("button", filtro).forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
      $$("li", galeria).forEach(function (li) {
        li.hidden = !(cat === "todas" || li.dataset.cat === cat);
      });
    });
  });

  /* Lightbox */
  var caixa = $("[data-caixa]");
  var caixaImg = $("[data-caixa-img]");
  var obraAberta = null, fotoAtual = 0, quemAbriu = null;

  function preenche(el, valor) {
    var v = texto(valor);
    el.textContent = v || "[PREENCHER]";
    el.classList.toggle("falta", !v);
  }
  function mostraFoto(n) {
    var fotos = obraAberta.fotos;
    fotoAtual = (n + fotos.length) % fotos.length;
    caixaImg.src = fotos[fotoAtual].src;
    caixaImg.alt = fotos[fotoAtual].alt || obraAberta.titulo;
    $("[data-caixa-contador]").textContent = "Foto " + (fotoAtual + 1) + " de " + fotos.length;
    var varias = fotos.length > 1;
    $("[data-caixa-ant]").hidden = !varias;
    $("[data-caixa-prox]").hidden = !varias;
  }
  function abreObra(i, botao) {
    obraAberta = obras[i];
    quemAbriu = botao;
    $("[data-caixa-titulo]").textContent = obraAberta.titulo;
    preenche($("[data-caixa-local]"), obraAberta.local);
    preenche($("[data-caixa-area]"), obraAberta.area);
    preenche($("[data-caixa-prazo]"), obraAberta.prazo);
    mostraFoto(0);
    caixa.showModal();
  }
  galeria.addEventListener("click", function (e) {
    var b = e.target.closest("[data-obra]");
    if (b) abreObra(Number(b.dataset.obra), b);
  });
  $("[data-caixa-ant]").addEventListener("click", function () { mostraFoto(fotoAtual - 1); });
  $("[data-caixa-prox]").addEventListener("click", function () { mostraFoto(fotoAtual + 1); });
  $("[data-caixa-fechar]").addEventListener("click", function () { caixa.close(); });
  caixa.addEventListener("click", function (e) { if (e.target === caixa) caixa.close(); });
  caixa.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") mostraFoto(fotoAtual - 1);
    if (e.key === "ArrowRight") mostraFoto(fotoAtual + 1);
  });
  caixa.addEventListener("close", function () { if (quemAbriu) quemAbriu.focus(); });

  /* ---------- 5. Antes e depois ---------- */
  var comparador = $("[data-comparador]");
  var range = $("[data-comparador-range]");
  function moveComparador() { comparador.style.setProperty("--pos", range.value + "%"); }
  range.addEventListener("input", moveComparador);
  moveComparador();

  /* ---------- 6. Serviços: foto que troca no hover (computador) ---------- */
  var vitrine = $("[data-vitrine]");
  var servicos = $$(".servico");
  function ativa(li) {
    servicos.forEach(function (s) { s.classList.toggle("is-ativo", s === li); });
    var nova = li.dataset.foto;
    if (!vitrine || vitrine.getAttribute("src") === nova) return;
    vitrine.classList.add("is-trocando");
    var pre = new Image();
    pre.onload = pre.onerror = function () {
      vitrine.src = nova;
      vitrine.alt = "";
      vitrine.classList.remove("is-trocando");
    };
    pre.src = nova;
  }
  servicos.forEach(function (li) {
    li.addEventListener("mouseenter", function () { ativa(li); });
  });
  if (servicos[0]) servicos[0].classList.add("is-ativo");

  /* ---------- 7. Depoimentos ---------- */
  var listaDep = $("[data-depoimentos]");
  (SITE.depoimentos || []).forEach(function (d) {
    var li = document.createElement("li");
    li.innerHTML =
      '<figure class="depoimento">' +
        '<img loading="lazy" width="900" height="675">' +
        "<blockquote><p></p></blockquote>" +
        "<figcaption><strong></strong> <span></span></figcaption>" +
      "</figure>";
    var img = $("img", li);
    img.src = d.foto; img.alt = d.alt || "Obra do cliente";
    var p = $("blockquote p", li);
    p.textContent = texto(d.texto) || "[PREENCHER: depoimento real do cliente, com autorização]";
    if (!texto(d.texto)) p.classList.add("falta");
    $("strong", li).textContent = texto(d.nome) || "[Nome]";
    $("figcaption span", li).textContent = texto(d.cidade) || "[Cidade]";
    listaDep.appendChild(li);
  });

  /* ---------- 8. Formulário que abre o WhatsApp ---------- */
  var form = $("[data-form]");
  var erro = $("[data-form-erro]");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var faltando = [];
    $$("[required]", form).forEach(function (campo) {
      var vazio = !campo.value.trim();
      campo.setAttribute("aria-invalid", String(vazio));
      if (vazio) faltando.push(campo);
    });
    if (faltando.length) {
      var nomes = faltando.map(function (c) { return $('label[for="' + c.id + '"]').textContent.trim(); });
      erro.textContent = "Preencha: " + nomes.join(", ") + ".";
      erro.hidden = false;
      faltando[0].focus();
      return;
    }
    erro.hidden = true;
    var dados = new FormData(form);
    var msg = (SITE.mensagemWhatsapp || "").replace(/\{(\w+)\}/g, function (_, k) {
      return texto(dados.get(k));
    }).trim();
    window.open(linkZap(msg), "_blank", "noopener");
  });
  $$("[required]", form).forEach(function (campo) {
    campo.addEventListener("input", function () {
      if (campo.value.trim()) campo.setAttribute("aria-invalid", "false");
    });
  });

  /* ---------- 9. Rolagem: cabeçalho e botão flutuante ---------- */
  function aoRolarPagina() {
    atualizaTopo();
    /* O botão flutuante some sobre o hero e na seção de contato, onde já há formulário */
    if (zap) {
      var noTopo = window.scrollY < hero.offsetHeight - window.innerHeight * 0.4;
      var cont = $("#contato").getBoundingClientRect();
      var noContato = cont.top < window.innerHeight * 0.5 && cont.bottom > 0;
      zap.classList.toggle("is-escondido", noTopo || noContato);
    }
  }
  window.addEventListener("scroll", aoRolarPagina, { passive: true });
  aoRolarPagina();
})();
