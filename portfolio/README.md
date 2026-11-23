# Portfólio da BN Digital

Página que junta todos os sites prontos, com print de computador e de celular de cada um.
HTML, CSS e JS puros, sem build.

No ar (depois do merge na `main`): <https://oliveirabrennobjj-beep.github.io/Meu-site/portfolio/>

## Link filtrado por ramo

O filtro fica no endereço. Mande ao cliente o link do ramo dele:

| Ramo | Link |
|---|---|
| Barbearia | `…/portfolio/#barbearia` |
| Lanches e hambúrguer | `…/portfolio/#lanches` |
| Café, padaria e açaí | `…/portfolio/#cafe` |
| Lojas e marcas | `…/portfolio/#lojas` |
| Saúde e esporte | `…/portfolio/#saude` |
| Serviços e cursos | `…/portfolio/#servicos` |

## Acrescentar um site

1. Tire os prints (computador 1440x900 e celular 390x844) e salve em `assets/img/` como
   `<nome>-pc.webp` (1200x750), `<nome>-pc-640.webp` (640x400) e `<nome>-cel.webp` (390x844).
2. Em `index.html`, copie um `<li class="obra">` inteiro e troque link, nomes, `data-ramo` e imagens.
   Para um site de exemplo, deixe `<span class="selo">Modelo</span>` no nome.
3. Atualize os números dos botões de ramo e o total no texto do topo.
4. Se a pasta do site for nova, acrescente-a no passo "Junta os sites" de `.github/workflows/publicar-bn-digital.yml`.

## De onde veio cada site

- Já estavam no repositório: Vértice (raiz), Maya, Navalha, Carvão, Burgeria, Açaí do Rei, Padaria BNH,
  Kitanda, BR Team, Studio Amo, Prumo, Orvel Abysse, Raio-X.
- Trazidos de outros branches: Your*peel (`ccr-a13b1e72-7rn46l`), Galaxy S26 Ultra (`ccr-234bd6b5-diioy7`),
  Guia Casimiro (`ccr-a782782c-2zcnrg`, não entra no portfólio).
- Baixados dos artifacts do Claude (que são privados e não abrem para o cliente): X Cocó Lanches,
  Ótica Ximenes, Bela Cafeteria, Brasa 77, Maison Valère.

Ficaram de fora: Padaria Casa do Trigo e o artifact "Barbearia Modelo" (cópias da Padaria BNH e da Vértice),
"Comercial Smash Mania" (é um vídeo animado, não site) e Parada do Pastel (só existe o print no site da BN Digital).
