/**
 * Slide animado da Barbearia Modelo: o topo e a base dourados vêm da imagem original,
 * o tubo listrado gira em CSS e os textos são HTML (nítidos em qualquer tamanho).
 */
export function BarberPoleSlide() {
  return (
    <div className="pole-slide" role="img" aria-label="Tela de entrada do site da Barbearia Modelo: poste de barbeiro dourado com as listras girando e o botão Entrar">
      <img src="trabalhos/poste-topo.webp" alt="" className="pole-slide__top" />
      <div className="pole-slide__mid" aria-hidden="true">
        <div className="pole-slide__tube">
          <div className="pole-slide__stripes" />
          <div className="pole-slide__glass" />
        </div>
      </div>
      <img src="trabalhos/poste-base.webp" alt="" className="pole-slide__base" />
      <div className="pole-slide__text" aria-hidden="true">
        <p className="pole-slide__name">
          BARBEARIA
          <br />
          MODELO
        </p>
        <p className="pole-slide__sub">Barbearia clássica</p>
        <span className="pole-slide__btn">ENTRAR</span>
      </div>
    </div>
  );
}
