import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { adminApi } from "../api/adminApi";

export function AdminIntegrationsPanel({ token }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const callbackState = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return {
      google: params.get("google"),
      message: params.get("message")
    };
  }, [location.search]);

  async function loadStatus() {
    setError("");
    try {
      const data = await adminApi.getGoogleIntegrationStatus(token);
      setStatus(data);
    } catch (loadError) {
      setError(loadError.message);
    }
  }

  useEffect(() => {
    loadStatus();
  }, [token]);

  async function handleConnectGoogle() {
    setLoading(true);
    setError("");
    try {
      const data = await adminApi.getGoogleAuthUrl(token, "/admin?tab=integrations");
      window.location.assign(data.authUrl);
    } catch (connectError) {
      setError(connectError.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDisconnectGoogle() {
    if (!window.confirm("Deseja desconectar a conta Google desta agenda?")) return;
    setLoading(true);
    setError("");
    try {
      await adminApi.disconnectGoogle(token);
      await loadStatus();
    } catch (disconnectError) {
      setError(disconnectError.message);
    } finally {
      setLoading(false);
    }
  }

  function clearCallbackQuery() {
    navigate("/admin?tab=integrations", { replace: true });
  }

  return (
    <section className="admin-card">
      <h3>Integracoes</h3>

      {callbackState.google === "connected" ? (
        <p className="status-msg success">
          Conta Google vinculada com sucesso.
          <button className="inline-link" type="button" onClick={clearCallbackQuery}>
            Ocultar aviso
          </button>
        </p>
      ) : null}
      {callbackState.google === "error" ? (
        <p className="status-msg error">
          Falha ao vincular conta Google: {callbackState.message || "erro desconhecido"}.
          <button className="inline-link" type="button" onClick={clearCallbackQuery}>
            Ocultar aviso
          </button>
        </p>
      ) : null}

      {error ? <p className="status-msg error">{error}</p> : null}

      <article className="integration-box">
        <h4>Google Calendar + Google Meet</h4>
        <p>
          Vincule a conta Google da psicologa para criar automaticamente o evento na
          agenda e gerar link do Google Meet em cada agendamento.
        </p>

        {status?.configured === false ? (
          <p className="status-msg error">{status.message}</p>
        ) : null}

        {status?.configured && status?.connected ? (
          <div>
            <p>
              <strong>Conta conectada:</strong> {status.googleEmail}
            </p>
            <p>
              <strong>Calendario:</strong> {status.calendarId || "primary"}
            </p>
            <button
              className="btn btn-ghost"
              type="button"
              onClick={handleDisconnectGoogle}
              disabled={loading}
            >
              Desconectar Google
            </button>
          </div>
        ) : null}

        {status?.configured && !status?.connected ? (
          <button
            className="btn btn-primary"
            type="button"
            onClick={handleConnectGoogle}
            disabled={loading}
          >
            {loading ? "Conectando..." : "Vincular conta Google"}
          </button>
        ) : null}
      </article>

      <article className="integration-box">
        <h4>WhatsApp Cloud API</h4>
        <p>
          Quando configurado no backend, o sistema envia automaticamente os detalhes
          do agendamento para o WhatsApp informado pelo paciente.
        </p>
        <p>
          Variaveis necessarias: <code>WHATSAPP_ENABLED</code>,{" "}
          <code>WHATSAPP_PHONE_NUMBER_ID</code>, <code>WHATSAPP_ACCESS_TOKEN</code>.
        </p>
      </article>
    </section>
  );
}
