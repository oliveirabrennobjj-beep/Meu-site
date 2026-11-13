import type { CSSProperties } from "react";
import WorkflowBlueprint, { type WorkflowGraph } from "@/components/ui/interactive-workflow-blueprint";
import { META_DIA, contar, contatosHoje, type Lead, type Status } from "./leads";

// As cores do painel no lugar das do componente.
const CORES = {
  "--color-background": "var(--bjork-panel)",
  "--color-foreground": "var(--bjork-text)",
  "--color-card": "var(--bjork-surface)",
  "--color-muted-foreground": "var(--bjork-text-muted)",
  "--color-border": "var(--bjork-border-strong)",
  "--color-primary": "var(--bjork-accent)",
  "--color-primary-foreground": "var(--blk-accent-fill-ink)",
  "--color-chart-2": "var(--blk-success)",
  "--color-chart-3": "var(--blk-warning)",
} as CSSProperties;

const lojas = (n: number) => `${n} ${n === 1 ? "loja" : "lojas"}`;

/** O caminho de cada loja, do "a enviar" ao "fechou", com quantas estão em cada etapa agora. */
export function Funil({ leads, onEtapa }: { leads: Lead[]; onEtapa: (status: Status) => void }) {
  const n = contar(leads);
  const hoje = contatosHoje(leads);
  const grafo: WorkflowGraph = {
    nodes: [
      { id: "novo", type: "blueprint", position: { x: 0, y: 80 }, data: { kind: "trigger", label: "A enviar", tag: lojas(n.novo), detail: "Lojas na lista esperando a primeira mensagem.", tool: `Hoje ${hoje}/${META_DIA}` } },
      { id: "enviado", type: "blueprint", position: { x: 250, y: 180 }, data: { kind: "delivery", label: "Enviado", tag: lojas(n.enviado), detail: "Sem resposta: lembrete leve em 2 ou 3 dias.", tool: "WhatsApp" } },
      { id: "respondeu", type: "blueprint", position: { x: 500, y: 80 }, data: { kind: "agent", label: "Respondeu", tag: lojas(n.respondeu), detail: "Pergunte antes de oferecer e marque a demonstração.", tool: "Assistente" } },
      { id: "fechou", type: "blueprint", position: { x: 760, y: 0 }, data: { kind: "review", label: "Fechou", tag: lojas(n.fechou), detail: "Site ou placa vendidos." } },
      { id: "depois", type: "blueprint", position: { x: 760, y: 200 }, data: { kind: "integration", label: "Mais pra frente", tag: lojas(n.depois), detail: "Voltar a falar na data combinada." } },
      { id: "nao", type: "blueprint", position: { x: 760, y: 400 }, data: { kind: "integration", label: "Não quer", tag: lojas(n.nao), detail: "Agradecer e não insistir." } },
    ],
    edges: [
      { id: "novo-enviado", source: "novo", target: "enviado" },
      { id: "enviado-respondeu", source: "enviado", target: "respondeu" },
      { id: "respondeu-fechou", source: "respondeu", target: "fechou" },
      { id: "respondeu-depois", source: "respondeu", target: "depois" },
      { id: "respondeu-nao", source: "respondeu", target: "nao" },
    ],
  };
  return (
    <WorkflowBlueprint
      // Os números mudam quando uma loja muda de etapa; a chave redesenha o fluxo.
      key={Object.values(n).join("-") + hoje}
      readOnly
      title="Funil de vendas"
      subtitle="Toque numa etapa para ver as lojas dela"
      initialGraph={grafo}
      apps={[]}
      // No celular cabe a altura toda do fluxo; para os lados, arrasta.
      style={{ ...CORES, "--wb-canvas-h": "clamp(560px, 62vh, 640px)" } as CSSProperties}
      onNodeOpen={(id) => onEtapa(id as Status)}
    />
  );
}
