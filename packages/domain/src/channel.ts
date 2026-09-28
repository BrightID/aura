// aura-node preflight rejects Cache-Control. Landing rewrites this path
// to the node (vercel.json + vite proxy). QR still embeds the real URL.
const AURA_NODE_PROFILE = 'https://aura-node.brightid.org/profile';

function uploadUrl(channelUrl: string, channelId: string): string {
  const base = channelUrl.replace(/\/$/, '');
  if (base === AURA_NODE_PROFILE) return `/profile/upload/${channelId}`;
  return `${base}/upload/${channelId}`;
}

function readUrl(channelUrl: string, path: string): string {
  const base = channelUrl.replace(/\/$/, '');
  return `${base}/${path}?_=${Date.now()}`;
}

async function errorFrom(res: Response): Promise<string> {
  try {
    const body = await res.json();
    if (body?.error) return body.error as string;
  } catch {}
  return `Request failed with status ${res.status}`;
}

export interface ChannelTarget {
  channelUrl: string;
  channelId: string;
}

export async function uploadToChannel({
  channelUrl,
  channelId,
  data,
  dataId,
  requestedTtl,
}: ChannelTarget & {
  data: string;
  dataId: string;
  requestedTtl?: number;
}): Promise<void> {
  const body = JSON.stringify({
    data,
    uuid: dataId,
    requestedTtl: requestedTtl ? Math.floor(requestedTtl / 1000) : undefined,
  });
  const res = await fetch(uploadUrl(channelUrl, channelId), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });
  if (!res.ok) throw new Error(await errorFrom(res));
}

export async function listChannel({
  channelUrl,
  channelId,
}: ChannelTarget): Promise<string[]> {
  const res = await fetch(readUrl(channelUrl, `list/${channelId}`));
  if (!res.ok) throw new Error(await errorFrom(res));
  const json = (await res.json()) as { profileIds?: string[] };
  if (!json?.profileIds) {
    throw new Error(
      `list for channel ${channelId}: unexpected response format`,
    );
  }
  return json.profileIds;
}

export async function downloadFromChannel({
  channelUrl,
  channelId,
  dataId,
  deleteAfterDownload,
}: ChannelTarget & {
  dataId: string;
  deleteAfterDownload?: boolean;
}): Promise<string> {
  const res = await fetch(
    readUrl(channelUrl, `download/${channelId}/${dataId}`),
  );
  if (!res.ok) throw new Error(await errorFrom(res));
  const json = (await res.json()) as { data?: string };
  if (deleteAfterDownload) {
    fetch(`${channelUrl}/${channelId}/${dataId}`, { method: 'DELETE' }).catch(
      () => {},
    );
  }
  if (!json?.data) {
    throw new Error(
      `download ${dataId} from channel ${channelId}: unexpected response format`,
    );
  }
  return json.data;
}
