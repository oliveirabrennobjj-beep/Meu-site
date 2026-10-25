# Raio-X das Coisas: página do minicurso

Página de vendas do minicurso "Raio-X: vídeos de curiosidade com IA", pensada para o link na bio do
Instagram e do TikTok @raiox.dascoisas. É estática (HTML, CSS e JavaScript), sem etapa de build.

## Antes de publicar

Edite `assets/js/config.js`:

- `checkoutUrl`: o link de pagamento (Kiwify, Hotmart, Eduzz...). Vazio, os botões abrem o Direct do Instagram.
- `preco`, `precoAntigo` e `parcelas`: copie os valores que o checkout mostrar.
- `acesso`: o tempo de acesso que você configurar na plataforma.

A garantia de 7 dias da página segue o direito de arrependimento do Código de Defesa do Consumidor
para compras pela internet. Configure o mesmo prazo na plataforma de pagamento.

## Como visualizar

```bash
cd raiox-das-coisas
python3 -m http.server 8000
```

Depois, abra <http://localhost:8000>.
