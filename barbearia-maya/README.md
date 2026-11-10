# Barbearia Maya (prévia)

Prévia de site para a Barbearia Maya, em Casimiro de Abreu, RJ. Ainda não foi aprovada pela barbearia.

Depois do merge na `main`, abre em: https://oliveirabrennobjj-beep.github.io/Meu-site/barbearia-maya/

## Como ver
Abra `index.html` no navegador (funciona com dois cliques).

## Onde mudar
Tudo que é da barbearia fica em `assets/js/config.js`:

| Campo | O que é |
|---|---|
| `whatsapp`, `whatsappVisivel`, `mensagemWhatsapp` | número e mensagem dos botões de agendar |
| `instagram`, `instagramVisivel` | link e nome do perfil |
| `endereco`, `cidade`, `horarios`, `mapaBusca` | localização, funcionamento e busca do mapa |
| `servicos` | nome, descrição, preço (vazio mostra "Consulte") e foto |
| `galeria` | fotos da galeria |

Cores e fontes: topo de `assets/css/styles.css`.

## De onde veio cada dado
- Nome, cidade, endereço, horário, WhatsApp, Instagram e "Desde 2022": print do perfil `@_barbeariamaya` no Instagram.
- Logo e fotos da galeria: recortes do mesmo print (baixa resolução).
- Textos das seções: briefing do Brenno.

## Fotos ilustrativas (Pexels, licença livre)
Hero `4625615`, sobre `30547746`, experiência `3875522` e `19225277`, chamada `9491366`,
serviços `13758247`, `19050581`, `12464843`, `32351047`, `35157699`, `7697481`.
Endereço de cada uma: `https://www.pexels.com/photo/<número>/`.

## Pendências (confirmar com a barbearia)
- [ ] Lista de serviços e preços: os 6 serviços são sugestão, nenhum preço foi inventado.
- [ ] Logo em arquivo original (PNG ou vetor). A atual é recorte de print.
- [ ] Fotos originais dos cortes e do salão, para trocar a galeria e as fotos ilustrativas.
- [ ] A foto de "Sobrancelha" mostra navalha no rosto, não sobrancelha. Trocar.
- [ ] Conferir o ponto do mapa no Google Maps.
- [ ] O Instagram no briefing veio como `@_barberiamaya`; usei `@_barbeariamaya`, que é o que aparece no print.
- [ ] Quando aprovar: tirar o `<meta name="robots" content="noindex">` e a frase "Prévia do site" do rodapé.
