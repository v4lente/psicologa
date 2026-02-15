export function Footer() {
  return (
    <footer id="contato" className="site-footer">
      <div className="container footer-grid">
        <div>
          <img
            src="/brand/logo-mark.svg"
            alt="Simbolo da marca Thais Coletto"
            className="footer-brand-mark"
            width="84"
            height="68"
            loading="lazy"
          />
          <p className="brand-main">THAIS COLETTO</p>
          <p>Atendimento psicologico acolhedor e baseado em evidencia.</p>
        </div>
        <div>
          <h4>Fale conosco</h4>
          <p>Email: contato@thaiscoletto.com.br</p>
          <p>WhatsApp: (00) 00000-0000</p>
        </div>
        <div>
          <h4>Redes sociais</h4>
          <p>Instagram: @thaiscoletto</p>
          <p>LinkedIn: /thaiscoletto</p>
        </div>
      </div>
      <div className="container footer-bottom">
        <small>(c) {new Date().getFullYear()} Thais Coletto. Todos os direitos reservados.</small>
      </div>
    </footer>
  );
}
