import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { auraBrightIdNodeApi } from '@/api';
import type { ConnectionInfo, UserConnectionsRes } from 'types';
import { brightIdProfileQueryOptions } from './connections';

export { useGetBrightIDProfileQuery, useLazyGetBrightIDProfileQuery } from './connections';

export const useGetGravatarProfileByHashedEmailQuery = (hashedEmail: string) =>
  useQuery({
    queryKey: ['gravatar', hashedEmail],
    queryFn: () =>
      axios
        .get<{ display_name: string; profile_url: string; avatar_url: string }>(
          `https://api.gravatar.com/v3/profiles/${hashedEmail}`,
        )
        .then((r) => r.data),
    staleTime: 300_000,
  });

export const useGetConnectionsQuery = (id: string, direction: 'inbound' | 'outbound') =>
  useQuery<ConnectionInfo[]>({
    queryKey: ['connections-info', id, direction],
    queryFn: async () => {
      const res = await auraBrightIdNodeApi.get<UserConnectionsRes>(
        `/users/${id}/connections/${direction}`,
      );
      return res.data.data.connections;
    },
    staleTime: 30_000,
  });
