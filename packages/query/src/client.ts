import type { CacheEntry, QueryClientConfig, QueryStatus } from './types.js';

type Listener = () => void;

const DEFAULT_GC_TIME = 5 * 60 * 1000; // 5 min

export function hashKey(key: unknown[]): string {
  return JSON.stringify(key, (_, v) =>
    v !== null && typeof v === 'object' && !Array.isArray(v)
      ? Object.fromEntries(
          Object.entries(v).sort(([a], [b]) => a.localeCompare(b)),
        )
      : v,
  );
}

export class QueryClient {
  private cache = new Map<string, CacheEntry>();
  private listeners = new Map<string, Set<Listener>>();

  constructor(private config: QueryClientConfig = {}) {}

  getEntry<TData, TError = Error>(
    key: string,
  ): CacheEntry<TData, TError> | undefined {
    return this.cache.get(key) as CacheEntry<TData, TError> | undefined;
  }

  setEntry<TData, TError = Error>(
    key: string,
    patch: Partial<CacheEntry<TData, TError>>,
  ): void {
    const prev = this.cache.get(key) as CacheEntry<TData, TError> | undefined;
    const next: CacheEntry<TData, TError> = {
      data: undefined,
      error: null,
      status: 'pending',
      fetchStatus: 'idle',
      updatedAt: 0,
      observers: 0,
      ...prev,
      ...patch,
    };
    this.cache.set(key, next as CacheEntry);
    this.notify(key);
  }

  subscribe(key: string, listener: Listener): () => void {
    if (!this.listeners.has(key)) this.listeners.set(key, new Set());
    this.listeners.get(key)!.add(listener);
    const entry = this.cache.get(key);
    if (entry) {
      clearTimeout(entry.gcTimer);
      this.cache.set(key, { ...entry, observers: entry.observers + 1 });
    }
    return () => this.unsubscribe(key, listener);
  }

  private unsubscribe(key: string, listener: Listener): void {
    const set = this.listeners.get(key);
    if (!set) return;
    set.delete(listener);
    const entry = this.cache.get(key);
    if (!entry) return;
    const observers = Math.max(0, entry.observers - 1);
    if (observers === 0) {
      const gcTime = this.config.defaultGcTime ?? DEFAULT_GC_TIME;
      const gcTimer = setTimeout(() => this.cache.delete(key), gcTime);
      this.cache.set(key, { ...entry, observers, gcTimer });
    } else {
      this.cache.set(key, { ...entry, observers });
    }
  }

  private notify(key: string): void {
    this.listeners.get(key)?.forEach((fn) => fn());
  }

  invalidateQueries(keyPrefix: unknown[]): void {
    for (const [hashedKey, entry] of this.cache) {
      if (matchesPrefix(hashedKey, keyPrefix)) {
        this.setEntry(hashedKey, { ...entry, updatedAt: 0 });
      }
    }
  }

  removeQueries(keyPrefix: unknown[]): void {
    for (const key of this.cache.keys()) {
      if (matchesPrefix(key, keyPrefix)) {
        this.cache.delete(key);
        this.listeners.delete(key);
      }
    }
  }

  setQueryData<TData>(queryKey: unknown[], data: TData): void {
    const key = hashKey(queryKey);
    this.setEntry<TData>(key, {
      data,
      error: null,
      status: 'success' as QueryStatus,
      fetchStatus: 'idle',
      updatedAt: Date.now(),
    });
  }

  getQueryData<TData>(queryKey: unknown[]): TData | undefined {
    return this.getEntry<TData>(hashKey(queryKey))?.data;
  }

  async ensureQueryData<TData>({
    queryKey,
    queryFn,
  }: {
    queryKey: unknown[];
    queryFn: (ctx: {
      queryKey: unknown[];
      signal: AbortSignal;
    }) => Promise<TData>;
  }): Promise<TData> {
    const entry = this.getEntry<TData>(hashKey(queryKey));
    if (
      entry?.status === 'success' &&
      entry.updatedAt > 0 &&
      entry.data !== undefined
    ) {
      return entry.data;
    }
    const controller = new AbortController();
    const data = await queryFn({ queryKey, signal: controller.signal });
    this.setQueryData(queryKey, data);
    return data;
  }

  getDefaultStaleTime(): number {
    return this.config.defaultStaleTime ?? 0;
  }

  getDefaultRetry(): number | false {
    return this.config.defaultRetry ?? 3;
  }

  getDefaultRetryDelay(): (attempt: number) => number {
    const d = this.config.defaultRetryDelay;
    if (typeof d === 'function') return d;
    if (typeof d === 'number') return () => d;
    return (attempt) => Math.min(1000 * 2 ** attempt, 30_000);
  }

  getDefaultRefetchOnWindowFocus(): boolean {
    return this.config.defaultRefetchOnWindowFocus ?? true;
  }
}

function matchesPrefix(hashedKey: string, prefix: unknown[]): boolean {
  try {
    const parsed: unknown[] = JSON.parse(hashedKey);
    return prefix.every(
      (p, i) => JSON.stringify(p) === JSON.stringify(parsed[i]),
    );
  } catch {
    return false;
  }
}

export const defaultClient = new QueryClient();
