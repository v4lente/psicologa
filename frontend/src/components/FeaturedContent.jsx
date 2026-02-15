export function FeaturedContent({ contents }) {
  return (
    <section id="conteudos" className="section">
      <div className="container">
        <div className="section-header">
          <p className="overline">Conteudos</p>
          <h2>Destaques para leitura</h2>
        </div>
        <div className="cards-grid">
          {contents.length === 0 && (
            <article className="card">
              <h3>Sem conteudos publicados</h3>
              <p>Publique novos materiais no painel administrativo.</p>
            </article>
          )}
          {contents.map((content) => (
            <article className="card" key={content.id}>
              {content.isFeatured ? <span className="tag">Destaque</span> : null}
              <h3>{content.title}</h3>
              <p>{content.excerpt}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
