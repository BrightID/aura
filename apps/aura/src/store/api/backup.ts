import { BrightIdBackup } from '@/types';
import { decryptData, decryptUserData, hash } from '@/utils/crypto';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Action } from 'redux';
import { REHYDRATE } from 'redux-persist';

function isHydrateAction(action: Action): action is Action<typeof REHYDRATE> & {
  key: string;
  payload: never;
  err: unknown;
} {
  return action.type === REHYDRATE;
}

export const backupApiSlice = createApi({
  reducerPath: 'backupApiSlice',
  baseQuery: fetchBaseQuery({
    baseUrl: '/',
    mode: 'no-cors',
  }),
  extractRehydrationInfo(action, { reducerPath }): any {
    if (isHydrateAction(action)) {
      if (action.key === 'root' && action.payload) {
        // return action.payload[reducerPath];
      }
    }

    return undefined;
  },

  endpoints: (build) => ({
    getAppLatestVersion: build.query<string, undefined>({
      query: () => ({
        url: '/versioning.txt',
        cache: 'no-store',
        method: 'GET',
        responseHandler: 'text',
      }),
      keepUnusedDataFor: 0,
    }),
    getProfileData: build.query<
      BrightIdBackup,
      { brightId: string; password: string }
    >({
      query: ({ brightId, password }) => ({
        url: `/brightid/backups/${hash(brightId + password)}/data`,
        method: 'GET',
        responseHandler: 'text',
      }),
      extraOptions: {
        maxRetries: 0,
      },
      transformResponse: (response: string, meta, args) => {
        return decryptUserData(response, args.password) as BrightIdBackup;
      },
    }),
    getProfilePhoto: build.query<
      string,
      { key: string; brightId: string; password: string }
    >({
      query: ({ brightId, key }) => ({
        url: `/brightid/backups/${key}/${brightId}`,
        method: 'GET',
        responseHandler: 'text',
      }),
      extraOptions: {
        maxRetries: 0,
      },
      transformResponse: (response: string, meta, args) => {
        return decryptData(response, args.password);
      },
    }),
  }),
  keepUnusedDataFor: 5000,
});

export const { reducer } = backupApiSlice;

export const { getProfilePhoto, getAppLatestVersion } =
  backupApiSlice.endpoints;

export const {
  useGetProfilePhotoQuery,
  useLazyGetProfilePhotoQuery,
  useGetAppLatestVersionQuery,
  useLazyGetAppLatestVersionQuery,
  useGetProfileDataQuery,
} = backupApiSlice;
