// Landing origin hosts /api (see root vercel.json).
// Prod always uses the canonical domain so the Vercel alias
// (aura-get-verified.vercel.app) never leaks into client fetches.
// Dev can override via env to hit a deployed API when running standalone.
const CANONICAL_API_ORIGIN = 'https://aura.brightid.org';

export const API_BASE_URL = import.meta.env.DEV
  ? (import.meta.env['VITE_SOME_AURA_DASHBOARD_API_URL'] ?? '')
  : CANONICAL_API_ORIGIN;
