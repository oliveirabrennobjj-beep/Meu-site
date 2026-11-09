---
tipo: padrao
projetos: ["[[Meu-site]]"]
tags: ["cerebro/padrao", "video", "motion-graphics", "remotion"]
criado: 2026-11-09
atualizado: 2026-11-09
resumo: "Vídeo com cara de profissional: Claude Code numa pasta, cena descrita como diretor, cada quadro em função do tempo, render quadro a quadro (navegador sem tela + ffmpeg), ajuste falando. Bônus: vertical recomposto."
---
# Motion graphics com Claude Code em 5 passos

Fonte: reel do @thejplabs (5 out. 2026). Animação travada "cara de PowerPoint" vem do caminho, não do Claude.

## 1. Claude Code numa pasta, não o chat
- Abrir o Claude Code numa pasta vazia (ou num projeto Remotion).
- O chat só mostra prévia. Quem transforma em vídeo é o Claude Code.

## 2. Descrever a cena como diretor
Sempre dizer:
- **Tipografia cinética** (texto que entra, cresce, se monta).
- **Transição entre formas** (círculo vira card, card vira linha…).
- **3D** e **movimento de câmera** (zoom, pan, órbita).
- **Duração** em segundos e **tamanho** (1080x1920 vertical, 1920x1080 horizontal).

## 3. Cada quadro em função do tempo
- Todo elemento é uma conta do quadro atual: `render(quadro)`.
- Sem relógio (`Date`, `setTimeout`, CSS animation solta) e sem sorteio (`Math.random`).
- Resultado: o quadro 42 sai igual toda vez. No Remotion: `useCurrentFrame()` + `interpolate()` / `spring()`; aleatório só com `random(seed)`.

## 4. Render quadro a quadro
- Navegador sem tela fotografa cada quadro a 60 fps e o ffmpeg junta em MP4.
- Nunca gravar a tela: gravação trava; render quadro a quadro não.
- No Remotion: `npx remotion render` (ou HyperFrames / Playwright + ffmpeg).

## 5. Ajustar falando
- Pedir em português simples: "mais suave", "troca a cor", "desacelera esse trecho", "emenda o final no começo" (loop).

## Bônus: vertical recomposto
- Pedir a versão vertical **recomposta** (layout refeito para 9:16), não o horizontal cortado no meio.

## Visual do exemplo (referência)
- Fundo quase preto, cards escuros com borda fina, número grande roxo (`01`…`04`), título branco forte, subtítulo em fonte mono cinza.
- Card ativo ganha borda roxa. Topo com abas de passo (CLAUDE CODE · DIRETOR · TEMPO · RENDER · AJUSTE).

## Prompt modelo
> Cria em Remotion um vídeo de 20 s, 1080x1920, 60 fps. Cena: [descrever]. Tipografia cinética no título, transição de círculo para card, leve câmera em zoom. Tudo calculado a partir do quadro, sem relógio nem aleatório. Depois renderiza em MP4.
