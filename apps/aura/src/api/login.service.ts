import { decryptUserData } from '@/utils/crypto';

import { recoveryApi } from './index';

export async function pullDecryptedUserData(key: string, password: string) {
  return decryptUserData((await pullEncryptedUserData(key)).data, password);
}

export function pullEncryptedUserData(key: string) {
  return recoveryApi.get<string>(`/backups/${key}/data`);
}
