# Criar site (receita pronta)

Quando o Brenno disser "cria um site para a loja X", siga esta receita sem perguntar qual skill usar.

## 1. O que pedir (só o que faltar)

Nome, segmento, cidade, Instagram, WhatsApp, endereço, horários, produtos/serviços com preço, fotos e logo.
Se não tiver tudo, comece mesmo assim: deixe os campos vazios no arquivo de configuração e avise o que falta.

## 2. Escolher o modelo

| Situação | Comece copiando | Por quê |
|---|---|---|
| Comércio simples (padaria, barbearia, salão, pet shop) | `padaria/` ou a raiz (Barbearia Vértice) | HTML estático, sem build, abre em qualquer lugar |
| Loja com várias unidades ou catálogo | `hortifruti/` | Estático, com várias lojas no `config.js` |
| Site mais caprichado, com animação e componentes | `bn-digital/` ou `brteam/` | React + Tailwind v4 + shadcn |
| Prévia rápida para mandar ao cliente ("modelo grátis") | `demos/` | Um `index.html` só |

Pasta nova = nome do cliente em minúsculas com hífen (ex.: `duga-burguer/`).

## 3. Skills (usar direto)

1. `frontend-design` + `ui-ux-pro-max`: direção visual (cores, fontes, estilo) que combine com o segmento.
2. `copywriting`: textos que vendem, sem cara de IA.
3. `impeccable`: acabamento e revisão do visual.
4. `seo-audit`: título, descrição, dados do Google (LocalBusiness).
5. `webapp-testing`: abrir no celular (390 px) e no computador e tirar print.
6. `verification-before-completion`: só dizer "pronto" depois de testar.

## 4. Padrão de todo site

- Dados do negócio num arquivo só (`assets/js/config.js`).
- Botão de WhatsApp com mensagem pronta em todo lugar que vende.
- Celular primeiro; fotos em WebP; fontes locais.
- `README.md` na pasta explicando onde mudar cada coisa.
- Print do celular e do computador em `docs/` da pasta.
- Link publicado: `https://oliveirabrennobjj-beep.github.io/Meu-site/<pasta>/`.

## 5. Depois de pronto

- Mandar o link para o Brenno testar no celular dele.
- Se for para vender a placa junto, lembrar da `memoria/placa-nfc.md`.

## Preferências do Brenno (acrescente aqui)

-
