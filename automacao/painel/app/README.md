# Painel de vendas (prospecção)

Painel do Brenno para mandar mensagem a comércios sem site. Publicado como Artifact em
<https://claude.ai/artifact/LMpGydYCibdZoLEf3eNBNo>. Os comércios ficam no banco do Artifact
(coleção `leads`; mensagem padrão em `config/mensagem`), nunca neste repositório.

Visual: casca escura adaptada do componente "Dashboard Shell" de @isaiahbjork no 21st.dev,
que o Brenno escolheu como referência. No celular o painel é desenhado a 520 px e encolhido
para caber (ver `src/main.tsx`), para ficar igual à referência.

## Mudar e publicar

```bash
npm install
npm run build   # confere os tipos, compila e gera ../vendas.html
npm run teste   # abre o vendas.html com empresas fictícias e confere o fluxo de envio
```

Depois publique `automacao/painel/vendas.html` com a ferramenta Artifact, passando a URL acima
e sem `capabilities` (mantém `db` e `user`).

## Onde fica cada coisa

- `src/painel/leads.ts`: regras (situações, Casimiro ou fora, texto da mensagem, importação).
- `src/painel/usePainel.ts`: leitura e gravação no banco do Artifact.
- `src/painel/PainelVendas.tsx`: a tela; `TabelaLeads`, `FichaLead` e `Ferramentas` são as partes.
- `src/components/ui/`: casca e blocos visuais, sem regra de negócio.
