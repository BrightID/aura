// The widget can run cross-origin (embedded via the SDK on third-party
// sites), so a same-origin relative path won't resolve correctly here — it
// needs an absolute URL to the core app on the unified domain.
// NOTE: aura.brightid.org/core is the deployed core app.
export const CORE_APP_URL = 'https://aura.brightid.org/core';
