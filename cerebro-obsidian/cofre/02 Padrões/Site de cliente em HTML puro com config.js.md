---
tipo: padrao
projetos: ["[[Meu-site]]"]
tags: ["cerebro/padrao", "site", "bn-digital"]
criado: 2026-11-02
atualizado: 2026-11-02
resumo: "Sites de clientes: HTML, CSS e JS puros, sem build, com todos os dados editáveis em assets/js/config.js."
---
# Site de cliente em HTML puro com config.js

## Quando usar
Todo site novo de comércio local da BN Digital (açaiteria, padaria, barbearia, academia…).

## Como fazer
```
<pasta>/
  index.html
  README.md               como ver, onde mudar, pendências
  PRODUCT.md, DESIGN.md
  assets/css/styles.css   cores e fontes no topo (:root)
  assets/js/config.js     TODOS os dados editáveis (window.SITE = {...})
  assets/js/main.js       lê o config e monta as partes dinâmicas
  assets/img/             fotos em WebP
```
- Campo vazio no `config.js` = a parte some do site (ou vira "Consulte pelo WhatsApp").
- Botão de WhatsApp: `https://wa.me/55DDDNUMERO?text=<mensagem codificada>`.

## Por que funciona
O dono (ou o Brenno pelo celular) muda preço, horário e telefone num arquivo só, sem quebrar o layout, e o site abre rápido sem framework.

Ver também: [[Fotos em WebP com srcset e lazy]], [[Checklist de site para comércio local]].
