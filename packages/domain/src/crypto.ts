import { fromByteArray, toByteArray } from 'base64-js';
import CryptoJS from 'crypto-js';
import nacl from 'tweetnacl';

export function encryptData(data: string, password: string) {
  return CryptoJS.AES.encrypt(data, password).toString();
}

export function decryptData(data: string, password: string) {
  return CryptoJS.AES.decrypt(data, password).toString(CryptoJS.enc.Utf8);
}

const URL_SAFE_MAP: Record<string, string> = { '/': '_', '+': '-', '=': '' };

export const b64ToUrlSafeB64 = (s: string) =>
  s.replace(/[/+=]/g, (c) => URL_SAFE_MAP[c] ?? c);

export const hash = (data: string) => {
  const b = CryptoJS.SHA256(data).toString(CryptoJS.enc.Base64);
  return b64ToUrlSafeB64(b);
};

export const randomWordArray = (size: number) =>
  CryptoJS.lib.WordArray.random(size);

export const urlSafeRandomKey = (bytes = 16): string =>
  b64ToUrlSafeB64(wordArrayToB64(randomWordArray(bytes)));

export const uInt8ArrayToB64 = (array: Uint8Array): string =>
  fromByteArray(array);

export const b64ToUint8Array = (str: string): Uint8Array => toByteArray(str);

export const strToUint8Array = (str: string): Uint8Array =>
  new TextEncoder().encode(str);

export const wordArrayToB64 = (wa: CryptoJS.lib.WordArray) =>
  CryptoJS.enc.Base64.stringify(wa);

export const generateB64Keypair = () => {
  const { publicKey, secretKey } = nacl.sign.keyPair();
  return {
    privateKey: fromByteArray(secretKey),
    publicKey: fromByteArray(publicKey),
  };
};
