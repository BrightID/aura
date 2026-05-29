import { makePersisted } from "@solid-primitives/storage"
import { createStore } from "solid-js/store"
import { AURA_NODE_URL_PROXY } from "@/shared/lib/urls"

export type Theme = "dark" | "light"

export interface PreferencesState {
  baseUrl: string
  nodeUrls: string[]
  isPrimaryDevice: boolean
  lastSyncTime: number
  languageTag: string | null
  theme: Theme
}

const [preferencesStore, setPreferencesStore] = makePersisted(
  createStore<PreferencesState>({
    baseUrl: AURA_NODE_URL_PROXY,
    nodeUrls: [AURA_NODE_URL_PROXY],
    isPrimaryDevice: true,
    lastSyncTime: 0,
    languageTag: null,
    theme: "dark",
  }),
)

export { preferencesStore, setPreferencesStore }
