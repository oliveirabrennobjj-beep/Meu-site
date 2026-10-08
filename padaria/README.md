# Padaria BNH — site

Site estático (HTML, CSS e JS, sem build) da Padaria BNH, em Casimiro de Abreu (RJ).

## Ver no computador

```bash
cd padaria
python3 -m http.server 8000
```

Abra <http://localhost:8000>.

## Onde mudar as coisas

Tudo em `assets/js/config.js`:

| O que | Campo |
|---|---|
| Link de pedidos (anota.ai) | `contato.pedidoUrl` |
| WhatsApp (só números, ex. `5522999999999`) | `contato.whatsapp` — quando preenchido, aparece o botão "Chamar no WhatsApp" |
| Endereço e link do mapa | `endereco.texto`, `endereco.mapaUrl` |
| Horários | `horarios` |
| Aviso de entrega | `avisoEntrega` |
| Vitrine "Mais pedidos" | `destaques` (nome, desc, preco, img, selo) |
| Cardápio por abas | `cardapio` |

Preço vazio aparece como "Consulte". Os preços preenchidos vieram dos posts da padaria
(croissant R$ 11,99, rabanada c/ cobertura R$ 7,00, bolo crocante R$ 8,50).

## Visual

- Cores e fontes no topo de `assets/css/styles.css` (`:root`).
- Fontes: Fraunces (títulos), Karla (texto), Caveat (só a frase de giz do festival).
- Estrutura inspirada no sistema da Starbucks (`awesome-design-md/design-md/starbucks`):
  faixas creme e café alternadas, botões em pílula e botão flutuante de pedido,
  trocando o verde pelas cores do selo da BNH.
- Fotos em `assets/img/` foram recortadas dos posts e stories da própria padaria.
  Para trocar uma foto, salve `nome-480.webp` e `nome-960.webp` e use `nome` no campo `img`.
