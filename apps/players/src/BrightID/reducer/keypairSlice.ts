import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RESET_STORE } from '@/BrightID/actions/resetStore';
import { RootState } from 'store';

const initialState: { publicKey: string; secretKey: string } = {
  publicKey: '',
  secretKey: '', // Use Base64-encoded string to make it serializable
};

const keypairSlice = createSlice({
  name: 'keypair',
  initialState,
  reducers: {
    setKeypair(state, action: PayloadAction<Keypair>) {
      const { publicKey, secretKey } = action.payload;
      state.publicKey = publicKey;
      state.secretKey = btoa(String.fromCharCode(...new Uint8Array(secretKey))); // Convert Uint8Array to Base64
    },
  },
  extraReducers: (builder) => {
    builder.addCase(RESET_STORE, () => {
      return initialState;
    });
  },
});

// Export channel actions
export const { setKeypair } = keypairSlice.actions;

// Export selectors
export const selectKeypair = createSelector(
  (state: RootState) => state.keypair,
  (keypair) => ({
    publicKey: keypair.publicKey,
    secretKey: (() => {
      try {
        return keypair.secretKey
          ? new Uint8Array(
              atob(keypair.secretKey)
                .split('')
                .map((char) => char.charCodeAt(0)),
            )
          : null;
      } catch {
        return new Uint8Array(
          keypair.secretKey.split('').map((char) => char.charCodeAt(0)),
        );
      }
    })(),
  }),
);

// Export reducer
export default keypairSlice.reducer;
