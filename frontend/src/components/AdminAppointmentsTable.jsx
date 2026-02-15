import { useEffect, useState } from "react";
import { adminApi } from "../api/adminApi";

const statusOptions = ["scheduled", "confirmed", "cancelled", "completed"];
const formatDate = (value) => {
  if (!value) return "-";
  const raw = String(value);
  if (raw.includes("T")) {
    return raw.slice(0, 10);
  }
  return raw;
};

export function AdminAppointmentsTable({ token }) {
  const [items, setItems] = useState([]);
  const [filters, setFilters] = useState({ dateFrom: "", dateTo: "", status: "" });
  const [error, setError] = useState("");

  async function load() {
    try {
      const data = await adminApi.listAppointments(token, filters);
      setItems(data);
    } catch (loadError) {
      setError(loadError.message);
    }
  }

  useEffect(() => {
    load();
  }, [token]);

  async function handleFilter(event) {
    event.preventDefault();
    await load();
  }

  async function handleStatusChange(id, status) {
    try {
      await adminApi.updateAppointmentStatus(token, id, status);
      await load();
    } catch (statusError) {
      setError(statusError.message);
    }
  }

  return (
    <section className="admin-card">
      <h3>Agendamentos</h3>
      <form className="admin-form compact" onSubmit={handleFilter}>
        <input
          type="date"
          value={filters.dateFrom}
          onChange={(event) =>
            setFilters((prev) => ({ ...prev, dateFrom: event.target.value }))
          }
        />
        <input
          type="date"
          value={filters.dateTo}
          onChange={(event) =>
            setFilters((prev) => ({ ...prev, dateTo: event.target.value }))
          }
        />
        <select
          value={filters.status}
          onChange={(event) =>
            setFilters((prev) => ({ ...prev, status: event.target.value }))
          }
        >
          <option value="">Todos os status</option>
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <button className="btn btn-primary" type="submit">
          Filtrar
        </button>
      </form>
      {error ? <p className="status-msg error">{error}</p> : null}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Paciente</th>
              <th>Contato</th>
              <th>Data</th>
              <th>Horario</th>
              <th>Meet</th>
              <th>Integracoes</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>
                  {item.patientName}
                  <br />
                  <small>{item.notes || "-"}</small>
                </td>
                <td>
                  {item.email}
                  <br />
                  {item.phone}
                </td>
                <td>{formatDate(item.date)}</td>
                <td>
                  {item.startTime} - {item.endTime}
                </td>
                <td>
                  {item.googleMeetLink ? (
                    <a href={item.googleMeetLink} target="_blank" rel="noreferrer">
                      Abrir link
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
                <td>
                  <small>Google: {item.googleCalendarStatus || "-"}</small>
                  <br />
                  <small>WhatsApp: {item.whatsappStatus || "-"}</small>
                </td>
                <td>
                  <select
                    value={item.status}
                    onChange={(event) =>
                      handleStatusChange(item.id, event.target.value)
                    }
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
