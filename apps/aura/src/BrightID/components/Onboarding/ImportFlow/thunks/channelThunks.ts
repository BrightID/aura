import ChannelAPI from '@/BrightID/api/channelService';
import {
  checkCompletedFlags,
  downloadUserInfo,
} from '@/BrightID/components/Onboarding/ImportFlow/thunks/channelDownloadThunks';
import {
  uploadAllInfoAfter,
  uploadDeviceInfo,
} from '@/BrightID/components/Onboarding/ImportFlow/thunks/channelUploadThunks';
import { setRecoveryChannel } from '@/BrightID/components/Onboarding/RecoveryFlow/recoveryDataSlice';
import { CHANNEL_POLL_INTERVAL } from '@/BrightID/components/Onboarding/RecoveryFlow/thunks/channelThunks';
import { selectBaseUrl } from '@/BrightID/reducer/settingsSlice';
import { IMPORT_PREFIX } from '@/BrightID/utils/constants';
import { hash } from '@/BrightID/utils/encoding';
import { AppDispatch, GetState } from 'store';

export const setupSync =
  () => async (_dispatch: AppDispatch, getState: GetState) => {
    const { recoveryData } = getState();
    // setup recovery data
    if (!recoveryData.aesKey) {
      // TODO: fix and uncomment this
      // const aesKey = await urlSafeRandomKey(16);
      // setup recovery data slice with sync info
      // dispatch(init({ aesKey }));
    }
  };

export const createSyncChannel =
  () => async (dispatch: AppDispatch, getState: GetState) => {
    const {
      recoveryData: { aesKey },
    } = getState();
    const baseUrl = selectBaseUrl();
    const url = new URL(`${baseUrl}/profile`);
    // use this for local running profile service
    // const url = new URL(`http://10.0.2.2:3000/`);
    const channelId = hash(aesKey);
    console.log(`created channel ${channelId} for sync data`);
    dispatch(setRecoveryChannel({ channelId, url }));
    const { settings } = getState();
    let lastSyncTime = 0;
    if (!settings.isPrimaryDevice) {
      await dispatch(uploadDeviceInfo());
      console.log(
        `Finished uploading last sync time to the channel ${channelId}`,
      );
    } else {
      console.log(
        `Polling last sync time from the scanner of the channel ${channelId}`,
      );
      lastSyncTime =
        (await pollOtherSideDeviceInfo(url, channelId)).lastSyncTime ?? 0;
      console.log(`Last sync time was ${lastSyncTime}`);
    }
    const after = settings.isPrimaryDevice
      ? lastSyncTime
      : settings.lastSyncTime;
    await dispatch(uploadAllInfoAfter(after));
    console.log(`Finished uploading sync data to the channel ${channelId}`);
  };

export const getOtherSideDeviceInfo = async (
  url: URL,
  channelId: string,
): Promise<SyncDeviceInfo> => {
  const channelApi = new ChannelAPI(url.href);
  try {
    const dataString = await channelApi.download({
      channelId,
      dataId: `${IMPORT_PREFIX}data`,
      deleteAfterDownload: true,
    });
    return JSON.parse(dataString) as SyncDeviceInfo;
  } catch (err) {
    // TODO: handle real errors, like network issues etc?
    // if other side (code generator) did not push its info, it was primary.
    return {
      isPrimaryDevice: true,
    };
  }
};

export const pollOtherSideDeviceInfo = async (
  url: URL,
  channelId: string,
): Promise<SyncDeviceInfo> => {
  // TODO: This is an endless loop. Needs refactoring and error handling.
  let data = await getOtherSideDeviceInfo(url, channelId);
  while (data.lastSyncTime === undefined) {
    await new Promise((r) => setTimeout(r, CHANNEL_POLL_INTERVAL));
    data = await getOtherSideDeviceInfo(url, channelId);
  }
  return data;
};

let channelIntervalId: IntervalId;
let checkInProgress = false;

export const pollImportChannel = () => async (dispatch: AppDispatch) => {
  channelIntervalId = setInterval(() => {
    if (!checkInProgress) {
      checkInProgress = true;
      dispatch(checkImportChannel())
        .then(() => {
          checkInProgress = false;
        })
        .catch((err) => {
          checkInProgress = false;
          console.error(`error polling sync/import channel: ${err.message}`);
        });
    }
  }, CHANNEL_POLL_INTERVAL);

  const id = channelIntervalId;

  console.log(`start polling sync/import channel (${channelIntervalId})`);

  return () => {
    clearInterval(id);
    console.log(`Stopped polling with ID ${id}`);
  };
};

export const clearImportChannel = () => {
  console.log(`stop polling sync/import channel (${channelIntervalId})`);
  clearInterval(channelIntervalId);
};

export const checkImportChannel =
  () => async (dispatch: AppDispatch, getState: GetState) => {
    const {
      recoveryData: {
        channel: { channelId, url },
      },
      // settings: { isPrimaryDevice },
    } = getState();
    if (url) {
      const channelApi = new ChannelAPI(url.href);
      const dataIds = await channelApi.list(channelId);
      await dispatch(downloadUserInfo({ channelApi, dataIds }));
      // await dispatch(downloadConnections({ channelApi, dataIds }));
      // await dispatch(downloadGroups({ channelApi, dataIds }));
      // await dispatch(downloadContextInfo({ channelApi, dataIds }));
      // await dispatch(downloadBlindSigs({ channelApi, dataIds }));
      await dispatch(checkCompletedFlags({ channelApi, dataIds }));
    }
  };
