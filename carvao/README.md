# Carvão (modelo de hamburgueria)

Site modelo de hamburgueria artesanal na brasa. Nasceu do HTML de referência "CARVÃO" que o Brenno mandou: mesma identidade, sem as partes genéricas (degradês no lugar de foto, caixa "MAPA", links mortos, cursor falso).

Depois do merge na `main`, abre em: https://oliveirabrennobjj-beep.github.io/Meu-site/carvao/

## Como ver
Abra `index.html` no navegador (funciona com dois cliques).

## Onde mudar
Tudo que é da loja fica em `assets/js/config.js`:

| Campo | O que é |
|---|---|
| `nome`, `bairro`, `cidade` | nome e lugar |
| `whatsapp` | DDI + DDD + número, só dígitos. Vazio = o botão abre o WhatsApp com a mensagem pronta e a pessoa escolhe o contato |
| `whatsappVisivel` | número escrito no site. Vazio = mostra "Pelo WhatsApp" |
| `mensagens` | texto pronto do pedido, da reserva e de cada burger (`{nome}` e `{preco}` são trocados sozinhos) |
| `instagram`, `tiktok`, `email` | aparecem no rodapé só quando preenchidos |
| `endereco`, `horarios`, `delivery` | cartão "Onde", menu do celular e rodapé |
| `mapaBusca` | o que o botão "Abrir no Google Maps" procura |
| `cardapio` | nome, descrição, preço (vazio mostra "Consulte"), foto e texto alternativo |

Cores e fontes: topo de `assets/css/styles.css`. Textos fixos (título, manifesto, processo): `index.html`.

Trocar foto: salve em `assets/img/` com o mesmo nome e os dois tamanhos (ex.: `carvao-300.webp` e `carvao-600.webp`).

## O que mudou em relação à referência
- Fotos reais no topo, no cardápio (miniatura no celular, prévia que segue o mouse no computador), no processo, na galeria e no "Onde".
- Cada burger é um link que abre o WhatsApp com o pedido escrito. Reserva, "Pedir agora" e "Bora comer?" também.
- "Abrir no Google Maps" no lugar da caixa "MAPA".
- Saíram: bolinha que seguia o mouse, telefone e e-mail de mentira, TikTok/Instagram sem link.
- Entraram: título e descrição para o Google, imagem de prévia do WhatsApp, "Pular para o conteúdo", foco visível, galeria que arrasta com o mouse e anda com as setas, menu do celular que fecha no ESC.
- Letras pequenas subiram de 10/11 px para 12 px ou mais.

## Fotos (Unsplash, licença livre para uso comercial)
Cada arquivo vem de `https://images.unsplash.com/photo-<código>`.

| Arquivo | Código | Autor |
|---|---|---|
| `hero` | `1607013251379-e6eecfffe234` | Eiliv Aceron |
| `carvao` | `1678110707289-ab14382a1625` | Arvid Skywalker |
| `fumo` | `1688246780164-00c01647e78c` | Fábio Alves |
| `brasa` | `1595531172949-30922c28a240` | Carlos Davila Cepeda |
| `cinza` | `1596662951482-0c4ba74a6df6` | Delfina Cocciardi |
| `origem` | `1639020715088-e7afebe6cb25` | Manu Ros |
| `pao` | `1632552544552-3ca612a328ac` | Amanda Lim |
| `blend` | `1612654198172-241d8540e1dc` | Nathana Rebouças |
| `fogo` | `1697970684518-56ccc51138b8` | não anotado |
| `g-chama` | `1789243596878-489b9420c010` | Maxim Tolchinskiy |
| `g-mao` | `1639020715392-2d8346c3acb0` | Manu Ros |
| `g-faisca` | `1602945072887-1171e7ce1450` | não anotado |
| `g-triplo` | `1553979459-d2229ba7433b` | amirali mirhashemian |
| `g-embrulho` | `1603508102983-99b101395d1a` | Nathan Dumlao |
| `local` | `1603101624611-f4c066aa7d29` | não anotado |

## Pendências (para virar site de um cliente)
- [ ] Tudo no `config.js` é exemplo: nome, "Rua da Brasa, 128", horários, delivery, cardápio e preços. Trocar pelos dados reais.
- [ ] Preencher `whatsapp` com o número da loja.
- [ ] "Desde 2019", "12 dias", "48h" e o texto do processo vieram da referência. Confirmar ou reescrever com o dono.
- [ ] Trocar as fotos de banco pelas fotos da loja. As fotos do cardápio não são dos burgers descritos.
- [ ] Instagram e link certo do Google Maps (`mapaBusca`).
- [ ] Tirar o `<meta name="robots" content="noindex">` do `index.html` e ajustar `canonical`, `og:url`, `og:image` e o JSON-LD para o endereço final.
