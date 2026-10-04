# Barber Club — site

Primeira versão do site da Barber Club, barbearia em Casimiro de Abreu (RJ).
É um site estático (HTML, CSS e JavaScript, sem etapa de build), pensado primeiro para o celular.

## Como visualizar

Na pasta do projeto:

```bash
python3 -m http.server 8000
```

Depois, abra <http://localhost:8000> no navegador.
Abrir o `index.html` direto (duplo clique) também funciona, mas o servidor local reproduz melhor o site publicado.

## Estrutura

```
index.html                 página única: cabeçalho, seções e rodapé
assets/js/site-config.js   DADOS DO NEGÓCIO: contatos, serviços, fotos, horários, endereço, avaliações
assets/js/main.js          monta o conteúdo a partir do site-config.js e cuida das interações
assets/js/motion.js        efeitos de movimento ao rolar (opcional)
assets/video/              vídeo em loop do poste da entrada (gerado em tools/intro-3d)
assets/css/styles.css      visual (cores e tipografia definidas no topo, em :root)
assets/fonts/              Outfit e DM Serif Display, servidas localmente (licença OFL)
assets/img/                fotos em WebP (versões de 640 e 1122 px) e favicon
tests/test_site.py         testes automatizados com Playwright
docs/capturas/             capturas de tela da versão atual
```

## Como atualizar os dados

Quase tudo muda em um único arquivo: `assets/js/site-config.js`. Campos vazios não aparecem no site.

| O que | Campo | Efeito |
|---|---|---|
| WhatsApp de agendamento | `contato.whatsappAgendamento` (ex.: `"5522999999999"`) | Todos os botões "Agendar horário" e "Consultar serviço" passam a abrir o WhatsApp com a mensagem pronta |
| Texto da mensagem | `contato.mensagemAgendamento` | `{servico}` vira o serviço escolhido |
| Endereço | `endereco.texto` e `endereco.confirmado: true` | Exibe o endereço |
| Mapa | `endereco.mapaEmbedUrl` (Google Maps › Compartilhar › Incorporar um mapa, só o valor de `src`) | Mostra o mapa, se o endereço estiver confirmado |
| Rota | `endereco.rotaUrl` (link do local no Google Maps) | Habilita o botão "Como chegar" |
| Horários | `horarios: [{ dias: "…", horas: "…" }]` | Substitui o aviso "Em breve" |
| Preço e duração | `servicos[].preco`, `servicos[].duracao` | Aparecem no card do serviço |
| Avaliações | `avaliacoes: [{ nome, texto }]` e `google.perfilUrl` | Mostra depoimentos e o link para o Google |
| Nota do Google | `google.nota`, `google.totalAvaliacoes`, `google.registradoEm` | Atualize à mão; o site não consulta o Google |
| Fotos e logo | `imagens.hero`, `imagens.sobre`, `imagens.espaco`, `imagens.resultados` (`src`, `srcset`, `alt`) e `imagens.logo` | Foto de fundo da seção principal, foto em arco e fotos extras de "Nosso espaço" e galeria "Cortes recentes" (as fotos abrem ampliadas ao tocar) |

## Tela de entrada

Na primeira abertura da página, aparece uma tela com o nome Barber Club sobre um poste de barbeiro e o botão **Entrar**.
Ela some com o botão, com Esc ou ao rolar a página, e não volta durante a mesma visita.
Quem chega por um link direto para uma seção (por exemplo, `…/#contato`) vai direto ao conteúdo.
Com movimento reduzido ativado no aparelho, o poste fica parado e a saída é imediata.

## Poste da tela de entrada

O poste da entrada é um **vídeo curto em loop** (`assets/video/poste.webm` e `poste.mp4`, 1,8 s, menos de 110 KB), tocado pelo chip de vídeo do aparelho. Assim ele gira liso até em celular simples, e aparece na hora.

- Enquanto o vídeo carrega, ou com "reduzir movimento" ativado, aparece o primeiro quadro (`poste.webp`).
- O vídeo foi desenhado em 3D com [three.js](https://threejs.org) (licença MIT): latão polido, tubo de vidro, listras dourado/creme/preto e luz de estúdio montada em código. Não é imagem gerada por IA.
- As bordas do vídeo têm a cor exata do fundo da página (`#0c0a08`), então ele se funde sem emenda.
- Para mudar cores, velocidade ou formato, edite `tools/intro-3d/pole-video.src.js` e gere de novo (precisa de Node, Python com Playwright e ffmpeg):

  ```bash
  cd tools/intro-3d
  npm install
  npm run video
  ```

## Movimento

Os efeitos ficam em `assets/js/motion.js`, com os estilos no fim de `assets/css/styles.css` (e as animações da entrada e do título nas seções correspondentes):

- **Tela de entrada:** poste em vídeo com as listras girando (ver acima). Ao entrar, o nome e o poste crescem e a tela sobe como uma cortina.
- **Seção principal:** o título sobe linha por linha, uma faixa dourada passa atrás do texto pequeno e a foto se aproxima devagar. Ao rolar, a foto e o texto se movem em velocidades diferentes (parallax).
- **Faixa rolando:** serviços, cidade e "Desde 2019" passam sem parar. Ela pausa quando o mouse está em cima.
- **Ao rolar:** títulos e textos aparecem, os cartões entram em sequência, as fotos se abrem como cortina e a nota 4,9 conta a partir do zero.
- **Barra de progresso** dourada no topo, e o cabeçalho sai ao descer e volta ao subir.
- **No computador:** os cartões de serviço inclinam seguindo o mouse.

Tudo usa só `transform` e `opacity`, sem bibliotecas. Com "reduzir movimento" ativado no aparelho, ou sem JavaScript, nada se mexe e todo o conteúdo aparece direto.
Para desligar os efeitos de rolagem, basta remover a linha `<script src="assets/js/motion.js" defer></script>` do `index.html`.

## Agendamento nesta versão

O agendamento é uma solicitação de contato: não há calendário de vagas nem confirmação automática.
O site deixa claro que o horário só fica marcado quando a barbearia responder.

- **Sem WhatsApp cadastrado (situação atual):** os botões levam à seção de contato, onde o visitante escolhe o serviço, copia a mensagem pronta e abre o Instagram.
- **Com WhatsApp cadastrado:** os botões abrem `wa.me` com a mensagem “Olá, Barber Club! Gostaria de consultar um horário para [serviço].”

## Informações pendentes

### Já cadastrado

- **Logo**, recortada da foto de perfil do Instagram (cabeçalho, tela de entrada, rodapé e ícone da aba).
- **Endereço**, R. Pastor Luís Laurentino da Silva, 957, Casimiro de Abreu, RJ, 28860-000.
- **Mapa e rota.** O mapa busca o lugar pelo nome no Google Maps, e "Como chegar" abre o perfil da Barber Club no Google Maps.
- **Avaliações no Google**, com dois depoimentos reais, copiados como aparecem (Marcos Cesar e Jim Torres), e o link para o perfil.

### Ainda falta

1. **WhatsApp de agendamento.** O telefone exibido, (31) 99780-3143, tem DDD de Minas Gerais, e Casimiro de Abreu usa o 22. Vale confirmar se é o número certo e se atende pelo WhatsApp.
2. **Número do endereço.** O 957 veio do Street View, que mostra um número aproximado. Confirme na fachada.
3. **Horários de funcionamento completos.** O perfil do Google, na captura, mostra só "abre seg. às 08:00". Basta uma captura com o quadro "Horário de funcionamento" aberto.
4. **Mapa com o ponto exato (opcional).** Em Google Maps › Compartilhar › Incorporar um mapa, copie o `src` para `endereco.mapaEmbedUrl`.
5. **Preços e duração dos serviços**, se a barbearia quiser mostrar. A faixa "R$ 20–80" do Google não foi usada como preço de serviço.
6. **Logo original** em alta resolução. A atual saiu de uma captura de tela e serve bem até uns 360 px.
7. **Origem das fotos.** As cinco fotos atuais (três de barbeiros de avental, degradê e barba com navalha) foram enviadas para esta versão. Antes de publicar, confirme que são da Barber Club e que as pessoas que aparecem autorizam o uso. Se forem ilustrativas ou geradas por IA, troque por fotos reais, porque o site as apresenta como o ambiente e o trabalho da barbearia. As fotos do perfil no Google (espelho, bancada, corte com desenho) parecem ser do salão real: os arquivos originais delas seriam ótimos aqui.

### Arquivos para enviar

| Arquivo sugerido | Uso | Formato |
|---|---|---|
| `logo.svg` (ou PNG com fundo transparente) | Substituir a logo recortada | Vetor ou PNG com pelo menos 800 px de largura |
| Fotos de cortes | Mais itens em "Cortes recentes" | Verticais (4:5), pelo menos 1000 × 1250 px |
| Foto da fachada ou do salão | Pode substituir ou complementar as atuais | Pelo menos 1600 px de largura para o fundo da seção principal |

Use fotos originais da barbearia. Capturas do Instagram ou do Google Maps não servem como foto do site, e fotos de banco de imagens não devem aparecer como clientes, equipe ou ambiente reais.
Para cada foto, escreva também um texto alternativo (`alt`) curto descrevendo a imagem.

## Testes

```bash
.venv/bin/python tests/test_site.py               # roda os testes
.venv/bin/python tests/test_site.py --shots pasta # e salva capturas de tela
```

Cobrem: rolagem horizontal de 320 a 1440 px, menu móvel, links e botões, fluxo de agendamento com e sem WhatsApp, galeria por teclado, tratamento de dados não confirmados e movimento reduzido.
Nas sessões na nuvem, o Playwright é preparado pelo hook descrito em `.claude/SKILLS.md`.

## Publicação

Fica para uma etapa posterior. Por ser um site estático, ele pode ser publicado em qualquer hospedagem de arquivos (GitHub Pages, Netlify, Cloudflare Pages, etc.).
