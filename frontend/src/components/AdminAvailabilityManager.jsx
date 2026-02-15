import { useEffect, useState } from "react";
import { adminApi } from "../api/adminApi";

const weekdayOptions = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Segunda" },
  { value: 2, label: "Terca" },
  { value: 3, label: "Quarta" },
  { value: 4, label: "Quinta" },
  { value: 5, label: "Sexta" },
  { value: 6, label: "Sabado" }
];

const initialForm = {
  weekday: 1,
  startTime: "08:00",
  endTime: "12:00",
  slotMinutes: 50,
  isActive: true
};

export function AdminAvailabilityManager({ token }) {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  async function load() {
    try {
      const data = await adminApi.listAvailabilities(token);
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
      if (editingId) {
        await adminApi.updateAvailability(token, editingId, form);
      } else {
        await adminApi.createAvailability(token, form);
      }
      setForm(initialForm);
      setEditingId(null);
      await load();
    } catch (submitError) {
      setError(submitError.message);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Deseja remover esta disponibilidade?")) return;
    try {
      await adminApi.deleteAvailability(token, id);
      await load();
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  function handleEdit(item) {
    setEditingId(item.id);
    setForm({
      weekday: item.weekday,
      startTime: item.startTime,
      endTime: item.endTime,
      slotMinutes: item.slotMinutes,
      isActive: Boolean(item.isActive)
    });
  }

  return (
    <section className="admin-card">
      <h3>Disponibilidade da agenda</h3>
      <form className="admin-form" onSubmit={handleSubmit}>
        <select
          value={form.weekday}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, weekday: Number(event.target.value) }))
          }
        >
          {weekdayOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <input
          type="time"
          value={form.startTime}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, startTime: event.target.value }))
          }
          required
        />
        <input
          type="time"
          value={form.endTime}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, endTime: event.target.value }))
          }
          required
        />
        <input
          type="number"
          min={20}
          max={120}
          value={form.slotMinutes}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, slotMinutes: Number(event.target.value) }))
          }
          required
        />
        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, isActive: event.target.checked }))
            }
          />
          Ativo
        </label>
        <button type="submit" className="btn btn-primary">
          {editingId ? "Salvar" : "Adicionar"}
        </button>
        {editingId ? (
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              setEditingId(null);
              setForm(initialForm);
            }}
          >
            Cancelar
          </button>
        ) : null}
      </form>
      {error ? <p className="status-msg error">{error}</p> : null}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Dia</th>
              <th>Inicio</th>
              <th>Fim</th>
              <th>Slot</th>
              <th>Status</th>
              <th>Acoes</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{weekdayOptions.find((option) => option.value === item.weekday)?.label}</td>
                <td>{item.startTime}</td>
                <td>{item.endTime}</td>
                <td>{item.slotMinutes} min</td>
                <td>{item.isActive ? "Ativo" : "Inativo"}</td>
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
