#!/bin/bash
# Liga o segundo cérebro (repositório privado C-rebro-) nas sessões do Claude na nuvem.
# Uso nos hooks: cerebro.sh session-start | prompt | tool | stop
# No computador do Brenno quem faz isso é o kit cerebro-obsidian/ (instalado no ~/.claude), então aqui só roda na nuvem.
EVENTO="$1"
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  [ "$EVENTO" = "stop" ] && echo '{}'
  exit 0
fi
COFRE=/home/user/c-rebro-
export TZ=America/Sao_Paulo
export CEREBRO_HOME="$HOME/.cerebro-nuvem"
if [ ! -d "$COFRE/.git" ]; then
  if [ "$EVENTO" = "session-start" ]; then
    cat <<'JSON'
{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"[Segundo cérebro] O Brenno guarda o segundo cérebro (cofre do Obsidian com projetos, padrões, decisões, preferências e aprendizados) no repositório privado oliveirabrennobjj-beep/C-rebro-. Ele ainda não está nesta sessão. Antes de começar qualquer tarefa, adicione o repositório com add_repo (owner oliveirabrennobjj-beep, repo C-rebro-, access push) e clone em /home/user/c-rebro- (git clone --depth 1). Depois disso os hooks buscam e registram no cofre sozinhos, inclusive o commit e o push."}}
JSON
  fi
  [ "$EVENTO" = "stop" ] && echo '{}'
  exit 0
fi
mkdir -p "$CEREBRO_HOME"
printf '{"cofre":"%s","git":true}\n' "$COFRE" > "$CEREBRO_HOME/config.json"
exec node "${CLAUDE_PROJECT_DIR:-/home/user/Meu-site}/cerebro-obsidian/motor/cerebro.mjs" hook "$EVENTO" --ferramenta claude
