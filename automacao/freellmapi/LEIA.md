# FreeLLMAPI

Proxy local: junta os planos gratis de varios provedores num endpoint so (`http://localhost:3001/v1`) e troca de modelo quando um limite acaba.

- Instalar (no PC, com Docker): `./instalar.sh`
- Conectar no Claude Code: `npx freellmapi setup-claude --url http://localhost:3001 --api-key <unified-key>`
- Cada provedor exige sua propria chave gratis (voce cria em cada site).
- Aviso do proprio projeto: uso pessoal/teste. Nao colocar codigo ou dados de cliente aqui: o texto vai para varios servicos de terceiros.
