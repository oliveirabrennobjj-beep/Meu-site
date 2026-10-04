/* Barber Club: movimento ao rolar a página.
 * Tudo aqui é enfeite: sem este arquivo (ou com "reduzir movimento" ativado no
 * aparelho), o conteúdo aparece normalmente, parado. */
(function () {
  "use strict";

  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reduce.matches || !("IntersectionObserver" in window)) return;

  root.classList.add("motion");

  function $all(sel, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(sel)); }

  /* ---------- revelar ao rolar ---------- */

  // Itens criados pelo main.js entram em sequência dentro do próprio grupo.
  function stagger(selector, variant, step) {
    $all(selector).forEach(function (node, i) {
      node.setAttribute("data-reveal", variant);
      node.style.setProperty("--reveal-delay", (i * step) + "ms");
    });
  }
  stagger(".service", "up", 110);
  stagger("[data-gallery=resultados] .gallery-item", "wipe", 120);
  stagger("[data-gallery=espaco] .gallery-item", "wipe", 120);
  stagger(".testimonial", "up", 140);
  stagger(".rating > :not(.section-title)", "up", 70);

  var revealer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-revealed");
      revealer.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -12% 0px", threshold: 0.12 });

  $all("[data-reveal]").forEach(function (node) { revealer.observe(node); });

  // Quem chega por um link direto (#contato) ou volta rolando não deve ver um buraco:
  // o que já passou da tela aparece de imediato.
  function revealPassed() {
    $all("[data-reveal]:not(.is-revealed)").forEach(function (node) {
      if (node.getBoundingClientRect().top < window.innerHeight * 0.88) node.classList.add("is-revealed");
    });
  }

  /* ---------- nota contando ---------- */

  var ratingNumber = document.querySelector("[data-rating-number]");
  if (ratingNumber && ratingNumber.textContent) {
    var finalText = ratingNumber.textContent;
    var target = parseFloat(finalText.replace(",", "."));
    if (!isNaN(target)) {
      var counter = new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting) return;
        counter.disconnect();
        var start = null;
        var duration = 1400;
        function frame(now) {
          if (start === null) start = now;
          var t = Math.min((now - start) / duration, 1);
          var eased = 1 - Math.pow(1 - t, 3);
          ratingNumber.textContent = (target * eased).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
          if (t < 1) requestAnimationFrame(frame);
          else ratingNumber.textContent = finalText;
        }
        requestAnimationFrame(frame);
      }, { threshold: 0.6 });
      counter.observe(ratingNumber);
    }
  }

  /* ---------- rolagem: parallax, progresso e cabeçalho ---------- */

  var heroMedia = document.querySelector(".hero-media");
  var heroContent = document.querySelector(".hero-content");
  var hero = document.querySelector(".hero");
  var spaceImg = document.querySelector(".space-frame img");
  var progress = document.querySelector("[data-scroll-progress]");
  var header = document.querySelector("[data-header]");
  var lastY = window.scrollY;
  var ticking = false;

  function update() {
    ticking = false;
    var y = window.scrollY;
    var vh = window.innerHeight;

    if (hero && y < hero.offsetHeight) {
      var p = y / hero.offsetHeight;
      if (heroMedia) heroMedia.style.transform = "translate3d(0," + (y * 0.35) + "px,0)";
      if (heroContent) {
        heroContent.style.transform = "translate3d(0," + (y * 0.18) + "px,0)";
        heroContent.style.opacity = String(Math.max(0, 1 - p * 1.4));
      }
    }

    if (spaceImg) {
      var r = spaceImg.parentNode.getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh) {
        var offset = ((r.top + r.height / 2) - vh / 2) / vh;
        spaceImg.style.transform = "translate3d(0," + (offset * -40) + "px,0) scale(1.12)";
      }
    }

    if (progress) {
      var max = document.documentElement.scrollHeight - vh;
      progress.style.transform = "scaleX(" + (max > 0 ? y / max : 0) + ")";
    }

    // o cabeçalho sai ao descer e volta ao subir; o menu aberto e o foco o mantêm
    if (header && !header.classList.contains("menu-open") && !header.contains(document.activeElement)) {
      var hide = y > lastY + 4 && y > vh * 0.6;
      var show = y < lastY - 4 || y < vh * 0.6;
      if (hide) header.classList.add("is-hidden");
      else if (show) header.classList.remove("is-hidden");
    }
    lastY = y;
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  if (header) header.addEventListener("focusin", function () { header.classList.remove("is-hidden"); });
  update();
  revealPassed();
  window.addEventListener("hashchange", function () { setTimeout(revealPassed, 50); });

  /* ---------- cartões que inclinam com o mouse ---------- */

  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    $all(".service").forEach(function (card) {
      card.addEventListener("pointermove", function (event) {
        var r = card.getBoundingClientRect();
        var px = (event.clientX - r.left) / r.width;
        var py = (event.clientY - r.top) / r.height;
        card.style.setProperty("--tilt-x", ((0.5 - py) * 7).toFixed(2) + "deg");
        card.style.setProperty("--tilt-y", ((px - 0.5) * 9).toFixed(2) + "deg");
        card.style.setProperty("--shine-x", (px * 100).toFixed(1) + "%");
        card.classList.add("is-tilting");
      });
      card.addEventListener("pointerleave", function () {
        card.style.setProperty("--tilt-x", "0deg");
        card.style.setProperty("--tilt-y", "0deg");
        card.classList.remove("is-tilting");
      });
    });
  }

  // Se a pessoa ativar "reduzir movimento" com a página aberta, tudo para.
  reduce.addEventListener("change", function (event) {
    if (!event.matches) return;
    root.classList.remove("motion");
    $all("[data-reveal]").forEach(function (node) { node.classList.add("is-revealed"); });
    window.removeEventListener("scroll", onScroll);
    [heroMedia, heroContent, spaceImg].forEach(function (node) {
      if (node) { node.style.transform = ""; node.style.opacity = ""; }
    });
  });
})();
