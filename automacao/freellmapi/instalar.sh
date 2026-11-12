#!/usr/bin/env bash
# Instala o FreeLLMAPI no PC (precisa de Docker). Rode UMA vez.
# Fonte: https://github.com/tashfeenahmed/freellmapi
set -euo pipefail
curl -fsSL https://freellmapi.co/install.sh | bash
echo
echo "1) Abra http://localhost:3001 e cole suas chaves gratis (Groq, Gemini, OpenRouter, Cerebras...) na aba Keys."
echo "2) Copie a 'unified key' do topo da aba Keys."
echo "3) Rode: npx freellmapi setup-claude --url http://localhost:3001 --api-key <unified-key>"
echo "   (ou: npx freellmapi launch  -> abre o Claude Code sem gravar chave em arquivo)"
