import { useUserStore } from './user.store';
import { useSettingsStore } from './settings.store';
import { useKeypairStore } from './keypair.store';
import { useOperationsStore } from './operations.store';
import { useProfileStore } from './profile.store';
import { useContactsStore } from './contacts.store';
import { useNotificationsStore } from './notifications.store';
import { useCacheStore } from './cache.store';
import { useRecoveryStore } from './recovery.store';

export function resetAllStores() {
  useUserStore.getState().reset();
  useSettingsStore.getState().reset();
  useKeypairStore.getState().reset();
  useOperationsStore.getState().reset();
  useProfileStore.getState().reset();
  useContactsStore.getState().reset();
  useNotificationsStore.getState().reset();
  useCacheStore.getState().reset();
  useRecoveryStore.getState().reset();
}
