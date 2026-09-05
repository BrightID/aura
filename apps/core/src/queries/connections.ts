import { createQuery, queryOptions } from '@tanstack/solid-query';
import { getJson, NODE_API_BASE } from '@/shared/lib/api';
import type {
  AuraNodeBrightIdConnection,
  AuraNodeConnectionsResponse,
  BrightIdProfile,
} from '@aura/domain/types/aura';

type Direction = 'inbound' | 'outbound';

const connectionsQueryOptions = (id: string, direction: Direction) =>
  queryOptions({
    queryKey: ['connections', direction, id],
    queryFn: ({ signal }) =>
      getJson<AuraNodeConnectionsResponse>(
        `${NODE_API_BASE}/brightid/v6/users/${id}/connections/${direction}?withVerifications=true`,
        signal,
      ).then((r) => r.data.connections),
    staleTime: 30_000,
    enabled: !!id,
  });

export const inboundConnectionsQueryOptions = (id: string) =>
  connectionsQueryOptions(id, 'inbound');

export const outboundConnectionsQueryOptions = (id: string) =>
  connectionsQueryOptions(id, 'outbound');

export const brightIdProfileQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ['brightid-profile', id],
    queryFn: ({ signal }) =>
      getJson<{ data: BrightIdProfile }>(
        `${NODE_API_BASE}/brightid/v6/users/${id}/profile`,
        signal,
      ).then((r) => r.data),
    staleTime: 60_000,
    enabled: !!id,
  });

// ─── Solid query hooks ──────────────────────────────────────────────────────
// Accept reactive accessors so the query re-keys when the id changes.

export const createInboundConnectionsQuery = (id: () => string) =>
  createQuery(() => inboundConnectionsQueryOptions(id()));

export const createOutboundConnectionsQuery = (id: () => string) =>
  createQuery(() => outboundConnectionsQueryOptions(id()));

export const createBrightIdProfileQuery = (id: () => string) =>
  createQuery(() => brightIdProfileQueryOptions(id()));

export type { AuraNodeBrightIdConnection };
