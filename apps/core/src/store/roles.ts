import { makePersisted } from "@solid-primitives/storage"
import { createStore } from "solid-js/store"

export interface RolesState {
  hasManagerRole: boolean
  hasTrainerRole: boolean
}

const [rolesStore, setRolesStore] = makePersisted(
  createStore<RolesState>({
    hasManagerRole: false,
    hasTrainerRole: false,
  }),
)

export { rolesStore, setRolesStore }
