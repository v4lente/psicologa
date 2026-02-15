import { useEffect, useState } from "react";
import { adminApi } from "../api/adminApi";

const initialForm = {
  title: "",
  excerpt: "",
  body: "",
  isFeatured: false,
  publishedAt: ""
};

const formatDateTimeLocal = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
};

export function AdminContentManager({ token }) {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  async function load() {
    try {
      const data = await adminApi.listContents(token);
      setItems(data);
    } catch (loadError) {
      setError(loadError.message);
    }
  }

  useEffect(() => {
    load();
  }, [token]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    try {
      const payload = {
        ...form,
        publishedAt: form.publishedAt ? new Date(form.publishedAt).toISOString() : null
      };
      if (editingId) {
        await adminApi.updateContent(token, editingId, payload);
      } else {
        await adminApi.createContent(token, payload);
      }
      setForm(initialForm);
      setEditingId(null);
      await load();
    } catch (submitError) {
      setError(submitError.message);
    }
  }

  function handleEdit(item) {
    setEditingId(item.id);
    setForm({
      title: item.title,
      excerpt: item.excerpt,
      body: item.body,
      isFeatured: item.isFeatured,
      publishedAt: formatDateTimeLocal(item.publishedAt)
    });
  }

  async function handleDelete(id) {
    if (!window.confirm("Deseja excluir este conteudo?")) return;
    try {
      await adminApi.deleteContent(token, id);
      await load();
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  return (
    <section className="admin-card">
      <h3>Conteudos em destaque</h3>
      <form className="admin-form vertical" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Titulo"
          value={form.title}
          onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
          required
        />
        <input
          type="text"
          placeholder="Resumo"
          value={form.excerpt}
          onChange={(event) => setForm((prev) => ({ ...prev, excerpt: event.target.value }))}
          required
        />
        <textarea
          placeholder="Conteudo completo"
          rows={6}
          value={form.body}
          onChange={(event) => setForm((prev) => ({ ...prev, body: event.target.value }))}
          required
        />
        <div className="admin-form compact">
          <input
            type="datetime-local"
            value={form.publishedAt}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, publishedAt: event.target.value }))
            }
          />
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, isFeatured: event.target.checked }))
              }
            />
            Destacar
          </label>
          <button className="btn btn-primary" type="submit">
            {editingId ? "Salvar" : "Publicar"}
          </button>
          {editingId ? (
            <button
              className="btn btn-ghost"
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm(initialForm);
              }}
            >
              Cancelar
            </button>
          ) : null}
        </div>
      </form>
      {error ? <p className="status-msg error">{error}</p> : null}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Titulo</th>
              <th>Publicado em</th>
              <th>Destaque</th>
              <th>Acoes</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.title}</td>
                <td>{item.publishedAt ? formatDateTimeLocal(item.publishedAt) : "-"}</td>
                <td>{item.isFeatured ? "Sim" : "Nao"}</td>
                <td className="table-actions">
                  <button type="button" onClick={() => handleEdit(item)}>
                    Editar
                  </button>
                  <button type="button" onClick={() => handleDelete(item.id)}>
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
