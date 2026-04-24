import ChannelAPI from '@/features/brightid/api/channelService';
import { hash } from '@/features/brightid/utils/encoding';
import { uploadRecoveryData } from '@/features/brightid/utils/recovery';
import { useRecoveryStore } from '@/store/recovery.store';

import { AURA_NODE_URL_PROXY } from '@/constants/urls';

// CONSTANTS

export const CHANNEL_POLL_INTERVAL = 3000;

// PLAIN ASYNC FUNCTIONS (converted from Redux thunks)

export const createRecoveryChannel = async (location: string) => {
  try {
    const recoveryStore = useRecoveryStore.getState();
    const baseUrl = AURA_NODE_URL_PROXY;
    const url = new URL(`${location + baseUrl}/profile`);
    // use this for local running profile service
    // const url = new URL(`http://10.0.2.2:3000/`);
    const channelApi = new ChannelAPI(url.href);
    const channelId = hash(recoveryStore.aesKey);
    console.log(`created channel ${channelId} for recovery data`);
    recoveryStore.setRecoveryChannel({ channelId, url });
    await uploadRecoveryData(recoveryStore, channelApi);
    console.log(`Finished uploading recovery data to channel ${channelId}`);
  } catch (e) {
    const msg = 'Profile data already exists in channel';
    if (!String(e).startsWith(msg)) {
      throw e;
    }
  }
};
