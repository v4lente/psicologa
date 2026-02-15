import { apiRequest } from "./client";

export const publicApi = {
  getContents: () => apiRequest("/public/contents"),
  getAvailabilities: () => apiRequest("/public/availabilities"),
  getSlots: (date) => apiRequest("/public/slots", { query: { date } }),
  createAppointment: (payload) =>
    apiRequest("/public/appointments", { method: "POST", body: payload })
};
