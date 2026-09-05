import { type BrightIdBackup } from 'types';
import { decryptData, encryptData } from '@aura/domain/crypto';

// Shared crypto primitives live in @aura/domain — re-exported here to keep the
// sdk's public API unchanged.
export {
  b64ToUrlSafeB64,
  decryptData,
  encryptData,
  generateB64Keypair,
  hash,
  randomWordArray,
  uInt8ArrayToB64,
  urlSafeRandomKey,
  wordArrayToB64,
} from '@aura/domain/crypto';

export function encryptUserData(userData: BrightIdBackup, password: string) {
  return encryptData(JSON.stringify(userData), password);
}

export function decryptUserData(encryptedUserData: string, password: string) {
  return JSON.parse(decryptData(encryptedUserData, password));
}
