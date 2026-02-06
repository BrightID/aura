import { AuraNodeBrightIdConnection, AuraNodeConnectionsResponse } from 'types';

import { apiSlice } from './slice';

export const connectionsApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getOutboundConnections: build.query<
      AuraNodeBrightIdConnection[],
      { id: string }
    >({
      query: ({ id }) => ({
        url: `/brightid/v6/users/${id}/connections/outbound?withVerifications=true`,
      }),
      keepUnusedDataFor: 30,
      extraOptions: { maxRetries: 0, refetchOnMountOrArgChange: 30 },
      transformResponse: (res: AuraNodeConnectionsResponse) =>
        res.data.connections,
      providesTags: (response) =>
        response?.map((item) => ({ id: item.id, type: 'BrightID' as const })) ??
        [],
    }),
    getInboundConnections: build.query<
      AuraNodeBrightIdConnection[],
      { id: string }
    >({
      query: ({ id }) => ({
        url: `/brightid/v6/users/${id}/connections/inbound?withVerifications=true`,
      }),
      transformResponse: (res: AuraNodeConnectionsResponse) =>
        res.data.connections,
      extraOptions: { maxRetries: 0, refetchOnMountOrArgChange: 30 },
      keepUnusedDataFor: 30,
      providesTags: (response) =>
        response?.map((item) => ({ id: item.id, type: 'BrightID' as const })) ??
        [],
    }),
  }),
});

export const { useGetInboundConnectionsQuery, useGetOutboundConnectionsQuery } =
  connectionsApi;
