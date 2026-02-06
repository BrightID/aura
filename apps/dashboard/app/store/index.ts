import { create } from "zustand"

export const useUser = create<{
  appUserId: string | null
  privateKey: string | null
  updateUserId: (userId: string) => void
  generatePrivateKey: (key: string) => void
}>((set) => ({
  appUserId: null as string | null,
  privateKey: null,
  updateUserId: (userId: string) => set({ appUserId: userId }),
  generatePrivateKey: (key: string) => {
    set({
      privateKey: key,
    })
  },
}))
