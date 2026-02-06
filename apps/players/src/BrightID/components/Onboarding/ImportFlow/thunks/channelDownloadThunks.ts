import ChannelAPI from '@/BrightID/api/channelService';
import {
  setRecoveryId,
  setUploadCompletedBy,
} from '@/BrightID/components/Onboarding/RecoveryFlow/recoveryDataSlice';
import {
  setBackupCompleted,
  setIsSponsored,
  setIsSponsoredv6,
  setName,
  setPassword,
} from '@/BrightID/reducer/userSlice';
import { IMPORT_PREFIX } from '@/BrightID/utils/constants';
import { decryptData } from '@/BrightID/utils/cryptoHelper';
import { b64ToUrlSafeB64 } from '@/BrightID/utils/encoding';
import { AppDispatch, GetState } from 'store';

export const downloadUserInfo =
  ({
    channelApi,
    dataIds,
  }: {
    channelApi: ChannelAPI;
    dataIds: Array<string>;
  }) =>
  async (dispatch: AppDispatch, getState: GetState) => {
    try {
      const {
        keypair: { publicKey: signingKey },
        recoveryData: {
          aesKey,
          channel: { channelId },
        },
        user: { updateTimestamps },
      } = getState();

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
      dispatch(setRecoveryId(info.id));
      if (
        !updateTimestamps.name ||
        info.updateTimestamps.name > updateTimestamps.name
      ) {
        dispatch(setName(info.name));
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
      //   dispatch(setPhoto(info.photo));
      // }
      if (
        !updateTimestamps.isSponsored ||
        info.updateTimestamps.isSponsored > updateTimestamps.isSponsored
      ) {
        dispatch(setIsSponsored(info.isSponsored));
      }
      if (
        !updateTimestamps.isSponsoredv6 ||
        info.updateTimestamps.isSponsoredv6 > updateTimestamps.isSponsoredv6
      ) {
        dispatch(setIsSponsoredv6(info.isSponsoredv6));
      }
      if (
        !updateTimestamps.password ||
        info.updateTimestamps.password > updateTimestamps.password
      ) {
        dispatch(setPassword(info.password));
      }
      if (
        !updateTimestamps.backupCompleted ||
        info.updateTimestamps.backupCompleted > updateTimestamps.backupCompleted
      ) {
        dispatch(setBackupCompleted(info.backupCompleted));
      }
      return true;
    } catch (err) {
      console.error(`downloadingUserInfo: ${String(err)}`);
    }
    return false;
  };

export const checkCompletedFlags =
  ({
    channelApi,
    dataIds,
  }: {
    channelApi: ChannelAPI;
    dataIds: Array<string>;
  }) =>
  async (dispatch: AppDispatch, getState: GetState) => {
    try {
      const {
        keypair: { publicKey: signingKey },
        recoveryData: {
          channel: { channelId },
          uploadCompletedBy,
        },
      } = getState();

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
        const uploader = completedBy(dataId);
        dispatch(setUploadCompletedBy(uploader));
      }
    } catch (err) {
      console.error(`checkingCompletedFlags: ${String(err)}`);
    }
  };
