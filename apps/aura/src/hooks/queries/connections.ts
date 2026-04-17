import { useQuery, queryOptions } from '@tanstack/react-query';
import { auraBrightIdNodeApi } from '@/api';
import type { AuraNodeBrightIdConnection, AuraNodeConnectionsResponse } from 'types';
import type { ProfileInfo, UserProfileRes } from 'types';

export const inboundConnectionsQueryOptions = (id: string) =>
  queryOptions<AuraNodeBrightIdConnection[]>({
    queryKey: ['connections', 'inbound', id],
    queryFn: async () => {
      const res = await auraBrightIdNodeApi.get<AuraNodeConnectionsResponse>(
        `/brightid/v6/users/${id}/connections/inbound?withVerifications=true`,
      );
      return res.data.data.connections;
    },
    staleTime: 30_000,
  });

export const outboundConnectionsQueryOptions = (id: string) =>
  queryOptions<AuraNodeBrightIdConnection[]>({
    queryKey: ['connections', 'outbound', id],
    queryFn: async () => {
      const res = await auraBrightIdNodeApi.get<AuraNodeConnectionsResponse>(
        `/brightid/v6/users/${id}/connections/outbound?withVerifications=true`,
      );
      return res.data.data.connections;
    },
    staleTime: 30_000,
  });

export const brightIdProfileQueryOptions = (id: string) =>
  queryOptions<ProfileInfo>({
    queryKey: ['brightid-profile', id],
    queryFn: async () => {
      const res = await auraBrightIdNodeApi.get<UserProfileRes>(
        `/brightid/v6/users/${id}/profile`,
      );
      return res.data.data;
    },
    staleTime: 60_000,
  });

export const useGetInboundConnectionsQuery = (id: string) =>
  useQuery(inboundConnectionsQueryOptions(id));

export const useGetOutboundConnectionsQuery = (id: string) =>
  useQuery(outboundConnectionsQueryOptions(id));

export const useGetBrightIDProfileQuery = (id: string) =>
  useQuery(brightIdProfileQueryOptions(id));

export const useLazyGetBrightIDProfileQuery = (id: string) =>
  useQuery({ ...brightIdProfileQueryOptions(id), enabled: false });
