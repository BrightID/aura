import CryptoJS from 'crypto-js';

export const getExplorerCode = (id: string, password: string) => {
  return CryptoJS.AES.encrypt(id, password).toString();
};
