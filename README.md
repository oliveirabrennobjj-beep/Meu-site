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
assets/css/styles.css      visual (cores e tipografia definidas no topo, em :root)
assets/fonts/              Big Shoulders Display e Barlow, servidas localmente (licença OFL)
assets/img/                favicon e, futuramente, as fotos reais
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
| Fotos e logo | `imagens.*.src` (arquivo em `assets/img/`) e `alt` | Troca o espaço reservado pela foto; fotos de "Cortes recentes" e "Nosso espaço" abrem ampliadas ao tocar |

## Agendamento nesta versão

O agendamento é uma solicitação de contato: não há calendário de vagas nem confirmação automática.
O site deixa claro que o horário só fica marcado quando a barbearia responder.

- **Sem WhatsApp cadastrado (situação atual):** os botões levam à seção de contato, onde o visitante escolhe o serviço, copia a mensagem pronta e abre o Instagram.
- **Com WhatsApp cadastrado:** os botões abrem `wa.me` com a mensagem “Olá, Barber Club! Gostaria de consultar um horário para [serviço].”

## Informações pendentes

Antes de publicar, confirme com a barbearia:

1. **WhatsApp de agendamento.** O telefone exibido, (31) 99780-3143, tem DDD de Minas Gerais, e Casimiro de Abreu usa o 22. Vale confirmar se é o número certo e se atende pelo WhatsApp.
2. **Endereço.** O texto da captura cita duas ruas (“Rua pastor Luiz Laurentino da Silva, R. Rodolfo Motta”). Ele está guardado em `endereco.referenciaDaCaptura` e não aparece no site.
3. **Ponto no mapa e link de rota**, depois de confirmar o endereço.
4. **Horários de funcionamento completos.**
5. **Link do perfil no Google** e a data em que a nota 4,9 / 33 avaliações foi vista (hoje está como “outubro de 2026”, a data desta versão).
6. **Depoimentos.** Só entram textos reais, copiados como aparecem, com o nome exibido.
7. **Preços e duração dos serviços**, se a barbearia quiser mostrar.

### Arquivos para enviar

| Arquivo sugerido | Uso | Formato |
|---|---|---|
| `logo.svg` (ou PNG com fundo transparente) | Cabeçalho | Vetor ou PNG com pelo menos 400 px de largura |
| `hero.jpg` | Foto principal, moldura em arco | Vertical, 4:5, pelo menos 1200 × 1500 px |
| `espaco-1.jpg` a `espaco-3.jpg` | Nosso espaço (fachada, cadeiras/bancada, detalhes) | A primeira horizontal (16:10); as outras verticais (4:5) |
| `corte-1.jpg` a `corte-6.jpg` | Cortes recentes | Verticais (4:5), pelo menos 1000 × 1250 px |

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
