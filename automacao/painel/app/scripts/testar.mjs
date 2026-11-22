// Abre o vendas.html montado, com um banco de mentira no lugar do banco do Artifact,
// confere o fluxo principal e salva capturas de tela.
//   node scripts/testar.mjs            → empresas fictícias
//   LEADS_DIR=pasta node scripts/...   → um .json por empresa (ex.: exportado do banco)
//   SAIDA=pasta                        → onde salvar as capturas (padrão: ./capturas)
import assert from "node:assert/strict";
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
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

// EXTRA='{"nome":"…","tipo":"…"}' põe uma loja no topo de Casimiro, para ver a prévia de outro ramo
// e salva só a tela e a foto dela (celular-demonstracao.png e foto-previa.jpg).
if (process.env.EXTRA) {
  leads.push({
    id: "w5522999990001",
    whatsapp: "5522999990001",
    cidade: "Casimiro de Abreu",
    nota: 4.8,
    avaliacoes: 12,
    status: "novo",
    link: "",
    ...JSON.parse(process.env.EXTRA),
  });
}

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

// Ramo errado no cadastro do Google (casos reais de 15/11): a massoterapeuta veio como salão de
// beleza e o CT de luta veio como academia. "Barbosa" no nome não pode virar barbearia.
const MASSO = "Yasmim Teste - Massoterapeuta";
const CT = "CT Teste";
const DENTISTA = "Dra. Deise Barbosa Teste";
// Caso real de 20/11: loja de aquário cadastrada como "Fornecedor" saía com prévia de banho e tosa.
const AQUARIO = "Aquarismo Peixes Teste - casa de ração";
// Caso real de 20/11: vende frango assado e quentinha, e a prévia mostrava costela.
const FRANGO = "Frango Assado Teste e Quentinha";
const QUEIJO = "Ateliê do Queijo Teste";
const PIZZA = "Gran Pizza Teste";
const PESCA = "Oficina da Pesca Teste";
for (const [i, nome, tipo] of [[3, MASSO, "Salão de beleza"], [4, CT, "Academia"], [5, DENTISTA, "Dentista"], [6, AQUARIO, "Loja de ração"], [7, FRANGO, "Restaurante"], [8, QUEIJO, "Fabricante de queijo"], [9, PIZZA, "Delivery"], [10, PESCA, "Loja de artigos para pesca"]]) {
  leads.push({
    id: `w552290000000${i}`,
    nome,
    tipo,
    // Cidade só delas: ficam numa tabela própria, sem mexer na paginação das outras.
    cidade: "Cidade de Teste",
    whatsapp: `552290000000${i}`,
    nota: 5,
    avaliacoes: 999990 + i,
    status: "novo",
    // Contato do dono pelo cadastro do CNPJ: celular dele (aquário) e WhatsApp da loja que já é dele (dentista).
    ...(nome === AQUARIO ? { dono: { nome: "Ana", whatsapp: "5522988887777", em: "2026-11-20T00:00:00.000Z" } } : {}),
    ...(nome === DENTISTA ? { dono: { nome: "Rui", mesmo: true, em: "2026-11-20T00:00:00.000Z" } } : {}),
    // Caso Raffus (22/11): número do Google sem WhatsApp Business; o certo estava no Instagram.
    ...(nome === PESCA
      ? { zap: { nome: "", confere: false, em: "2026-11-20T00:00:00.000Z" }, link: "https://www.instagram.com/pesca_teste/" }
      : {}),
  });
}

// Mesma moldura que a plataforma põe em volta da página publicada.
const moldura = (corpo) => `<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1,viewport-fit=cover"><style>:root{color-scheme:light;box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}html{scroll-padding-top:env(safe-area-inset-top,0px)}body{margin:0;padding:0;font:14px -apple-system,BlinkMacSystemFont,sans-serif;background:#fff;color:#000}img{max-width:100%}[hidden]:not([hidden=until-found i]){display:none!important}</style></head><body>
${corpo}
</body></html>`;

function bancoDeMentira(iniciais) {
  // Uma coleção por caminho (leads, compromissos…), como no banco do Artifact.
  const colecoes = new Map([["leads", new Map(iniciais.map(({ id, ...dados }) => [id, dados]))]]);
  const ouvintes = new Map();
  const docsDe = (caminho) => {
    if (!colecoes.has(caminho)) colecoes.set(caminho, new Map());
    return colecoes.get(caminho);
  };
  window.__escritas = [];
  const emitir = (caminho) => {
    const snap = {
      metadata: { fromCache: false },
      docs: [...docsDe(caminho)].map(([id, dados]) => ({ id, exists: true, data: () => dados })),
    };
    (ouvintes.get(caminho) ?? new Set()).forEach((fn) => fn(snap));
  };
  const db = {
    doc: (caminho) => ({
      onSnapshot: (next) => (setTimeout(() => next({ exists: false, data: () => undefined }), 0), () => {}),
      set: async (dados) => void window.__escritas.push({ op: "set", caminho, dados }),
    }),
    collection: (caminho) => ({
      onSnapshot: (next) => {
        if (!ouvintes.has(caminho)) ouvintes.set(caminho, new Set());
        ouvintes.get(caminho).add(next);
        setTimeout(() => emitir(caminho), 30);
        return () => ouvintes.get(caminho).delete(next);
      },
      doc: (id) => ({
        update: async (dados) => {
          window.__escritas.push({ op: "update", colecao: caminho, id, dados });
          docsDe(caminho).set(id, { ...docsDe(caminho).get(id), ...dados });
          emitir(caminho);
        },
        set: async (dados) => {
          window.__escritas.push({ op: "set", colecao: caminho, id, dados });
          docsDe(caminho).set(id, dados);
          emitir(caminho);
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
  // Horário de Brasília, como no celular do Brenno (a agenda usa o relógio de São Paulo).
  const contexto = await browser.newContext({ timezoneId: "America/Sao_Paulo", ...opcoes });
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
  await pagina.route("http://painel.teste/img/**", (rota) =>
    rota.fulfill({
      contentType: rota.request().url().endsWith(".woff2") ? "font/woff2" : "image/webp",
      body: readFileSync(path.join(raiz, "..", new URL(rota.request().url()).pathname)),
    }),
  );
  await pagina.route("http://painel.teste/", (rota) =>
    rota.fulfill({
      contentType: "text/html",
      body: moldura(readFileSync(path.join(raiz, "../vendas.html"), "utf8")),
    }),
  );
  // Sem lote de pesquisa novo neste teste (o painel ignora lote vazio).
  await pagina.route("http://painel.teste/pesquisa/**", (rota) =>
    rota.fulfill({ contentType: "application/json", body: '{"lote":"","leads":[]}' }),
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
  if (process.env.EXTRA) {
    // Só a prévia da loja extra: tela e foto gerada.
    const nomeExtra = JSON.parse(process.env.EXTRA).nome;
    await p.getByRole("button", { name: nomeExtra }).first().click();
    await p.getByRole("dialog").first().getByRole("button", { name: "Mostrar demonstração do site" }).click();
    const previa = p.getByRole("dialog", { name: `Demonstração do site de ${nomeExtra}` });
    await previa.getByRole("heading", { level: 1 }).waitFor();
    await p.waitForTimeout(600);
    await p.screenshot({ path: path.join(saida, "celular-demonstracao.png") });
    // RAMOS=crossfit,pilates troca o estilo da prévia e tira um print de cada (sem gerar a foto).
    if (process.env.RAMOS) {
      // Tela bem alta: a prévia rola dentro do diálogo e o que fica fora da rolagem sai em branco no print.
      await p.setViewportSize({ width: 412, height: 4200 });
      for (const id of process.env.RAMOS.split(",")) {
        await previa.getByLabel("Estilo da prévia").selectOption(id);
        const foto = id.split("/").at(-1);
        await previa.locator(`img[src*="img/demo/${foto}-"]`).first().waitFor();
        await p.waitForTimeout(400);
        // Página inteira da prévia (o artigo), não só a parte que cabe na tela.
        await previa.locator("article").screenshot({ path: path.join(saida, `previa-${id.replace("/", "_")}.png`) });
      }
      assert.deepEqual(cel.erros, []);
      console.log(`Prévias de ${process.env.RAMOS} em ${saida}`);
      await browser.close();
      process.exit(0);
    }
    await previa.getByRole("button", { name: "Mandar foto" }).click();
    const gerada = previa.getByRole("img", { name: `Foto da prévia do site de ${nomeExtra}` });
    await gerada.waitFor({ timeout: 20000 });
    const src = await gerada.getAttribute("src");
    writeFileSync(path.join(saida, "foto-previa.jpg"), Buffer.from(src.split(",")[1], "base64"));
    assert.deepEqual(cel.erros, []);
    console.log(`Prévia de ${nomeExtra} em ${saida}`);
    await browser.close();
    process.exit(0);
  }
  const aEnviar = leads.filter((l) => (l.status ?? "novo") === "novo").length;
  assert.equal(await p.getByRole("article").filter({ hasText: "A enviar" }).locator("p").first().innerText(), String(aEnviar));
  assert.equal(await p.getByRole("region", { name: "Casimiro de Abreu" }).locator("h2 + span").innerText(), String(casimiro));
  assert.ok(await semTransbordo(p), "a página não pode rolar para o lado");
  await p.screenshot({ path: path.join(saida, "celular-geral.png") });
  await p.screenshot({ path: path.join(saida, "celular-inteiro.png"), fullPage: false });

  // Barbearia sem contato: a ficha já abre no horário marcado, com mensagem sem preço.
  if (leads.some((l) => l.nome === "Barbearia Exemplo 16")) {
    await p.getByRole("button", { name: "Barbearia Exemplo 16" }).first().click();
    const barbearia = p.getByRole("dialog");
    assert.equal(
      await barbearia.getByRole("radio", { name: "Oferecer o sistema de horário marcado" }).getAttribute("aria-checked"),
      "true",
    );
    const textoHorario = decodeURIComponent(
      await barbearia.getByRole("link", { name: "Enviar no WhatsApp" }).getAttribute("href"),
    );
    assert.match(textoHorario, /horário marcado/);
    assert.doesNotMatch(textoHorario, /R\$|\{/);
    await p.waitForTimeout(300);
    await p.screenshot({ path: path.join(saida, "celular-horario.png") });
    // O sistema no notebook e no celular, nos dois tipos: horário marcado e controle de alunos.
    for (const [ramo, nomeSistema, arquivoFoto] of [
      [null, "horário marcado", "celular-sistema.png"],
      ["pilates", "controle de alunos", "celular-sistema-alunos.png"],
    ]) {
      if (ramo) await barbearia.getByLabel("Ramo da loja").selectOption(ramo);
      await barbearia.getByRole("button", { name: `Mostrar o sistema (${nomeSistema})` }).click();
      const sistema = p.getByRole("dialog", { name: `Sistema de ${nomeSistema} de Barbearia Exemplo 16` });
      await sistema.getByRole("heading", { level: 1 }).waitFor();
      await p.waitForTimeout(500);
      await p.screenshot({ path: path.join(saida, arquivoFoto) });
      await sistema.getByRole("button", { name: "Fechar sistema" }).click();
      await sistema.waitFor({ state: "detached" });
    }
    await barbearia.getByRole("button", { name: "Fechar ficha" }).click();
    await barbearia.waitFor({ state: "detached" });
  }

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

  // Número sem WhatsApp: a loja sai das listas e da contagem; em "Tiradas" dá para trazer de volta.
  const kpiAEnviar = () => p.getByRole("article").filter({ hasText: "A enviar" }).locator("p").first().innerText();
  await cidadeFora.locator("tbody tr button").first().click();
  const semZap = await p.getByRole("dialog").getByRole("heading", { level: 2 }).innerText();
  await p.getByRole("dialog").getByRole("button", { name: "Loja não existe mais" }).waitFor();
  await p.waitForTimeout(400);
  await p.getByRole("dialog").getByRole("button", { name: "Número sem WhatsApp" }).scrollIntoViewIfNeeded();
  await p.screenshot({ path: path.join(saida, "celular-tirar-da-lista.png") });
  await p.getByRole("dialog").getByRole("button", { name: "Número sem WhatsApp" }).click();
  await p.getByRole("status").filter({ hasText: `${semZap} saiu da lista: número sem WhatsApp` }).first().waitFor({ state: "attached" });
  assert.equal((await p.evaluate(() => window.__escritas)).at(-1).dados.tirada.motivo, "semWhatsApp");
  // A ficha pula para a próxima loja da mesma cidade.
  assert.notEqual(await p.getByRole("dialog").getByRole("heading", { level: 2 }).innerText(), semZap);
  await p.getByRole("dialog").getByRole("button", { name: "Fechar ficha" }).click();
  assert.equal(await kpiAEnviar(), String(aEnviar - 1));
  assert.equal(await p.getByRole("button", { name: semZap, exact: true }).count(), 0);
  await p.getByRole("button", { name: "Tiradas da lista: 1" }).click();
  await p.getByRole("button", { name: semZap, exact: true }).click();
  await p.getByRole("dialog").getByText(/Tirada da lista hoje: número sem WhatsApp/).waitFor();
  assert.equal(await p.getByRole("dialog").getByRole("button", { name: "Número sem WhatsApp" }).count(), 0);
  await p.waitForTimeout(400);
  await p.screenshot({ path: path.join(saida, "celular-tirada.png") });
  await p.getByRole("dialog").getByRole("button", { name: "Voltar pra lista" }).click();
  assert.equal((await p.evaluate(() => window.__escritas)).at(-1).dados.tirada, null);
  await p.getByRole("dialog").getByRole("button", { name: "Número sem WhatsApp" }).waitFor();
  await p.getByRole("dialog").getByRole("button", { name: "Fechar ficha" }).click();
  await p.getByRole("button", { name: "Ver todas" }).click();
  assert.equal(await kpiAEnviar(), String(aEnviar));

  // Prévia com o ramo certo: massagem para a massoterapeuta, luta para o CT, dentista para a "Barbosa".
  for (const [loja, rotulo, foto] of [
    [MASSO, "Massoterapia em Cidade de Teste", "massagem-1.webp"],
    [CT, "Academia de luta em Cidade de Teste", "luta-1.webp"],
    [DENTISTA, "Dentista em Cidade de Teste", "dentista-1.webp"],
    [AQUARIO, "Aquarismo em Cidade de Teste", "aquario-1.webp"],
    [FRANGO, "Frango assado em Cidade de Teste", "frango-1.webp"],
    // Queijaria não é supermercado; pizzaria com tipo "Delivery" é pizzaria (o nome vence o tipo genérico).
    [QUEIJO, "Cidade de Teste", "queijaria-1.webp"],
    [PIZZA, "Cidade de Teste", "pizzaria-1.webp"],
    // "Oficina" no nome de loja de pesca não é mecânica.
    [PESCA, "Cidade de Teste", "pesca-1.webp"],
  ]) {
    await p.getByRole("button", { name: loja, exact: true }).click();
    await p.getByRole("dialog").first().getByRole("button", { name: "Mostrar demonstração do site" }).click();
    const previa = p.getByRole("dialog", { name: `Demonstração do site de ${loja}` });
    await previa.getByText(rotulo).first().waitFor();
    assert.ok((await previa.locator(`img[src$="${foto}"]`).count()) >= 1, `${loja} usa a foto ${foto}`);
    if (loja === MASSO) {
      await p.waitForTimeout(500);
      await p.screenshot({ path: path.join(saida, "celular-previa-massagem.png") });
      // A mensagem também fala do ramo certo.
      await previa.getByRole("button", { name: "Fechar demonstração" }).click();
      const textoMasso = decodeURIComponent(
        await p.getByRole("dialog").getByRole("link", { name: "Enviar no WhatsApp" }).getAttribute("href"),
      );
      assert.match(textoMasso, /Pra massoterapia eu monto o site com os atendimentos/);
      assert.doesNotMatch(textoMasso, /sal[aã]o de beleza|na cadeira/);
    } else if (loja === CT) {
      await p.waitForTimeout(500);
      await p.screenshot({ path: path.join(saida, "celular-previa-luta.png") });
      // Trocar o estilo na prévia grava o ramo escolhido e muda as fotos na hora.
      await previa.getByLabel("Estilo da prévia").selectOption("academia");
      await previa.locator('img[src$="academia-1.webp"]').first().waitFor();
      const troca = (await p.evaluate(() => window.__escritas)).at(-1).dados;
      assert.equal(troca.ramo, "academia");
      await previa.getByLabel("Estilo da prévia").selectOption("luta");
      await previa.locator('img[src$="luta-1.webp"]').first().waitFor();
      assert.equal((await p.evaluate(() => window.__escritas)).at(-1).dados.tipo, "Academia de luta");
      await previa.getByRole("button", { name: "Fechar demonstração" }).click();
    } else if (loja === FRANGO) {
      // O Brenno pode escolher o sub-nicho na prévia: grava e troca as fotos.
      await previa.getByLabel("Estilo da prévia").selectOption("restaurante/marmita");
      await previa.locator('img[src$="marmita-1.webp"]').first().waitFor();
      assert.equal((await p.evaluate(() => window.__escritas)).at(-1).dados.subnicho, "marmita");
      await previa.getByRole("button", { name: "Fechar demonstração" }).click();
    } else {
      await previa.getByRole("button", { name: "Fechar demonstração" }).click();
    }
    await p.getByRole("dialog").getByRole("button", { name: "Fechar ficha" }).click();
  }
  await p.evaluate(() => (window.__escritas.length = 0));

  // Número não confirmado: aviso com Instagram e "Corrigir número"; depois disso todo envio vai pro número certo.
  {
    await p.getByRole("button", { name: PESCA, exact: true }).click();
    const ficha = p.getByRole("dialog");
    await ficha.getByText(/Número não confirmado: \(22\) [\d-]+ veio do Google/).waitFor();
    assert.equal(await ficha.getByRole("link", { name: "Ver no Instagram" }).getAttribute("href"), "https://www.instagram.com/pesca_teste/");
    await ficha.getByRole("button", { name: "Corrigir número" }).click();
    await ficha.getByLabel("WhatsApp certo da loja, com DDD").fill("(22) 99743-1349");
    await ficha.getByRole("button", { name: "Salvar", exact: true }).click();
    assert.equal((await p.evaluate(() => window.__escritas)).at(-1).dados.whatsappCerto, "5522997431349");
    await ficha.getByText("Número corrigido por você: (22) 99743-1349.").waitFor();
    assert.match(await ficha.getByRole("link", { name: "Enviar no WhatsApp" }).getAttribute("href"), /^https:\/\/wa\.me\/5522997431349\?text=/);
    await p.screenshot({ path: path.join(saida, "celular-numero-corrigido.png") });
    await ficha.getByRole("button", { name: "Fechar ficha" }).click();
  }

  // Dono pelo CNPJ: mensagem pro celular dele chamando pelo nome; a da loja fica como segunda opção.
  {
    await p.getByRole("button", { name: AQUARIO, exact: true }).click();
    const ficha = p.getByRole("dialog");
    await ficha.getByText("Celular do dono, Ana, no cadastro do CNPJ").waitFor();
    const praDono = await ficha.getByRole("link", { name: "Enviar pro dono (Ana)" }).getAttribute("href");
    assert.match(praDono, /^https:\/\/wa\.me\/5522988887777\?text=/);
    assert.match(decodeURIComponent(praDono), /text=Oi, Ana, /);
    const praLoja = decodeURIComponent(await ficha.getByRole("link", { name: "Mandar pra loja" }).getAttribute("href"));
    assert.match(praLoja, /^https:\/\/wa\.me\/5522900000006\?text=Oi, (?!Ana)/);
    await p.screenshot({ path: path.join(saida, "celular-dono-cnpj.png") });
    await ficha.getByRole("button", { name: "Fechar ficha" }).click();

    await p.getByRole("button", { name: DENTISTA, exact: true }).click();
    await ficha.getByText("Esse WhatsApp é o do dono (Rui) no cadastro do CNPJ.").waitFor();
    const mesmo = decodeURIComponent(await ficha.getByRole("link", { name: "Enviar no WhatsApp" }).getAttribute("href"));
    assert.match(mesmo, /^https:\/\/wa\.me\/5522900000005\?text=Oi, Rui, /);
    await ficha.getByRole("button", { name: "Fechar ficha" }).click();
  }

  await p.getByRole("radio", { name: "Só Casimiro de Abreu" }).click();
  assert.equal(await p.locator("[data-tabelas] section[aria-labelledby]").count(), 1);
  await p.getByRole("region", { name: "Casimiro de Abreu" }).scrollIntoViewIfNeeded();
  await p.waitForTimeout(300);
  await p.screenshot({ path: path.join(saida, "celular-casimiro-tabela.png") });

  // Quem já recebeu o site pela versão antiga ainda pode receber a placa.
  // Loja longe que já recebeu pedido de visita: a ficha oferece a correção, uma vez só.
  await p.getByRole("button", { name: LONGE, exact: true }).click();
  const longe = p.getByRole("dialog");
  const correcao = decodeURIComponent(
    await longe.getByRole("link", { name: "Mandar a correção" }).getAttribute("href"),
  );
  assert.match(correcao, /text=Opa, corrigindo o que falei antes: aí fica longe/);
  assert.match(correcao, /demonstração/);
  assert.match(correcao, /plaquinha/);
  await p.waitForTimeout(400);
  await p.screenshot({ path: path.join(saida, "celular-correcao.png") });
  // No contexto, para valer também nas abas novas que o envio abre.
  await cel.contexto.route("https://wa.me/**", (rota) => rota.fulfill({ contentType: "text/html", body: "ok" }));
  const [abaCorrecao] = await Promise.all([
    cel.contexto.waitForEvent("page"),
    longe.getByRole("link", { name: "Mandar a correção" }).click(),
  ]);
  await abaCorrecao.close();
  await longe.getByRole("link", { name: "Mandar a correção" }).waitFor({ state: "detached" });
  assert.ok((await p.evaluate(() => window.__escritas)).at(-1).dados.corrigidoEm);
  await longe.getByRole("button", { name: "Fechar ficha" }).click();
  await p.evaluate(() => (window.__escritas.length = 0));

  await p.getByRole("button", { name: ANTIGA, exact: true }).click();
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
  // Salão e pet shop também têm o sistema (horário marcado): um botão a mais na ficha.
  const comSistema = /^(Salão de Beleza|Pet Shop|Barbearia) Exemplo/.test(nome);
  await primeira.click();
  const ficha = p.getByRole("dialog");
  await ficha.getByRole("link", { name: "Enviar no WhatsApp" }).waitFor();
  await p.waitForTimeout(400);
  await p.screenshot({ path: path.join(saida, "celular-ficha.png") });
  // Demonstração: prévia do site com o nome da loja; os botões só explicam o que fariam.
  await ficha.first().getByRole("button", { name: "Mostrar demonstração do site" }).click();
  const demo = p.getByRole("dialog", { name: `Demonstração do site de ${nome}` });
  await demo.getByText(`Prévia: ${nome}`).waitFor();
  await demo.getByRole("heading", { level: 1 }).waitFor();
  await p.waitForTimeout(500);
  await p.screenshot({ path: path.join(saida, "celular-demonstracao.png") });
  await demo.getByRole("button", { name: /WhatsApp/ }).first().click();
  await demo.getByRole("status").filter({ hasText: "No site de verdade" }).waitFor();
  // Mandar foto: sem compartilhar nem salvar no navegador de teste, mostra a foto gerada.
  await demo.getByRole("button", { name: "Mandar foto" }).click();
  const fotoGerada = demo.getByRole("img", { name: `Foto da prévia do site de ${nome}` });
  await fotoGerada.waitFor({ timeout: 20000 });
  const srcFoto = await fotoGerada.getAttribute("src");
  assert.match(srcFoto, /^data:image\/jpeg;base64,/);
  writeFileSync(path.join(saida, "foto-previa.jpg"), Buffer.from(srcFoto.split(",")[1], "base64"));
  await demo.getByRole("button", { name: "Voltar para a prévia" }).click();
  await demo.getByRole("button", { name: "Fechar demonstração" }).click();
  await demo.waitFor({ state: "detached" });
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
  assert.equal(await ficha.getByRole("radiogroup", { name: "O que oferecer" }).count(), comSistema ? 1 : 0);
  assert.equal((await p.evaluate(() => window.__escritas)).at(-1).dados.visita, false);
  await ficha.getByRole("radio", { name: "Dá pra ir: mensagem pedindo visita" }).click();
  assert.equal((await p.evaluate(() => window.__escritas)).at(-1).dados.visita, true);

  // Nada enviado ainda em Casimiro: abre com as duas ofertas numa mensagem só.
  assert.equal(
    await ficha.getByRole("radio", { name: "Oferecer site e placa na mesma mensagem" }).getAttribute("aria-checked"),
    "true",
  );
  // Antes de mandar, quatro opções: as duas, placa, site e dono (mais o sistema, quando o ramo tem).
  assert.equal(await ficha.getByRole("radiogroup", { name: "O que oferecer" }).getByRole("radio").count(), comSistema ? 5 : 4);
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

  const hrefPlaca = await ficha.getByRole("link", { name: "Enviar no WhatsApp" }).getAttribute("href");
  const [aba] = await Promise.all([
    cel.contexto.waitForEvent("page"),
    ficha.getByRole("link", { name: "Enviar no WhatsApp" }).click(),
  ]);
  // O WhatsApp abre com a mensagem que estava na tela, não com a próxima.
  await aba.waitForLoadState();
  assert.equal(aba.url(), hrefPlaca);
  await aba.close();
  await ficha.getByRole("button", { name: /^Próximo:/ }).waitFor();
  // "AS DUAS" continua na ficha depois do primeiro envio.
  assert.equal(await ficha.getByRole("radio", { name: "Oferecer site e placa na mesma mensagem" }).count(), 1);
  const escritas = (await p.evaluate(() => window.__escritas)).filter((e) => e.dados.enviadoEm);
  assert.equal(escritas.length, 1);
  assert.equal(escritas[0].dados.status, "enviado");
  assert.equal(escritas[0].dados.canal, "whatsapp");
  assert.equal(escritas[0].dados.pediuVisita, true);
  await p.screenshot({ path: path.join(saida, "celular-enviado.png") });

  // Em Casimiro dá para mandar a outra oferta depois da primeira; cada uma fica marcada sozinha.
  await ficha.getByRole("radio", { name: "Oferecer o site" }).click({ timeout: 4000 });
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
  assert.equal(await ficha.getByRole("radio", { name: /^Oferecer/ }).count(), comSistema ? 1 : 0);
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
  // Se o WhatsApp não abriu, dá para voltar em "AS DUAS" e mandar o mesmo texto de novo.
  await ficha.getByRole("radio", { name: "As duas: mensagem já enviada" }).click();
  const textoReenvio = decodeURIComponent(
    await ficha.getByRole("link", { name: "Enviar de novo" }).getAttribute("href"),
  );
  assert.match(textoReenvio, /text=Oi, (bom dia|boa tarde|boa noite), tudo certo\?/);
  assert.match(textoReenvio, /site e uma plaquinha/);
  await ficha.getByText(/Mensagem das duas ofertas enviada hoje/).waitFor();
  await ficha.getByRole("radio", { name: "Dono: pedido já enviado" }).click();
  await p.waitForTimeout(300);
  await p.screenshot({ path: path.join(saida, "celular-dono.png") });
  await p.screenshot({ path: path.join(saida, "celular-duas-ofertas.png") });

  // A pessoa gostou: a mensagem oferece a demonstração do site, sem preço.
  await ficha.getByRole("button", { name: "Respondeu" }).click();
  const textoGostou = decodeURIComponent(
    await ficha.getByRole("link", { name: "Só oferecer a demonstração por texto" }).getAttribute("href"),
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
  // O combinado aparece na "Agenda de hoje", no topo do painel, na linha de amanhã.
  const hojeAgenda = p.getByRole("region", { name: /^Agenda de hoje/ });
  assert.match(await hojeAgenda.innerText(), new RegExp(`Amanhã:[\\s\\S]*12:00 ${nome}`));
  // Quem respondeu e não tem horário: "Pedir horário" abre o WhatsApp com a mensagem formal pronta.
  const lojaLonge = hojeAgenda.getByRole("listitem").filter({ hasText: LONGE });
  await lojaLonge.getByRole("button", { name: "Pedir horário" }).click();
  const pedido = decodeURIComponent(await lojaLonge.getByRole("link", { name: "Abrir no WhatsApp" }).getAttribute("href"));
  assert.match(pedido, /^https:\/\/wa\.me\/5522900000002\?text=Olá, Loja Longe de Teste! Tudo bem\? Aqui é o Brenno, da BN Digital\./);
  assert.match(pedido, /Tenho disponibilidade (na|no) \S+ \(\d\d\/\d\d\) ou (na|no) \S+ \(\d\d\/\d\d\)\. Qual dia e horário/);
  await p.getByRole("main").evaluate((el) => el.scrollTo({ top: 0 }));
  await p.waitForTimeout(300);
  await p.screenshot({ path: path.join(saida, "celular-hoje.png") });
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

  // Agenda: no celular abre no Dia; o combinado de amanhã (anotado pelo assistente) aparece no dia seguinte.
  await p.getByRole("button", { name: "Abrir menu" }).click();
  await p.getByRole("dialog", { name: "Menu" }).getByRole("link", { name: /Agenda/ }).click();
  await p.getByRole("heading", { name: "Agenda" }).waitFor();
  await p.getByRole("button", { name: "Próximo" }).click();
  assert.match(await p.getByRole("region", { name: "Dia" }).innerText(), new RegExp(nome));
  const compromissoSalvo = async () =>
    (await p.evaluate(() => window.__escritas)).filter((e) => e.colecao === "compromissos").at(-1).dados;

  // Marcar: visita na Loja Antiga amanhã às 12:00.
  await p.getByRole("button", { name: "Novo horário" }).click();
  let form = p.getByRole("dialog", { name: "Novo horário" });
  await form.getByPlaceholder("Buscar loja pelo nome").fill("Loja Antiga");
  await form.getByRole("button", { name: new RegExp(ANTIGA) }).click();
  await form.getByLabel("Hora").fill("12:00");
  await form.getByRole("button", { name: "Marcar horário" }).click();
  let salvo = await compromissoSalvo();
  assert.equal(salvo.leadId, "w5522900000001");
  assert.equal(salvo.hora, "12:00");
  assert.equal(salvo.tipo, "visita");
  await p.getByRole("dialog", { name: `Horário com ${ANTIGA}` }).getByRole("button", { name: "Fechar" }).click();

  // Choque: 12:15 bate com a visita (30 min + 15 de deslocamento) e o painel sugere 12:45.
  await p.waitForTimeout(300);
  await p.getByRole("button", { name: "Novo horário" }).click();
  form = p.getByRole("dialog", { name: "Novo horário" });
  await form.getByPlaceholder("Buscar loja pelo nome").fill("Loja Longe");
  await form.getByRole("button", { name: new RegExp(LONGE) }).click();
  await form.getByLabel("Hora").fill("12:15");
  assert.match(await form.getByRole("alert").innerText(), new RegExp(`Bate com ${ANTIGA} \\(12:00\\)`));
  await form.getByRole("button", { name: /^Usar / }).click();
  assert.equal(await form.getByLabel("Hora").inputValue(), "12:45");
  await form.getByRole("button", { name: "Marcar horário" }).click();
  assert.equal((await compromissoSalvo()).hora, "12:45");

  // Ficha do horário: remarcar guarda o histórico e a confirmação já usa a hora nova.
  const horario = p.getByRole("dialog", { name: `Horário com ${LONGE}` });
  await horario.getByRole("button", { name: "Remarcar" }).click();
  await horario.getByLabel("Nova hora").fill("15:00");
  await horario.getByRole("button", { name: "Salvar novo horário" }).click();
  salvo = await compromissoSalvo();
  assert.equal(salvo.status, "remarcado");
  assert.equal(salvo.hora, "15:00");
  assert.equal(salvo.historico.length, 1);
  await p.waitForTimeout(300);
  const confirmacao = decodeURIComponent(await horario.getByRole("link", { name: "Abrir no WhatsApp" }).getAttribute("href"));
  assert.match(confirmacao, /^https:\/\/wa\.me\/5522900000002\?text=Oi Loja Longe de Teste, tudo bem\? Confirmando nossa conversa .+, às 15:00, aí na loja\./);
  await p.screenshot({ path: path.join(saida, "celular-horario.png") });
  // Realizado → "Vai pensar" já abre o retorno.
  await horario.getByRole("button", { name: "Realizado" }).click();
  await horario.getByRole("button", { name: "Vai pensar" }).click();
  salvo = await compromissoSalvo();
  assert.equal(salvo.status, "realizado");
  assert.equal(salvo.resultado, "pensar");
  form = p.getByRole("dialog", { name: "Novo horário" });
  await form.getByRole("button", { name: "Fechar" }).click();
  await p.waitForTimeout(300);
  assert.ok(await semTransbordo(p));
  await p.screenshot({ path: path.join(saida, "celular-agenda-dia.png") });

  // Exemplos: 5 horários de mentira, sem telefone, e o botão para apagar.
  await p.getByRole("radio", { name: "Semana" }).click();
  await p.getByRole("button", { name: "Pôr 5 exemplos" }).click();
  await p.waitForTimeout(300);
  const exemplos = (await p.evaluate(() => window.__escritas)).filter((e) => e.colecao === "compromissos" && e.dados.exemplo);
  assert.equal(exemplos.length, 5);
  assert.ok(exemplos.every((e) => e.dados.cliente.whatsapp === ""));
  assert.ok(await semTransbordo(p));
  await p.screenshot({ path: path.join(saida, "celular-agenda-semana.png") });
  await p.getByRole("button", { name: "Apagar exemplos" }).click();
  await p.waitForTimeout(300);
  assert.equal(
    (await p.evaluate(() => window.__escritas)).filter((e) => e.colecao === "compromissos" && e.dados.apagado).length,
    5,
  );
  await p.getByRole("button", { name: "Pôr 5 exemplos" }).waitFor();

  // Funil: o fluxo mostra as etapas e tocar numa leva à lista filtrada.
  await p.getByRole("button", { name: "Abrir menu" }).click();
  await p.getByRole("dialog", { name: "Menu" }).getByRole("link", { name: "Funil" }).click();
  await p.getByRole("region", { name: "Funil de vendas" }).waitFor();
  await p.waitForTimeout(600);
  assert.ok(await semTransbordo(p));
  await p.screenshot({ path: path.join(saida, "celular-funil.png") });
  await p.locator(".react-flow__node", { hasText: "Enviado" }).click();
  await p.getByRole("status").filter({ hasText: "Mostrando enviados" }).first().waitFor({ state: "attached" });
  await p.locator("[data-tabelas]").waitFor();

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
