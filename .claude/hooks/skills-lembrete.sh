#!/bin/bash
# Lembrete no início de toda conversa: o texto abaixo entra no contexto do Claude.
# Faz o Claude carregar as skills de economia de token e as do pedido, sem esperar o Brenno pedir.
cat <<'EOF'
[Regra do Brenno] Antes da primeira resposta, carregue a skill `caveman` e mantenha respostas curtas em português.
Em cada pedido, carregue TODAS as skills da linha certa da tabela "Skills: usar SEMPRE" do CLAUDE.md (design, vídeo, SEO, bug etc.), sem perguntar. Termine com "Skills usadas: …".
EOF
