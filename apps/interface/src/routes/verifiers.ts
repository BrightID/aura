import { css, html, LitElement, type CSSResultGroup } from 'lit';
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
export class VerifiersPage extends SignalWatcher(LitElement) {
  static styles?: CSSResultGroup = css`
    .filter {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      align-items: center;
      margin-bottom: 8px;
    }

    .filter a-button {
      flex: 0 0 auto;
    }

    .filter a-button[variant='ghost']::part(button) {
      color: var(--muted-foreground);
    }

    main {
      margin-top: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .empty {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
      padding: 24px 0;
      color: var(--muted-foreground);
    }
  `;

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
      <a-head level="1">Activity</a-head>

      <div class="filter">
        ${filters.map(
          (filter) => html`
            <a-button
              size="sm"
              variant=${activityFilter.get() === filter.id ? 'default' : 'ghost'}
              @click=${() => this.setFilter(filter.id)}
            >
              ${filter.label}
            </a-button>
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
              ? html`<a-card variant="default">
                  <div class="empty">
                    <a-icon name="triangle-alert" size="md"></a-icon>
                    <a-text variant="muted">Could not load activity.</a-text>
                  </div>
                </a-card>`
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
          verifications.get().filter((item) => this.passesFilter(item)).length === 0
            ? html`<a-card variant="default">
                <div class="empty">
                  <a-icon name="inbox" size="md"></a-icon>
                  <a-text variant="muted">No activity yet.</a-text>
                </div>
              </a-card>`
            : ''
        }
      </main>
    `;
  }
}
