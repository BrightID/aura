/*
 * Channel service client.
 *
 * Replaces the old `ChannelAPI` class + apisauce instance. These are plain
 * fetch helpers — the recovery flow drives them through TanStack Query
 * (mutation for upload, polling query for list/download) instead of calling a
 * stateful class.
 *
 *   POST /profile/upload/{channelId}
 *   GET  /profile/list/{channelId}
 *   GET  /profile/download/{channelId}/{dataId}
 */

const NO_CACHE = { 'Cache-Control': 'no-cache' };

async function errorFrom(res: Response): Promise<string> {
  try {
    const body = await res.json();
    if (body?.error) return body.error as string;
  } catch {
    // not json
  }
  return `Request failed with status ${res.status}`;
}

export interface ChannelTarget {
  /** Channel base url, e.g. `/auranode-test/profile` (proxied) */
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
    // backend expects seconds
    requestedTtl: requestedTtl ? Math.floor(requestedTtl / 1000) : undefined,
  });
  const res = await fetch(`${channelUrl}/upload/${channelId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...NO_CACHE },
    body,
  });
  if (!res.ok) throw new Error(await errorFrom(res));
}

export async function listChannel({
  channelUrl,
  channelId,
}: ChannelTarget): Promise<string[]> {
  const res = await fetch(`${channelUrl}/list/${channelId}`, {
    headers: NO_CACHE,
  });
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
  const res = await fetch(`${channelUrl}/download/${channelId}/${dataId}`, {
    headers: NO_CACHE,
  });
  if (!res.ok) throw new Error(await errorFrom(res));
  const json = (await res.json()) as { data?: string };
  if (deleteAfterDownload) {
    // best-effort cleanup, ignore failures
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
