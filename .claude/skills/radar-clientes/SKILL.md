---
name: radar-clientes
description: Acha comércios sem site e com poucas avaliações no Google (região de Casimiro de Abreu ou outra cidade), gera a mensagem de WhatsApp de cada um e joga no Painel BN. Use quando o Brenno pedir "roda o radar", "acha clientes", "radar de clientes", "lojas sem site" ou "/radar-clientes".
---

# Radar de clientes (BN Digital)

Painel: https://claude.ai/artifact/FmNsJDgQYXXyeKwUfF7Wrc (coleção `lojas` no banco do artifact).
Arquivos: `bn-digital/prospeccao/radar/` (`filtro.py`, `seed.py`, `painel.html`, listas `lojas-AAAA-MM-DD.json`).

## Passo a passo

1. **Buscar** no Firecrawl Maps (`firecrawl_scrape` com `alexandria`, provider `firecrawl-maps`, capability `businesses/search`, `language: pt-BR`, `country: br`), até 10 buscas por chamada: `"<ramo> em <cidade> RJ"`.
   - Custa 10 créditos por busca (20 lojas). Avisar o Brenno antes se for passar de 100.
   - Ramos que funcionaram: hamburgueria, açaí, barbearia, salão de beleza, pet shop, restaurante, padaria, oficina mecânica, loja de roupas, pousada.
   - Já rodado em 08/11/2026: Casimiro de Abreu (todos os ramos acima) e pousada em Barra de São João. Próximo: Rio das Ostras e Barra de São João.
2. **Salvar** cada resultado como `b<N>.json` numa pasta de trabalho e rodar `seed.py` lá (lê `filtro.py`).
   - Filtro: sem site (ou só Instagram/Facebook/Linktree/iFood), menos de 20 avaliações, com telefone, fora das listas antigas (`bn-digital/prospeccao/leads*.json`).
   - Na região (Casimiro, Barra, Rio das Ostras): mensagem oferece site + plaquinha NFC. Cidade de fora: trocar o texto para só site.
3. **Conferir** no painel quais `doc_id` já existem (`ArtifactData list` em `lojas`) e não regravar loja que já tem andamento.
4. **Gravar** as novas com `ArtifactData batch` (até 50 por vez, `op: set`, `file_path` de cada doc).
5. Salvar a lista em `bn-digital/prospeccao/radar/lojas-<data>.json`, commitar e mandar o link do painel.

## Aba "Pedidos de site"

Links fixos (99Freelas, Workana, GetNinjas, grupos do Facebook) e uma resposta pronta. Para puxar pedidos automaticamente, a rede da sessão precisa liberar `www.99freelas.com.br` e `www.workana.com`.
