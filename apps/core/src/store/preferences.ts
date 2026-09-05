import { makePersisted } from '@solid-primitives/storage';
import { createStore } from 'solid-js/store';
import { AURA_NODE_URL } from '@/shared/lib/urls';

export type Theme = 'dark' | 'light';

export interface PreferencesState {
  baseUrl: string;
  nodeUrls: string[];
  isPrimaryDevice: boolean;
  lastSyncTime: number;
  languageTag: string | null;
  theme: Theme;
}

const DEFAULTS: PreferencesState = {
  baseUrl: AURA_NODE_URL,
  nodeUrls: [AURA_NODE_URL],
  isPrimaryDevice: true,
  lastSyncTime: 0,
  languageTag: null,
  theme: 'dark',
};

const [preferencesStore, setPreferencesStore] = makePersisted(
  createStore<PreferencesState>({ ...DEFAULTS }),
);

// A persisted snapshot from an older app version replaces the defaults
// wholesale, so fields added since then hydrate as undefined — backfill them.
for (const key of Object.keys(DEFAULTS) as (keyof PreferencesState)[]) {
  if (preferencesStore[key] === undefined) {
    setPreferencesStore(key, DEFAULTS[key] as never);
  }
}

export function setTheme(theme: Theme): void {
  setPreferencesStore('theme', theme);
}

export { preferencesStore, setPreferencesStore };
