import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import { useEffect, useMemo, useState } from "react";
import { publicApi } from "../api/publicApi";

dayjs.locale("pt-br");

const weekdayLabels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

function buildMonthGrid(month) {
  const start = month.startOf("month").startOf("week");
  const end = month.endOf("month").endOf("week");
  const dates = [];
  let cursor = start;
  while (cursor.isBefore(end) || cursor.isSame(end, "day")) {
    dates.push(cursor);
    cursor = cursor.add(1, "day");
  }
  return dates;
}

export function BookingCalendar() {
  const today = dayjs().startOf("day");
  const [visibleMonth, setVisibleMonth] = useState(today.startOf("month"));
  const [selectedDate, setSelectedDate] = useState(today.format("YYYY-MM-DD"));
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [form, setForm] = useState({
    patientName: "",
    email: "",
    phone: "",
    notes: ""
  });

  const days = useMemo(() => buildMonthGrid(visibleMonth), [visibleMonth]);

  useEffect(() => {
    let active = true;
    async function fetchSlots() {
      setLoadingSlots(true);
      setSelectedSlot("");
      try {
        const data = await publicApi.getSlots(selectedDate);
        if (!active) return;
        setSlots(data);
      } catch (error) {
        if (!active) return;
        setSlots([]);
        setStatus({ type: "error", message: error.message });
      } finally {
        if (active) {
          setLoadingSlots(false);
        }
      }
    }
    fetchSlots();
    return () => {
      active = false;
    };
  }, [selectedDate]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!selectedSlot) {
      setStatus({ type: "error", message: "Selecione um horario disponivel." });
      return;
    }

    try {
      const appointment = await publicApi.createAppointment({
        ...form,
        date: selectedDate,
        startTime: selectedSlot
      });
      const infoParts = [];
      if (appointment.googleCalendarStatus === "created") {
        infoParts.push("Evento criado no Google Agenda.");
      }
      if (appointment.whatsappStatus === "sent") {
        infoParts.push("Detalhes enviados no WhatsApp.");
      }
      if (appointment.meetLink) {
        infoParts.push(`Link Meet: ${appointment.meetLink}`);
      }
      setStatus({
        type: "success",
        message: `Agendamento realizado com sucesso. ${infoParts.join(" ")}`
      });
      setForm({ patientName: "", email: "", phone: "", notes: "" });
      setSelectedSlot("");
      const data = await publicApi.getSlots(selectedDate);
      setSlots(data);
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    }
  }

  return (
    <section id="agendamento" className="section section-highlight">
      <div className="container">
        <div className="section-header">
          <p className="overline">Agendamento</p>
          <h2>Escolha o melhor horario para seu atendimento</h2>
        </div>

        <div className="booking-layout">
          <article className="panel">
            <div className="calendar-head">
              <button
                className="btn btn-ghost"
                type="button"
                onClick={() => setVisibleMonth((prev) => prev.subtract(1, "month"))}
              >
                Anterior
              </button>
              <strong>{visibleMonth.format("MMMM [de] YYYY")}</strong>
              <button
                className="btn btn-ghost"
                type="button"
                onClick={() => setVisibleMonth((prev) => prev.add(1, "month"))}
              >
                Proximo
              </button>
            </div>

            <div className="calendar-grid">
              {weekdayLabels.map((day) => (
                <div key={day} className="weekday">
                  {day}
                </div>
              ))}
              {days.map((date) => {
                const iso = date.format("YYYY-MM-DD");
                const isCurrentMonth = date.month() === visibleMonth.month();
                const isDisabled = date.isBefore(today);
                const isSelected = iso === selectedDate;
                return (
                  <button
                    key={iso}
                    type="button"
                    className={`day-btn ${isSelected ? "selected" : ""}`}
                    disabled={!isCurrentMonth || isDisabled}
                    onClick={() => setSelectedDate(iso)}
                  >
                    {date.format("DD")}
                  </button>
                );
              })}
            </div>
          </article>

          <article className="panel">
            <p className="slot-title">
              Horarios em {dayjs(selectedDate).format("DD/MM/YYYY")}
            </p>
            {loadingSlots ? <p>Carregando horarios...</p> : null}
            {!loadingSlots && slots.length === 0 ? (
              <p>Sem horarios disponiveis para esta data.</p>
            ) : null}
            <div className="slot-grid">
              {slots.map((slot) => (
                <button
                  key={slot.startTime}
                  type="button"
                  className={`slot-btn ${
                    selectedSlot === slot.startTime ? "selected" : ""
                  }`}
                  disabled={!slot.isAvailable}
                  onClick={() => setSelectedSlot(slot.startTime)}
                >
                  {slot.startTime}
                </button>
              ))}
            </div>

            <form className="booking-form" onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Nome completo"
                value={form.patientName}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, patientName: event.target.value }))
                }
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, email: event.target.value }))
                }
                required
              />
              <input
                type="tel"
                placeholder="Telefone"
                value={form.phone}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, phone: event.target.value }))
                }
                required
              />
              <textarea
                placeholder="Observacoes (opcional)"
                value={form.notes}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, notes: event.target.value }))
                }
                rows={4}
              />
              <button className="btn btn-primary" type="submit">
                Confirmar agendamento
              </button>
            </form>
            {status.message ? (
              <p className={`status-msg ${status.type}`}>{status.message}</p>
            ) : null}
          </article>
        </div>
      </div>
    </section>
  );
}
