import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import localforage from 'localforage';

interface ContactsState {
  storedInfoHashed: { type: string; value: string }[];
}

interface ContactsActions {
  addContactInfo: (info: { type: string; value: string }) => void;
  reset: () => void;
}

const initialState: ContactsState = {
  storedInfoHashed: [],
};

export const useContactsStore = create<ContactsState & ContactsActions>()(
  persist(
    (set) => ({
      ...initialState,
      addContactInfo: (info) =>
        set((s) => ({ storedInfoHashed: [...s.storedInfoHashed, info] })),
      reset: () => set(initialState),
    }),
    { name: 'contacts', storage: createJSONStorage(() => localforage) },
  ),
);
