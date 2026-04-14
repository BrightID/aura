import ChannelAPI from '@/BrightID/api/channelService';
import { setRecoveryChannel } from '@/BrightID/components/Onboarding/RecoveryFlow/recoveryDataSlice';
import { hash } from '@/BrightID/utils/encoding';
import { uploadRecoveryData } from '@/BrightID/utils/recovery';
import { AppDispatch, GetState } from 'store';

import { AURA_NODE_URL_PROXY } from '@/constants/urls';

// CONSTANTS

export const CHANNEL_POLL_INTERVAL = 3000;

// THUNKS

export const createRecoveryChannel =
  (location: string) => async (dispatch: AppDispatch, getState: GetState) => {
    try {
      const { recoveryData } = getState();
      const baseUrl = AURA_NODE_URL_PROXY;
      const url = new URL(`${location + baseUrl}/profile`);
      // use this for local running profile service
      // const url = new URL(`http://10.0.2.2:3000/`);
      const channelApi = new ChannelAPI(url.href);
      const channelId = hash(recoveryData.aesKey);
      console.log(`created channel ${channelId} for recovery data`);
      dispatch(setRecoveryChannel({ channelId, url }));
      await uploadRecoveryData(recoveryData, channelApi);
      console.log(`Finished uploading recovery data to channel ${channelId}`);
    } catch (e) {
      const msg = 'Profile data already exists in channel';
      if (!String(e).startsWith(msg)) {
        throw e;
      }
    }
  };
