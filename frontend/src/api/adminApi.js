import { apiRequest } from "./client";

export const adminApi = {
  login: (payload) => apiRequest("/auth/login", { method: "POST", body: payload }),
  me: (token) => apiRequest("/auth/me", { token }),

  listAvailabilities: (token) => apiRequest("/admin/availabilities", { token }),
  createAvailability: (token, payload) =>
    apiRequest("/admin/availabilities", { method: "POST", token, body: payload }),
  updateAvailability: (token, id, payload) =>
    apiRequest(`/admin/availabilities/${id}`, { method: "PUT", token, body: payload }),
  deleteAvailability: (token, id) =>
    apiRequest(`/admin/availabilities/${id}`, { method: "DELETE", token }),

  listAppointments: (token, query) => apiRequest("/admin/appointments", { token, query }),
  updateAppointmentStatus: (token, id, status) =>
    apiRequest(`/admin/appointments/${id}/status`, {
      method: "PATCH",
      token,
      body: { status }
    }),

  listContents: (token) => apiRequest("/admin/contents", { token }),
  createContent: (token, payload) =>
    apiRequest("/admin/contents", { method: "POST", token, body: payload }),
  updateContent: (token, id, payload) =>
    apiRequest(`/admin/contents/${id}`, { method: "PUT", token, body: payload }),
  deleteContent: (token, id) =>
    apiRequest(`/admin/contents/${id}`, { method: "DELETE", token }),

  getGoogleIntegrationStatus: (token) =>
    apiRequest("/admin/integrations/google/status", { token }),
  getGoogleAuthUrl: (token, returnTo = "/admin?tab=integrations") =>
    apiRequest("/admin/integrations/google/auth-url", {
      token,
      query: { returnTo }
    }),
  disconnectGoogle: (token) =>
    apiRequest("/admin/integrations/google", { method: "DELETE", token })
};
