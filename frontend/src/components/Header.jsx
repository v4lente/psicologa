export function Header() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <a className="brand" href="#inicio" aria-label="Inicio - Thais Coletto Psicologa">
          <img
            className="brand-image"
            src="/brand/logo-horizontal.svg"
            alt="Logo Thais Coletto Psicologa"
            width="340"
            height="88"
          />
        </a>
        <nav className="top-nav">
          <a href="#agendamento">Agendamento</a>
          <a href="#conteudos">Conteudos</a>
          <a href="#contato">Contato</a>
          <a href="/admin/login">Admin</a>
        </nav>
      </div>
    </header>
  );
}
