import { useCallback, useEffect, useRef, useState } from "react";
import { TPL_PADRAO, lerImportacao, type Lead } from "./leads";

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

/** Leads e mensagem padrão, guardados no banco do Artifact (coleções `leads` e `config`). */
export function usePainel(avisar: (texto: string) => void) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [tpl, setTpl] = useState(TPL_PADRAO);
  const [fase, setFase] = useState<Fase>("carregando");
  const [lento, setLento] = useState(false);
  const [erro, setErro] = useState("");
  const dbRef = useRef<Db | null>(null);
  const filas = useRef(new Map<string, Promise<unknown>>());

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
        db.doc("config/mensagem").onSnapshot(
          (snap) => {
            const texto = snap.exists ? snap.data()?.texto : null;
            if (typeof texto === "string" && texto.trim()) setTpl(texto);
          },
          () => {},
        ),
      );
      parar.push(
        db.collection("leads").onSnapshot(
          (snap) => {
            if (!snap.metadata?.fromCache) chegou();
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

  const salvarMensagem = useCallback(
    async (texto: string) => {
      const novo = texto.trim() || TPL_PADRAO;
      setTpl(novo);
      const db = dbRef.current;
      if (!db) {
        avisar("Sem conexão com o painel: a mensagem não foi salva.");
        return;
      }
      try {
        await db.doc("config/mensagem").set({ texto: novo });
        avisar("Mensagem salva");
      } catch (e) {
        avisar(`Não salvou a mensagem: ${motivo(e)}`);
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

  return { leads, tpl, fase, lento, erro, salvar, salvarMensagem, importar };
}
