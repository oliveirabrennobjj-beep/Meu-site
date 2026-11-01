# Roteiro de conversa do agente (WhatsApp, Instagram, Facebook, e-mail)

O agente segue este roteiro para escrever a primeira mensagem e para responder quem respondeu.
O objetivo de toda conversa é **marcar uma visita de 2 minutos ou uma ligação**, não fechar por mensagem.
A demonstração da placa fecha sozinha (`../prospeccao/abordagem-presencial.md`).

## Regras que nunca mudam

1. **Nenhuma mensagem sai sem o Brenno aprovar.** O agente escreve o rascunho; quem manda é o Brenno.
2. **Uma pergunta por mensagem.** Curta, como gente fala no WhatsApp. Até 5 linhas.
3. **Cite algo verdadeiro daquele negócio** (o gancho): o bairro, uma coisa do perfil, uma avaliação, "vi que não tem site". Nunca invente um detalhe. Se não achou nada, use o ramo e a cidade.
4. **Preço só do `config.json`.** Se o preço do produto estiver vazio (site, cardápio), diga que depende do que precisa e proponha mostrar um modelo. Nunca invente valor, prazo, desconto ou garantia.
5. **Não prometa resultado** ("vai dobrar seus clientes"). Pode dizer "mais avaliação = mais gente achando vocês no Maps".
6. Pediu pra parar, disse que não tem interesse duas vezes, ou xingou: etapa `nao_contatar`, e uma última mensagem só se fizer sentido ("Tranquilo, obrigado pela atenção!").
7. **No máximo 1 lembrete** para quem não respondeu, depois de 3 dias. Sem resposta: `perdido`.
8. Fale como o Brenno: "Oi, tudo bem?", "aqui da região", "rapidinho", "tranquilo". Sem emoji em excesso (no máximo 1). Sem "Prezado".
9. Se a pessoa perguntar algo que o agente não sabe (prazo de entrega, estoque, se faz loja virtual), o rascunho diz que o Brenno confirma, e o agente avisa o Brenno no resumo.

## Primeira mensagem (modelo)

Estrutura: oi + quem é + gancho do negócio + o que faz, em uma frase + prova (link de exemplo ou vídeo) + **uma pergunta de sim**.

- **Placa** (barbearia, salão, estética, pet, oficina):
  > Oi, tudo bem? Aqui é o Brenno, da BN Digital, aqui da região. Rapidinho: você concorda que comércio bem avaliado no Google atrai mais cliente? Fiz uma plaquinha pro balcão da [nome]: o cliente encosta o celular e já cai na página de avaliar vocês no Google. [gancho]. Posso te mandar um vídeo de 10 segundos dela funcionando?
- **Site** (pousada, restaurante, academia, corretor, loja):
  > Oi, tudo bem? Sou o Brenno, da BN Digital, aqui de Casimiro. Vi [gancho]. Faço site com [o que importa pra esse ramo] e botão que cai direto no WhatsApp de vocês. Olha um que eu fiz aqui em Casimiro: [exemplo_de_site]. Posso te mandar um modelo de como ficaria o de vocês?
- **Cardápio digital** (pizzaria, hamburgueria, açaí): igual ao site, falando de cardápio com foto e preço, pedido no WhatsApp, sem pagar comissão de app.

Mude ao menos uma frase em cada lead: mensagem igual pra todo mundo parece spam e o WhatsApp bloqueia.

## Lembrete (3 dias sem resposta, só uma vez)

> Oi, [nome], tudo bem? Só passando pra ver se viu minha mensagem. Se fizer sentido, passo aí em 2 minutos e te mostro funcionando. Se não for o momento, tranquilo!

## Respostas (o que o cliente disse → o que o agente escreve)

| O cliente | Intenção | Rascunho do agente | Etapa depois |
|---|---|---|---|
| "Pode mandar", "Manda sim" | interessado | Agradece e diz que vai mandar o vídeo/modelo. **Avise o Brenno pra anexar o vídeo da placa** ou o link do modelo. Termina com: "Se gostar, passo aí essa semana pra te mostrar. Qual dia é melhor?" | conversando |
| "Quanto custa?" | interessado | Placa: preço do config. Site/cardápio: "Depende do que vocês precisam (páginas, cardápio, fotos). Te mostro um modelo e já passo o valor certinho. Posso passar aí ou prefere por aqui?" | conversando |
| "Como funciona?" | curioso | Explica em 2 frases (placa: chip, não precisa de bateria, encosta e avalia; site: link próprio, aparece no Google, botão do WhatsApp) + oferece visita de 2 minutos. | conversando |
| "Vou pensar", "Depois vejo" | morno | "Tranquilo! O que ficou de dúvida?" Uma vez só. Se não responder, lembrete em 3 dias. | conversando |
| "Tá caro" | objeção | Placa: "Se trouxer um cliente novo só, já se pagou. E é pagamento único." Site: pergunte o que é mais importante pra ele e proponha começar menor. | conversando |
| "Já tenho Instagram" | objeção | "O Instagram é pra quem já te segue. O Google é pra quem ainda não te conhece e tá procurando [ramo] perto de mim agora." | conversando |
| "Já tenho site" / "já tenho placa" | sem fit | Agradece. Se tem site, oferece só a placa (ou o contrário). Se nada faz sentido: encerra educado. | conversando ou perdido |
| "Pode passar aqui", "Amanhã de manhã" | **reunião** | Confirma dia, horário e endereço numa frase. Avise o Brenno com destaque. | reuniao |
| "Não tenho interesse" | não | "Tranquilo, obrigado pela atenção! Se precisar, é só chamar." | perdido |
| "Para de mandar", "Quem te deu meu número?" | não contatar | Pede desculpa em uma linha, diz que não manda mais. | nao_contatar |
| Pergunta fora do roteiro | ? | Responde só o que tem no config/roteiro; o resto, "vou confirmar e já te falo". Avise o Brenno. | respondeu (fica pro Brenno) |

## Na visita (etapa `reuniao`)

O agente não fecha venda por mensagem. Quando marcar, ele lembra o Brenno do roteiro presencial (os 7 passos) e do que levar.
