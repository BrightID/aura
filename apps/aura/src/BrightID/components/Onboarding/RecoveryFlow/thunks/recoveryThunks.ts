import { setKeypair } from '@/BrightID/actions';
import { verifyKeypair } from '@/BrightID/utils/cryptoHelper';
import { urlSafeRandomKey } from '@/BrightID/utils/encoding';
import { AppDispatch, GetState } from 'store';
import nacl from 'tweetnacl';

import { init } from '../recoveryDataSlice';

// HELPERS

const THREE_DAYS = 259200000;

const pastLimit = (timestamp: number) => timestamp + THREE_DAYS < Date.now();

// THUNKS

export const setupRecovery =
  () => async (dispatch: AppDispatch, getState: GetState) => {
    console.log(`Setting up recovery...`);
    const { recoveryData } = getState();
    // setup recovery data
    if (!recoveryData.timestamp || pastLimit(recoveryData.timestamp)) {
      const { publicKey, secretKey } = await nacl.sign.keyPair();
      const aesKey = await urlSafeRandomKey(16);
      // setup recovery data slice with new keypair
      dispatch(init({ publicKey, secretKey, aesKey }));
    } else {
      // we should already have valid recovery data. double-check required data is available.
      const { publicKey, secretKey } = recoveryData;
      try {
        verifyKeypair({ publicKey, secretKey });
      } catch (e) {
        // Existing keys don't work, set up new keys.
        const { publicKey, secretKey } = await nacl.sign.keyPair();
        const aesKey = await urlSafeRandomKey(16);
        // setup recovery data slice with new keypair
        dispatch(init({ publicKey, secretKey, aesKey }));
      }
    }
  };

export const setRecoveryKeys =
  () => (dispatch: AppDispatch, getState: GetState) => {
    const { publicKey, secretKey } = getState().recoveryData;
    verifyKeypair({ publicKey, secretKey });
    dispatch(setKeypair({ publicKey, secretKey }));
  };
