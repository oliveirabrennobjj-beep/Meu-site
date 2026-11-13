// Abre o vendas.html montado, com um banco de mentira no lugar do banco do Artifact,
// confere o fluxo principal e salva capturas de tela.
//   node scripts/testar.mjs            → empresas fictícias
//   LEADS_DIR=pasta node scripts/...   → um .json por empresa (ex.: exportado do banco)
//   SAIDA=pasta                        → onde salvar as capturas (padrão: ./capturas)
import assert from "node:assert/strict";
import { mkdirSync, readdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const saida = process.env.SAIDA ?? path.join(raiz, "capturas");
mkdirSync(saida, { recursive: true });

function leadsFicticios() {
  const tipos = ["Pizzaria", "Barbearia", "Padaria", "Pet Shop", "Sorveteria", "Lanchonete", "Salão de Beleza"];
  const cidades = ["Casimiro de Abreu", "Macaé", "Rio das Ostras", "Macaé", "Rio das Ostras"];
  return Array.from({ length: 34 }, (_, i) => {
    const whatsapp = `55229900${String(10000 + i)}`;
    return {
      id: `w${whatsapp}`,
      nome: `${tipos[i % tipos.length]} Exemplo ${i + 1}`,
      tipo: tipos[i % tipos.length],
      cidade: cidades[i % cidades.length],
      whatsapp,
      telefone: `(22) 99000-${String(1000 + i)}`,
      nota: i % 11 === 0 ? null : 4 + ((i * 7) % 11) / 10,
      avaliacoes: i % 11 === 0 ? null : 40 + ((i * 137) % 900),
      link: i % 3 === 0 ? "https://www.instagram.com/exemplo/" : "",
      status: "novo",
    };
  });
}

const leads = process.env.LEADS_DIR
  ? readdirSync(process.env.LEADS_DIR)
      .filter((f) => f.endsWith(".json"))
      .map((f) => ({
        ...JSON.parse(readFileSync(path.join(process.env.LEADS_DIR, f), "utf8")),
        id: f.replace(/\.json$/, ""),
      }))
  : leadsFicticios();

// Loja gravada pela versão antiga do painel: um envio só (site), sem o registro por oferta.
const ANTIGA = "Loja Antiga de Teste";
leads.push({
  id: "w5522900000001",
  nome: ANTIGA,
  tipo: "Padaria",
  cidade: "Casimiro de Abreu",
  whatsapp: "5522900000001",
  nota: 5,
  avaliacoes: 999999,
  status: "enviado",
  produto: "site",
  enviadoEm: new Date(Date.now() - 86_400_000).toISOString(),
});

// Loja longe do centro que recebeu o pedido de visita antes da correção (caso da Parada Ideal).
const LONGE = "Loja Longe de Teste";
leads.push({
  id: "w5522900000002",
  nome: LONGE,
  tipo: "Padaria",
  cidade: "Casimiro de Abreu",
  whatsapp: "5522900000002",
  nota: 4.3,
  avaliacoes: 999998,
  status: "respondeu",
  produto: "dono",
  visita: false,
  enviadoEm: new Date(Date.now() - 90_000_000).toISOString(),
  enviados: {
    site: new Date(Date.now() - 90_100_000).toISOString(),
    placa: new Date(Date.now() - 90_100_000).toISOString(),
    dono: new Date(Date.now() - 90_000_000).toISOString(),
  },
});

// Mesma moldura que a plataforma põe em volta da página publicada.
const moldura = (corpo) => `<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1,viewport-fit=cover"><style>:root{color-scheme:light;box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}html{scroll-padding-top:env(safe-area-inset-top,0px)}body{margin:0;padding:0;font:14px -apple-system,BlinkMacSystemFont,sans-serif;background:#fff;color:#000}img{max-width:100%}[hidden]:not([hidden=until-found i]){display:none!important}</style></head><body>
${corpo}
</body></html>`;

function bancoDeMentira(iniciais) {
  const docs = new Map(iniciais.map(({ id, ...dados }) => [id, dados]));
  const ouvintes = new Set();
  window.__escritas = [];
  const emitir = () => {
    const snap = {
      metadata: { fromCache: false },
      docs: [...docs].map(([id, dados]) => ({ id, exists: true, data: () => dados })),
    };
    ouvintes.forEach((fn) => fn(snap));
  };
  const db = {
    doc: (caminho) => ({
      onSnapshot: (next) => (setTimeout(() => next({ exists: false, data: () => undefined }), 0), () => {}),
      set: async (dados) => void window.__escritas.push({ op: "set", caminho, dados }),
    }),
    collection: () => ({
      onSnapshot: (next) => (ouvintes.add(next), setTimeout(emitir, 30), () => ouvintes.delete(next)),
      doc: (id) => ({
        update: async (dados) => {
          window.__escritas.push({ op: "update", id, dados });
          docs.set(id, { ...docs.get(id), ...dados });
          emitir();
        },
        set: async (dados) => {
          window.__escritas.push({ op: "set", id, dados });
          docs.set(id, dados);
          emitir();
        },
      }),
    }),
  };
  // Claude de mentira para o assistente de anotação: devolve sempre o mesmo entendimento.
  window.__perguntas = [];
  const amanha = new Date(Date.now() + 86_400_000);
  const dia = `${amanha.getFullYear()}-${String(amanha.getMonth() + 1).padStart(2, "0")}-${String(amanha.getDate()).padStart(2, "0")}`;
  // Conversa: responde em partes (como o Claude de verdade) e propõe salvar um compromisso na "Loja Antiga".
  window.__conversas = [];
  const resposta =
    'Ela respondeu que o dono chega meio-dia. Manda amanhã:\n"Oi, tudo bem? Aqui é o Brenno."\n```painel\n' +
    JSON.stringify([
      {
        loja: "w5522900000001",
        status: "respondeu",
        compromisso: { quando: `${dia}T12:00`, oque: "Mandar mensagem pro dono" },
        anotacao: "Funcionária disse que o dono chega meio-dia.",
      },
    ]) +
    "\n```";
  const sample = async (entrada, opcoes = {}) => {
    window.__conversas.push({ entrada, fotos: opcoes.images?.length ?? 0 });
    opcoes.onText?.({ text: resposta.slice(0, 40), delta: resposta.slice(0, 40) });
    await new Promise((fim) => setTimeout(fim, 200));
    opcoes.onText?.({ text: resposta, delta: resposta.slice(40) });
    return { text: resposta, truncated: false };
  };
  sample.limits = async () => ({
    maxPromptBytes: 262144,
    images: { maxCount: 1, maxInputBytes: 20_000_000, mediaTypes: ["image/png", "image/jpeg", "image/webp"] },
  });
  sample.json = async (pergunta) => {
    window.__perguntas.push(pergunta);
    return {
      status: "respondeu",
      compromisso: { quando: `${dia}T12:00`, oque: "Conversar com o dono pessoalmente" },
      anotacao: "O dono quer conversar amanhã meio-dia na loja.",
    };
  };
  window.claude = { use: async (nome) => (nome === "db" ? db : nome === "sample" ? sample : null) };
}

const umd = (pacote, arquivo) =>
  readFileSync(path.join(raiz, "node_modules", pacote, "umd", arquivo), "utf8");

async function abrir(browser, opcoes) {
  const contexto = await browser.newContext(opcoes);
  const pagina = await contexto.newPage();
  const erros = [];
  pagina.on("pageerror", (e) => erros.push(String(e)));
  pagina.on("console", (m) => m.type() === "error" && erros.push(m.text()));
  await pagina.addInitScript(bancoDeMentira, leads);
  await pagina.route("**/cdnjs.cloudflare.com/**", (rota) => {
    const react = !rota.request().url().includes("react-dom");
    return rota.fulfill({
      contentType: "application/javascript",
      body: react
        ? umd("react", "react.production.min.js")
        : umd("react-dom", "react-dom.production.min.js"),
    });
  });
  await pagina.route("**/fonts.googleapis.com/**", (rota) =>
    rota.fulfill({ contentType: "text/css", body: "" }),
  );
  await pagina.route("http://painel.teste/", (rota) =>
    rota.fulfill({
      contentType: "text/html",
      body: moldura(readFileSync(path.join(raiz, "../vendas.html"), "utf8")),
    }),
  );
  await pagina.goto("http://painel.teste/");
  await pagina.getByRole("region", { name: "Casimiro de Abreu" }).waitFor();
  await pagina.waitForTimeout(900);
  return { contexto, pagina, erros };
}

const semTransbordo = (pagina) =>
  pagina.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);

const browser = await chromium.launch();
try {
  // Barra de São João é distrito de Casimiro, mas o painel conta como fora.
  const casimiro = leads.filter(
    (l) => /casimiro/i.test(l.cidade ?? "") && !/barra de s[aã]o jo[aã]o/i.test(`${l.nome} ${l.cidade}`),
  ).length;

  // Celular
  const cel = await abrir(browser, {
    viewport: { width: 412, height: 915 },
    deviceScaleFactor: 2.625,
    isMobile: true,
    hasTouch: true,
  });
  const p = cel.pagina;
  const aEnviar = leads.filter((l) => (l.status ?? "novo") === "novo").length;
  assert.equal(await p.getByRole("article").filter({ hasText: "A enviar" }).locator("p").first().innerText(), String(aEnviar));
  assert.equal(await p.getByRole("region", { name: "Casimiro de Abreu" }).locator("h2 + span").innerText(), String(casimiro));
  assert.ok(await semTransbordo(p), "a página não pode rolar para o lado");
  await p.screenshot({ path: path.join(saida, "celular-geral.png") });
  await p.screenshot({ path: path.join(saida, "celular-inteiro.png"), fullPage: false });

  // Nicho: tocar em um deixa só ele nas tabelas; tocar de novo volta tudo.
  const nicho = p.getByRole("region", { name: "Nichos" }).getByRole("button").first();
  const nomeNicho = await nicho.locator("span span").first().innerText();
  await nicho.click();
  const sublinhas = await p.locator("[data-tabelas] tbody tr p").allInnerTexts();
  assert.ok(sublinhas.length > 0 && sublinhas.every((t) => t === nomeNicho), "só o nicho escolhido aparece");
  await p.screenshot({ path: path.join(saida, "celular-nicho.png") });
  await nicho.click();

  // Fora de Casimiro: mensagem de site, sem preço e sem pedido de visita.
  const cidadeFora = p.locator("[data-tabelas] section[aria-labelledby]").filter({ hasText: "WhatsApp · site" }).first();
  await cidadeFora.locator("tbody tr button").first().click();
  const textoFora = decodeURIComponent(
    await p.getByRole("dialog").getByRole("link", { name: "Enviar no WhatsApp" }).getAttribute("href"),
  );
  assert.match(textoFora, /text=Oi, (bom dia|boa tarde|boa noite), tudo certo\?/);
  assert.match(textoFora, /não têm site/);
  assert.match(textoFora, /Sou de Casimiro, pertinho de /);
  // Os atalhos da loja aparecem em toda ficha, não só nas de Casimiro.
  for (const atalho of ["Ver no Google Maps", /Instagram/, "Abrir o WhatsApp da loja"]) {
    assert.equal(await p.getByRole("dialog").getByRole("link", { name: atalho }).count(), 1);
  }
  assert.doesNotMatch(textoFora, /R\$|passar aí/);
  await p.getByRole("dialog").getByRole("button", { name: "Fechar ficha" }).click();

  await p.getByRole("radio", { name: "Só Casimiro de Abreu" }).click();
  assert.equal(await p.locator("[data-tabelas] section[aria-labelledby]").count(), 1);
  await p.getByRole("region", { name: "Casimiro de Abreu" }).scrollIntoViewIfNeeded();
  await p.waitForTimeout(300);
  await p.screenshot({ path: path.join(saida, "celular-casimiro-tabela.png") });

  // Quem já recebeu o site pela versão antiga ainda pode receber a placa.
  // Loja longe que já recebeu pedido de visita: a ficha oferece a correção, uma vez só.
  await p.getByRole("button", { name: LONGE }).click();
  const longe = p.getByRole("dialog");
  const correcao = decodeURIComponent(
    await longe.getByRole("link", { name: "Mandar a correção" }).getAttribute("href"),
  );
  assert.match(correcao, /text=Opa, corrigindo o que falei antes: aí fica longe/);
  assert.match(correcao, /demonstração/);
  assert.match(correcao, /plaquinha/);
  await p.waitForTimeout(400);
  await p.screenshot({ path: path.join(saida, "celular-correcao.png") });
  await p.route("https://wa.me/**", (rota) => rota.fulfill({ contentType: "text/html", body: "ok" }));
  const [abaCorrecao] = await Promise.all([
    cel.contexto.waitForEvent("page"),
    longe.getByRole("link", { name: "Mandar a correção" }).click(),
  ]);
  await abaCorrecao.close();
  await longe.getByRole("link", { name: "Mandar a correção" }).waitFor({ state: "detached" });
  assert.ok((await p.evaluate(() => window.__escritas)).at(-1).dados.corrigidoEm);
  await longe.getByRole("button", { name: "Fechar ficha" }).click();
  await p.evaluate(() => (window.__escritas.length = 0));

  await p.getByRole("button", { name: ANTIGA }).click();
  const antiga = p.getByRole("dialog");
  await antiga.getByRole("radio", { name: "Dá pra ir: mensagem pedindo visita" }).click();
  await antiga.getByRole("radio", { name: "Site: mensagem já enviada" }).waitFor();
  assert.equal(
    await antiga.getByRole("radio", { name: "Oferecer a placa de avaliações" }).getAttribute("aria-checked"),
    "true",
  );
  // Já falou do site: a placa entra como continuação, sem novo "oi".
  const textoAntiga = decodeURIComponent(
    await antiga.getByRole("link", { name: "Enviar no WhatsApp" }).getAttribute("href"),
  );
  assert.match(textoAntiga, /text=Ah, esqueci de falar: também faço uma plaquinha/);
  assert.doesNotMatch(textoAntiga, /Oi,|Aqui é o Brenno/);
  await p.waitForTimeout(400);
  await p.screenshot({ path: path.join(saida, "celular-ja-mandou-site.png") });
  await antiga.getByRole("button", { name: "Fechar ficha" }).click();

  const primeira = p.getByRole("region", { name: "Casimiro de Abreu" }).locator("tbody tr button").first();
  const nome = await primeira.innerText();
  await primeira.click();
  const ficha = p.getByRole("dialog");
  await ficha.getByRole("link", { name: "Enviar no WhatsApp" }).waitFor();
  await p.waitForTimeout(400);
  await p.screenshot({ path: path.join(saida, "celular-ficha.png") });
  const href = await ficha.getByRole("link", { name: "Enviar no WhatsApp" }).getAttribute("href");
  assert.match(href, /^https:\/\/wa\.me\/55\d{10,11}\?text=/);
  // Atalhos da loja: mapa pelo nome, Instagram (perfil ou busca) e WhatsApp sem mensagem.
  const maps = await ficha.getByRole("link", { name: "Ver no Google Maps" }).getAttribute("href");
  assert.match(maps, /^https:\/\/www\.google\.com\/maps\/search\/\?api=1&query=/);
  assert.ok(decodeURIComponent(maps).includes(nome));
  assert.equal(await ficha.getByRole("link", { name: /Instagram/ }).count(), 1);
  assert.match(
    await ficha.getByRole("link", { name: "Abrir o WhatsApp da loja" }).getAttribute("href"),
    /^https:\/\/wa\.me\/55\d+\?text=$/,
  );
  // Loja da cidade de Casimiro já abre com visita; marcando NÃO, vira mensagem só por WhatsApp.
  assert.equal(
    await ficha.getByRole("radio", { name: "Dá pra ir: mensagem pedindo visita" }).getAttribute("aria-checked"),
    "true",
  );
  await ficha.getByRole("radio", { name: "Não dá pra ir: mensagem só por WhatsApp" }).click();
  const textoSemVisita = decodeURIComponent(
    await ficha.getByRole("link", { name: "Enviar no WhatsApp" }).getAttribute("href"),
  );
  assert.match(textoSemVisita, /Sou de Casimiro também/);
  assert.doesNotMatch(textoSemVisita, /passar aí|dono/);
  assert.equal(await ficha.getByRole("radiogroup", { name: "O que oferecer" }).count(), 0);
  assert.equal((await p.evaluate(() => window.__escritas)).at(-1).dados.visita, false);
  await ficha.getByRole("radio", { name: "Dá pra ir: mensagem pedindo visita" }).click();
  assert.equal((await p.evaluate(() => window.__escritas)).at(-1).dados.visita, true);

  // Nada enviado ainda em Casimiro: abre com as duas ofertas numa mensagem só.
  assert.equal(
    await ficha.getByRole("radio", { name: "Oferecer site e placa na mesma mensagem" }).getAttribute("aria-checked"),
    "true",
  );
  // Antes de mandar, quatro opções: as duas, placa, site e dono.
  assert.equal(await ficha.getByRole("radiogroup", { name: "O que oferecer" }).getByRole("radio").count(), 4);
  const textoAmbas = decodeURIComponent(
    await ficha.getByRole("link", { name: "Enviar no WhatsApp" }).getAttribute("href"),
  );
  assert.match(textoAmbas, /site e uma plaquinha/);
  assert.match(textoAmbas, /falar direto com o dono/);
  assert.match(textoAmbas, /me passa o contato/);
  assert.doesNotMatch(textoAmbas, /R\$/);

  // Aqui o Brenno escolhe mandar só a placa primeiro.
  await ficha.getByRole("radio", { name: "Oferecer a placa de avaliações" }).click();
  const textoCasimiro = decodeURIComponent(
    await ficha.getByRole("link", { name: "Enviar no WhatsApp" }).getAttribute("href"),
  );
  assert.ok(textoCasimiro.includes(nome), "a mensagem leva o nome do comércio");
  assert.match(textoCasimiro, /plaquinha com chip/);

  const [aba] = await Promise.all([
    cel.contexto.waitForEvent("page"),
    ficha.getByRole("link", { name: "Enviar no WhatsApp" }).click(),
  ]);
  await aba.close();
  await ficha.getByRole("button", { name: /^Próximo:/ }).waitFor();
  const escritas = (await p.evaluate(() => window.__escritas)).filter((e) => e.dados.enviadoEm);
  assert.equal(escritas.length, 1);
  assert.equal(escritas[0].dados.status, "enviado");
  assert.equal(escritas[0].dados.canal, "whatsapp");
  assert.equal(escritas[0].dados.pediuVisita, true);
  await p.screenshot({ path: path.join(saida, "celular-enviado.png") });

  // Em Casimiro dá para mandar a outra oferta depois da primeira; cada uma fica marcada sozinha.
  await ficha.getByRole("radio", { name: /^Oferecer/ }).click({ timeout: 4000 });
  const textoSegunda = decodeURIComponent(
    await ficha.getByRole("link", { name: "Enviar no WhatsApp" }).getAttribute("href"),
  );
  assert.match(textoSegunda, /text=Ah, e aproveitando: também faço site/);
  assert.doesNotMatch(textoSegunda, /Oi,|Aqui é o Brenno/);
  await p.waitForTimeout(300);
  await p.screenshot({ path: path.join(saida, "celular-segunda-oferta.png") });
  const [outraAba] = await Promise.all([
    cel.contexto.waitForEvent("page"),
    ficha.getByRole("link", { name: "Enviar no WhatsApp" }).click(),
  ]);
  await outraAba.close();
  await ficha.getByRole("button", { name: /^Próximo:/ }).waitFor();
  assert.equal(await ficha.getByRole("radio", { name: /^Oferecer/ }).count(), 0);
  const segunda = (await p.evaluate(() => window.__escritas)).at(-1).dados;
  assert.ok(segunda.enviados.placa && segunda.enviados.site, "as duas ofertas ficam marcadas");
  assert.equal(segunda.status, undefined, "a segunda oferta não muda a situação");

  // Depois das duas ofertas, a ficha passa a sugerir pedir para falar com o dono, sem novo "oi".
  assert.equal(
    await ficha.getByRole("radio", { name: "Pedir para falar com o dono" }).getAttribute("aria-checked"),
    "true",
  );
  const textoDono = decodeURIComponent(
    await ficha.getByRole("link", { name: "Enviar no WhatsApp" }).getAttribute("href"),
  );
  assert.match(textoDono, /text=Ah, e quem eu procuro aí/);
  assert.doesNotMatch(textoDono, /Oi,|Aqui é o Brenno/);
  const [abaDono] = await Promise.all([
    cel.contexto.waitForEvent("page"),
    ficha.getByRole("link", { name: "Enviar no WhatsApp" }).click(),
  ]);
  await abaDono.close();
  await ficha.getByRole("radio", { name: "Dono: pedido já enviado" }).waitFor();
  const terceira = (await p.evaluate(() => window.__escritas)).at(-1).dados;
  assert.ok(terceira.enviados.dono && terceira.enviados.placa && terceira.enviados.site);
  await p.waitForTimeout(300);
  await p.screenshot({ path: path.join(saida, "celular-dono.png") });
  await p.screenshot({ path: path.join(saida, "celular-duas-ofertas.png") });

  // A pessoa gostou: a mensagem oferece a demonstração do site, sem preço.
  await ficha.getByRole("button", { name: "Respondeu" }).click();
  const textoGostou = decodeURIComponent(
    await ficha.getByRole("link", { name: "Oferecer demonstração do site" }).getAttribute("href"),
  );
  assert.match(textoGostou, /demonstração de design/);
  assert.match(textoGostou, /hoje ou amanhã/);
  assert.ok(textoGostou.includes(nome));
  assert.doesNotMatch(textoGostou, /R\$|\{/);
  await p.screenshot({ path: path.join(saida, "celular-gostou.png") });

  // Assistente de anotação: entende o texto, mostra o que vai salvar e grava situação, compromisso e anotação.
  await ficha.getByLabel(/Conta o que aconteceu/).fill("o dono falou que quer conversar amanhã meio dia lá na loja");
  await ficha.getByRole("button", { name: "Anotar" }).click();
  await ficha.getByText("O assistente entendeu:").waitFor();
  const pergunta = (await p.evaluate(() => window.__perguntas)).at(-1);
  assert.ok(pergunta.includes(nome) && pergunta.includes("amanhã meio dia"), "o Claude recebe o comércio e o texto");
  assert.match(await ficha.getByRole("status").filter({ hasText: "Marcado:" }).innerText(), /amanhã 12:00/);
  await p.waitForTimeout(300);
  await p.screenshot({ path: path.join(saida, "celular-anotar.png") });
  await ficha.getByRole("button", { name: "Salvar" }).click();
  const anotada = (await p.evaluate(() => window.__escritas)).at(-1).dados;
  assert.equal(anotada.compromisso.oque, "Conversar com o dono pessoalmente");
  assert.equal(anotada.obs, "O dono quer conversar amanhã meio-dia na loja.");
  assert.equal(anotada.historico.at(-1).texto, "o dono falou que quer conversar amanhã meio dia lá na loja");
  await ficha.getByRole("button", { name: "Feito" }).waitFor();

  await ficha.getByRole("button", { name: "Fechar ficha" }).click();
  // O compromisso aparece em "Próximos passos", no topo do painel.
  const passos = p.getByRole("region", { name: "Próximos passos" });
  assert.match(await passos.innerText(), new RegExp(`amanhã 12:00[\\s\\S]*${nome}`));
  await p.getByRole("main").evaluate((el) => el.scrollTo({ top: 0 }));
  await p.waitForTimeout(300);
  await p.screenshot({ path: path.join(saida, "celular-proximos-passos.png") });
  await p.getByRole("button", { name: "Abrir menu" }).click();
  await p.getByRole("dialog", { name: "Menu" }).getByText("Meta de hoje").waitFor();
  // Meta de 30 comércios: a padaria recebeu placa, site e dono hoje e conta como 1 contato.
  const meta = p.getByRole("dialog", { name: "Menu" }).getByRole("meter", { name: "Comércios contatados hoje" });
  assert.equal(await meta.getAttribute("aria-valuemax"), "30");
  assert.equal(await meta.getAttribute("aria-valuenow"), "1");
  await p.waitForTimeout(400);
  await p.screenshot({ path: path.join(saida, "celular-menu.png") });
  // Assistente: manda um print com pergunta, ele responde e propõe salvar no painel.
  await p.getByRole("dialog", { name: "Menu" }).getByRole("link", { name: "Assistente" }).click();
  await p.getByRole("heading", { name: "Assistente" }).waitFor();
  await p.getByLabel("Escolher foto").setInputFiles({
    name: "print.png",
    mimeType: "image/png",
    buffer: Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
      "base64",
    ),
  });
  await p.getByLabel("Mensagem para o assistente").fill("o que eu faço com essa?");
  await p.getByRole("button", { name: "Enviar" }).click();
  await p.getByRole("button", { name: "Salvar no painel" }).waitFor();
  const conversaEnviada = (await p.evaluate(() => window.__conversas)).at(-1);
  assert.equal(conversaEnviada.fotos, 1, "a foto vai junto");
  const instrucoes = conversaEnviada.entrada[0].content;
  assert.match(instrucoes, /Barra de São João, Rio Dourado, Professor Souza/);
  assert.match(instrucoes, /ABORDAGEM PROFISSIONAL/);
  assert.match(instrucoes, /w5522900000001 \| Loja Antiga de Teste .*\+55 22 90000-0001/);
  assert.equal(conversaEnviada.entrada.at(-1).content, "o que eu faço com essa?\n[Foto em anexo]");
  assert.doesNotMatch(await p.locator("main").innerText(), /```painel/);
  await p.waitForTimeout(300);
  await p.screenshot({ path: path.join(saida, "celular-assistente.png") });
  await p.getByRole("button", { name: "Salvar no painel" }).click();
  await p.getByText("Salvo no painel", { exact: true }).waitFor();
  const salvaPeloAssistente = (await p.evaluate(() => window.__escritas)).filter((e) => e.id === "w5522900000001").at(-1);
  assert.equal(salvaPeloAssistente.dados.status, "respondeu");
  assert.equal(salvaPeloAssistente.dados.compromisso.oque, "Mandar mensagem pro dono");
  const guardada = (await p.evaluate(() => window.__escritas)).filter((e) => e.caminho === "assistente/conversa").at(-1);
  assert.equal(guardada.dados.mensagens.length, 2);
  assert.deepEqual(guardada.dados.mensagens[1].salvas, [0]);

  assert.deepEqual(cel.erros, []);
  await cel.contexto.close();

  // Computador
  const pc = await abrir(browser, { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  assert.ok(await semTransbordo(pc.pagina));
  await pc.pagina.screenshot({ path: path.join(saida, "computador.png") });
  assert.deepEqual(pc.erros, []);
  await pc.contexto.close();

  console.log(`OK: ${leads.length} empresas, ${casimiro} em Casimiro. Capturas em ${saida}`);
} finally {
  await browser.close();
}
