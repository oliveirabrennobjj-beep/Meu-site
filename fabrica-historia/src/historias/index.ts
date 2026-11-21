import { tomadas as oVigia } from "./o-vigia/tomadas";

// Cada história nova ganha uma pasta com personagens.tsx + tomadas.tsx e uma linha aqui.
export const historias: Record<string, Record<string, React.FC<{ dur: number }>>> = {
  "o-vigia": oVigia,
};
