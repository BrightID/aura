import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import localforage from 'localforage';

interface KeypairState {
  publicKey: string;
  secretKey: string; // Base64-encoded
}

interface KeypairActions {
  setKeypair: (keypair: { publicKey: string; secretKey: Uint8Array }) => void;
  reset: () => void;
}

const initialState: KeypairState = {
  publicKey: '',
  secretKey: '',
};

export const useKeypairStore = create<KeypairState & KeypairActions>()(
  persist(
    (set) => ({
      ...initialState,
      setKeypair: ({ publicKey, secretKey }) =>
        set({
          publicKey,
          secretKey: btoa(String.fromCharCode(...new Uint8Array(secretKey))),
        }),
      reset: () => set(initialState),
    }),
    { name: 'keypair', storage: createJSONStorage(() => localforage) },
  ),
);

export const selectKeypair = () => {
  const { publicKey, secretKey } = useKeypairStore.getState();
  return {
    publicKey,
    secretKey: (() => {
      try {
        return secretKey
          ? new Uint8Array(
              atob(secretKey)
                .split('')
                .map((c) => c.charCodeAt(0)),
            )
          : null;
      } catch {
        return new Uint8Array(secretKey.split('').map((c) => c.charCodeAt(0)));
      }
    })(),
  };
};
