import { useCallback, useEffect, useRef, useState } from "react";
import type { Mensagem } from "./assistente";
import { TEXTOS_PADRAO, lerImportacao, lerZap, type ChaveTexto, type Lead, type Textos } from "./leads";

interface DocSnap {
  id: string;
  exists: boolean;
  data(): Record<string, unknown> | undefined;
  metadata?: { fromCache?: boolean };
}
interface QuerySnap {
  docs: DocSnap[];
  metadata?: { fromCache?: boolean };
}
interface DbError {
  code?: string;
  message?: string;
}
interface DocRef {
  set(data: Record<string, unknown>): Promise<void>;
  update(data: Record<string, unknown>): Promise<void>;
  onSnapshot(next: (snap: DocSnap) => void, error?: (e: DbError) => void): () => void;
}
interface Db {
  doc(path: string): DocRef;
  collection(path: string): {
    doc(id: string): DocRef;
    onSnapshot(next: (snap: QuerySnap) => void, error?: (e: DbError) => void): () => void;
  };
}

declare global {
  interface Window {
    claude?: { use?: (name: string) => Promise<unknown> };
  }
}

export type Fase = "carregando" | "pronto" | "sem-conta" | "erro";

const motivo = (e: unknown) => (e as DbError)?.message || (e as DbError)?.code || "erro";

// O banco aceita qualquer formato; garante os campos que a tela usa para ordenar e montar links.
function lerLead(doc: DocSnap): Lead {
  const d = doc.data() ?? {};
  return {
    ...(d as Partial<Lead>),
    id: doc.id,
    nome: String(d.nome ?? "Sem nome"),
    whatsapp: String(d.whatsapp ?? ""),
    nota: typeof d.nota === "number" ? d.nota : null,
    avaliacoes: typeof d.avaliacoes === "number" ? d.avaliacoes : null,
  };
}

/** Leads e textos das mensagens, guardados no banco do Artifact (coleções `leads` e `config`). */
export function usePainel(avisar: (texto: string) => void) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [textos, setTextos] = useState<Textos>(TEXTOS_PADRAO);
  const [fase, setFase] = useState<Fase>("carregando");
  const [lento, setLento] = useState(false);
  // A lista veio do servidor (não do cache): só então dá para saber quem ainda não está no banco.
  const [doServidor, setDoServidor] = useState(false);
  const [erro, setErro] = useState("");
  const dbRef = useRef<Db | null>(null);
  const filas = useRef(new Map<string, Promise<unknown>>());
  const [conversa, setConversa] = useState<Mensagem[]>([]);

  useEffect(() => {
    let vivo = true;
    const parar: (() => void)[] = [];
    const timer = window.setTimeout(() => vivo && setLento(true), 10_000);
    const chegou = () => {
      window.clearTimeout(timer);
      setLento(false);
    };
    (async () => {
      const db = ((await window.claude?.use?.("db")) ?? null) as Db | null;
      if (!vivo) return;
      if (!db) {
        chegou();
        setFase("sem-conta");
        return;
      }
      dbRef.current = db;
      parar.push(
        db.doc("config/mensagens").onSnapshot(
          (snap) => {
            const salvos = snap.exists ? (snap.data() ?? {}) : {};
            const lidos = { ...TEXTOS_PADRAO };
            for (const chave of Object.keys(lidos) as ChaveTexto[]) {
              const texto = salvos[chave];
              if (typeof texto === "string" && texto.trim()) lidos[chave] = texto;
            }
            setTextos(lidos);
          },
          () => {},
        ),
      );
      parar.push(
        db.doc("assistente/conversa").onSnapshot(
          (snap) => {
            const mensagens = snap.exists ? snap.data()?.mensagens : null;
            if (Array.isArray(mensagens)) setConversa(mensagens as Mensagem[]);
          },
          () => {},
        ),
      );
      parar.push(
        db.collection("leads").onSnapshot(
          (snap) => {
            if (!snap.metadata?.fromCache) {
              chegou();
              setDoServidor(true);
            }
            setLeads(snap.docs.map(lerLead));
            setFase("pronto");
          },
          (e) => {
            chegou();
            setErro(motivo(e));
            setFase("erro");
          },
        ),
      );
    })();
    return () => {
      vivo = false;
      window.clearTimeout(timer);
      parar.forEach((fn) => fn());
    };
  }, []);

  const salvar = useCallback(
    (id: string, mudanca: Partial<Lead>) => {
      const dados = { ...mudanca, atualizado: new Date().toISOString() };
      setLeads((atual) => atual.map((l) => (l.id === id ? { ...l, ...dados } : l)));
      const db = dbRef.current;
      if (!db) {
        avisar("Sem conexão com o painel: a mudança não foi salva.");
        return;
      }
      // Um documento recebe uma gravação por vez; a próxima espera a anterior terminar.
      const anterior = filas.current.get(id) ?? Promise.resolve();
      const proxima = anterior
        .then(() => db.collection("leads").doc(id).update(dados))
        .catch((e) => avisar(`Não salvou: ${motivo(e)}`));
      filas.current.set(id, proxima);
    },
    [avisar],
  );

  const salvarMensagens = useCallback(
    async (novos: Textos) => {
      setTextos(novos);
      const db = dbRef.current;
      if (!db) {
        avisar("Sem conexão com o painel: as mensagens não foram salvas.");
        return;
      }
      try {
        await db.doc("config/mensagens").set({ ...novos });
        avisar("Mensagens salvas");
      } catch (e) {
        avisar(`Não salvou as mensagens: ${motivo(e)}`);
      }
    },
    [avisar],
  );

  /** Devolve quantas empresas novas entraram. Lança erro com texto pronto para mostrar. */
  const importar = useCallback(
    async (texto: string) => {
      const novos = lerImportacao(
        texto,
        leads.map((l) => l.whatsapp),
      );
      const db = dbRef.current;
      if (!db) throw new Error("Sem conexão com o painel. Abra de novo e tente outra vez.");
      for (const lead of novos) {
        await db.collection("leads").doc(`w${lead.whatsapp}`).set(lead);
      }
      return novos.length;
    },
    [leads],
  );

  // Pesquisa automática: o Claude publica `pesquisa/lote.json` junto do painel ({lote, leads}).
  // Na primeira carga completa, entra no banco quem ainda não está (pelo WhatsApp, inclusive as
  // tiradas) e `config/pesquisa` guarda o lote, para não rodar de novo.
  const pesquisaFeita = useRef(false);
  useEffect(() => {
    const db = dbRef.current;
    if (fase !== "pronto" || !doServidor || !db || pesquisaFeita.current) return;
    pesquisaFeita.current = true;
    (async () => {
      let arquivo: { lote?: unknown; leads?: unknown; conferencia?: unknown };
      try {
        const resposta = await fetch("pesquisa/lote.json", { cache: "no-store" });
        if (!resposta.ok) return;
        arquivo = await resposta.json();
      } catch {
        return;
      }
      const lote = String(arquivo.lote ?? "");
      if (!lote || !Array.isArray(arquivo.leads)) return;
      const jaFeito = await new Promise<string | null>((fim) => {
        let parar: (() => void) | null = null;
        let acabou = false;
        const terminar = (valor: string | null) => {
          if (acabou) return;
          acabou = true;
          window.setTimeout(() => parar?.(), 0);
          fim(valor);
        };
        parar = db.doc("config/pesquisa").onSnapshot(
          (snap) => {
            if (snap.metadata?.fromCache) return;
            terminar(snap.exists ? String(snap.data()?.lote ?? "") : "");
          },
          () => terminar(null),
        );
      });
      if (jaFeito === null || jaFeito === lote) return;
      const novos = lerImportacao(
        JSON.stringify(arquivo.leads),
        leads.map((l) => l.whatsapp),
      );
      // Conferência do WhatsApp das lojas que já estavam no painel ({whatsapp: zap}).
      const conferencia =
        arquivo.conferencia && typeof arquivo.conferencia === "object"
          ? (arquivo.conferencia as Record<string, unknown>)
          : {};
      const conferir = leads.flatMap((l) => {
        const zap = lerZap(conferencia[l.whatsapp]);
        return zap && zap.em !== l.zap?.em ? [{ id: l.id, zap }] : [];
      });
      try {
        for (let i = 0; i < novos.length; i += 20) {
          await Promise.all(
            novos.slice(i, i + 20).map((lead) => db.collection("leads").doc(`w${lead.whatsapp}`).set(lead)),
          );
        }
        for (let i = 0; i < conferir.length; i += 20) {
          await Promise.all(
            conferir.slice(i, i + 20).map(({ id, zap }) => db.collection("leads").doc(id).update({ zap })),
          );
        }
        await db.doc("config/pesquisa").set({
          lote,
          em: new Date().toISOString(),
          entraram: novos.length,
          conferidas: conferir.length,
        });
        if (novos.length) avisar(`${novos.length} empresas novas da pesquisa entraram no painel`);
      } catch (e) {
        avisar(`A pesquisa nova não entrou toda: ${motivo(e)}`);
      }
    })();
  }, [fase, doServidor, leads, avisar]);

  /** Guarda a conversa com o assistente (só as últimas 40 falas). */
  const salvarConversa = useCallback(
    (mensagens: Mensagem[]) => {
      const ultimas = mensagens.slice(-40);
      setConversa(ultimas);
      const db = dbRef.current;
      if (!db) return;
      const anterior = filas.current.get("conversa") ?? Promise.resolve();
      const proxima = anterior
        .then(() => db.doc("assistente/conversa").set({ mensagens: ultimas }))
        .catch((e) => avisar(`Não salvou a conversa: ${motivo(e)}`));
      filas.current.set("conversa", proxima);
    },
    [avisar],
  );

  return {
    leads,
    textos,
    conversa,
    fase,
    lento,
    erro,
    salvar,
    salvarMensagens,
    salvarConversa,
    importar,
  };
}
