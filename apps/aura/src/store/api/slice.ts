import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { AURA_NODE_URL_PROXY } from '@/constants/urls';
import { Action } from 'redux';
import { REHYDRATE } from 'redux-persist';

function isHydrateAction(action: Action): action is Action<typeof REHYDRATE> & {
  key: string;
  payload: never;
  err: unknown;
} {
  return action.type === REHYDRATE;
}

export const apiSlice = createApi({
  reducerPath: 'apiSlice',
  baseQuery: fetchBaseQuery({
    baseUrl: AURA_NODE_URL_PROXY,
    mode: 'no-cors',
  }),

  tagTypes: ['BrightID'],
  extractRehydrationInfo(action, { reducerPath }): any {
    if (isHydrateAction(action)) {
      if (action.key === 'root' && action.payload) {
        const payload = action.payload[reducerPath] as ReturnType<
          typeof apiSlice.reducer
        >;
        const queries = payload.queries;

        return {
          ...payload,
          queries: Object.keys(queries).reduce(
            (prev, curr) => {
              if (queries[curr]?.data) {
                prev[curr] = queries[curr];
              }

              return prev;
            },
            {} as Record<string, any>,
          ),
          subscriptions: {},
        };
      }
    }
  },

  endpoints: () => ({}),
  keepUnusedDataFor: 150,
});

export const { reducer } = apiSlice;
