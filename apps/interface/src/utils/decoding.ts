import CryptoJS from 'crypto-js'

export const decryptData = (data: string, aesKey: string) => {
  const decrypted = CryptoJS.AES.decrypt(data, aesKey).toString(CryptoJS.enc.Utf8)
  return JSON.parse(decrypted)
}
