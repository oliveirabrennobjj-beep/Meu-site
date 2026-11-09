# WhatsApp no automático

## Nível 1: hoje, só pelo celular (grátis, sem risco)
App **WhatsApp Business** → Ferramentas comerciais:

1. **Mensagem de saudação** (manda sozinha para quem fala pela 1ª vez ou após 14 dias):
   > Oi! Aqui é o Brenno, da BN Digital. Faço sites, vídeos e Instagram para comércio local.
   > Me conta: qual o nome do seu negócio e o que você precisa? Respondo já já.
2. **Mensagem de ausência** (fora do horário):
   > Oi! Agora estou fora do horário, mas já vi sua mensagem. Amanhã cedo te respondo.
   > Se quiser adiantar, manda o @ do Instagram do seu negócio.
3. **Respostas rápidas** (digite `/` no chat para usar):
   - `/preco`: Os sites começam em R$ ___. Inclui: página no celular, botão do WhatsApp, Google Maps e fotos do seu negócio. Te mando um exemplo?
   - `/exemplo`: Olha um site que fiz: <link do site publicado>. O seu fica nesse nível, com a cara do seu negócio.
   - `/prazo`: Fica pronto em até ___ dias depois que você me mandar as fotos e informações.
   - `/fotos`: Para começar, me manda: logo (se tiver), 5 a 10 fotos reais, endereço, horário e o @ do Instagram.
   - `/pix`: Para fechar: chave Pix ___. Assim que cair, começo o seu.
   - `/obrigado`: Fechado! Obrigado pela confiança. Te mando a primeira versão em ___ dias.
4. **Etiquetas**: Novo contato · Orçamento enviado · Fechado · Pagou · Entregue.
5. **Catálogo**: 3 itens: Site, Vídeo para Instagram, Gestão de Instagram (com foto e preço).

Os `___` são seus preços e prazos. Não invento esses valores.

## Nível 2: Claude respondendo (precisa de conta Meta)
Ver `automacao/PLANO.md`, seção 1. Recomendado: API oficial da Meta + Make (já conectado ao Claude).
Passos quando decidir:
1. business.facebook.com → criar conta empresarial "BN Digital".
2. developers.facebook.com → app → WhatsApp → adicionar número (pode ser um chip novo).
3. Me avisar: eu peço o token num formulário seguro e monto o cenário no Make
   (mensagem chega → Claude classifica: orçamento / dúvida / cliente → responde ou te avisa).
