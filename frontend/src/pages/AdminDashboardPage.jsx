import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AdminAppointmentsTable } from "../components/AdminAppointmentsTable";
import { AdminAvailabilityManager } from "../components/AdminAvailabilityManager";
import { AdminContentManager } from "../components/AdminContentManager";
import { AdminIntegrationsPanel } from "../components/AdminIntegrationsPanel";
import { useAuth } from "../context/AuthContext";

const tabs = [
  { id: "appointments", label: "Agendamentos" },
  { id: "availability", label: "Disponibilidade" },
  { id: "content", label: "Conteudos" },
  { id: "integrations", label: "Integracoes" }
];

export function AdminDashboardPage() {
  const { token, user, logout } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialTab = useMemo(() => {
    const tab = searchParams.get("tab");
    return tabs.some((item) => item.id === tab) ? tab : "appointments";
  }, [searchParams]);
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  function handleTabChange(tabId) {
    setActiveTab(tabId);
    const next = new URLSearchParams(searchParams.toString());
    next.set("tab", tabId);
    navigate(`/admin?${next.toString()}`, { replace: true });
  }

  return (
    <main className="admin-page">
      <section className="container">
        <header className="admin-header">
          <div>
            <p className="overline">Painel administrativo</p>
            <h1>Ola, {user?.name || "Admin"}</h1>
          </div>
          <button className="btn btn-ghost" type="button" onClick={logout}>
            Sair
          </button>
        </header>

        <div className="tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={activeTab === tab.id ? "active" : ""}
              onClick={() => handleTabChange(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "appointments" ? <AdminAppointmentsTable token={token} /> : null}
        {activeTab === "availability" ? <AdminAvailabilityManager token={token} /> : null}
        {activeTab === "content" ? <AdminContentManager token={token} /> : null}
        {activeTab === "integrations" ? <AdminIntegrationsPanel token={token} /> : null}
      </section>
    </main>
  );
}
