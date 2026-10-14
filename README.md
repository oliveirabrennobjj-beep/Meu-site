# Barbearia Vértice — site

Primeira versão do site da Barbearia Vértice, barbearia em Casimiro de Abreu (RJ).
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
| Fotos e logo | `imagens.hero`, `imagens.sobre`, `imagens.resultados` (`src`, `srcset`, `alt`) e `imagens.logo` | Foto de fundo da seção principal, foto em arco de "Nosso espaço" e galeria "Cortes recentes" (abre ampliada ao tocar) |

## Tela de entrada

Na primeira abertura da página, aparece uma tela com o nome Barbearia Vértice sobre um poste de barbeiro e o botão **Entrar**.
Ela some com o botão, com Esc ou ao rolar a página, e não volta durante a mesma visita.
Quem chega por um link direto para uma seção (por exemplo, `…/#contato`) vai direto ao conteúdo.
Com movimento reduzido ativado no aparelho, o poste fica parado e a saída é imediata.

## Agendamento nesta versão

O agendamento é uma solicitação de contato: não há calendário de vagas nem confirmação automática.
O site deixa claro que o horário só fica marcado quando a barbearia responder.

- **Sem WhatsApp cadastrado (situação atual):** os botões levam à seção de contato, onde o visitante escolhe o serviço, copia a mensagem pronta e abre o Instagram.
- **Com WhatsApp cadastrado:** os botões abrem `wa.me` com a mensagem “Olá, Barbearia Vértice! Gostaria de consultar um horário para [serviço].”

## Informações pendentes

Antes de publicar, confirme com a barbearia:

1. **Contatos.** O site mudou de nome (era Barber Club) e os contatos da barbearia anterior foram retirados. Preencha `contato.whatsappAgendamento`, `contato.telefone` e `contato.instagram` com os dados da Barbearia Vértice.
2. **Endereço.** Preencha `endereco.texto` e marque `confirmado: true`.
3. **Ponto no mapa e link de rota**, depois de confirmar o endereço.
4. **Horários de funcionamento completos.**
5. **Nota e link do perfil no Google.** A seção de avaliações só aparece quando `google.nota` for preenchida com os números reais.
6. **Depoimentos.** Só entram textos reais, copiados como aparecem, com o nome exibido.
7. **Preços e duração dos serviços**, se a barbearia quiser mostrar.
8. **Origem das fotos.** A foto de fundo da abertura é o corte com reflexo enviado pelo dono do site, de uma barbearia parceira. As outras fotos (barbeiro de avental, degradê e barba com navalha) foram enviadas para esta versão. Antes de publicar, confirme que são da Barbearia Vértice e que as pessoas que aparecem autorizam o uso. Se forem ilustrativas ou geradas por IA, troque por fotos reais, porque o site as apresenta como o ambiente e o trabalho da barbearia.

### Arquivos para enviar

| Arquivo sugerido | Uso | Formato |
|---|---|---|
| `logo.svg` (ou PNG com fundo transparente) | Cabeçalho | Vetor ou PNG com pelo menos 400 px de largura |
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
