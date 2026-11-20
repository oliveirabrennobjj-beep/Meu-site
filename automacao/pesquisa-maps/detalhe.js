// node detalhe.js entrada.json saida.json  (entrada: {id:{nome,href}}) concorrencia 5
const { chromium } = require('playwright'); const fs = require('fs');
const ent = JSON.parse(fs.readFileSync(process.argv[2])); const out = process.argv[3];
const res = fs.existsSync(out) ? JSON.parse(fs.readFileSync(out)) : {};
const ids = Object.keys(ent).filter(id => !res[id]);
(async () => {
  const b = await chromium.launch({ proxy: { server: process.env.HTTPS_PROXY } });
  const ctx = await b.newContext({ locale: 'pt-BR', viewport: { width: 1200, height: 900 } });
  await ctx.route(/\.(png|jpg|jpeg|webp|gif|woff2?)(\?|$)|googleusercontent|gstatic\.com\/.*\/(image|tiles)/, r => r.abort());
  let i = 0, ok = 0;
  async function worker() {
    let p = await ctx.newPage();
    while (i < ids.length) {
      const id = ids[i++];
      try {
        await p.goto(ent[id].href + '?hl=pt-BR', { waitUntil: 'domcontentloaded', timeout: 45000 });
        await p.waitForSelector('h1.DUwDvf', { timeout: 15000 });
        await p.waitForTimeout(600);
        res[id] = await p.evaluate(() => {
          const q = s => document.querySelector(s);
          const lab = s => q(s)?.getAttribute('aria-label') || '';
          const f7 = q('div.F7nice')?.innerText || '';
          const nota = (f7.match(/^([\d,]+)/) || [])[1];
          const av = (f7.match(/\(([\d.]+)\)/) || [])[1];
          return {
            nome: q('h1.DUwDvf')?.innerText || '',
            categoria: q('button.DkEaL')?.innerText || '',
            nota: nota ? parseFloat(nota.replace(',', '.')) : null,
            avaliacoes: av ? parseInt(av.replace(/\./g, '')) : 0,
            endereco: lab('button[data-item-id="address"]').replace(/^Endereço:\s*/, ''),
            telefone: lab('button[data-item-id^="phone"]').replace(/^Telefone:\s*/, ''),
            site: q('a[data-item-id="authority"]')?.href || '',
            fechado: /Permanentemente fechado|Fechado permanentemente/i.test(document.body.innerText.slice(0, 3000)),
          };
        });
        ok++;
        if (ok % 25 === 0) console.log(ok, '/', ids.length);
      } catch (e) {
        if (/crash/i.test(e.message)) { ids.push(id); await p.close().catch(() => {}); p = await ctx.newPage(); continue; }
        if (!/closed|Target/.test(e.message)) res[id] = { erro: e.message.slice(0, 60) };
      }
    }
    await p.close();
  }
  const s = setInterval(() => fs.writeFileSync(out, JSON.stringify(res)), 15000);
  await Promise.all(Array.from({length:+process.env.N||5},(_, k)=>worker()));
  clearInterval(s); fs.writeFileSync(out, JSON.stringify(res)); console.log('FIM', ok); await b.close();
})();
