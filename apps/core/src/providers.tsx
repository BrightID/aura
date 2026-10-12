import { QueryClient, QueryClientProvider } from '@tanstack/solid-query';
import localforage from 'localforage';
import { createEffect, onMount, type ParentComponent } from 'solid-js';
import OpNotifications from '@/components/evaluation/op-notifications';
import NotificationsChecker from '@/components/notifications/notifications-checker';
import { preferencesStore } from '@/store/preferences';
import { isNotFound } from '@aura/domain/http';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 0,
      staleTime: 0,
      // 404 = "no profile on the node yet" — a real answer, don't retry it
      retry: (failureCount, error) => !isNotFound(error) && failureCount < 3,
    },
  },
});

/** Wipe active query data on logout. */
export function clearQueryCache(): void {
  queryClient.clear();
}

const Providers: ParentComponent = (props) => {
  // Remove query data persisted by earlier versions; keep user settings intact.
  onMount(() => {
    void localforage
      .createInstance({ name: 'aura', storeName: 'query-cache' })
      .removeItem('aura-query-cache')
      .catch((error) =>
        console.warn('Could not remove legacy query cache', error),
      );
  });

  // Apply the persisted theme to the document root (tailwind `.dark` variant).
  createEffect(() => {
    document.documentElement.classList.toggle(
      'dark',
      preferencesStore.theme === 'dark',
    );
  });

  return (
    <QueryClientProvider client={queryClient}>
      <a-toaster />
      <OpNotifications />
      <NotificationsChecker />
      {props.children}
    </QueryClientProvider>
  );
};

export default Providers;
