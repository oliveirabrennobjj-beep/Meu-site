// Todos os dados editáveis do site da Barbearia Maya.
// Campo vazio = a parte some do site ou vira "Consulte".
window.SITE = {
  nome: "Barbearia Maya",
  cidade: "Casimiro de Abreu, RJ",
  whatsapp: "5522997738422",
  whatsappVisivel: "(22) 99773-8422",
  mensagemWhatsapp: "Olá! Vim pelo site da Barbearia Maya e gostaria de agendar um horário.",
  instagram: "https://www.instagram.com/_barbeariamaya/",
  instagramVisivel: "@_barbeariamaya",
  endereco: "Rua Pastor Luiz Laurentino da Silva, 816, Loja 05",
  horarios: "Segunda a sábado, das 08h às 19h30",
  mapaBusca: "Barbearia Maya, Rua Pastor Luiz Laurentino da Silva, 816, Casimiro de Abreu, RJ",

  // Serviços: lista sugerida, a confirmar com a barbearia. Preço vazio mostra "Consulte".
  servicos: [
    { nome: "Corte masculino", descricao: "Na máquina e na tesoura, do jeito que você pedir.", preco: "", foto: "s-corte.webp", alt: "Barbeiro penteando e cortando o cabelo de um cliente" },
    { nome: "Degradê", descricao: "Transição limpa nas laterais e na nuca.", preco: "", foto: "s-degrade.webp", alt: "Máquina fazendo o degradê na nuca de um cliente" },
    { nome: "Corte na tesoura", descricao: "Acabamento feito à mão, fio a fio.", preco: "", foto: "s-tesoura.webp", alt: "Tesoura cortando o cabelo preso com presilhas" },
    { nome: "Barba", descricao: "Desenho, aparo e alinhamento.", preco: "", foto: "s-barba.webp", alt: "Barbeiro alinhando a barba de um cliente de olhos fechados" },
    { nome: "Acabamento", descricao: "Pezinho e contornos em dia entre um corte e outro.", preco: "", foto: "s-acabamento.webp", alt: "Máquina de acabamento alinhando o contorno do cabelo" },
    { nome: "Sobrancelha", descricao: "Limpeza e alinhamento discretos.", preco: "", foto: "s-sobrancelha.webp", alt: "Barbeiro trabalhando com a navalha no rosto de um cliente" }
  ],

  // Galeria: fotos reais do Instagram da barbearia (recortes do perfil; trocar pelos arquivos originais).
  galeria: [
    { foto: "ig-1.webp", w: 356, h: 404, alt: "Barbeiro da Barbearia Maya atendendo um cliente na cadeira" },
    { foto: "ig-3.webp", w: 354, h: 473, alt: "Barbeiro da Barbearia Maya segurando a tesoura" },
    { foto: "ig-2.webp", w: 354, h: 404, alt: "Barbeiro e cliente depois do corte na Barbearia Maya" },
    { foto: "ig-4.webp", w: 356, h: 473, alt: "Bancadas e iluminação do salão da Barbearia Maya" }
  ]
};
