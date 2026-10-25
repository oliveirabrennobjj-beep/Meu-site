(() => {
  const cfg = window.RAIOX || {};
  const ig = `https://instagram.com/${cfg.instagram}`;
  const tt = `https://www.tiktok.com/@${cfg.tiktok}`;
  const dm = `https://ig.me/m/${cfg.instagram}`;
  const pixMode = !cfg.checkoutUrl && Boolean(cfg.pixChave);
  // Sem checkout: com Pix, os botões levam ao QR Code; sem Pix, abrem o Direct do Instagram.
  const buy = cfg.checkoutUrl || (pixMode ? "#oferta" : dm);

  const set = (sel, fn) => document.querySelectorAll(sel).forEach(fn);
  set("[data-checkout]", (a) => {
    a.href = buy;
    if (!pixMode) {
      a.target = "_blank";
      a.rel = "noopener";
    }
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

  if (pixMode && window.Pix && window.qrcode) {
    const code = window.Pix.brcode({ key: cfg.pixChave, name: cfg.pixNome, city: cfg.pixCidade, amount: cfg.valor });
    const qr = window.qrcode(0, "M");
    qr.addData(code);
    qr.make();
    set("[data-pix-qr]", (el) => (el.innerHTML = qr.createSvgTag({ cellSize: 6, margin: 2, scalable: true })));
    set("[data-pix-code]", (el) => (el.value = code));
    set("[data-pix]", (el) => (el.hidden = false));
    set("[data-offer-cta]", (el) => el.remove());
    set("[data-ig-dm]", (a) => (a.href = dm));
    set("[data-ig-handle]", (el) => (el.textContent = cfg.instagram));
    set("[data-entrega-passo]", (el) => (el.textContent = "Você paga no Pix e recebe o guia"));
    set("[data-entrega]", (el) => (el.textContent = "Depois de pagar no Pix, mande o comprovante e o seu e-mail no Direct do Instagram. O PDF chega assim que o pagamento for confirmado."));
    set("[data-pix-copy]", (btn) =>
      btn.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(code);
        } catch {
          document.querySelector("[data-pix-code]").select();
          document.execCommand("copy");
        }
        btn.textContent = "Código copiado";
        setTimeout(() => (btn.textContent = "Copiar código Pix"), 2500);
      }),
    );
  }
})();
