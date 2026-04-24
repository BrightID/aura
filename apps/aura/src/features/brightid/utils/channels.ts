import ChannelAPI from '@/features/brightid/api/channelService';
import {
  CHANNEL_INFO_VERSION_1,
  CHANNEL_INFO_VERSION_2,
  channel_states,
  channel_types,
  GROUP_CHANNEL_TTL,
  SINGLE_CHANNEL_TTL,
  STAR_CHANNEL_TTL,
} from '@/features/brightid/utils/constants';
import { urlSafeRandomKey } from '@/features/brightid/utils/encoding';

export const generateChannelData = async (
  channelType: ChannelType,
  url: URL,
): Promise<Channel> => {
  const aesKey = await urlSafeRandomKey(16);
  const id = await urlSafeRandomKey(9);
  const timestamp = Date.now();
  let ttl;
  switch (channelType) {
    case 'GROUP':
      ttl = GROUP_CHANNEL_TTL;
      break;
    case 'STAR':
      ttl = STAR_CHANNEL_TTL;
      break;
    case 'SINGLE':
    default:
      ttl = SINGLE_CHANNEL_TTL;
      break;
  }
  const myProfileId = await urlSafeRandomKey(9);
  const initiatorProfileId = myProfileId;
  const type = channelType;
  const state = channel_states.OPEN;
  const channelApi = new ChannelAPI(url.href);

  return {
    aesKey,
    api: channelApi,
    id,
    initiatorProfileId,
    myProfileId,
    state,
    timestamp,
    ttl,
    type,
    url,
  };
};

export const createChannelInfo = (channel: Channel) => {
  /*
    Channel types "SINGLE" and "GROUP" are compatible with CHANNEL_INFO_VERSION 1.
    Channel type "STAR" requires CHANNEL_INFO_VERSION 2
   */
  let version;
  switch (channel.type) {
    case channel_types.SINGLE:
    case channel_types.GROUP:
      version = CHANNEL_INFO_VERSION_1;
      break;
    case channel_types.STAR:
      version = CHANNEL_INFO_VERSION_2;
      break;
    default:
      throw new Error(`Unhandled channel type ${channel.type}`);
  }
  const obj: ChannelInfo = {
    version,
    type: channel.type,
    timestamp: channel.timestamp,
    ttl: channel.ttl,
    initiatorProfileId: channel.initiatorProfileId,
  };
  return obj;
};

export const buildChannelQrUrl = ({ aesKey, id, url }: Channel) => {
  const qrUrl = new URL(url.href);
  qrUrl.searchParams.append('aes', aesKey);
  qrUrl.searchParams.append('id', id);
  return qrUrl;
};
