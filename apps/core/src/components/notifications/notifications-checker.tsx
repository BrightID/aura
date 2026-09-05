import { createEffect, untrack } from 'solid-js';
import {
  createBrightIdProfileQuery,
  createInboundConnectionsQuery,
  createOutboundConnectionsQuery,
} from '@/queries/connections';
import { authStore } from '@/store/auth';
import { ingestNotifications, notificationsStore } from '@/store/notifications';
import { diffNotifications } from '@aura/domain/notifications';

/**
 * Headless checker: whenever the session's profile/connections queries refresh
 * (their normal cadence — no extra polling stack), diff the fresh data against
 * the tracked snapshot and ingest any new alerts. Renders nothing.
 */
export default function NotificationsChecker() {
  const subjectId = () => authStore.user?.brightId ?? '';

  const profile = createBrightIdProfileQuery(subjectId);
  const inbound = createInboundConnectionsQuery(subjectId);
  const outbound = createOutboundConnectionsQuery(subjectId);

  createEffect(() => {
    const id = subjectId();
    const verifications = profile.data?.verifications;
    const inboundData = inbound.data;
    const outboundData = outbound.data;
    if (!id || !verifications || !inboundData || !outboundData) return;

    // untrack: the diff reads (and ingest writes) the notifications store —
    // tracking those reads would re-trigger this effect in a loop. It should
    // only re-run when the queries deliver fresh data.
    untrack(() => {
      const now = Date.now();
      ingestNotifications(
        diffNotifications({
          subjectId: id,
          verifications,
          inbound: inboundData,
          outbound: outboundData,
          prevTracked: notificationsStore.tracked,
          lastFetch: notificationsStore.lastFetch,
          now,
        }),
        now,
      );
    });
  });

  return null;
}
