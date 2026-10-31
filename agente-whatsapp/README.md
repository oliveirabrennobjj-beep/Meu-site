# Agente de WhatsApp da BN Digital

Um atendente virtual que responde o WhatsApp da BN Digital sozinho, usando o Claude.

## O plano do agente

| Pergunta | Resposta |
|---|---|
| O que o negócio faz | Sites personalizados, cardápios digitais e placas NFC para avaliações no Google (Casimiro de Abreu e região) |
| Quem são os clientes | Donos de pequenos comércios: lanchonetes, barbearias, academias, lojas, pousadas, pet shops |
| O que precisa resolver | Tirar dúvidas, mostrar trabalhos parecidos, passar o preço da placa e colher os dados do orçamento |
| Que ações pode tomar | Registrar um orçamento · marcar uma visita para mostrar a placa · chamar o Brenno |

Cada ação salva um registro na pasta `dados/` e manda um aviso para o seu WhatsApp pessoal, com o link da conversa do cliente.

## Onde mudar cada coisa

| O que | Arquivo |
|---|---|
| Produtos, preços, trabalhos, dúvidas comuns, região atendida | `src/negocio.ts` |
| Jeito de falar, roteiro de atendimento e regras | `src/prompt.ts` |
| Ações (orçamento, visita, chamar o Brenno) e os avisos | `src/ferramentas.ts` |

**Preços:** site e cardápio ficam "sob consulta" (o agente nunca inventa valor). A placa usa o preço do roteiro de abordagem: R$ 129, ou R$ 229 levando duas. Se mudar, altere em `src/negocio.ts`.

## Testar no terminal (sem WhatsApp)

```bash
cd agente-whatsapp
npm install
cp .env.exemplo .env      # preencha pelo menos ANTHROPIC_API_KEY
npm run conversar
```

Você escreve como se fosse um cliente e vê o que o agente responde. Os avisos que iriam para o seu WhatsApp aparecem no terminal.

## Ligar no WhatsApp de verdade

O agente usa a **API oficial do WhatsApp (Cloud API, da Meta)**.

1. Em <https://developers.facebook.com>, crie um app do tipo **Empresa** e adicione o produto **WhatsApp**.
2. Em *WhatsApp › Configuração da API*, copie o **token** e o **ID do número de telefone** para `WHATSAPP_TOKEN` e `WHATSAPP_PHONE_NUMBER_ID` no `.env`. Para não expirar, gere um token permanente com um *usuário do sistema* no Gerenciador de Negócios.
3. Coloque o servidor no ar (`npm start`) num endereço com HTTPS: Render, Railway, uma VPS, ou `npx cloudflared tunnel --url http://localhost:3000` para testar do seu computador.
4. Em *WhatsApp › Configuração › Webhook*, cadastre `https://SEU-ENDERECO/webhook`, com o mesmo texto de `WHATSAPP_VERIFY_TOKEN` no campo **Verificar token**, e assine o campo **messages**.
5. Preencha `WHATSAPP_APP_SECRET` (Configurações do app › Básico) e `WHATSAPP_DONO` (seu número pessoal, ex.: `5522999999999`).

Atenção a três pontos da Meta:

- **Número:** o número ligado na Cloud API sai do aplicativo WhatsApp Business comum. Use um chip novo para o agente, ou ative o modo *coexistência* se quiser continuar usando o app no mesmo número.
- **Avisos para você:** a Meta só deixa mandar mensagem livre para quem falou com o número nas últimas 24 horas. Mande um "oi" do seu número pessoal para o número do agente uma vez por dia, ou os avisos ficam só no log e na pasta `dados/`.
- **Custo:** responder clientes que chamaram é gratuito na Meta. O Claude é cobrado por uso em <https://console.anthropic.com>.

## Detalhes técnicos

- Modelo: Claude Opus 5.5 com esforço baixo (respostas rápidas e curtas). Troque com a variável `MODELO`.
- Se o modelo recusar uma mensagem por engano, outro modelo responde no lugar (`fallbacks: "default"`).
- A conversa fica na memória do servidor e recomeça depois de 24 horas parada ou quando o servidor reinicia.
- Mensagens de áudio, foto e figurinha recebem um pedido para escrever em texto.
- `npm run check` confere os tipos do TypeScript.
