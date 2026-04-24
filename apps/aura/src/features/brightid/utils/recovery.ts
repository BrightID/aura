import ChannelAPI from '@/features/brightid/api/channelService';
import { RECOVERY_CHANNEL_TTL } from '@/features/brightid/utils/constants';
import { hash } from '@/features/brightid/utils/encoding';

export const buildRecoveryChannelQrUrl = ({
  aesKey,
  url,
  t,
  changePrimaryDevice,
  name,
}: {
  aesKey: string;
  url: { href: string };
  t: QrCodeURL_Type;
  changePrimaryDevice: boolean;
  name?: string;
}) => {
  const qrUrl = new URL(url.href);
  qrUrl.searchParams.append('aes', aesKey);
  qrUrl.searchParams.append('t', t);
  if (name) {
    qrUrl.searchParams.append('n', name);
  }
  qrUrl.searchParams.append('p', String(changePrimaryDevice));
  return qrUrl;
};

export const uploadRecoveryData = async (
  recoveryData: RecoveryData,
  channelApi: ChannelAPI,
) => {
  const channelId = hash(recoveryData.aesKey);
  const dataObj = {
    signingKey: recoveryData.publicKey,
    timestamp: recoveryData.timestamp,
  };
  const data = JSON.stringify(dataObj);
  await channelApi.upload({
    channelId,
    data,
    dataId: 'data',
    requestedTtl: RECOVERY_CHANNEL_TTL,
  });
};

export const loadRecoveryData = async (
  channelApi: ChannelAPI,
  aesKey: string,
): Promise<{ signingKey: string; timestamp: number }> => {
  const dataString = await channelApi.download({
    channelId: hash(aesKey),
    dataId: 'data',
  });
  const data = JSON.parse(dataString);
  if (!data.signingKey || !data.timestamp) {
    throw new Error(
      'Please ask the inboundConnection to reload their QR code and try again',
    );
  }
  return data;
};
