// API lives on the landing origin (see root vercel.json). Override via env
// to point at a deployed API when the dashboard runs standalone.
export const API_BASE_URL =
  import.meta.env['VITE_SOME_AURA_DASHBOARD_API_URL'] ?? '';
