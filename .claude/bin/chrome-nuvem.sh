#!/bin/bash
# Abre o Chromium da nuvem com --no-sandbox, exigido quando o processo roda como root.
# Usado pela skill design-taste-frontend via CHROME_PATH (ver .claude/hooks/session-start.sh).
exec /opt/pw-browsers/chromium --no-sandbox "$@"
