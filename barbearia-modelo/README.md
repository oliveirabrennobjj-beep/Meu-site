# Barbearia modelo (site de exemplo da BN Digital)

Site de exemplo para mostrar a barbearias da região. Nome "Navalha Barbearia" e textos são ilustrativos.
HTML, CSS e JS puros, sem build. Sem fotos de propósito: o visual vem da tipografia e do poste de barbeiro.

## Ver
`cd barbearia-modelo && python3 -m http.server 8000` e abra http://localhost:8000.
Publicado (depois do merge na main): https://oliveirabrennobjj-beep.github.io/Meu-site/barbearia-modelo/

## Virar site de cliente
Tudo em `assets/js/config.js`: `nome`, `cidade`, `frase`, `whatsapp`, `instagram`, `endereco`, `horarios`,
`servicos` (preço vazio mostra "Consulte"), `diferenciais`. Troque `exemplo` para `false` (some o aviso amarelo).

## Pendências para um cliente real
- Fotos reais da barbearia (fachada, cadeiras, cortes).
- Preços, horários e endereço confirmados pelo dono.
- Tirar `<meta name="robots" content="noindex">` e pôr `canonical`, `og:image` e JSON-LD `BarberShop`.
