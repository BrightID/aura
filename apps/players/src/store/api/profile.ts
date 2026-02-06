import axios from 'axios';
import { apiSlice } from './slice';

export const profileApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getBrightIDProfile: build.query<ProfileInfo, string>({
      query: (id) => ({
        url: `/brightid/v6/users/${id}/profile`,
      }),
      keepUnusedDataFor: 60,
      transformResponse: (res: UserProfileRes) => res.data,
      providesTags: (res) =>
        res?.id ? [{ type: 'BrightID' as const, id: res.id }] : [],
    }),
    getGravatarProfileByHashedEmail: build.query<
      {
        display_name: string;
        profile_url: string;
        avatar_url: string;
      },
      string
    >({
      queryFn: (hashedEmail) =>
        axios.get(`https://api.gravatar.com/v3/profiles/${hashedEmail}`),
    }),
    getConnections: build.query<
      ConnectionInfo[],
      { id: string; direction: 'inbound' | 'outbound' }
    >({
      query: ({ direction, id }) => ({
        url: `/users/${id}/connections/${direction}`,
      }),
      transformResponse: (res: UserConnectionsRes) => res.data.connections,
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetConnectionsQuery,
  useGetBrightIDProfileQuery,
  useLazyGetBrightIDProfileQuery,
  useGetGravatarProfileByHashedEmailQuery,
} = profileApi;
