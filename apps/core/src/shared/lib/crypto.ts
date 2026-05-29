import { fromByteArray } from 'base64-js';
import CryptoJS from 'crypto-js';
import nacl from 'tweetnacl';
import type { BrightIdBackup } from '../types';

export function encryptData(data: string, password: string) {
  return CryptoJS.AES.encrypt(data, password).toString();
}

export function encryptUserData(userData: BrightIdBackup, password: string) {
  return encryptData(JSON.stringify(userData), password);
}

export function decryptData(data: string, password: string) {
  return CryptoJS.AES.decrypt(data, password).toString(CryptoJS.enc.Utf8);
}

export function decryptUserData(encryptedUserData: string, password: string): BrightIdBackup {
  return JSON.parse(decryptData(encryptedUserData, password));
}

const URL_SAFE_MAP: Record<string, string> = { '/': '_', '+': '-', '=': '' };
export const b64ToUrlSafeB64 = (s: string) => s.replace(/[/+=]/g, (c) => URL_SAFE_MAP[c]);

export const hash = (data: string) => {
  const b = CryptoJS.SHA256(data).toString(CryptoJS.enc.Base64);
  return b64ToUrlSafeB64(b);
};

export const randomWordArray = (size: number) => CryptoJS.lib.WordArray.random(size);

export const wordArrayToB64 = (wa: CryptoJS.lib.WordArray) =>
  CryptoJS.enc.Base64.stringify(wa);

export const generateB64Keypair = () => {
  const { publicKey, secretKey } = nacl.sign.keyPair();
  return {
    privateKey: fromByteArray(secretKey),
    publicKey: fromByteArray(publicKey),
  };
};
