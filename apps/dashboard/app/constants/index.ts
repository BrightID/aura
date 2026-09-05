// The interface API lives on the same origin when deployed together
// (see root vercel.json). Override via env to point at a deployed API.
export const API_BASE_URL =
  import.meta.env['VITE_SOME_AURA_DASHBOARD_API_URL'] ?? '';
