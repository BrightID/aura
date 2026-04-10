import { createAsyncThunk } from '@reduxjs/toolkit';
import { clearAllProfilePhotoCache } from '@/api/profilePhoto.service';
import { AuthData } from 'types';

import { pullEncryptedUserData } from '../../api/login.service';
import { hash } from '../../utils/crypto';

//TODO: add a way to reload brightId backup
export const getBrightIdBackupThunk = createAsyncThunk<
  string,
  { authKey: string }
>('profile/getBrightIdBackup', async ({ authKey }) => {
  try {
    const backupData = (await pullEncryptedUserData(authKey)).data;
    await clearAllProfilePhotoCache();
    return backupData;
  } catch (error) {
    console.log(error);
    throw error;
  }
});

export const loginThunk = createAsyncThunk<AuthData, AuthData>(
  'profile/loginByExplorerCode',
  async ({ brightId, password }, { dispatch }) => {
    const authKey = hash(brightId + password);
    await dispatch(getBrightIdBackupThunk({ authKey }));
    return {
      brightId,
      password,
    };
  },
);

export const SET_ = 'SET_';

export const resetStore = () => ({
  type: SET_,
});
