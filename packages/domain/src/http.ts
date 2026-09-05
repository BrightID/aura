const REQUEST_TIMEOUT_MS = 30_000;

export class HttpError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

export const isNotFound = (e: unknown): boolean =>
  e instanceof HttpError && e.status === 404;

async function fetchWithTimeout(
  url: string,
  init?: RequestInit,
  signal?: AbortSignal,
): Promise<Response> {
  const timeout = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
  const composed = signal ? AbortSignal.any([signal, timeout]) : timeout;
  return fetch(url, { ...init, signal: composed });
}

export async function getJson<T>(
  url: string,
  signal?: AbortSignal,
): Promise<T> {
  const res = await fetchWithTimeout(url, undefined, signal);
  if (!res.ok)
    throw new HttpError(
      `GET ${url} failed with status ${res.status}`,
      res.status,
    );
  return (await res.json()) as T;
}

export async function getText(
  url: string,
  signal?: AbortSignal,
): Promise<string> {
  const res = await fetchWithTimeout(url, undefined, signal);
  if (!res.ok)
    throw new HttpError(
      `GET ${url} failed with status ${res.status}`,
      res.status,
    );
  return await res.text();
}

export async function postJson<T>(
  url: string,
  body: unknown,
  signal?: AbortSignal,
): Promise<T> {
  const res = await fetchWithTimeout(
    url,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
    signal,
  );
  if (!res.ok)
    throw new HttpError(
      `POST ${url} failed with status ${res.status}`,
      res.status,
    );
  return (await res.json()) as T;
}
