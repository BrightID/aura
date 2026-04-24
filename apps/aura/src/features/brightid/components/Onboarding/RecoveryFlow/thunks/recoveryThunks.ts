import { verifyKeypair } from '@/features/brightid/utils/cryptoHelper';
import { urlSafeRandomKey } from '@/features/brightid/utils/encoding';
import { useKeypairStore } from '@/store/keypair.store';
import { useRecoveryStore } from '@/store/recovery.store';
import nacl from 'tweetnacl';

// HELPERS

const THREE_DAYS = 259200000;

const pastLimit = (timestamp: number) => timestamp + THREE_DAYS < Date.now();

// PLAIN ASYNC FUNCTIONS (converted from Redux thunks)

export const setupRecovery = async () => {
  console.log(`Setting up recovery...`);
  const recoveryStore = useRecoveryStore.getState();
  // setup recovery data
  if (!recoveryStore.timestamp || pastLimit(recoveryStore.timestamp)) {
    const { publicKey, secretKey } = await nacl.sign.keyPair();
    const aesKey = await urlSafeRandomKey(16);
    // setup recovery data slice with new keypair
    recoveryStore.init({ publicKey, secretKey, aesKey });
  } else {
    // we should already have valid recovery data. double-check required data is available.
    const { publicKey, secretKey } = recoveryStore;
    try {
      verifyKeypair({ publicKey, secretKey });
    } catch (e) {
      // Existing keys don't work, set up new keys.
      const { publicKey, secretKey } = await nacl.sign.keyPair();
      const aesKey = await urlSafeRandomKey(16);
      // setup recovery data slice with new keypair
      recoveryStore.init({ publicKey, secretKey, aesKey });
    }
  }
};

export const setRecoveryKeys = () => {
  const { publicKey, secretKey } = useRecoveryStore.getState();
  verifyKeypair({ publicKey, secretKey });
  useKeypairStore.getState().setKeypair({ publicKey, secretKey: secretKey as unknown as Uint8Array });
};
