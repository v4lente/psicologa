export function Hero() {
  return (
    <section id="inicio" className="hero">
      <div className="container hero-grid">
        <div>
          <p className="overline">CRP: 07/34396</p>
          <h1>Escuta qualificada para acolher, compreender e transformar.</h1>
          <p>
            Atendimento psicologico com abordagem humanizada. Agende seu horario,
            acompanhe os conteudos em destaque e cuide da sua saude emocional.
          </p>
          <a href="#agendamento" className="btn btn-primary">
            Agendar consulta
          </a>
        </div>
        <div className="hero-card">
          <img
            src="/brand/logo-full.svg"
            alt="Identidade visual da psicologa Thais Coletto"
            className="hero-logo-full"
            width="440"
            height="500"
            loading="eager"
          />
          <p className="hero-card-title">Avaliacao psicologica e atendimento humanizado</p>
        </div>
      </div>
    </section>
  );
}
