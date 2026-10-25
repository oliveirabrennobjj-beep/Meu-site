(() => {
  const cfg = window.RAIOX || {};
  const ig = `https://instagram.com/${cfg.instagram}`;
  const tt = `https://www.tiktok.com/@${cfg.tiktok}`;
  // Sem checkout ainda: os botões abrem o Direct do Instagram.
  const buy = cfg.checkoutUrl || `https://ig.me/m/${cfg.instagram}`;

  const set = (sel, fn) => document.querySelectorAll(sel).forEach(fn);
  set("[data-checkout]", (a) => {
    a.href = buy;
    a.target = "_blank";
    a.rel = "noopener";
  });
  set("[data-ig]", (a) => (a.href = ig));
  set("[data-tt]", (a) => (a.href = tt));
  set("[data-preco]", (el) => (el.textContent = cfg.preco));
  set("[data-preco-antigo]", (el) => {
    if (cfg.precoAntigo) el.textContent = cfg.precoAntigo;
    else el.remove();
  });
  set("[data-parcelas]", (el) => {
    if (cfg.parcelas) el.textContent = cfg.parcelas;
    else el.remove();
  });
  set("[data-acesso]", (el) => (el.textContent = cfg.acesso));
})();
