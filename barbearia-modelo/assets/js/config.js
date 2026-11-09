// Tudo que muda de uma barbearia para outra fica aqui.
// Este é um SITE DE EXEMPLO da BN Digital: nome e textos são ilustrativos.
// Para um cliente real, troque os campos e apague o aviso de exemplo (exemplo: false).
window.SITE = {
  exemplo: true,
  nome: "Navalha Barbearia",
  cidade: "Macaé - RJ",
  frase: "Corte na régua, barba no capricho.",
  sub: "Agende pelo WhatsApp e seja atendido na hora marcada.",
  whatsapp: "", // só números, ex.: 5522999999999. Vazio = botão leva para a BN Digital.
  instagram: "",
  endereco: { texto: "", mapaUrl: "" },
  horarios: [], // ex.: [["Ter a Sex", "9h às 20h"], ["Sáb", "8h às 18h"]]
  servicos: [
    { nome: "Corte", desc: "Máquina e tesoura, acabamento na navalha", preco: "" },
    { nome: "Barba", desc: "Toalha quente, navalha e hidratação", preco: "" },
    { nome: "Corte + barba", desc: "O combo completo", preco: "" },
    { nome: "Pigmentação", desc: "Disfarça falhas na barba e no cabelo", preco: "" },
    { nome: "Sobrancelha", desc: "Limpeza na navalha", preco: "" },
    { nome: "Pezinho", desc: "Acerto rápido entre um corte e outro", preco: "" }
  ],
  diferenciais: [
    ["Hora marcada", "Você agenda pelo WhatsApp e não fica esperando."],
    ["Navalha descartável", "Lâmina nova em cada cliente."],
    ["Do clássico ao degradê", "Social, militar, americano, low e mid fade."]
  ]
};
