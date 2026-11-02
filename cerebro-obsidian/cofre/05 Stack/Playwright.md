---
tipo: stack
projetos: ["[[Meu-site]]"]
tags: ["cerebro/stack", "testes"]
criado: 2026-11-02
atualizado: 2026-11-02
resumo: "Testes de site e capturas de tela (celular 390 px e computador 1440 px), incluindo erros do console."
---
# Playwright

## Como uso
- Capturas de conferência antes de mostrar um site ao cliente (celular 390 px, computador 1440 px).
- Testes automatizados de site estático (`tests/test_site.py`, pacote **Python** `playwright`).

## Pegadinhas
- O pacote Python e o pacote Node são diferentes: a skill webapp-testing precisa do **Python**.
- A versão do Playwright tem que bater com o Chromium instalado (ex.: 1.56 ↔ chromium-1194).
