import ChannelAPI from '@/BrightID/api/channelService';
import { IMPORT_PREFIX } from '@/BrightID/utils/constants';
import { decryptData } from '@/BrightID/utils/cryptoHelper';
import { b64ToUrlSafeB64 } from '@/BrightID/utils/encoding';
import { useKeypairStore } from '@/store/keypair.store';
import { useRecoveryStore } from '@/store/recovery.store';
import { useUserStore } from '@/store/user.store';

export const downloadUserInfo = async ({
  channelApi,
  dataIds,
}: {
  channelApi: ChannelAPI;
  dataIds: Array<string>;
}) => {
  try {
    const { publicKey: signingKey } = useKeypairStore.getState();
    const recoveryStore = useRecoveryStore.getState();
    const { aesKey, channel: { channelId } } = recoveryStore;
    const userStore = useUserStore.getState();
    const { updateTimestamps } = userStore;

    const prefix = `${IMPORT_PREFIX}userinfo_`;
    const isUserInfo = (id: string) => id.startsWith(prefix);
    const uploader = (id: string) => id.replace(prefix, '').split(':')[1];
    const userInfoDataId = dataIds.find(
      (dataId) =>
        isUserInfo(dataId) &&
        uploader(dataId) !== b64ToUrlSafeB64(signingKey),
    );
    if (!userInfoDataId) {
      return false;
    }

    const encrypted = await channelApi.download({
      channelId,
      dataId: userInfoDataId,
      deleteAfterDownload: true,
    });
    const info = decryptData(encrypted, aesKey);
    recoveryStore.setRecoveryId(info.id);
    if (
      !updateTimestamps.name ||
      info.updateTimestamps.name > updateTimestamps.name
    ) {
      userStore.setName(info.name);
    }
    // if (
    //   !updateTimestamps.photo ||
    //   info.updateTimestamps.photo > updateTimestamps.photo
    // ) {
    //   const filename = await saveImage({
    //     imageName: info.id,
    //     base64Image: info.photo,
    //   });
    //   info.photo = { filename };
    //   userStore.setPhoto(info.photo);
    // }
    if (
      !updateTimestamps.isSponsored ||
      info.updateTimestamps.isSponsored > updateTimestamps.isSponsored
    ) {
      userStore.setIsSponsored(info.isSponsored);
    }
    if (
      !updateTimestamps.isSponsoredv6 ||
      info.updateTimestamps.isSponsoredv6 > updateTimestamps.isSponsoredv6
    ) {
      userStore.setIsSponsoredv6(info.isSponsoredv6);
    }
    if (
      !updateTimestamps.password ||
      info.updateTimestamps.password > updateTimestamps.password
    ) {
      userStore.setPassword(info.password);
    }
    if (
      !updateTimestamps.backupCompleted ||
      info.updateTimestamps.backupCompleted > updateTimestamps.backupCompleted
    ) {
      userStore.setBackupCompleted(info.backupCompleted);
    }
    return true;
  } catch (err) {
    console.error(`downloadingUserInfo: ${String(err)}`);
  }
  return false;
};

export const checkCompletedFlags = async ({
  channelApi,
  dataIds,
}: {
  channelApi: ChannelAPI;
  dataIds: Array<string>;
}) => {
  try {
    const { publicKey: signingKey } = useKeypairStore.getState();
    const recoveryStore = useRecoveryStore.getState();
    const { channel: { channelId }, uploadCompletedBy } = recoveryStore;

    const prefix = `${IMPORT_PREFIX}completed_`;
    const isCompleted = (id: string) => id.startsWith(prefix);
    const completedBy = (id: string) => id.replace(prefix, '');
    const uploader = (id: string) => id.replace(prefix, '').split(':')[1];

    const completedDataIds = dataIds.filter(
      (dataId) =>
        isCompleted(dataId) &&
        uploader(dataId) !== b64ToUrlSafeB64(signingKey) &&
        !uploadCompletedBy[completedBy(dataId)],
    );

    for (const dataId of completedDataIds) {
      await channelApi.download({
        channelId,
        dataId,
        deleteAfterDownload: true,
      });
      const uploaderStr = completedBy(dataId);
      recoveryStore.setUploadCompletedBy(uploaderStr);
    }
  } catch (err) {
    console.error(`checkingCompletedFlags: ${String(err)}`);
  }
};
