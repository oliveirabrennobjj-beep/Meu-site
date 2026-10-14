/* Barbearia Vértice: monta o conteúdo a partir de site-config.js e cuida das interações. */
(function () {
  "use strict";

  var cfg = window.BARBER_CLUB;
  if (!cfg) return;

  var contato = cfg.contato || {};
  var imagens = cfg.imagens || {};
  var whatsapp = onlyDigits(contato.whatsappAgendamento);
  var instagramUrl = contato.instagram && contato.instagram.url;
  var instagramUser = contato.instagram && contato.instagram.usuario;
  var cidadeUf = cfg.cidade + ", " + cfg.uf;

  /* ---------- utilidades ---------- */

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function onlyDigits(value) { return String(value || "").replace(/\D/g, ""); }

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (key) {
      var value = attrs[key];
      if (value === null || value === undefined || value === false) return;
      if (key === "text") node.textContent = value;
      else if (key === "html") node.innerHTML = value;
      else if (key === "className") node.className = value;
      else node.setAttribute(key, value === true ? "" : value);
    });
    [].concat(children || []).forEach(function (child) {
      if (child) node.appendChild(typeof child === "string" ? document.createTextNode(child) : child);
    });
    return node;
  }

  var ICONS = {
    camera: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
    instagram: '<rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>',
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
    message: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z"/>',
    copy: '<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    map: '<path d="M20 10c0 4.99-5.54 10.19-7.4 11.79a1 1 0 0 1-1.2 0C9.54 20.19 4 14.99 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
    route: '<polygon points="3 11 22 2 13 21 11 13 3 11"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  };

  function icon(name, size) {
    var s = size || 20;
    return el("span", {
      className: "icon",
      "aria-hidden": "true",
      html: '<svg viewBox="0 0 24 24" width="' + s + '" height="' + s + '" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">' + ICONS[name] + "</svg>",
    });
  }

  function findService(id) {
    return (cfg.servicos || []).filter(function (s) { return s.id === id; })[0];
  }

  function bookingMessage(serviceId) {
    var service = findService(serviceId);
    var texto = service ? service.mensagem || service.nome.toLowerCase() : contato.servicoGenerico;
    return (contato.mensagemAgendamento || "").replace("{servico}", texto);
  }

  function whatsappUrl(serviceId) {
    return "https://wa.me/" + whatsapp + "?text=" + encodeURIComponent(bookingMessage(serviceId));
  }

  function placeholder(label, extraClass) {
    return el("div", { className: "ph" + (extraClass ? " " + extraClass : "") }, [
      icon("camera", 22),
      el("span", { className: "ph-label", text: label }),
      el("span", { className: "ph-note", text: "Foto em breve" }),
    ]);
  }

  /* ---------- marca ---------- */

  if (imagens.logo) {
    var brand = $("[data-brand]");
    brand.innerHTML = "";
    brand.appendChild(el("img", { src: imagens.logo, alt: "", className: "brand-logo", height: "36" }));
    brand.appendChild(el("span", { className: "brand-name visually-hidden", text: cfg.nome }));
  }

  /* ---------- seção principal ---------- */

  (function renderHero() {
    var slot = $("[data-hero-media]");
    var hero = imagens.hero || {};
    if (hero.src) {
      var img = el("img", {
        src: hero.src, srcset: hero.srcset || null, sizes: "100vw", alt: hero.alt || "",
        width: "1122", height: "1402", fetchpriority: "high", decoding: "async",
      });
      if (hero.posicao) img.style.objectPosition = hero.posicao;
      slot.appendChild(img);
    } else {
      $(".hero").classList.add("hero-no-photo");
    }
  })();

  /* ---------- serviços ---------- */

  (function renderServices() {
    var list = $("[data-services]");
    (cfg.servicos || []).forEach(function (service) {
      var meta = [];
      if (service.preco) meta.push(el("li", {}, [el("span", { className: "meta-label", text: "Preço" }), el("span", { text: service.preco })]));
      if (service.duracao) meta.push(el("li", {}, [el("span", { className: "meta-label", text: "Duração" }), el("span", { text: service.duracao })]));

      var action;
      if (whatsapp) {
        action = el("a", {
          className: "btn btn-outline", href: whatsappUrl(service.id), target: "_blank", rel: "noopener",
          "aria-label": "Consultar serviço: " + service.nome + " (abre o WhatsApp)",
        }, ["Consultar serviço"]);
      } else {
        action = el("a", {
          className: "btn btn-outline", href: "#contato", "data-service": service.id,
          "aria-label": "Consultar serviço: " + service.nome,
        }, ["Consultar serviço"]);
        action.addEventListener("click", function (event) {
          event.preventDefault();
          goToBooking(service.id);
        });
      }

      list.appendChild(el("li", { className: "service", id: "servico-" + service.id }, [
        el("h3", { className: "service-name", text: service.nome }),
        el("p", { className: "service-desc", text: service.descricao }),
        meta.length ? el("ul", { className: "service-meta", role: "list" }, meta) : null,
        action,
      ]));
    });
  })();

  /* ---------- sobre ---------- */

  $("[data-about]").textContent =
    "A " + cfg.nome + " atende em " + cfg.cidade + " com corte de cabelo, barba e corte infantil. " +
    "Dá para resolver o seu visual e o das crianças no mesmo lugar.";
  $("[data-since-year]").textContent = cfg.desde;

  (function renderAboutPhoto() {
    var slot = $("[data-about-media]");
    var sobre = imagens.sobre || {};
    if (sobre.src) {
      slot.appendChild(el("img", {
        src: sobre.src, srcset: sobre.srcset || null, sizes: "(min-width: 900px) 40vw, 90vw",
        alt: sobre.alt || "", width: "1122", height: "1402", loading: "lazy", decoding: "async",
      }));
    } else {
      slot.appendChild(placeholder(sobre.reservado || "Foto do espaço"));
    }
  })();

  /* ---------- galerias ---------- */

  var galleries = {};

  function renderGallery(name, emptyState) {
    var list = $('[data-gallery="' + name + '"]');
    var items = (imagens[name] || []);
    var withPhotos = items.filter(function (item) { return item.src; });
    galleries[name] = withPhotos;

    // Sem nenhuma foto, um aviso curto ocupa menos espaço que uma grade vazia.
    if (!withPhotos.length && emptyState) {
      list.hidden = true;
      list.parentNode.insertBefore(emptyState, list.nextSibling);
      return;
    }

    items.forEach(function (item) {
      var li = el("li", { className: "gallery-item" });
      if (item.src) {
        var index = withPhotos.indexOf(item);
        var label = item.alt || item.reservado || "Foto";
        var button = el("button", {
          type: "button", className: "gallery-btn", "aria-label": "Ampliar foto: " + label,
          "aria-haspopup": "dialog",
        }, [el("img", {
          src: item.src, srcset: item.srcset || null, sizes: "(min-width: 900px) 33vw, 50vw",
          alt: "", loading: "lazy", decoding: "async", width: "600", height: "750",
        })]);
        button.addEventListener("click", function () { openLightbox(name, index, button); });
        li.appendChild(button);
      } else {
        li.appendChild(placeholder(item.reservado || "Foto"));
      }
      list.appendChild(li);
    });

    if (withPhotos.length && instagramUrl) {
      list.appendChild(el("li", { className: "gallery-item gallery-more" }, [
        el("a", { href: instagramUrl, target: "_blank", rel: "noopener" }, [
          icon("instagram", 30),
          el("span", { className: "gallery-more-title", text: "Veja mais no Instagram" }),
          el("span", { className: "gallery-more-user", text: "@" + instagramUser }),
        ]),
      ]));
    }
  }

  var resultsEmpty = null;
  if (!(imagens.resultados || []).some(function (item) { return item.src; })) {
    resultsEmpty = el("div", { className: "gallery-empty" }, [
      icon("camera", 28),
      el("p", {}, [
        el("strong", { text: "As fotos dos cortes chegam em breve." }),
        "Enquanto isso, os trabalhos mais recentes estão no Instagram da " + cfg.nome + ".",
      ]),
      instagramUrl ? el("a", { className: "btn btn-outline", href: instagramUrl, target: "_blank", rel: "noopener" }, [icon("instagram"), "Veja mais no Instagram"]) : null,
    ]);
  }
  renderGallery("resultados", resultsEmpty);

  $all("[data-instagram-link]").forEach(function (link) {
    if (instagramUrl) link.href = instagramUrl;
    else link.hidden = true;
  });

  /* ---------- ampliação de fotos ---------- */

  var lightbox = $("[data-lightbox]");
  var lbImg = $("[data-lightbox-img]");
  var lbCaption = $("[data-lightbox-caption]");
  var lbCount = $("[data-lightbox-count]");
  var lbState = { name: null, index: 0, trigger: null };

  function showLightboxItem() {
    var items = galleries[lbState.name] || [];
    var item = items[lbState.index];
    if (!item) return;
    lbImg.src = item.src;
    lbImg.alt = item.alt || "";
    lbCaption.textContent = item.alt || "";
    lbCaption.hidden = !item.alt;
    lbCount.textContent = (lbState.index + 1) + " de " + items.length;
    var single = items.length < 2;
    $("[data-lightbox-prev]").hidden = single;
    $("[data-lightbox-next]").hidden = single;
    lbCount.hidden = single;
  }

  function openLightbox(name, index, trigger) {
    lbState = { name: name, index: index, trigger: trigger };
    showLightboxItem();
    if (typeof lightbox.showModal === "function") lightbox.showModal();
    else lightbox.setAttribute("open", "");
    document.documentElement.classList.add("is-locked");
    $("[data-lightbox-close]").focus();
  }

  function closeLightbox() {
    if (lightbox.open) lightbox.close();
  }

  function stepLightbox(delta) {
    var total = (galleries[lbState.name] || []).length;
    if (total < 2) return;
    lbState.index = (lbState.index + delta + total) % total;
    showLightboxItem();
  }

  lightbox.addEventListener("close", function () {
    document.documentElement.classList.remove("is-locked");
    if (lbState.trigger) lbState.trigger.focus();
  });
  lightbox.addEventListener("click", function (event) {
    if (event.target === lightbox) closeLightbox();
  });
  lightbox.addEventListener("keydown", function (event) {
    if (event.key === "ArrowRight") { event.preventDefault(); stepLightbox(1); }
    if (event.key === "ArrowLeft") { event.preventDefault(); stepLightbox(-1); }
    if (event.key === "Tab") {
      var focusables = $all("button", lightbox).filter(function (b) { return !b.hidden; });
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  $("[data-lightbox-close]").addEventListener("click", closeLightbox);
  $("[data-lightbox-prev]").addEventListener("click", function () { stepLightbox(-1); });
  $("[data-lightbox-next]").addEventListener("click", function () { stepLightbox(1); });

  /* ---------- avaliações ---------- */

  (function renderRating() {
    var google = cfg.google || {};
    var block = $("[data-rating]");
    if (!google.nota) {
      $(".rating-score", block).hidden = true;
      return;
    }
    var nota = Number(google.nota);
    var notaTexto = nota.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    $("[data-rating-number]").textContent = notaTexto;

    var stars = $("[data-rating-stars]");
    var star = '<svg viewBox="0 0 24 24" width="22" height="22"><path d="M12 2.5l2.94 5.96 6.58.96-4.76 4.64 1.12 6.55L12 17.52l-5.88 3.09 1.12-6.55L2.48 9.42l6.58-.96z"/></svg>';
    var row = new Array(6).join(star);
    stars.innerHTML = '<span class="stars-base">' + row + '</span><span class="stars-fill" style="width:' + (nota / 5 * 100) + '%">' + row + "</span>";

    if (google.totalAvaliacoes) {
      $("[data-rating-meta]").textContent = google.totalAvaliacoes + " avaliações no Google";
    }
    if (google.registradoEm) {
      $("[data-rating-note]").textContent = "Números do perfil no Google registrados em " + google.registradoEm + ". Podem ter mudado desde então.";
    }
    var googleLink = $("[data-google-link]");
    if (google.perfilUrl) {
      googleLink.href = google.perfilUrl;
      googleLink.hidden = false;
    }
  })();

  (function renderTestimonials() {
    var reviews = (cfg.avaliacoes || []).filter(function (r) { return r.texto && r.nome; });
    var list = $("[data-testimonials]");
    if (!reviews.length) return;
    reviews.forEach(function (review) {
      list.appendChild(el("li", { className: "testimonial" }, [
        el("blockquote", {}, [el("p", { text: review.texto })]),
        el("p", { className: "testimonial-name", text: review.nome }),
      ]));
    });
    list.hidden = false;
    $(".reviews-inner").classList.add("has-testimonials");
  })();

  /* ---------- agendamento ---------- */

  var select = $("[data-service-select]");
  var preview = $("[data-message-preview]");
  var actions = $("[data-booking-actions]");
  var help = $("[data-booking-help]");
  var status = $("[data-booking-status]");
  var whatsappAction = null;

  (cfg.servicos || []).forEach(function (service) {
    select.appendChild(el("option", { value: service.id, text: service.nome }));
  });

  function updateMessage() {
    preview.textContent = bookingMessage(select.value);
    if (whatsappAction) whatsappAction.href = whatsappUrl(select.value);
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var area = el("textarea", { readonly: true, className: "visually-hidden" });
      area.value = text;
      document.body.appendChild(area);
      area.select();
      var ok = false;
      try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      area.remove();
      if (ok) resolve(); else reject(new Error("copy failed"));
    });
  }

  if (whatsapp) {
    whatsappAction = el("a", {
      className: "btn btn-primary", target: "_blank", rel: "noopener", href: whatsappUrl(""),
    }, [icon("message"), "Enviar pelo WhatsApp"]);
    actions.appendChild(whatsappAction);
    help.textContent = "Abre o WhatsApp com a mensagem pronta. Você pode editar antes de enviar.";
  } else {
    if (instagramUrl) {
      actions.appendChild(el("a", {
        className: "btn btn-primary", href: instagramUrl, target: "_blank", rel: "noopener",
      }, [icon("instagram"), "Chamar no Instagram"]));
    }
    var copyBtn = el("button", { type: "button", className: "btn btn-ghost", "data-copy-message": true }, [icon("copy"), el("span", { text: "Copiar mensagem" })]);
    var copyTimer = null;
    copyBtn.addEventListener("click", function () {
      var label = $("span:last-child", copyBtn);
      copyText(preview.textContent).then(function () {
        label.textContent = "Mensagem copiada";
        status.textContent = "Mensagem copiada. Cole na conversa do Instagram.";
      }, function () {
        label.textContent = "Copiar mensagem";
        status.textContent = "Não foi possível copiar. Selecione o texto da mensagem e copie manualmente.";
      });
      clearTimeout(copyTimer);
      copyTimer = setTimeout(function () { label.textContent = "Copiar mensagem"; }, 3000);
    });
    actions.appendChild(copyBtn);
    help.textContent = instagramUrl
      ? "Por enquanto, os horários são combinados pelo direct do Instagram" +
        (instagramUser ? " (@" + instagramUser + ")" : "") + ". Copie a mensagem e cole na conversa."
      : "Copie a mensagem e envie para a barbearia pelo contato que você já tem. Os canais de agendamento serão divulgados em breve.";
  }

  select.addEventListener("change", updateMessage);
  $("[data-booking-form]").addEventListener("submit", function (event) { event.preventDefault(); });
  updateMessage();

  function goToBooking(serviceId) {
    if (serviceId !== undefined) {
      select.value = serviceId;
      updateMessage();
    }
    var target = $("#contato");
    target.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
    if (history.replaceState) history.replaceState(null, "", "#contato");
    select.focus({ preventScroll: true });
  }

  $all("[data-agendar]").forEach(function (link) {
    if (whatsapp) {
      link.href = whatsappUrl("");
      link.target = "_blank";
      link.rel = "noopener";
      return;
    }
    link.addEventListener("click", function (event) {
      event.preventDefault();
      closeMenu();
      goToBooking();
    });
  });

  /* ---------- localização e contato ---------- */

  (function renderLocation() {
    var endereco = cfg.endereco || {};
    var confirmado = Boolean(endereco.confirmado && endereco.texto);
    var info = $("[data-info-list]");

    function row(label, content) {
      info.appendChild(el("div", { className: "info-row" }, [
        el("dt", { text: label }),
        el("dd", {}, [].concat(content)),
      ]));
    }

    row("Cidade", cidadeUf);
    row("Endereço", confirmado
      ? endereco.texto
      : el("span", { className: "pending", text: "Endereço completo em breve. Pergunte pelo Instagram." }));

    var horarios = (cfg.horarios || []).filter(function (h) { return h.dias && h.horas; });
    if (horarios.length) {
      row("Horários", el("ul", { className: "hours", role: "list" }, horarios.map(function (h) {
        return el("li", {}, [el("span", { text: h.dias }), el("span", { text: h.horas })]);
      })));
    } else {
      row("Horários", el("span", { className: "pending", text: "Em breve. Consulte pelo Instagram." }));
    }

    if (contato.telefone && contato.telefone.exibicao) {
      row("Telefone", el("a", { href: "tel:" + contato.telefone.link }, [contato.telefone.exibicao]));
    }
    if (instagramUrl) {
      row("Instagram", el("a", { href: instagramUrl, target: "_blank", rel: "noopener" }, ["@" + instagramUser]));
    }
    if (contato.linkBio) {
      row("Outros links", el("a", { href: contato.linkBio, target: "_blank", rel: "noopener" }, ["Link da bio"]));
    }

    var map = $("[data-map]");
    if (confirmado && endereco.mapaEmbedUrl) {
      map.appendChild(el("iframe", {
        src: endereco.mapaEmbedUrl, title: "Mapa com a localização da " + cfg.nome,
        loading: "lazy", referrerpolicy: "no-referrer-when-downgrade", allowfullscreen: true,
      }));
    } else {
      map.classList.add("map-pending");
      map.appendChild(el("div", { className: "map-placeholder" }, [
        icon("map", 26),
        el("p", { text: "O mapa aparece aqui depois que o endereço for confirmado." }),
      ]));
    }

    var route = $("[data-route]");
    if (confirmado && endereco.rotaUrl) {
      route.appendChild(el("a", { className: "btn btn-outline", href: endereco.rotaUrl, target: "_blank", rel: "noopener" }, [icon("route"), "Como chegar"]));
    } else {
      route.appendChild(el("button", { type: "button", className: "btn btn-outline", disabled: true, "aria-describedby": "rota-ajuda" }, [icon("route"), "Como chegar"]));
      route.appendChild(el("p", { className: "route-help", id: "rota-ajuda", text: "A rota fica disponível depois da confirmação do endereço." }));
    }
  })();

  /* ---------- rodapé ---------- */

  (function renderFooter() {
    var list = $("[data-footer-contacts]");
    $("[data-footer-place]").textContent = cidadeUf + ". Desde " + cfg.desde + ".";
    if (instagramUrl) list.appendChild(el("li", {}, [el("a", { href: instagramUrl, target: "_blank", rel: "noopener" }, [icon("instagram", 18), "@" + instagramUser])]));
    if (contato.telefone && contato.telefone.exibicao) list.appendChild(el("li", {}, [el("a", { href: "tel:" + contato.telefone.link }, [icon("phone", 18), contato.telefone.exibicao])]));
    if (contato.linkBio) list.appendChild(el("li", {}, [el("a", { href: contato.linkBio, target: "_blank", rel: "noopener" }, [icon("link", 18), "Link da bio"])]));
    $("[data-year]").textContent = new Date().getFullYear();
  })();

  /* ---------- menu móvel ---------- */

  var header = $("[data-header]");
  var toggle = $("[data-menu-toggle]");
  var nav = $("[data-nav]");
  var desktop = window.matchMedia("(min-width: 960px)");

  function setMenu(open) {
    toggle.setAttribute("aria-expanded", String(open));
    header.classList.toggle("menu-open", open);
    $(".menu-toggle-label", toggle).textContent = open ? "Fechar" : "Menu";
  }
  function closeMenu() { if (toggle.getAttribute("aria-expanded") === "true") setMenu(false); }

  toggle.addEventListener("click", function () {
    setMenu(toggle.getAttribute("aria-expanded") !== "true");
  });
  $all("a", nav).forEach(function (link) { link.addEventListener("click", closeMenu); });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
      setMenu(false);
      toggle.focus();
    }
  });
  document.addEventListener("click", function (event) {
    if (!header.contains(event.target)) closeMenu();
  });
  desktop.addEventListener("change", function (event) { if (event.matches) closeMenu(); });

  /* ---------- cabeçalho e link ativo ---------- */

  function onScroll() { header.classList.toggle("is-scrolled", window.scrollY > 40); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if ("IntersectionObserver" in window) {
    var links = $all("[data-nav-link]");
    var sections = links.map(function (link) { return $(link.getAttribute("href")); }).filter(Boolean);
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (link) {
          var active = link.getAttribute("href") === "#" + entry.target.id;
          if (active) link.setAttribute("aria-current", "location");
          else link.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (section) { observer.observe(section); });
  }

  /* ---------- tela de entrada ---------- */

  (function intro() {
    var root = document.documentElement;
    var overlay = $("[data-intro]");
    var enterBtn = $("[data-intro-enter]");
    var behind = [header, $("main"), $(".site-footer"), $(".skip-link")];
    var leaving = false;

    if (!root.classList.contains("intro-open")) {
      overlay.remove();
      return;
    }

    behind.forEach(function (node) { node.setAttribute("inert", ""); });
    enterBtn.focus({ preventScroll: true });

    function enter() {
      if (leaving) return;
      leaving = true;
      try { sessionStorage.setItem("bc-entrada", "1"); } catch (e) {}
      behind.forEach(function (node) { node.removeAttribute("inert"); });
      var done = function () {
        overlay.remove();
        root.classList.remove("intro-open", "intro-leaving");
      };
      if (prefersReducedMotion()) {
        done();
      } else {
        root.classList.add("intro-leaving");
        overlay.addEventListener("transitionend", function (event) {
          if (event.target === overlay) done();
        });
        setTimeout(done, 1200);
      }
      $("main").focus({ preventScroll: true });
    }

    enterBtn.addEventListener("click", enter);
    overlay.addEventListener("keydown", function (event) {
      if (event.key === "Escape") enter();
      if (event.key === "Tab") { event.preventDefault(); enterBtn.focus(); }
    });
    overlay.addEventListener("wheel", function (event) { if (event.deltaY > 0) enter(); }, { passive: true });
    var touchY = null;
    overlay.addEventListener("touchstart", function (event) { touchY = event.touches[0].clientY; }, { passive: true });
    overlay.addEventListener("touchmove", function (event) {
      if (touchY !== null && touchY - event.touches[0].clientY > 40) enter();
    }, { passive: true });
  })();

  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  document.documentElement.classList.add("js-ready");
})();
