import ChannelAPI from '@/BrightID/api/channelService';
import {
  IMPORT_PREFIX,
  RECOVERY_CHANNEL_TTL,
} from '@/BrightID/utils/constants';
import { encryptData } from '@/BrightID/utils/cryptoHelper';
import { b64ToUrlSafeB64 } from '@/BrightID/utils/encoding';
import { useKeypairStore } from '@/store/keypair.store';
import { useProfileStore } from '@/store/profile.store';
import { useRecoveryStore } from '@/store/recovery.store';
import { useSettingsStore } from '@/store/settings.store';
import { useUserStore } from '@/store/user.store';
import { hash } from '@/utils/crypto';

export const getUserInfo = async (
  userId: string,
  password: string,
) => {
  const userStore = useUserStore.getState();
  let photo: string | undefined;
  try {
    const key = hash(userId + password);
    const response = await fetch(`/brightid/backups/${key}/${userId}`);
    if (response.ok) {
      const text = await response.text();
      const { decryptData: decryptFn } = await import('@/BrightID/utils/cryptoHelper');
      photo = decryptFn(text, password) as string;
    }
  } catch (_e) {
    // photo fetch failed, proceed without it
  }

  return {
    id: userStore.id,
    name: userStore.name,
    photo,
    isSponsored: userStore.isSponsored,
    isSponsoredv6: userStore.isSponsoredv6,
    backupCompleted: userStore.backupCompleted,
    password: userStore.password,
    updateTimestamps: userStore.updateTimestamps,
  };
};

export const uploadAllInfoAfter = async (_after: number) => {
  const userStore = useUserStore.getState();
  const authData = useProfileStore.getState().authData;
  const { publicKey: signingKey } = useKeypairStore.getState();
  const recoveryStore = useRecoveryStore.getState();
  const { channel: { url, channelId }, aesKey } = recoveryStore;

  // use keypair for sync and recovery for import
  if (authData && url) {
    const channelApi = new ChannelAPI(url.href);

    console.log('uploading user info');

    const encrypted = encryptData(
      await getUserInfo(userStore.id, authData.password),
      aesKey,
    );
    const userDataId = `${IMPORT_PREFIX}userinfo_${userStore.id}:${b64ToUrlSafeB64(
      signingKey,
    )}`;
    await channelApi.upload({
      channelId,
      dataId: userDataId,
      data: encrypted,
    });

    console.log('uploading completed flag');
    const completeDataId = `${IMPORT_PREFIX}completed_${
      userStore.id
    }:${b64ToUrlSafeB64(signingKey)}`;
    await channelApi.upload({
      channelId,
      dataId: completeDataId,
      data: 'completed',
    });
  }
};

export const uploadDeviceInfo = async () => {
  const recoveryStore = useRecoveryStore.getState();
  const { channel: { url, channelId }, publicKey: signingKey } = recoveryStore;
  const { lastSyncTime, isPrimaryDevice } = useSettingsStore.getState();
  const dataObj: SyncDeviceInfo = {
    signingKey,
    lastSyncTime,
    isPrimaryDevice,
  };
  const data = JSON.stringify(dataObj);
  if (url) {
    const channelApi = new ChannelAPI(url.href);
    await channelApi.upload({
      channelId,
      data,
      dataId: `${IMPORT_PREFIX}data`,
      requestedTtl: RECOVERY_CHANNEL_TTL,
    });
  }
};
