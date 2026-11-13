import { useEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { toJpeg } from "html-to-image";
import {
  ArrowRight,
  BadgeCheck,
  Bike,
  CakeSlice,
  Car,
  CircleGauge,
  Clock,
  Croissant,
  CupSoda,
  Dumbbell,
  HeartPulse,
  IceCreamCone,
  Instagram,
  Loader2,
  MapPin,
  MessageCircle,
  PawPrint,
  Pizza,
  Scissors,
  Send,
  ShieldCheck,
  Smile,
  Sparkles,
  Star,
  Store,
  Utensils,
  Wrench,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { cidadeDe, fmtInt, type Lead } from "./leads";

// Prévia de como ficaria o site da loja, no nível de um site pronto (referência: shots do
// Pinterest que o Brenno mandou). Só usa o que é verdade (nome, ramo, cidade, nota do Google);
// fotos são de banco livre (Unsplash) por ramo, e produtos, preços e horários ficam como espaço
// para os da loja. O botão "Mandar foto" gera uma imagem da página para mandar no WhatsApp.

type Servico = [nome: string, linha: string, icone: LucideIcon];

interface Tema {
  foto: string;
  escuro?: boolean;
  fundo: string;
  cartao: string;
  tinta: string;
  suave: string;
  destaque: string;
  noDestaque: string;
  mancha: string;
  /** Com capa, a foto ocupa o topo inteiro e o texto vai por cima (cor do véu sobre a foto). */
  capa?: string;
  /** Cor de destaque por cima da capa; sem ela, usa `destaque`. */
  noCapa?: string;
  /** Dois cartões com foto (fotos 3 e 4 do ramo). */
  destaques?: [nome: string, linha: string][];
  fonte: string;
  italico?: boolean;
  maiusculo?: boolean;
  roteiro: string;
  titulo: [string, string];
  chamada: string;
  botao: string;
  servicos: Servico[];
  sobre: [string, string];
  cta: [string, string];
}

const SERIF = `"Fraunces", Georgia, serif`;

const TEMAS: [RegExp, Tema][] = [
  [/barb/i, {
    foto: "barbearia", escuro: true, fundo: "#121110", cartao: "#1c1a18", tinta: "#f2ece3", suave: "#f2ece3a8",
    destaque: "#c9a24a", noDestaque: "#121110", mancha: "#c9a24a2e", capa: "#121110", fonte: `"Oswald", sans-serif`, maiusculo: true,
    destaques: [["Barba", "Desenho e acabamento"], ["Corte", "Tesoura ou máquina"]],
    roteiro: "Hora marcada", titulo: ["Corte na régua,", "visual no ponto"],
    chamada: "Escolha o serviço, marque o horário pelo WhatsApp e chegue na hora certa.", botao: "Agendar horário",
    servicos: [["Corte", "Do clássico ao degradê", Scissors], ["Barba", "Desenho e acabamento", Sparkles],
      ["Corte e barba", "O combo completo", BadgeCheck], ["Hora marcada", "Sem esperar na fila", Clock]],
    sobre: ["Seu lugar", "de confiança"], cta: ["Bora marcar seu horário?", "Escolha o dia e confirme pelo WhatsApp."],
  }],
  [/sal[aã]o|beleza|est[eé]tic|unha|nail|manicure|studio|massot|sobrancel|cabel|makeup|beauty/i, {
    foto: "salao", fundo: "#fbf4f1", cartao: "#ffffff", tinta: "#2b2424", suave: "#2b2424a8",
    destaque: "#a8645a", noDestaque: "#ffffff", mancha: "#eccbc1", fonte: `"Cormorant Garamond", serif`, italico: true,
    destaques: [["Cabelo", "Corte, cor e tratamento"], ["Unhas", "Mãos e pés"]],
    roteiro: "Feito com carinho", titulo: ["Sua beleza,", "no seu tempo"],
    chamada: "Escolha o serviço e marque seu horário pelo WhatsApp, sem precisar ligar.", botao: "Marcar horário",
    servicos: [["Cabelo", "Corte, cor e tratamento", Scissors], ["Unhas", "Mãos e pés", Sparkles],
      ["Sobrancelha", "Design e acabamento", Smile], ["Estética", "Cuidados com a pele", HeartPulse]],
    sobre: ["Um cantinho", "pra você se cuidar"], cta: ["Pronta pra se cuidar?", "Marque seu horário em poucos toques."],
  }],
  [/academ|gym|fitness|treino|crossfit|luta|jiu|steel|ct /i, {
    foto: "academia", escuro: true, fundo: "#0d0f14", cartao: "#161a22", tinta: "#f5f7fa", suave: "#f5f7faa8",
    destaque: "#4b84f5", noDestaque: "#ffffff", mancha: "#4b84f533", capa: "#0d0f14", fonte: `"Archivo Black", sans-serif`, maiusculo: true,
    destaques: [["Musculação", "Força e resultado"], ["Aula experimental", "Conheça antes de fechar"]],
    roteiro: "Bora treinar", titulo: ["Treino forte,", "perto de casa"],
    chamada: "Conheça os planos e agende sua aula experimental pelo WhatsApp.", botao: "Aula experimental",
    servicos: [["Musculação", "Força e resultado", Dumbbell], ["Planos", "Escolha o que cabe", BadgeCheck],
      ["Aula experimental", "Conheça antes de fechar", Zap], ["Horários", "A grade da semana", Clock]],
    sobre: ["Seu treino", "no seu ritmo"], cta: ["Primeira aula, bora?", "Agende pelo WhatsApp e venha conhecer."],
  }],
  [/a[cç]a[ií]|sorvet/i, {
    foto: "acai", fundo: "#f8f2fb", cartao: "#ffffff", tinta: "#2b0e36", suave: "#2b0e36a8",
    destaque: "#6a1f86", noDestaque: "#ffffff", mancha: "#e7d2f1", fonte: `"Bricolage Grotesque", sans-serif`,
    destaques: [["Açaí no copo", "Do seu tamanho"], ["Sorvetes", "Pra refrescar"]],
    roteiro: "Geladinho!", titulo: ["Monte o seu,", "do seu jeito"],
    chamada: "Escolha o tamanho, os adicionais e peça pelo WhatsApp.", botao: "Pedir agora",
    servicos: [["Açaí no copo", "Do seu tamanho", IceCreamCone], ["Adicionais", "Frutas, cremes e mais", Sparkles],
      ["Sorvetes", "Pra refrescar", IceCreamCone], ["Bebidas", "Geladas", CupSoda]],
    sobre: ["Feito na hora,", "do jeito que você gosta"], cta: ["Bateu a vontade?", "Monte seu pedido e mande pelo WhatsApp."],
  }],
  [/pizz/i, {
    foto: "pizzaria", fundo: "#faf3ea", cartao: "#ffffff", tinta: "#2a1a14", suave: "#2a1a14a8",
    destaque: "#b8322a", noDestaque: "#ffffff", mancha: "#f1d3c1", fonte: SERIF, italico: true,
    destaques: [["Salgadas", "Os clássicos da casa"], ["Especiais", "Sabores diferentes"]],
    roteiro: "Hoje tem pizza", titulo: ["Pizza quentinha,", "do forno pra você"],
    chamada: "Escolha os sabores no cardápio e peça pelo WhatsApp.", botao: "Pedir pizza",
    servicos: [["Salgadas", "Os clássicos da casa", Pizza], ["Especiais", "Sabores diferentes", Pizza],
      ["Doces", "Pra fechar a noite", CakeSlice], ["Bebidas", "Pra acompanhar", CupSoda]],
    sobre: ["Sabor de casa,", "toda noite"], cta: ["Bateu a fome?", "Escolha os sabores e peça em poucos toques."],
  }],
  [/hamb|burg|lanch|smash|dog/i, {
    foto: "hamburgueria", fundo: "#fffaf5", cartao: "#ffffff", tinta: "#2a1310", suave: "#2a1310a8",
    destaque: "#d62828", noDestaque: "#ffffff", mancha: "#fbdcd5", capa: "#9c1212", noCapa: "#ffd23f", fonte: `"Anton", sans-serif`, maiusculo: true,
    destaques: [["Lanches", "Os mais pedidos"], ["Porções", "Pra dividir"]],
    roteiro: "Feito na hora", titulo: ["Hambúrguer", "de verdade"],
    chamada: "Escolha no cardápio e peça pelo WhatsApp.", botao: "Pedir agora",
    servicos: [["Lanches", "Os mais pedidos", Utensils], ["Combos", "Pra matar a fome", BadgeCheck],
      ["Porções", "Pra dividir", Utensils], ["Bebidas", "Geladas", CupSoda]],
    sobre: ["Feito na chapa,", "do jeito certo"], cta: ["Bateu a fome?", "Escolha no cardápio e peça pelo WhatsApp."],
  }],
  [/padar|confeit|latic|leiteria|caf[eé]|doce|bolo|p[aã]o/i, {
    foto: "padaria", fundo: "#faf4ea", cartao: "#ffffff", tinta: "#2e1b10", suave: "#2e1b10a8",
    destaque: "#9a5b1f", noDestaque: "#ffffff", mancha: "#efd9bd", fonte: SERIF, italico: true,
    destaques: [["Pães", "Saindo do forno"], ["Doces e bolos", "Pra adoçar o dia"]],
    roteiro: "Feito com carinho", titulo: ["Pão quentinho,", "café passado"],
    chamada: "Veja os produtos e encomende pelo WhatsApp.", botao: "Encomendar",
    servicos: [["Pães", "Saindo do forno", Croissant], ["Doces e bolos", "Pra adoçar o dia", CakeSlice],
      ["Salgados", "Pro lanche", Utensils], ["Encomendas", "Bolos e festas", Store]],
    sobre: ["A padaria", "do seu bairro"], cta: ["Vai uma encomenda?", "Mande o pedido pelo WhatsApp e retire no balcão."],
  }],
  [/restaur|churras|grill|cozinha|comida|marmit|gastronom|sabor/i, {
    foto: "restaurante", escuro: true, fundo: "#14100c", cartao: "#1f1913", tinta: "#f4ead9", suave: "#f4ead9a8",
    destaque: "#d39a3d", noDestaque: "#14100c", mancha: "#d39a3d2b", capa: "#14100c", fonte: SERIF, maiusculo: true,
    destaques: [["Pratos do dia", "O cardápio de hoje"], ["Carnes", "No ponto certo"]],
    roteiro: "Seja bem-vindo", titulo: ["Comida boa,", "clima melhor"],
    chamada: "Veja o cardápio do dia e peça pelo WhatsApp.", botao: "Ver cardápio",
    servicos: [["Pratos do dia", "O cardápio de hoje", Utensils], ["Carnes", "No ponto certo", Utensils],
      ["Sobremesas", "Pra fechar", CakeSlice], ["Bebidas", "Pra acompanhar", CupSoda]],
    sobre: ["Mesa posta,", "comida no ponto"], cta: ["Bora almoçar?", "Veja o cardápio e peça pelo WhatsApp."],
  }],
  [/pet|veterin|ra[cç][oõ]es|vet\b/i, {
    foto: "pet", fundo: "#f2f7f3", cartao: "#ffffff", tinta: "#17352a", suave: "#17352aa8",
    destaque: "#2f7d52", noDestaque: "#ffffff", mancha: "#cfe5d6", fonte: `"Bricolage Grotesque", sans-serif`,
    destaques: [["Banho e tosa", "Cheiroso e feliz"], ["Saúde", "Cuidado em dia"]],
    roteiro: "Au au!", titulo: ["Carinho de verdade", "pro seu pet"],
    chamada: "Escolha o serviço e marque pelo WhatsApp.", botao: "Agendar",
    servicos: [["Banho e tosa", "Cheiroso e feliz", PawPrint], ["Saúde", "Cuidado em dia", HeartPulse],
      ["Rações", "Para cada fase", Store], ["Acessórios", "Coleiras e brinquedos", Sparkles]],
    sobre: ["Cuidado com", "quem você ama"], cta: ["Bora cuidar do seu pet?", "Marque pelo WhatsApp em poucos toques."],
  }],
  [/oficina|mec[aâ]nic|auto|diesel|motor|lanterna|radiador|pneu|refrigera|moto/i, {
    foto: "oficina", escuro: true, fundo: "#14161a", cartao: "#1d2026", tinta: "#f1f1ee", suave: "#f1f1eea8",
    destaque: "#f28c28", noDestaque: "#14161a", mancha: "#f28c282b", capa: "#14161a", fonte: `"Archivo Black", sans-serif`, maiusculo: true,
    destaques: [["Troca de óleo", "Motor protegido"], ["Revisão", "Antes da viagem"]],
    roteiro: "Orçamento rápido", titulo: ["Seu carro", "em boas mãos"],
    chamada: "Mande o modelo e o problema. A resposta vem pelo WhatsApp.", botao: "Pedir orçamento",
    servicos: [["Troca de óleo", "Motor protegido", Car], ["Revisão", "Antes da viagem", Wrench],
      ["Freios", "Segurança em dia", CircleGauge], ["Elétrica", "Bateria e luzes", Zap]],
    sobre: ["Serviço bem feito,", "preço combinado"], cta: ["Carro dando sinal?", "Mande uma mensagem e peça seu orçamento."],
  }],
  [/dent|odonto|sorriso|cl[ií]nica|sa[uú]de/i, {
    foto: "dentista", fundo: "#f3f8f6", cartao: "#ffffff", tinta: "#13332e", suave: "#13332ea8",
    destaque: "#1f6b5c", noDestaque: "#ffffff", mancha: "#cfe3dc", fonte: SERIF, italico: true,
    destaques: [["Ortodontia", "Aparelho e alinhadores"], ["Clínico geral", "Prevenção e limpeza"]],
    roteiro: "Sorria com confiança", titulo: ["Sorriso saudável,", "vida mais leve"],
    chamada: "Marque sua consulta pelo WhatsApp, sem esperar ligação.", botao: "Marcar consulta",
    servicos: [["Clínico geral", "Prevenção e limpeza", Smile], ["Ortodontia", "Aparelho e alinhamento", Sparkles],
      ["Implantes", "Recupere o sorriso", ShieldCheck], ["Estética", "Clareamento e lentes", Star]],
    sobre: ["Sua clínica", "de confiança"], cta: ["Pronto pro seu sorriso?", "Marque sua avaliação pelo WhatsApp."],
  }],
];

const GERAL: Tema = {
  foto: "geral", fundo: "#f4f6fb", cartao: "#ffffff", tinta: "#18233a", suave: "#18233aa8",
  destaque: "#2457f5", noDestaque: "#ffffff", mancha: "#d6e0fb", fonte: `"Bricolage Grotesque", sans-serif`,
  roteiro: "Vem conferir", titulo: ["Tudo o que você precisa,", "pertinho de casa"],
  chamada: "Veja o que temos e fale direto pelo WhatsApp.", botao: "Falar no WhatsApp",
  servicos: [["Produtos", "Confira as novidades", Store], ["Serviços", "Do jeito que você precisa", Sparkles],
    ["Atendimento", "Rápido pelo WhatsApp", MessageCircle], ["Entrega", "Combine pelo WhatsApp", Bike]],
  sobre: ["O comércio", "do seu bairro"], cta: ["Ficou com alguma dúvida?", "Chame no WhatsApp que a gente responde."],
};

export const temaDe = (lead: Lead) =>
  TEMAS.find(([padrao]) => padrao.test(`${lead.tipo ?? ""} ${lead.nome}`))?.[1] ?? GERAL;

const nota = (n: number) => n.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const arquivo = (nome: string) =>
  `previa-${nome.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "site"}.jpg`;

// Formas orgânicas atrás das fotos, como na referência.
const BOLHA = "62% 38% 46% 54% / 55% 44% 56% 45%";
const BOLHA2 = "38% 62% 55% 45% / 46% 58% 42% 54%";

// Fontes da prévia, servidas junto com o painel. A tela e a foto usam os mesmos arquivos:
// a foto não enxerga as fontes do Google, e com letras diferentes o texto quebraria em outro lugar.
const TEXTO = "Roboto Demo";
const FONTES: Record<string, [arquivo: string, peso: number, estilo?: "italic"][]> = {
  [TEXTO]: [["roboto-400", 400], ["roboto-500", 500], ["roboto-700", 700]],
  Caveat: [["caveat-600", 600]],
  Oswald: [["oswald-600", 600]],
  "Cormorant Garamond": [["cormorant-600", 600], ["cormorant-600-italic", 600, "italic"]],
  Fraunces: [["fraunces-600", 600], ["fraunces-600-italic", 600, "italic"]],
  "Archivo Black": [["archivo-black-400", 400]],
  "Bricolage Grotesque": [["bricolage-700", 700]],
  Anton: [["anton-400", 400]],
};

const face = (familia: string, peso: number, estilo: string | undefined, url: string) =>
  `@font-face{font-family:"${familia}";font-weight:${peso};font-style:${estilo ?? "normal"};font-display:swap;src:url(${url}) format("woff2")}`;

/** As fontes da prévia para a tela (arquivos ao lado do painel). */
const FONTES_NA_TELA = Object.entries(FONTES)
  .flatMap(([familia, arquivos]) =>
    arquivos.map(([arquivo, peso, estilo]) => face(familia, peso, estilo, `img/demo/fontes/${arquivo}.woff2`)),
  )
  .join("");

const comoDataUrl = (blob: Blob) =>
  new Promise<string>((ok, erro) => {
    const leitor = new FileReader();
    leitor.onload = () => ok(String(leitor.result));
    leitor.onerror = () => erro(leitor.error);
    leitor.readAsDataURL(blob);
  });

/** `@font-face` com os arquivos embutidos; vazio se não conseguir ler (a foto sai com a letra padrão). */
async function cssDasFontes(familias: string[]) {
  try {
    const faces = await Promise.all(
      familias.flatMap((familia) =>
        (FONTES[familia] ?? []).map(async ([arquivo, peso, estilo]) => {
          const resposta = await fetch(`img/demo/fontes/${arquivo}.woff2`);
          if (!resposta.ok) throw new Error(arquivo);
          const dados = await comoDataUrl(new Blob([await resposta.arrayBuffer()], { type: "font/woff2" }));
          return face(familia, peso, estilo, dados);
        }),
      ),
    );
    return faces.join("");
  } catch {
    return "";
  }
}

type Downloads = { save: (r: { filename: string; data: Blob }) => Promise<unknown> };

/** Tela cheia com a prévia do site; "Mandar foto" gera a imagem e abre o compartilhar do celular. */
export function Demonstracao({
  lead,
  mensagem,
  onFechar,
}: {
  lead: Lead;
  /** Texto que vai junto com a foto no WhatsApp. */
  mensagem: string;
  onFechar: () => void;
}) {
  const t = temaDe(lead);
  const fechar = useRef<HTMLButtonElement>(null);
  const pagina = useRef<HTMLElement>(null);
  const [aviso, setAviso] = useState("");
  const [gerando, setGerando] = useState(false);
  const [foto, setFoto] = useState<{ url: string; salva: boolean } | null>(null);

  useEffect(() => {
    fechar.current?.focus();
    const tecla = (e: KeyboardEvent) => e.key === "Escape" && onFechar();
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [onFechar]);
  useEffect(() => {
    if (!aviso) return;
    const timer = window.setTimeout(() => setAviso(""), 3200);
    return () => window.clearTimeout(timer);
  }, [aviso]);

  const linkConversa = `https://wa.me/${lead.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(mensagem)}`;

  /** Desenha a página inteira numa foto JPG (sem o botão flutuante). */
  async function gerarFoto() {
    const el = pagina.current!;
    await Promise.all([...el.querySelectorAll("img")].map((img) => img.decode().catch(() => undefined)));
    await document.fonts.ready;
    const doTitulo = /"([^"]+)"/.exec(t.fonte)?.[1];
    return toJpeg(el, {
      pixelRatio: 2,
      quality: 0.9,
      backgroundColor: t.fundo,
      fontEmbedCSS: await cssDasFontes([TEXTO, "Caveat", ...(doTitulo ? [doTitulo] : [])]),
      filter: (no: HTMLElement) => !(no instanceof HTMLElement && no.dataset.foraDaFoto !== undefined),
    });
  }

  async function mandarFoto() {
    if (gerando) return;
    setGerando(true);
    try {
      const dataUrl = await gerarFoto();
      const blob = await (await fetch(dataUrl)).blob();
      const nome = arquivo(lead.nome);
      const file = new File([blob], nome, { type: "image/jpeg" });
      // 1º: compartilhar do celular (a foto e o texto vão juntos pro WhatsApp).
      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file], text: mensagem });
          setAviso("Escolha o WhatsApp e a conversa da loja.");
          return;
        } catch (e) {
          if ((e as DOMException)?.name === "AbortError") return;
        }
      }
      // 2º: salvar a foto no celular e abrir a conversa com o texto pronto.
      const downloads = (await window.claude?.use?.("downloads").catch(() => null)) as Downloads | null;
      if (downloads) {
        try {
          await downloads.save({ filename: nome, data: blob });
          setFoto({ url: dataUrl, salva: true });
          return;
        } catch {
          /* recusou ou não deu: mostra a foto para salvar na mão */
        }
      }
      // 3º: mostra a foto para tocar e segurar.
      setFoto({ url: dataUrl, salva: false });
    } catch {
      setAviso("Não consegui gerar a foto. Tire um print da tela e mande.");
    } finally {
      setGerando(false);
    }
  }

  const cidade = cidadeDe(lead);
  const ramo = lead.tipo?.trim() || "Comércio";
  const temNota = typeof lead.nota === "number" && lead.nota > 0;
  const titulo: CSSProperties = { fontFamily: t.fonte, textTransform: t.maiusculo ? "uppercase" : undefined };
  const destaqueTitulo: CSSProperties = { ...titulo, color: t.destaque, fontStyle: t.italico ? "italic" : undefined };
  const roteiro: CSSProperties = { fontFamily: `"Caveat", cursive`, color: t.destaque };
  const demo = (oque: string) => () => setAviso(`No site de verdade, ${oque}`);
  const pill = "inline-flex min-h-[46px] cursor-pointer items-center justify-center gap-2 rounded-full px-5 text-[14.5px] font-semibold";
  const Marca = t.servicos[0][2];
  const servicos = t.destaques ? t.servicos.filter(([nome]) => !t.destaques!.some(([d]) => d === nome)) : t.servicos;
  const acento = t.noCapa ?? t.destaque;

  const cabecalho = (sobreCapa: boolean) => (
    <header className="flex items-center gap-2.5">
      <span
        className="grid size-9 place-items-center rounded-[11px]"
        style={sobreCapa ? { background: acento, color: t.capa } : { background: t.destaque, color: t.noDestaque }}
      >
        <Marca aria-hidden="true" className="size-5" />
      </span>
      <span className="min-w-0 flex-1 truncate text-[16px] font-bold" style={titulo}>{lead.nome}</span>
      <button
        type="button"
        onClick={demo("este botão abre o WhatsApp da loja.")}
        className="rounded-full px-3.5 py-2 text-[12px] font-semibold"
        style={sobreCapa ? { background: "#ffffff26", color: "#ffffff" } : { background: t.tinta, color: t.fundo }}
      >
        {t.botao.split(" ")[0]}
      </button>
    </header>
  );

  const selo = (classe: string, estilo: CSSProperties, corSuave: string) => (
    <div className={`flex items-center gap-2.5 rounded-[16px] px-3.5 py-2.5 shadow-[0_14px_30px_-12px_rgba(0,0,0,.35)] ${classe}`} style={estilo}>
      <span className="flex gap-0.5" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => <Star key={i} className="size-3.5" fill="#f5b301" stroke="none" />)}
      </span>
      <span className="text-[12.5px] font-semibold">
        {temNota ? `${nota(lead.nota!)} no Google` : "Avalie no Google"}
        {temNota && lead.avaliacoes ? <span className="block text-[11px] font-normal" style={{ color: corSuave }}>{fmtInt(lead.avaliacoes)} avaliações</span> : null}
      </span>
    </div>
  );

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Demonstração do site de ${lead.nome}`}
      className="fixed inset-0 z-[80] flex flex-col bg-[var(--blk-scrim)] backdrop-blur-sm"
    >
      <div className="flex shrink-0 items-center gap-2.5 border-b border-[color:var(--bjork-border)] bg-[var(--bjork-panel)] px-3 py-2.5 text-[color:var(--bjork-text)]">
        <button
          ref={fechar}
          type="button"
          onClick={onFechar}
          aria-label="Fechar demonstração"
          className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-full bg-[var(--bjork-surface-active)] focus-visible:ring-2 focus-visible:ring-[color:var(--bjork-accent)]"
        >
          <X aria-hidden="true" className="size-5" />
        </button>
        <p className="min-w-0 flex-1 truncate text-[13.5px] font-semibold">Prévia: {lead.nome}</p>
        <button
          type="button"
          onClick={mandarFoto}
          disabled={gerando}
          className="inline-flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-full bg-[var(--bjork-accent)] px-4 text-[13.5px] font-semibold text-white disabled:opacity-70 focus-visible:ring-2 focus-visible:ring-white"
        >
          {gerando ? <Loader2 aria-hidden="true" className="size-4 animate-spin" /> : <Send aria-hidden="true" className="size-4" />}
          {gerando ? "Gerando foto…" : "Mandar foto"}
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <article
          ref={pagina}
          className="relative mx-auto w-full max-w-[460px] overflow-hidden shadow-[0_0_60px_rgba(0,0,0,.45)]"
          style={{ background: t.fundo, color: t.tinta, fontFamily: `"${TEXTO}", "Roboto", system-ui, sans-serif` }}
        >
          <style>{FONTES_NA_TELA}</style>
          {t.capa ? (
            /* Capa: a foto ocupa o topo e o texto vai por cima */
            <section className="relative overflow-hidden" style={{ color: "#ffffff" }}>
              <img
                src={`img/demo/${t.foto}-1.webp`}
                alt=""
                width={720}
                height={900}
                className="absolute inset-0 h-full w-full object-cover"
                style={{ objectPosition: "center 78%" }}
              />
              <div
                aria-hidden="true"
                className="absolute inset-0"
                style={{ background: `linear-gradient(180deg, ${t.capa} 0%, ${t.capa}f2 36%, ${t.capa}8c 60%, ${t.capa}1a 100%)` }}
              />
              <div className="relative flex min-h-[680px] flex-col px-5 pb-6 pt-5">
                {cabecalho(true)}
                <span className="mt-9 inline-flex items-center gap-1.5 self-start rounded-full px-3 py-1 text-[12px] font-semibold" style={{ background: "#ffffff1f", color: acento }}>
                  <MapPin aria-hidden="true" className="size-3.5" /> {ramo} em {cidade}
                </span>
                <h1 className="mt-4 text-[44px] font-bold leading-[1.02] tracking-[-0.01em] [overflow-wrap:anywhere]" style={titulo}>
                  {t.titulo[0]}
                  <span className="block" style={{ ...titulo, color: acento }}>{t.titulo[1]}</span>
                </h1>
                <p className="mt-4 max-w-[32ch] text-[15.5px] leading-relaxed" style={{ color: "#ffffffd9" }}>{t.chamada}</p>
                <div className="mt-6 flex flex-wrap gap-2.5">
                  <button type="button" onClick={demo(`este botão abre a conversa com a ${lead.nome} no WhatsApp.`)} className={pill} style={{ background: acento, color: t.capa }}>
                    {t.botao} <ArrowRight aria-hidden="true" className="size-4" />
                  </button>
                  <button type="button" onClick={demo("este botão mostra a rota no Google Maps.")} className={pill} style={{ background: "#ffffff1f", color: "#ffffff", boxShadow: "inset 0 0 0 1px #ffffff59" }}>
                    <MapPin aria-hidden="true" className="size-4" /> Como chegar
                  </button>
                </div>
                <p aria-hidden="true" className="mt-7 rotate-[-6deg] self-end text-[32px] leading-none" style={{ ...roteiro, color: acento }}>{t.roteiro}</p>
                {selo("mt-auto self-start", { background: "#ffffff", color: "#1c1c1c" }, "#1c1c1c99")}
              </div>
            </section>
          ) : (
            <>
              <div className="px-5 pt-5">{cabecalho(false)}</div>
              <section className="relative px-5 pb-10 pt-8">
                <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-semibold" style={{ background: t.mancha, color: t.tinta }}>
                  <MapPin aria-hidden="true" className="size-3.5" /> {ramo} em {cidade}
                </span>
                <h1 className="mt-4 text-[42px] font-bold leading-[1.02] tracking-[-0.01em] [overflow-wrap:anywhere]" style={titulo}>
                  {t.titulo[0]}
                  <span className="block" style={destaqueTitulo}>{t.titulo[1]}</span>
                </h1>
                <p className="mt-4 max-w-[32ch] text-[15.5px] leading-relaxed" style={{ color: t.suave }}>{t.chamada}</p>
                <div className="mt-6 flex flex-wrap gap-2.5">
                  <button type="button" onClick={demo(`este botão abre a conversa com a ${lead.nome} no WhatsApp.`)} className={pill} style={{ background: t.tinta, color: t.fundo }}>
                    {t.botao} <ArrowRight aria-hidden="true" className="size-4" />
                  </button>
                  <button type="button" onClick={demo("este botão mostra a rota no Google Maps.")} className={pill} style={{ background: t.cartao, color: t.tinta, boxShadow: "0 6px 18px rgba(0,0,0,.08)" }}>
                    <MapPin aria-hidden="true" className="size-4" style={{ color: t.destaque }} /> Como chegar
                  </button>
                </div>

                <div className="relative mt-10 h-[340px]">
                  <div aria-hidden="true" className="absolute inset-x-2 inset-y-4" style={{ background: t.mancha, borderRadius: BOLHA2, transform: "rotate(-8deg)" }} />
                  <img
                    src={`img/demo/${t.foto}-1.webp`}
                    alt=""
                    width={720}
                    height={900}
                    className="absolute inset-x-6 bottom-0 top-0 h-full w-[calc(100%-3rem)] object-cover"
                    style={{ borderRadius: BOLHA, boxShadow: "0 24px 50px -20px rgba(0,0,0,.45)" }}
                  />
                  <p aria-hidden="true" className="absolute -top-4 right-2 rotate-[-8deg] text-[30px] leading-none" style={roteiro}>{t.roteiro}</p>
                  <Sparkles aria-hidden="true" className="absolute left-1 top-8 size-6" style={{ color: t.destaque }} />
                  <Sparkles aria-hidden="true" className="absolute bottom-10 right-0 size-5" style={{ color: t.destaque }} />
                  {selo("absolute -bottom-5 left-3", { background: t.cartao }, t.suave)}
                </div>
              </section>
            </>
          )}

          {/* Serviços */}
          <section className="px-5 pb-10 pt-6">
            <p className="text-center text-[11px] font-bold tracking-[0.18em]" style={{ color: t.destaque }}>— O QUE A GENTE FAZ —</p>
            <h2 className="mt-2 text-center text-[28px] font-bold leading-tight" style={titulo}>Nossos serviços</h2>
            {t.destaques && (
              <ul className="mt-6 grid grid-cols-2 gap-3">
                {t.destaques.map(([nome, linha], i) => (
                  <li key={nome} className="overflow-hidden rounded-[18px] shadow-[0_14px_30px_-18px_rgba(0,0,0,.5)]" style={{ background: t.cartao }}>
                    <img src={`img/demo/${t.foto}-${i + 3}.webp`} alt="" width={480} height={480} className="aspect-square w-full object-cover" />
                    <span className="block px-3 pb-3 pt-2.5">
                      <span className="block text-[14.5px] font-bold leading-tight">{nome}</span>
                      <span className="mt-0.5 block text-[12px]" style={{ color: t.suave }}>{linha}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <ul className={`${t.destaques ? "mt-3" : "mt-6"} grid grid-cols-2 gap-3`}>
              {servicos.map(([nome, linha, Icone]) => (
                <li key={nome} className="flex flex-col rounded-[18px] p-3.5 shadow-[0_10px_26px_-18px_rgba(0,0,0,.4)]" style={{ background: t.cartao }}>
                  <Icone aria-hidden="true" className="size-7" style={{ color: t.destaque }} strokeWidth={1.6} />
                  <span className="mt-3 text-[14.5px] font-bold leading-tight">{nome}</span>
                  <span className="mt-1 flex-1 text-[12px] leading-snug" style={{ color: t.suave }}>{linha}</span>
                  <span className="mt-3 grid size-7 place-items-center self-end rounded-full" style={{ background: t.mancha, color: t.escuro ? t.destaque : t.tinta }}>
                    <ArrowRight aria-hidden="true" className="size-3.5" />
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-center text-[12px]" style={{ color: t.suave }}>Aqui entram as fotos e os preços de vocês.</p>
          </section>

          {/* Sobre */}
          <section className="px-5 pb-12">
            <div className="relative">
              <div aria-hidden="true" className="absolute -left-8 top-6 h-40 w-40" style={{ background: t.mancha, borderRadius: BOLHA }} />
              <img
                src={`img/demo/${t.foto}-2.webp`}
                alt=""
                width={640}
                height={640}
                loading="eager"
                className="relative aspect-[4/3] w-full rounded-[26px] object-cover shadow-[0_24px_50px_-24px_rgba(0,0,0,.5)]"
              />
              <span className="absolute -bottom-4 left-4 inline-flex items-center gap-2 rounded-[14px] px-3.5 py-2.5 text-[12.5px] font-semibold shadow-[0_14px_30px_-12px_rgba(0,0,0,.35)]" style={{ background: t.cartao }}>
                <ShieldCheck aria-hidden="true" className="size-5" style={{ color: t.destaque }} />
                <span>Em {cidade}<span className="block text-[11px] font-normal" style={{ color: t.suave }}>{ramo}</span></span>
              </span>
            </div>
            <span className="mt-9 inline-flex rounded-full px-3 py-1 text-[12px] font-semibold" style={{ background: t.mancha, color: t.escuro ? t.destaque : t.tinta }}>Sobre a {lead.nome}</span>
            <h2 className="mt-3 text-[30px] font-bold leading-[1.05]" style={titulo}>
              {t.sobre[0]}
              <span className="block" style={destaqueTitulo}>{t.sobre[1]}</span>
            </h2>
            <p className="mt-3 text-[14.5px] leading-relaxed" style={{ color: t.suave }}>
              Veja tudo o que a gente oferece, confira os horários e fale com a gente sem precisar ligar.
            </p>
            <ul className="mt-5 grid gap-3">
              {([
                ["Atendimento pelo WhatsApp", "Resposta rápida, direto no celular", MessageCircle],
                ["Fácil de achar no Google", "Rota até a porta em um toque", MapPin],
                ["Avaliação na plaquinha", "Encostou o celular, avaliou", Star],
              ] as Servico[]).map(([nome, linha, Icone]) => (
                <li key={nome} className="flex items-center gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full" style={{ background: t.mancha, color: t.escuro ? t.destaque : t.tinta }}>
                    <Icone aria-hidden="true" className="size-5" />
                  </span>
                  <span>
                    <span className="block text-[14px] font-bold">{nome}</span>
                    <span className="block text-[12.5px]" style={{ color: t.suave }}>{linha}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* Avaliações (só a nota real; os comentários vêm do Google) */}
          <section className="px-5 pb-12">
            <p className="text-center text-[11px] font-bold tracking-[0.18em]" style={{ color: t.destaque }}>— AVALIAÇÕES —</p>
            <h2 className="mt-2 text-center text-[28px] font-bold leading-tight" style={titulo}>O que dizem no Google</h2>
            <div className="mt-6 rounded-[22px] p-5 text-center shadow-[0_14px_34px_-20px_rgba(0,0,0,.45)]" style={{ background: t.cartao }}>
              <p className="text-[48px] font-bold leading-none" style={{ fontFamily: t.fonte }}>{temNota ? nota(lead.nota!) : "★"}</p>
              <span className="mt-2 flex justify-center gap-1" aria-hidden="true">
                {[0, 1, 2, 3, 4].map((i) => <Star key={i} className="size-5" fill="#f5b301" stroke="none" />)}
              </span>
              <p className="mt-2 text-[13.5px] font-semibold">
                {temNota && lead.avaliacoes ? `${fmtInt(lead.avaliacoes)} avaliações no Google` : "Seja o primeiro a avaliar"}
              </p>
              <p className="mx-auto mt-2 max-w-[30ch] text-[12.5px] leading-snug" style={{ color: t.suave }}>
                Os comentários de quem já foi aparecem aqui, direto do Google.
              </p>
            </div>
          </section>

          {/* Chamada final */}
          <section className="mx-4 mb-10 flex flex-col items-start gap-4 rounded-[24px] p-6" style={{ background: t.escuro ? t.destaque : t.capa ?? t.tinta, color: t.escuro ? t.noDestaque : t.fundo }}>
            <Marca aria-hidden="true" className="size-9" strokeWidth={1.6} />
            <div>
              <h2 className="text-[24px] font-bold leading-tight" style={titulo}>{t.cta[0]}</h2>
              <p className="mt-1.5 text-[13.5px] leading-relaxed opacity-80">{t.cta[1]}</p>
            </div>
            <button type="button" onClick={demo(`este botão abre a conversa com a ${lead.nome} no WhatsApp.`)} className={pill} style={{ background: t.escuro ? t.noDestaque : t.fundo, color: t.escuro ? t.destaque : t.capa ?? t.tinta }}>
              {t.botao} <ArrowRight aria-hidden="true" className="size-4" />
            </button>
          </section>

          {/* Rodapé */}
          <footer className="border-t px-5 pb-8 pt-6" style={{ borderColor: `color-mix(in srgb, ${t.tinta} 12%, transparent)` }}>
            <div className="flex items-center gap-2.5">
              <span className="grid size-8 place-items-center rounded-[10px]" style={{ background: t.destaque, color: t.noDestaque }}>
                <Marca aria-hidden="true" className="size-4" />
              </span>
              <span className="min-w-0 flex-1 truncate text-[15px] font-bold" style={titulo}>{lead.nome}</span>
              <span className="flex gap-2" aria-hidden="true" style={{ color: t.destaque }}>
                <Instagram className="size-5" /><MessageCircle className="size-5" /><MapPin className="size-5" />
              </span>
            </div>
            <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[12.5px]" style={{ color: t.suave }}>
              <span>Início</span><span>Serviços</span><span>Sobre</span><span>Contato</span>
            </p>
            <p className="mt-4 text-[11.5px]" style={{ color: t.suave }}>{cidade} · Site feito por BN Digital</p>
          </footer>

          <button
            type="button"
            data-fora-da-foto=""
            onClick={demo(`este botão abre o WhatsApp da ${lead.nome}.`)}
            aria-label="Botão do WhatsApp"
            className="sticky bottom-4 left-full z-10 -mt-14 mb-4 mr-4 grid size-14 cursor-pointer place-items-center rounded-full shadow-[0_10px_24px_rgba(0,0,0,.35)]"
            style={{ background: "#25d366", color: "#ffffff" }}
          >
            <MessageCircle aria-hidden="true" className="size-7" />
          </button>
        </article>
      </div>

      {foto && (
        <div className="absolute inset-0 z-10 flex flex-col bg-[var(--bjork-bg)]">
          <div className="flex items-center gap-2.5 border-b border-[color:var(--bjork-border)] px-3 py-2.5 text-[color:var(--bjork-text)]">
            <button type="button" onClick={() => setFoto(null)} aria-label="Voltar para a prévia" className="grid size-10 place-items-center rounded-full bg-[var(--bjork-surface-active)]">
              <X aria-hidden="true" className="size-5" />
            </button>
            <p className="min-w-0 flex-1 text-[13px] leading-snug">
              {foto.salva
                ? "Foto salva. Toque em WhatsApp e, na conversa, no clipe para escolher a foto."
                : "Toque e segure a foto para salvar. Depois toque em WhatsApp e mande na conversa."}
            </p>
            <a href={linkConversa} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center gap-2 rounded-full bg-[#25d366] px-4 text-[13.5px] font-semibold text-white">
              <MessageCircle aria-hidden="true" className="size-4" /> WhatsApp
            </a>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            <img src={foto.url} alt={`Foto da prévia do site de ${lead.nome}`} className="mx-auto w-full max-w-[460px] rounded-[12px]" />
          </div>
        </div>
      )}

      {aviso && (
        <p
          role="status"
          className="absolute bottom-6 left-1/2 z-20 max-w-[88%] -translate-x-1/2 rounded-[12px] border border-[color:var(--bjork-border-strong)] bg-[var(--bjork-menu)] px-4 py-2.5 text-center text-[13.5px] font-medium text-[color:var(--bjork-text)] shadow-[var(--bjork-shadow-menu)]"
        >
          {aviso}
        </p>
      )}
    </div>,
    document.body,
  );
}
