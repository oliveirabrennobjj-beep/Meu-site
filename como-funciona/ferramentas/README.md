# Ferramentas dos vídeos

- `savewords.py raw.json words.json`: converte a transcrição do ElevenLabs (eleven_scribe_v1, arquivo `words_download_url`)
  no `src/words.json` que os projetos usam para legendas e tempos.
- `fakewords.py texto.txt words.json`: gera tempos estimados a partir do texto do roteiro, para montar a animação
  antes de ter a narração. Depois troque pelo `words.json` real.
