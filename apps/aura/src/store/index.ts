import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { combineReducers, Middleware } from 'redux';
import {
  createMigrate,
  persistReducer,
  persistStore,
  PERSIST,
  PURGE,
  REHYDRATE,
  PersistedState,
  PAUSE,
  FLUSH,
  REGISTER,
} from 'redux-persist';

import reducers from '@/features/brightid/reducer';
import { __DEV__ } from '@/utils/env';
import { apiSlice } from './api/slice';
import { migrations } from './migrations';
import { profileSlice } from './profile';
import { backupApiSlice } from './api/backup';
import {
  withReduxStateSync,
  createStateSyncMiddleware,
  initMessageListener,
} from 'redux-state-sync';
import { operationsSlice } from '@/features/brightid/actions';
import { cacheSlice } from './cache';
import localforage from 'localforage';
import { notificationsSlice } from './notifications';
import { contactsSlice } from './contacts';

const migrationManifest = createMigrate(migrations, { debug: __DEV__ });

const migrateDbFromDeserializedToSerialized = async () => {
  const localforageDbVersion = await localforage.getItem('version');

  if (Number(localforageDbVersion) >= dbVersion) return;

  const dbKey = `persist:${persistConfig.key}`;

  let persistData: Record<string, unknown> | null =
    await localforage.getItem(dbKey);

  if (!persistData) return;

  if (typeof persistData === 'string') {
    persistData = JSON.parse(persistData);
  }

  for (const key in persistData) {
    if (typeof persistData[key] === 'string') {
      try {
        persistData[key] = JSON.parse(persistData[key]);
      } catch {
        continue;
      }
    }
  }

  await localforage.setItem('version', 1);
  await localforage.setItem(dbKey, persistData);

  return persistData;
};

const persistIgnoredActions = [
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
];

const persistConfig = {
  key: 'root',
  version: 6,
  storage: localforage,
  blacklist: ['recoveryData'],
  migrate: async (state: PersistedState, currentVersion: number) => {
    const data = (await migrateDbFromDeserializedToSerialized()) ?? state;

    return await migrationManifest(data as PersistedState, currentVersion);
  },
  serialize: false,
  deserialize: false,
};

localforage.config({
  storeName: 'keyvaluepairs',
  name: 'localforage',
});

const dbVersion = 1;

const rootReducer = withReduxStateSync(
  combineReducers({
    ...reducers,
    profile: profileSlice.reducer,
    [contactsSlice.reducerPath]: contactsSlice.reducer,
    [notificationsSlice.reducerPath]: notificationsSlice.reducer,
    [cacheSlice.reducerPath]: cacheSlice.reducer,
  }),
);

const persistedReducer = persistReducer(persistConfig, rootReducer);

export function configureAppStore(preloadedState?: any) {
  const middlewares = [apiSlice.middleware, backupApiSlice.middleware];

  if (!process.env.VITEST) {
    const syncMiddleware = createStateSyncMiddleware({
      channel: 'AURA_UPDATE_CHANNEL',
      broadcastChannelOption: {
        type: typeof window !== 'undefined' ? 'localstorage' : 'native',
      },
      blacklist: [
        ...persistIgnoredActions,
        apiSlice.reducerPath,
        backupApiSlice.reducerPath,
        operationsSlice.reducerPath,
        '__rtkq/unfocused',
        '__rtkq/focused',
      ],
    });
    middlewares.push(syncMiddleware as Middleware);
  }

  const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
        immutableCheck: false,
      }).concat(...middlewares),
    preloadedState,
  });

  const persistor = persistStore(store);

  setupListeners(store.dispatch);
  initMessageListener(store);

  return { store, persistor };
}

export type AppStore = ReturnType<typeof configureAppStore>['store'];
export type AppDispatch = AppStore['dispatch'];
export type GetState = AppStore['getState'];
export type RootState = ReturnType<GetState>;
