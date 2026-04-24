import ChannelAPI from '@/features/brightid/api/channelService';
import {
  checkCompletedFlags,
  downloadUserInfo,
} from '@/features/brightid/components/Onboarding/ImportFlow/thunks/channelDownloadThunks';
import {
  uploadAllInfoAfter,
  uploadDeviceInfo,
} from '@/features/brightid/components/Onboarding/ImportFlow/thunks/channelUploadThunks';
import { CHANNEL_POLL_INTERVAL } from '@/features/brightid/components/Onboarding/RecoveryFlow/thunks/channelThunks';
import { AURA_NODE_URL_PROXY } from '@/constants/urls';
import { IMPORT_PREFIX } from '@/features/brightid/utils/constants';
import { hash } from '@/features/brightid/utils/encoding';
import { useRecoveryStore } from '@/store/recovery.store';
import { useSettingsStore } from '@/store/settings.store';

export const setupSync = async () => {
  const recoveryStore = useRecoveryStore.getState();
  // setup recovery data
  if (!recoveryStore.aesKey) {
    // TODO: fix and uncomment this
    // const aesKey = await urlSafeRandomKey(16);
    // setup recovery data slice with sync info
    // recoveryStore.init({ aesKey });
  }
};

export const createSyncChannel = async () => {
  const recoveryStore = useRecoveryStore.getState();
  const { aesKey } = recoveryStore;
  const baseUrl = AURA_NODE_URL_PROXY;
  const url = new URL(`${baseUrl}/profile`);
  // use this for local running profile service
  // const url = new URL(`http://10.0.2.2:3000/`);
  const channelId = hash(aesKey);
  console.log(`created channel ${channelId} for sync data`);
  recoveryStore.setRecoveryChannel({ channelId, url });
  const { lastSyncTime, isPrimaryDevice } = useSettingsStore.getState();
  let _lastSyncTime = 0;
  if (!isPrimaryDevice) {
    await uploadDeviceInfo();
    console.log(
      `Finished uploading last sync time to the channel ${channelId}`,
    );
  } else {
    console.log(
      `Polling last sync time from the scanner of the channel ${channelId}`,
    );
    _lastSyncTime =
      (await pollOtherSideDeviceInfo(url, channelId)).lastSyncTime ?? 0;
    console.log(`Last sync time was ${_lastSyncTime}`);
  }
  const after = isPrimaryDevice ? _lastSyncTime : lastSyncTime;
  await uploadAllInfoAfter(after);
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

export const pollImportChannel = (): (() => void) => {
  channelIntervalId = setInterval(() => {
    if (!checkInProgress) {
      checkInProgress = true;
      checkImportChannel()
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

export const checkImportChannel = async () => {
  const recoveryStore = useRecoveryStore.getState();
  const { channel: { channelId, url } } = recoveryStore;
  if (url) {
    const channelApi = new ChannelAPI(url.href);
    const dataIds = await channelApi.list(channelId);
    await downloadUserInfo({ channelApi, dataIds });
    // await downloadConnections({ channelApi, dataIds });
    // await downloadGroups({ channelApi, dataIds });
    // await downloadContextInfo({ channelApi, dataIds });
    // await downloadBlindSigs({ channelApi, dataIds });
    await checkCompletedFlags({ channelApi, dataIds });
  }
};
