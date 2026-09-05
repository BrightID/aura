/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AURA_EMBED_BASE_URL?: string;
  readonly VITE_AURA_PROJECT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
