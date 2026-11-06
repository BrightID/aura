import { iconUrl } from '@aura/ui/icon';
import { LightElement } from '@aura/widgets/light-element';
import { html } from 'lit';
import { customElement } from 'lit/decorators.js';

import '@/components/common/verifier-card';
import '@/components/common/verifier-card-skeleton';
import { queryClient } from '@/utils/apis';
import { fetchInboundConnections } from '@/utils/apis/notifications';
import { pushRouter } from '@/router';
import { userBrightId } from '@/states/user';
import { signal, SignalWatcher } from '@lit-labs/signals';
import type { AuraNodeBrightIdConnection } from '@/types/brightid';
import { map } from 'lit/directives/map.js';
import { createBlockiesImage } from '@/utils/image';
import { EvaluationCategory, getAuraVerification } from '@/utils/aura';
import { subjectLevelPoints } from '@/lib/data/levels';
import './verifiers.css';

const verifications = signal([] as AuraNodeBrightIdConnection[]);
const isLoading = signal(true);
const loadError = signal(false);

type ActivityFilter = 'all' | '1' | '2' | '3' | 'evaluated' | 'not';
const activityFilter = signal<ActivityFilter>('all');

const filters: { id: ActivityFilter; label: string }[] = [
  { id: '1', label: 'Level 1' },
  { id: '2', label: 'Level 2' },
  { id: '3', label: 'Level 3' },
  { id: 'evaluated', label: 'Evaluated' },
  { id: 'not', label: "Didn't evaluate" },
];

@customElement('verifiers-page')
export class VerifiersPage extends SignalWatcher(LightElement) {
  constructor() {
    super();
    if (!userBrightId.get()) {
      pushRouter('/login');
      return;
    }
    this.fetchInbounds();
  }

  private async fetchInbounds() {
    try {
      const res = await queryClient.ensureQueryData({
        queryKey: ['notifications'],
        queryFn: () => fetchInboundConnections(userBrightId.get()),
      });
      verifications.set(res);
      loadError.set(false);
    } catch {
      loadError.set(true);
    } finally {
      isLoading.set(false);
    }
  }

  private levelOf(item: AuraNodeBrightIdConnection) {
    return (
      getAuraVerification(item.verifications, EvaluationCategory.PLAYER)
        ?.level ?? 0
    );
  }

  private passesFilter(item: AuraNodeBrightIdConnection) {
    const verification = getAuraVerification(
      item.verifications,
      EvaluationCategory.PLAYER,
    );
    const level = verification?.level ?? 0;
    const filter = activityFilter.get();
    if (filter === '1') return level === 1;
    if (filter === '2') return level === 2;
    if (filter === '3') return level >= 3;
    if (filter === 'evaluated') return verification != null;
    if (filter === 'not') return verification == null;
    return true;
  }

  private setFilter(id: ActivityFilter) {
    activityFilter.set(activityFilter.get() === id ? 'all' : id);
  }

  private nextLevelScore(level: number) {
    return subjectLevelPoints[level + 1] || 0;
  }

  protected render() {
    return html`
      <h1 class="a-head" data-level="1">Activity</h1>

      <div class="filter">
        ${filters.map(
          (filter) => html`
            <button
              class="a-button"
              type="button"
              data-size="sm"
              data-variant=${activityFilter.get() === filter.id ? 'default' : 'ghost'}
              @click=${() => this.setFilter(filter.id)}
            >
              ${filter.label}
            </button>
          `,
        )}
      </div>

      <main>
        ${
          isLoading.get()
            ? html`
                <verifier-card-skeleton></verifier-card-skeleton>
                <verifier-card-skeleton></verifier-card-skeleton>
                <verifier-card-skeleton></verifier-card-skeleton>
              `
            : loadError.get()
              ? html`<div class="a-card" data-variant="default">
                  <div class="empty">
                    <span
                      class="a-icon text-2xl"
                      aria-hidden="true"
                      style="--icon-url: url('${iconUrl('triangle-alert')}')"
                    ></span>
                    <p class="a-text" data-variant="muted">
                      Could not load activity.
                    </p>
                  </div>
                </div>`
              : map(
                  verifications.get().filter((item) => this.passesFilter(item)),
                  (item) => {
                    const verification = getAuraVerification(
                      item.verifications,
                      EvaluationCategory.PLAYER,
                    );
                    const level = this.levelOf(item);
                    const next = this.nextLevelScore(level);
                    const score = verification?.score ?? 0;
                    const progressPercent =
                      next > 0 ? (score / next) * 100 : score > 0 ? 100 : 0;

                    return html`
                      <verifier-card
                        .verifierName=${item.id.slice(0, 7)}
                        verifierEmail=""
                        .verifierPicture=${createBlockiesImage(item.id)}
                        .verifierLevel=${level}
                        .progressPercent=${progressPercent}
                        .evaluationNote=${verification ? 'Evaluated you' : "Hasn't evaluated you"}
                      ></verifier-card>
                    `;
                  },
                )
        }
        ${
          !isLoading.get() &&
          !loadError.get() &&
          verifications.get().filter((item) => this.passesFilter(item))
            .length === 0
            ? html`<div class="a-card" data-variant="default">
                <div class="empty">
                  <span
                    class="a-icon text-2xl"
                    aria-hidden="true"
                    style="--icon-url: url('${iconUrl('inbox')}')"
                  ></span>
                  <p class="a-text" data-variant="muted">No activity yet.</p>
                </div>
              </div>`
            : ''
        }
      </main>
    `;
  }
}
