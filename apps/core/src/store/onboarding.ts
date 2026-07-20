import { makePersisted } from "@solid-primitives/storage"
import { createStore } from "solid-js/store"

export interface OnboardingState {
  onboardingShown: boolean
  getStartedShown: boolean
}

const [onboardingStore, setOnboardingStore] = makePersisted(
  createStore<OnboardingState>({
    onboardingShown: false,
    getStartedShown: false,
  }),
)

export { onboardingStore, setOnboardingStore }
