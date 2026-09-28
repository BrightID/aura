import { toast } from '@aura/ui';
import { createEffect, onMount } from 'solid-js';
import {
  dismissUpdate,
  initPwa,
  isUpdateDismissed,
  needRefresh,
  updateApp,
  versionReady,
} from '@/shared/lib/pwa';

/**
 * Headless PWA updater: registers the service worker and toasts
 * "New version available" with an Update action when one is waiting.
 * Dismiss sticks for this waiting script for the rest of the tab session.
 */
export default function UpdatePrompt() {
  onMount(initPwa);

  createEffect(() => {
    // Wait until the waiting worker names its precache, so a dismiss sticks
    // to that build and the next build can toast again.
    if (!needRefresh() || !versionReady() || isUpdateDismissed()) return;
    toast.info('New version available', {
      id: 'pwa-update',
      duration: Infinity,
      onDismiss: dismissUpdate,
      action: { label: 'Update', onClick: updateApp },
    });
  });

  return null;
}
