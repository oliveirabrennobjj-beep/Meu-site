---
tipo: padrao
projetos: ["[[Meu-site]]"]
tags: ["cerebro/padrao", "desempenho", "imagens"]
criado: 2026-11-02
atualizado: 2026-11-02
resumo: "Fotos em WebP (480/960 px, até ~200 KB), srcset, width/height, lazy nas de baixo e preload só na do topo."
---
# Fotos em WebP com srcset e lazy

- Converter para **WebP**, duas larguras (ex.: 480 e 960 px, ou 640 e 1122 px), até ~200 KB cada.
- `<img srcset="... 480w, ... 960w" sizes="..." width="" height="" alt="">` para não pular layout.
- Foto do topo: `<link rel="preload" as="image">`. Demais: `loading="lazy"`.
- `og:image` em **JPG** (WhatsApp e redes não mostram WebP em todos os casos).
