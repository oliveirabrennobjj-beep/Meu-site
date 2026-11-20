(function () {
  var S = window.SITE || {};
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  var M = S.mensagens || {};

  /* ---- WhatsApp: com número vai direto; sem número abre o app para escolher o contato ---- */
  function linkWa(texto) {
    var msg = encodeURIComponent(texto || M.pedido || '');
    return 'https://wa.me/' + (S.whatsapp || '') + '?text=' + msg;
  }
  function comoLink(el, href) { el.href = href; el.target = '_blank'; el.rel = 'noopener'; }

  $$('[data-wa]').forEach(function (el) {
    comoLink(el, linkWa(M[el.getAttribute('data-wa')] || M.pedido));
  });

  /* ---- Textos de endereço e horário ---- */
  var lugar = [S.bairro, S.cidade].filter(Boolean).join(' · ');
  var horario = S.horarios && S.horarios.dias ? S.horarios.dias + ' · ' + S.horarios.horas : '';
  function preencher(sel, texto) {
    $$(sel).forEach(function (el) { if (texto) el.textContent = texto; else el.remove(); });
  }
  preencher('[data-endereco]', S.endereco);
  preencher('[data-bairro]', lugar);
  preencher('[data-horario-linha]', horario);
  preencher('[data-endereco-linha]', [S.endereco, S.bairro].filter(Boolean).join(', '));
  preencher('[data-ano]', String(new Date().getFullYear()));

  /* ---- Mapa ---- */
  $$('[data-mapa]').forEach(function (el) {
    if (S.mapaBusca) {
      el.href = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(S.mapaBusca);
    } else if (el.classList.contains('btn')) {
      el.remove();
    } else {
      el.removeAttribute('href'); el.removeAttribute('target');
      var go = $('.local__map-go', el); if (go) go.remove();
    }
  });

  /* ---- Cartão "Onde" ---- */
  var local = $('[data-local]');
  if (local) {
    var linhas = [
      ['Endereço', [S.endereco, lugar].filter(Boolean)],
      ['Horário', S.horarios && S.horarios.dias ? [S.horarios.dias, S.horarios.horas] : []],
      ['Reservas', [S.whatsappVisivel || 'Pelo WhatsApp']],
      ['Delivery', S.delivery ? [S.delivery] : []]
    ];
    linhas.forEach(function (l) {
      if (!l[1].length) return;
      var div = document.createElement('div'); div.className = 'local__row';
      var dt = document.createElement('dt'); dt.textContent = l[0];
      var dd = document.createElement('dd');
      l[1].forEach(function (t, i) { if (i) dd.appendChild(document.createElement('br')); dd.appendChild(document.createTextNode(t)); });
      div.appendChild(dt); div.appendChild(dd); local.appendChild(div);
    });
  }

  /* ---- Contato no rodapé: só o que existe no config ---- */
  var contato = $('[data-contato]');
  if (contato) {
    var itens = [['WhatsApp' + (S.whatsappVisivel ? ' ' + S.whatsappVisivel : ''), linkWa(M.pedido)]];
    if (S.instagram) itens.push(['Instagram', S.instagram]);
    if (S.tiktok) itens.push(['TikTok', S.tiktok]);
    if (S.email) itens.push([S.email, 'mailto:' + S.email]);
    itens.forEach(function (i) {
      var a = document.createElement('a'); a.textContent = i[0]; a.href = i[1];
      if (i[1].indexOf('mailto:') !== 0) { a.target = '_blank'; a.rel = 'noopener'; }
      contato.appendChild(a);
    });
  }

  /* ---- Cardápio ---- */
  var lista = $('[data-cardapio]');
  var img = 'assets/img/';
  (S.cardapio || []).forEach(function (item, i) {
    var preco = item.preco ? 'R$ ' + item.preco : 'Consulte';
    var msg = (M.item || 'Olá! Quero pedir o {nome}.').replace('{nome}', item.nome).replace('{preco}', preco).replace(' (Consulte)', '');
    var li = document.createElement('li');
    var a = document.createElement('a');
    a.className = 'menu__row';
    comoLink(a, linkWa(msg));
    a.setAttribute('data-preview', item.foto || '');
    a.innerHTML =
      '<span class="menu__idx" aria-hidden="true">' + (i < 9 ? '0' : '') + (i + 1) + '</span>' +
      (item.foto ? '<span class="menu__thumb"><img src="' + img + item.foto + '-300.webp" srcset="' + img + item.foto + '-300.webp 300w, ' + img + item.foto + '-600.webp 600w" sizes="88px" width="300" height="375" loading="lazy" decoding="async" alt=""></span>' : '') +
      '<span class="menu__main"><h3 class="menu__name"></h3><span class="menu__desc"></span></span>' +
      '<span class="menu__side"><span class="menu__price"></span><span class="menu__go">Pedir</span></span>';
    $('.menu__name', a).textContent = item.nome;
    $('.menu__desc', a).textContent = item.descricao || '';
    $('.menu__price', a).textContent = preco;
    if (item.foto) $('img', a).alt = item.alt || '';
    li.appendChild(a); lista.appendChild(li);
  });

  /* ---- Entradas: título do topo ao carregar, fotos quando chegam na tela ---- */
  var hero = $('.hero'), titulo = $('[data-lines]');
  requestAnimationFrame(function () {
    requestAnimationFrame(function () { if (hero) hero.classList.add('is-in'); if (titulo) titulo.classList.add('is-in'); });
  });
  var fotos = $$('[data-foto]');
  if (reduce || !('IntersectionObserver' in window)) {
    fotos.forEach(function (f) { f.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    fotos.forEach(function (f) { io.observe(f); });
  }

  /* ---- Nav e barra do celular ao rolar ---- */
  var nav = $('#nav'), cta = $('#mobileCta'), marcado = false;
  function aoRolar() {
    if (marcado) return; marcado = true;
    requestAnimationFrame(function () {
      nav.classList.toggle('is-scrolled', window.scrollY > 24);
      cta.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.55);
      marcado = false;
    });
  }
  window.addEventListener('scroll', aoRolar, { passive: true });
  aoRolar();

  /* ---- Menu do celular ---- */
  var burger = $('#burger'), drawer = $('#drawer');
  var fundo = [$('main'), $('footer'), cta];
  function gaveta(abrir) {
    burger.classList.toggle('is-open', abrir);
    drawer.classList.toggle('is-open', abrir);
    nav.classList.toggle('is-menu', abrir);
    burger.setAttribute('aria-expanded', abrir ? 'true' : 'false');
    burger.setAttribute('aria-label', abrir ? 'Fechar menu' : 'Abrir menu');
    document.body.style.overflow = abrir ? 'hidden' : '';
    fundo.forEach(function (el) { if (el) el.inert = abrir; });
  }
  burger.addEventListener('click', function () { gaveta(!drawer.classList.contains('is-open')); });
  $$('a', drawer).forEach(function (a) { a.addEventListener('click', function () { gaveta(false); }); });
  document.addEventListener('keydown', function (e) {
    if (!drawer.classList.contains('is-open')) return;
    if (e.key === 'Escape') { gaveta(false); burger.focus(); return; }
    if (e.key !== 'Tab') return;
    // foco fica entre o botão e os links da gaveta
    var alvos = [burger].concat($$('a', drawer)), primeiro = alvos[0], ultimo = alvos[alvos.length - 1];
    if (e.shiftKey && document.activeElement === primeiro) { e.preventDefault(); ultimo.focus(); }
    else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primeiro.focus(); }
  });
  window.addEventListener('resize', function () { if (window.innerWidth > 860 && drawer.classList.contains('is-open')) gaveta(false); });

  /* ---- Prévia que segue o mouse no cardápio (só computador com mouse) ---- */
  var preview = $('#preview'), previewImg = $('#previewImg');
  if (fine && !reduce && lista && preview) {
    document.documentElement.classList.add('has-preview');
    var x = 0, y = 0, tx = 0, ty = 0, rodando = false;
    function quadro() {
      x += (tx - x) * 0.16; y += (ty - y) * 0.16;
      preview.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';
      if (preview.classList.contains('is-on') || Math.abs(tx - x) > 0.5 || Math.abs(ty - y) > 0.5) requestAnimationFrame(quadro);
      else rodando = false;
    }
    function mostrar(linha, e) {
      var foto = linha.getAttribute('data-preview');
      if (!foto) return;
      previewImg.src = img + foto + '-600.webp';
      if (!preview.classList.contains('is-on') && e) { x = tx = e.clientX + 170; y = ty = e.clientY; }
      preview.classList.add('is-on');
      if (!rodando) { rodando = true; requestAnimationFrame(quadro); }
    }
    $$('.menu__row', lista).forEach(function (linha) {
      linha.addEventListener('pointerenter', function (e) { mostrar(linha, e); });
    });
    lista.addEventListener('pointermove', function (e) { tx = e.clientX + 170; ty = e.clientY; });
    lista.addEventListener('pointerleave', function () { preview.classList.remove('is-on'); });
    window.addEventListener('scroll', function () { preview.classList.remove('is-on'); }, { passive: true });
  } else if (preview) {
    preview.remove();
  }

  /* ---- Galeria: arrastar com o mouse e setas do teclado ---- */
  var gal = $('#galeria');
  if (gal) {
    var arrastando = false, inicioX = 0, inicioScroll = 0, andou = 0;
    gal.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      arrastando = true; andou = 0; inicioX = e.clientX; inicioScroll = gal.scrollLeft;
    });
    window.addEventListener('pointermove', function (e) {
      if (!arrastando) return;
      var dx = e.clientX - inicioX; andou = Math.max(andou, Math.abs(dx));
      if (andou > 6) { gal.classList.add('is-drag'); gal.scrollLeft = inicioScroll - dx; }
    });
    window.addEventListener('pointerup', function () {
      if (!arrastando) return; arrastando = false; gal.classList.remove('is-drag');
    });
    gal.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      var passo = gal.firstElementChild ? gal.firstElementChild.getBoundingClientRect().width + 16 : 300;
      gal.scrollBy({ left: e.key === 'ArrowRight' ? passo : -passo, behavior: reduce ? 'auto' : 'smooth' });
    });
  }
})();
