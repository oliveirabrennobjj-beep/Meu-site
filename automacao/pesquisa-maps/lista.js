// node lista.js consultas.txt lista.json  -> coleta lugares (sem detalhe), concorrencia 5
const { chromium } = require('playwright'); const fs = require('fs');
const qs = fs.readFileSync(process.argv[2], 'utf8').split('\n').map(s => s.trim()).filter(Boolean);
const out = process.argv[3];
const res = fs.existsSync(out) ? JSON.parse(fs.readFileSync(out)) : {};
const feito = new Set(Object.values(res).flatMap(r => r.q));
(async () => {
  const b = await chromium.launch({ proxy: { server: process.env.HTTPS_PROXY } });
  const ctx = await b.newContext({ locale: 'pt-BR', viewport: { width: 1300, height: 900 } });
  let i = 0;
  async function worker() {
    const p = await ctx.newPage();
    while (i < qs.length) {
      const q = qs[i++];
      try {
        await p.goto('https://www.google.com/maps/search/' + encodeURIComponent(q) + '?hl=pt-BR', { waitUntil: 'domcontentloaded', timeout: 60000 });
        await p.waitForSelector('div[role="feed"], h1.DUwDvf', { timeout: 20000 }).catch(() => {});
        let prev = 0;
        for (let k = 0; k < 20; k++) {
          const n = await p.$$eval('div[role="feed"] a[href*="/maps/place/"]', a => a.length).catch(() => 0);
          const end = await p.$('span:has-text("final da lista")');
          if (end || (n === prev && k > 2)) break; prev = n;
          await p.$eval('div[role="feed"]', f => f.scrollBy(0, 5000)).catch(() => {});
          await p.waitForTimeout(1300);
        }
        let items = await p.$$eval('div[role="feed"] a[href*="/maps/place/"]', as => as.map(a => ({ nome: a.getAttribute('aria-label'), href: a.href.split('?')[0], texto: (a.parentElement.innerText || '') })));
        if (!items.length && await p.$('h1.DUwDvf')) items = [{ nome: await p.$eval('h1.DUwDvf', h => h.innerText), href: p.url().split('?')[0], texto: '' }];
        for (const it of items) {
          const id = (it.href.match(/!1s([^!]+)/) || [])[1] || it.href;
          if (!res[id]) res[id] = { nome: it.nome, href: it.href, texto: it.texto, q: [] };
          res[id].q.push(q);
        }
        console.log(items.length, q);
      } catch (e) { console.log('ERRO', q, e.message.slice(0, 80)); }
    }
    await p.close();
  }
  const salvar = setInterval(() => fs.writeFileSync(out, JSON.stringify(res)), 15000);
  await Promise.all([1, 2, 3, 4, 5].map(worker));
  clearInterval(salvar); fs.writeFileSync(out, JSON.stringify(res));
  console.log('TOTAL', Object.keys(res).length); await b.close();
})();
