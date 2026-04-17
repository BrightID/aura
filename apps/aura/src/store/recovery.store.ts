import { create } from 'zustand';
import { RecoveryErrorType } from '@/BrightID/components/Onboarding/RecoveryFlow/RecoveryError';
import { recover_steps, RECOVERY_CHANNEL_TTL } from '@/BrightID/utils/constants';
import { uInt8ArrayToB64 } from '@/BrightID/utils/encoding';
import type { RecoverStep_Type } from '@/BrightID/reducer/types';

export interface RecoveryState {
  recoverStep: RecoverStep_Type;
  publicKey: string;
  secretKey: Uint8Array;
  aesKey: string;
  errorMessage: string;
  errorType: RecoveryErrorType;
  id: string;
  name: string;
  photo: { filename: string };
  timestamp: number;
  sigs: Record<string, Signature>;
  uploadCompletedBy: Record<string, boolean>;
  qrcode: string;
  recoveredConnections: number;
  recoveredGroups: number;
  recoveredBlindSigs: number;
  channel: {
    channelId: string;
    url: null | { href: string };
    expires: number;
    pollTimerId: IntervalId;
  };
}

interface RecoveryActions {
  init: (data: { publicKey?: Uint8Array; secretKey: Uint8Array; aesKey: string }) => void;
  setRecoveryAesKey: (key: string) => void;
  setRecoveryChannel: (data: { channelId: string; url: URL }) => void;
  resetChannelExpiration: () => void;
  setSig: (data: { sig: Signature; signer: string }) => void;
  updateNamePhoto: (data: { name: string; photo: Photo }) => void;
  resetRecoverySigs: () => void;
  resetRecoveryData: () => void;
  setRecoveryError: (data: { errorType: RecoveryErrorType; errorMessage?: string }) => void;
  increaseRecoveredConnections: (n: number) => void;
  increaseRecoveredGroups: (n: number) => void;
  increaseRecoveredBlindSigs: (n: number) => void;
  setUploadCompletedBy: (id: string) => void;
  setRecoveryId: (id: string) => void;
  setRecoverStep: (step: RecoverStep_Type) => void;
  setChannelIntervalId: (id: IntervalId) => void;
  reset: () => void;
}

const initialState: RecoveryState = {
  recoverStep: recover_steps.NOT_STARTED,
  publicKey: '',
  secretKey: new Uint8Array(),
  aesKey: '',
  errorMessage: '',
  errorType: RecoveryErrorType.NONE,
  id: '',
  name: '',
  photo: { filename: '' },
  timestamp: 0,
  sigs: {},
  uploadCompletedBy: {},
  qrcode: '',
  recoveredConnections: 0,
  recoveredGroups: 0,
  recoveredBlindSigs: 0,
  channel: {
    channelId: '',
    url: null,
    expires: 0,
    pollTimerId: null,
  },
};

export const useRecoveryStore = create<RecoveryState & RecoveryActions>()((set, get) => ({
  ...initialState,
  init: ({ publicKey, secretKey, aesKey }) =>
    set({
      publicKey: uInt8ArrayToB64(publicKey ?? new Uint8Array()),
      secretKey,
      aesKey,
      timestamp: Date.now(),
      errorMessage: '',
      errorType: RecoveryErrorType.NONE,
      id: '',
      name: '',
      photo: { filename: '' },
      recoveredConnections: 0,
      recoveredGroups: 0,
      recoveredBlindSigs: 0,
      sigs: {},
      uploadCompletedBy: {},
      recoverStep: recover_steps.NOT_STARTED,
    }),
  setRecoveryAesKey: (aesKey) => set({ aesKey }),
  setRecoveryChannel: ({ channelId, url }) =>
    set((s) => ({
      channel: {
        ...s.channel,
        channelId,
        url: { href: url?.href },
        expires: Date.now() + RECOVERY_CHANNEL_TTL,
      },
    })),
  resetChannelExpiration: () =>
    set((s) => ({
      channel: { ...s.channel, expires: Date.now() + RECOVERY_CHANNEL_TTL },
    })),
  setSig: ({ sig, signer }) => {
    const { id } = get();
    if (sig.id !== id) {
      set({ sigs: { [signer]: sig }, id: sig.id, name: '', photo: { filename: '' } });
    } else {
      set((s) => ({ sigs: { ...s.sigs, [signer]: sig } }));
    }
  },
  updateNamePhoto: ({ name, photo }) => set({ name, photo }),
  resetRecoverySigs: () => set({ sigs: {} }),
  resetRecoveryData: () => set({ ...initialState }),
  setRecoveryError: ({ errorType, errorMessage = '' }) =>
    set({ errorType, errorMessage }),
  increaseRecoveredConnections: (n) =>
    set((s) => ({ recoveredConnections: s.recoveredConnections + n })),
  increaseRecoveredGroups: (n) =>
    set((s) => ({ recoveredGroups: s.recoveredGroups + n })),
  increaseRecoveredBlindSigs: (n) =>
    set((s) => ({ recoveredBlindSigs: s.recoveredBlindSigs + n })),
  setUploadCompletedBy: (id) =>
    set((s) => ({ uploadCompletedBy: { ...s.uploadCompletedBy, [id]: true } })),
  setRecoveryId: (id) => set({ id }),
  setRecoverStep: (recoverStep) => set({ recoverStep }),
  setChannelIntervalId: (pollTimerId) =>
    set((s) => ({ channel: { ...s.channel, pollTimerId } })),
  reset: () => set({ ...initialState }),
}));
