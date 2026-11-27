/*
  PRODUTOS — é só mexer aqui. O layout não muda. (Sem combos: o depósito não vende combo.)

  Cada produto:
    nome        "Heineken"
    categoria   um dos ids de CATEGORIAS abaixo
    tamanho     "Long neck 330 ml", "Lata 350 ml", "Fardo 12 un"...
    preco       "8,90"  (vazio "" mostra "Preço a confirmar")
    precoAntigo "9,90"  (opcional: aparece riscado e com selo de desconto)
    foto        nome do arquivo em assets/img/produtos, sem .webp
    destaque    true = aparece em "Mais pedidos"
    disponivel  false = aparece como "Esgotado" (o painel do dono faz isso sem mexer aqui)

  Foto nova: imagem em fundo branco, salva em assets/img/produtos/<nome>.webp
  Depois de mexer: rode  node deposito-do-gordinho/montar.mjs  (atualiza a página
  para quem abre sem JavaScript). Se esquecer, o site mostra a lista nova do mesmo jeito.
*/
var CATEGORIAS = [
  { id: "cervejas", nome: "Cervejas", foto: "brahma" },
  { id: "destilados", nome: "Destilados", foto: "redlabel" },
  { id: "vinhos", nome: "Vinhos", foto: "pergola" },
  { id: "refrigerantes", nome: "Refrigerantes", foto: "coca" },
  { id: "energeticos", nome: "Energéticos", foto: "redbull" },
  { id: "agua-gelo", nome: "Água e gelo", foto: "gelo" },
  { id: "carvao-outros", nome: "Carvão e outros", foto: "carvao" }
];

var PRODUTOS = [
  { nome: "Heineken", categoria: "cervejas", tamanho: "Long neck 330 ml", preco: "", precoAntigo: "", foto: "heineken", destaque: true },
  { nome: "Brahma Chopp", categoria: "cervejas", tamanho: "Garrafa 600 ml", preco: "", precoAntigo: "", foto: "brahma", destaque: true },
  { nome: "Original", categoria: "cervejas", tamanho: "Garrafa 600 ml", preco: "", precoAntigo: "", foto: "original", destaque: true },
  { nome: "Skol", categoria: "cervejas", tamanho: "Lata 350 ml", preco: "", precoAntigo: "", foto: "skol", destaque: true },
  { nome: "Antarctica Pilsen", categoria: "cervejas", tamanho: "Garrafa 600 ml", preco: "", precoAntigo: "", foto: "antarctica", destaque: false },
  { nome: "Bohemia", categoria: "cervejas", tamanho: "Garrafa 600 ml", preco: "", precoAntigo: "", foto: "bohemia", destaque: false },
  { nome: "Brahma Duplo Malte", categoria: "cervejas", tamanho: "Latão 473 ml", preco: "", precoAntigo: "", foto: "duplomalte", destaque: false },
  { nome: "Amstel", categoria: "cervejas", tamanho: "Lata 350 ml", preco: "", precoAntigo: "", foto: "amstel", destaque: false },
  { nome: "Spaten", categoria: "cervejas", tamanho: "Long neck 355 ml", preco: "", precoAntigo: "", foto: "spaten", destaque: false },

  { nome: "Johnnie Walker Red Label", categoria: "destilados", tamanho: "Garrafa 1 L", preco: "", precoAntigo: "", foto: "redlabel", destaque: true },
  { nome: "Vodka Smirnoff", categoria: "destilados", tamanho: "Garrafa 998 ml", preco: "", precoAntigo: "", foto: "smirnoff", destaque: false },
  { nome: "Cachaça 51", categoria: "destilados", tamanho: "Garrafa 965 ml", preco: "", precoAntigo: "", foto: "cachaca51", destaque: false },
  { nome: "Conhaque Dreher", categoria: "destilados", tamanho: "Garrafa 900 ml", preco: "", precoAntigo: "", foto: "dreher", destaque: false },

  { nome: "Vinho Pérgola Tinto Suave", categoria: "vinhos", tamanho: "Garrafa 1 L", preco: "", precoAntigo: "", foto: "pergola", destaque: false },
  { nome: "Breez Cooler", categoria: "vinhos", tamanho: "Garrafa 275 ml", preco: "", precoAntigo: "", foto: "breez", destaque: false },
  { nome: "Smirnoff Ice", categoria: "vinhos", tamanho: "Long neck 275 ml", preco: "", precoAntigo: "", foto: "ice", destaque: false },

  { nome: "Coca-Cola", categoria: "refrigerantes", tamanho: "Garrafa 2 L", preco: "", precoAntigo: "", foto: "coca", destaque: true },
  { nome: "Guaraná Antarctica", categoria: "refrigerantes", tamanho: "Garrafa 2 L", preco: "", precoAntigo: "", foto: "guarana", destaque: false },

  { nome: "Red Bull", categoria: "energeticos", tamanho: "Lata 250 ml", preco: "", precoAntigo: "", foto: "redbull", destaque: true },
  { nome: "Monster Energy", categoria: "energeticos", tamanho: "Lata 473 ml", preco: "", precoAntigo: "", foto: "monster", destaque: false },

  { nome: "Gelo em cubos", categoria: "agua-gelo", tamanho: "Saco 5 kg", preco: "", precoAntigo: "", foto: "gelo", destaque: true },
  { nome: "Água Crystal", categoria: "agua-gelo", tamanho: "Garrafa 500 ml", preco: "", precoAntigo: "", foto: "agua", destaque: false },

  { nome: "Carvão vegetal", categoria: "carvao-outros", tamanho: "Saco 3 kg", preco: "", precoAntigo: "", foto: "carvao", destaque: false },
  { nome: "Ruffles Original", categoria: "carvao-outros", tamanho: "Pacote", preco: "", precoAntigo: "", foto: "ruffles", destaque: false },
  { nome: "Amendoim japonês Dori", categoria: "carvao-outros", tamanho: "Pacote", preco: "", precoAntigo: "", foto: "amendoim", destaque: false },
  { nome: "Paçoquita", categoria: "carvao-outros", tamanho: "Pote", preco: "", precoAntigo: "", foto: "pacoca", destaque: false },
  { nome: "Balas Fini", categoria: "carvao-outros", tamanho: "Pacote", preco: "", precoAntigo: "", foto: "bala", destaque: false }
];

if (typeof module !== "undefined") module.exports = { CATEGORIAS: CATEGORIAS, PRODUTOS: PRODUTOS };
