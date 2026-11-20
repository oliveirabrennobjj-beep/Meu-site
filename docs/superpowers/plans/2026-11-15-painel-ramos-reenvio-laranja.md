# Painel: ramo certo na prévia, reenvio e visual laranja

Pedido do Brenno em 15/11/2026, depois de usar o painel com lojas de verdade.

## O que resolver

1. **Prévia e mensagem com o ramo errado.** Causa: `temaDe` procurava pedaços de palavra em
   tipo + nome ("Barbosa" virava barbearia, "Cunha" virava salão) e não existiam temas de
   massagem, luta e estética. As mensagens usavam outra lista de ramos, em `leads.ts`.
   - Um catálogo só (`RAMOS` em `leads.ts`): decide pelo tipo; o nome só corrige em casos
     certos (massoterapeuta, CT, "clínica de estética", açaí).
   - `lead.ramo`: escolha do Brenno na ficha e na prévia; vale mais que a detecção.
   - Temas novos com fotos livres (Pexels): massagem, luta, estética. Tema geral com foto neutra.
2. **Botão "AS DUAS" sumia depois do primeiro envio.** Fica sempre na ficha; loja de fora
   também pode reenviar enquanto está em "Enviado".
3. **Dados:** corrigir tipo das lojas com ramo errado, marcar quem respondeu, importar as
   lojas das pesquisas diárias que ainda não entraram.
4. **Visual:** painel escuro com laranja mais espalhado (referências do Pinterest: roxo e verde).
5. **Revisão de bugs** do fluxo de envio.

## Ordem

1. Catálogo de ramos, temas, seletor e reenvio (com teste) → publicar.
2. Dados no banco do Artifact.
3. Visual laranja → publicar.

## Fora do escopo

- Testar número no WhatsApp antes de enviar (só o celular sabe).
- Temas para ramos que ainda não têm loja no painel (pousada, farmácia, ótica).
