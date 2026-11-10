(function () {
  var S = window.SITE || {};
  var doc = document;
  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };
  var IMG = "assets/img/";

  function wa(texto) {
    return "https://wa.me/" + S.whatsapp + "?text=" + encodeURIComponent(texto || S.mensagemWhatsapp || "");
  }
  function texto(sel, valor) { if (valor) $$(sel).forEach(function (el) { el.textContent = valor; }); }

  // Dados do config (o HTML já traz os mesmos valores, para o site abrir completo sem JS)
  texto("[data-endereco]", S.endereco);
  texto("[data-cidade]", S.cidade);
  texto("[data-horarios]", S.horarios);
  texto("[data-fone]", S.whatsappVisivel);
  texto("[data-ig-nome]", S.instagramVisivel);
  if (S.whatsapp) {
    $$("[data-wa]").forEach(function (a) { a.href = wa(); a.target = "_blank"; a.rel = "noopener"; });
  }
  if (S.instagram) $$("[data-ig]").forEach(function (a) { a.href = S.instagram; });
  if (S.mapaBusca) {
    var q = encodeURIComponent(S.mapaBusca);
    $$("[data-mapa]").forEach(function (a) { a.href = "https://www.google.com/maps/search/?api=1&query=" + q; });
  }

  // Serviços
  var trilho = $("[data-servicos]");
  if (trilho && Array.isArray(S.servicos)) {
    S.servicos.forEach(function (s) {
      var li = doc.createElement("li");
      li.className = "servico";
      li.innerHTML =
        '<img decoding="async" width="800" height="600" alt="">' +
        '<div class="servico-corpo"><h3></h3><p></p>' +
        '<div class="servico-base"><span class="preco"></span><a class="link-ouro">Agendar</a></div></div>';
      var img = $("img", li);
      img.src = IMG + s.foto; img.alt = s.alt || "";
      $("h3", li).textContent = s.nome;
      $("p", li).textContent = s.descricao || "";
      $(".preco", li).textContent = s.preco ? "R$ " + s.preco : "Consulte";
      var a = $("a", li);
      a.href = wa("Olá! Vim pelo site da Barbearia Maya e gostaria de agendar: " + s.nome + ".");
      a.target = "_blank"; a.rel = "noopener";
      a.setAttribute("aria-label", "Agendar " + s.nome + " pelo WhatsApp");
      trilho.appendChild(li);
    });
  }

  // Galeria com ampliação
  var grade = $("[data-galeria]"), luz = $("#luz");
  if (grade && Array.isArray(S.galeria)) {
    S.galeria.forEach(function (g) {
      var li = doc.createElement("li");
      li.innerHTML = '<button type="button" class="foto"><img loading="lazy" alt=""></button>';
      var img = $("img", li);
      img.src = IMG + g.foto; img.width = g.w; img.height = g.h; img.alt = g.alt || "";
      $("button", li).setAttribute("aria-label", "Ampliar foto: " + (g.alt || ""));
      $("button", li).addEventListener("click", function () {
        if (!luz || !luz.showModal) return;
        var grande = $("img", luz);
        grande.src = img.src; grande.alt = img.alt;
        luz.showModal();
      });
      grade.appendChild(li);
    });
  }
  if (luz) {
    $(".luz-fecha", luz).addEventListener("click", function () { luz.close(); });
    luz.addEventListener("click", function (e) { if (e.target === luz) luz.close(); });
  }

  // Cabeçalho: transparente sobre a foto, sólido ao rolar
  var topo = $("#cabecalho");
  function rolou() { topo.classList.toggle("solido", window.scrollY > 24); }
  rolou();
  window.addEventListener("scroll", rolou, { passive: true });

  // Menu do celular
  var botao = $(".abre-menu"), menu = $("#menu");
  function fechaMenu() {
    doc.body.classList.remove("menu-aberto");
    botao.setAttribute("aria-expanded", "false");
    botao.setAttribute("aria-label", "Abrir menu");
  }
  botao.addEventListener("click", function () {
    var aberto = doc.body.classList.toggle("menu-aberto");
    botao.setAttribute("aria-expanded", String(aberto));
    botao.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
  });
  $$("a", menu).forEach(function (a) { a.addEventListener("click", fechaMenu); });
  doc.addEventListener("keydown", function (e) { if (e.key === "Escape") fechaMenu(); });

  // Entrada suave das seções (uma vez, e nada se o aparelho pedir menos movimento)
  var calmo = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var alvos = $$(".revela, .grade-fotos li");
  if (calmo || !("IntersectionObserver" in window)) {
    alvos.forEach(function (el) { el.classList.add("visivel"); });
  } else {
    var obs = new IntersectionObserver(function (itens) {
      itens.forEach(function (it) {
        if (it.isIntersecting) { it.target.classList.add("visivel"); obs.unobserve(it.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    alvos.forEach(function (el) { obs.observe(el); });
  }
})();
