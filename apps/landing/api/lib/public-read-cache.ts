import type { VercelResponse } from '@vercel/node';

// Neon suspends its compute after about 5 minutes with no queries.
// setPublicReadCacheHeaders tells the CDN to answer for 1 hour (s-maxage)
// without calling this server, so no query runs and the suspend can happen.
// For 1 day after that hour, the CDN may keep answering while one new
// query runs.
// max-age=300 applies to the browser only. It does not change how often
// the CDN calls this server.
// publicRead stores a result for 60 seconds in this process. A repeat
// request in that window does not query. Overlapping requests in this
// process share one query. Another process stores its own result and
// queries on its own.
// An s-maxage shorter than Neon's suspend time would call this server
// often enough to keep the compute awake while requests keep arriving.
const MEMORY_TTL_MS = 60 * 1000;
const CDN_S_MAXAGE_S = 60 * 60;
const CDN_SWR_S = 60 * 60 * 24;

type Entry = { data: unknown; expiresAt: number };

const memory = new Map<string, Entry>();
const inflight = new Map<string, Promise<unknown>>();

export function setPublicReadCacheHeaders(res: VercelResponse) {
  res.setHeader(
    'Cache-Control',
    `public, max-age=300, s-maxage=${CDN_S_MAXAGE_S}, stale-while-revalidate=${CDN_SWR_S}`,
  );
  res.setHeader(
    'Vercel-CDN-Cache-Control',
    `public, s-maxage=${CDN_S_MAXAGE_S}, stale-while-revalidate=${CDN_SWR_S}`,
  );
}

export async function publicRead<T>(
  key: string,
  load: () => Promise<T>,
  ttlMs = MEMORY_TTL_MS,
): Promise<T> {
  const cached = memory.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.data as T;

  const pending = inflight.get(key);
  if (pending) return pending as Promise<T>;

  const promise = load()
    .then((data) => {
      memory.set(key, { data, expiresAt: Date.now() + ttlMs });
      return data;
    })
    .finally(() => {
      inflight.delete(key);
    });

  inflight.set(key, promise);
  return promise;
}
