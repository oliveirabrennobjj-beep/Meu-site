# Checklist antes de mostrar ao Brenno

## Visual (olhando as capturas)
- [ ] No celular, o topo mostra nome, frase e botão de WhatsApp sem rolar.
- [ ] Nenhuma rolagem lateral, texto cortado ou foto esticada/borrada.
- [ ] Cores e fontes batem com `DESIGN.md`; o "detalhe assinatura" aparece.
- [ ] Fica bonito também no computador (não é só o celular esticado).

## Conteúdo
- [ ] Nada inventado: telefone, endereço, horário, preço e depoimentos vieram do cliente, do Brenno ou do Instagram dele.
- [ ] Campos vazios escondem a parte ou mostram "Consulte pelo WhatsApp".
- [ ] Textos sem clichê de IA e sem erro de português.
- [ ] Rodapé com "Site feito por BN Digital".

## Funciona
- [ ] Todos os botões de WhatsApp abrem `wa.me/55...` com mensagem pronta.
- [ ] "Abrir no Google Maps" e Instagram abrem o lugar certo.
- [ ] Menu do celular abre, fecha e não prende a página.
- [ ] Console sem erros (o script de capturas lista).
- [ ] Abre também dando dois cliques no `index.html` (sem servidor).

## Google e WhatsApp
- [ ] `<title>` e `description` com nome + ramo + cidade.
- [ ] `og:image` em JPG para a prévia no WhatsApp.
- [ ] JSON-LD do tipo certo, só com dados confirmados.

## Acessibilidade e velocidade
- [ ] `lang="pt-BR"`, "Pular para o conteúdo", `alt` nas fotos, foco visível.
- [ ] Contraste AA em textos e botões; alvos de toque ≥ 44 px.
- [ ] Imagens em WebP, topo com `preload`, resto com `loading="lazy"`.
- [ ] Página inteira com menos de ~1,5 MB no primeiro carregamento.

## Entrega
- [ ] `README.md` com "como ver", "onde mudar" (tabela do `config.js`) e "pendências".
- [ ] Workflow de publicação atualizado com a pasta nova.
- [ ] Branch, commit, push e PR feitos.
