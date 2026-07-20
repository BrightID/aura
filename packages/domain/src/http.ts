/** Default per-request ceiling so a hung server can't wedge a query forever. */
const REQUEST_TIMEOUT_MS = 30_000

/** Non-2xx response — carries the status so callers can branch on it. */
export class HttpError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "HttpError"
    this.status = status
  }
}

/**
 * Whether an error is a 404 — e.g. a brightid profile or connections lookup
 * for a user the aura node hasn't seen yet (profiles are created by their
 * first received evaluation).
 */
export const isNotFound = (e: unknown): boolean =>
  e instanceof HttpError && e.status === 404

/**
 * Fetch with a timeout, honoring an optional caller signal (e.g. query
 * cancellation on unmount). Aborts on whichever fires first.
 */
async function fetchWithTimeout(
  url: string,
  init?: RequestInit,
  signal?: AbortSignal,
): Promise<Response> {
  const timeout = AbortSignal.timeout(REQUEST_TIMEOUT_MS)
  const composed = signal ? AbortSignal.any([signal, timeout]) : timeout
  return fetch(url, { ...init, signal: composed })
}

/** GET + parse JSON, throwing on non-2xx. */
export async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetchWithTimeout(url, undefined, signal)
  if (!res.ok)
    throw new HttpError(`GET ${url} failed with status ${res.status}`, res.status)
  return (await res.json()) as T
}

/** GET raw text, throwing on non-2xx (encrypted backup blobs). */
export async function getText(url: string, signal?: AbortSignal): Promise<string> {
  const res = await fetchWithTimeout(url, undefined, signal)
  if (!res.ok)
    throw new HttpError(`GET ${url} failed with status ${res.status}`, res.status)
  return await res.text()
}

/** POST a JSON body + parse the JSON response, throwing on non-2xx. */
export async function postJson<T>(
  url: string,
  body: unknown,
  signal?: AbortSignal,
): Promise<T> {
  const res = await fetchWithTimeout(
    url,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
    signal,
  )
  if (!res.ok)
    throw new HttpError(`POST ${url} failed with status ${res.status}`, res.status)
  return (await res.json()) as T
}
