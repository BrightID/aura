import { subjectLevelPoints } from '@/lib/data/levels';
import { userBrightId } from '@/states/user';
import { getBrightId, queryClient } from '@/utils/apis';
import { EvaluationCategory, getAuraVerification } from '@/utils/aura';
import { createBlockiesImage } from '@/utils/image';
import { compactFormat } from '@/utils/number';
import { signal, SignalWatcher } from '@lit-labs/signals';
import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

const score = signal(0);
const level = signal(0);
const profileLoaded = signal(false);
const profileError = signal(false);

@customElement('profile-card')
export class ProfileCard extends SignalWatcher(LitElement) {
  static styles = css`
    .profile-header {
      display: flex;
      align-items: center;
      text-align: left;
      gap: 16px;
      margin-bottom: 16px;
    }

    .profile-picture {
      width: 64px;
      height: 64px;
      border-radius: 16px;
      overflow: hidden;
      flex-shrink: 0;
    }

    .profile-picture img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .profile-info {
      flex: 1 1 auto;
      min-width: 0;
      overflow-wrap: anywhere;
    }
    .ellipsis {
      display: block;
      min-width: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .profile-stats {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: 10px;
      flex-wrap: wrap;
      text-align: left;
    }

    .progress-bar {
      width: 100%;
      height: 8px;
      background-color: color-mix(in oklch, var(--border) 50%, transparent);
      border-radius: 9999px;
      overflow: hidden;
      margin-top: 12px;
    }

    .progress {
      height: 100%;
      background-color: var(--primary);
      border-radius: 9999px;
    }
  `;

  @property({})
  firstName = '';

  @property({})
  lastName = '';

  @property({})
  email = '';

  @property({})
  image = createBlockiesImage(userBrightId.get());

  defaultUserImage = createBlockiesImage(userBrightId.get());

  constructor() {
    super();

    const brightId = userBrightId.get();
    if (!brightId) {
      profileLoaded.set(true);
      return;
    }

    score.set(0);
    level.set(0);
    profileError.set(false);
    profileLoaded.set(false);
    queryClient
      .ensureQueryData({
        queryKey: ['profile', brightId],
        queryFn: () => getBrightId(brightId),
      })
      .then((res) => {
        if (!res) return;
        const verification = getAuraVerification(
          res.verifications,
          EvaluationCategory.SUBJECT,
        );
        if (!verification) return;
        score.set(verification.score);
        level.set(verification.level);
      })
      .catch(() => {
        profileError.set(true);
      })
      .finally(() => {
        profileLoaded.set(true);
      });
  }

  private get displayName() {
    const name = `${this.firstName} ${this.lastName}`.trim();
    return name || 'No name yet';
  }

  private get nextLevel() {
    return level.get() + 1;
  }

  private get nextLevelScore() {
    return subjectLevelPoints[this.nextLevel] || 0;
  }

  protected render() {
    return html`
      <a-card variant="default">
        <div class="profile-header">
          <div class="profile-picture">
            <img
              src=${this.image || this.defaultUserImage}
              alt="Profile picture"
            />
          </div>
          <div class="profile-info">
            <a-head
              level="5"
              style="margin: 0; font-size: 1rem"
              title=${this.displayName}
            >
              <span class="ellipsis">${this.displayName}</span>
            </a-head>
            ${
              this.email
                ? html`<a-text
                    variant="muted"
                    style="margin-top: 2px; display: block"
                    title=${this.email}
                    ><span class="ellipsis">${this.email}</span></a-text
                  >`
                : ''
            }
          </div>
        </div>
        ${
          profileError.get()
            ? html`<a-text variant="muted">Could not load your level.</a-text>`
            : !profileLoaded.get()
              ? html`<a-skeleton style="height: 2.5rem"></a-skeleton>`
              : html`
                  <div class="profile-stats">
                    <a-badge variant="secondary" size="sm"
                      >Level ${level.get()}</a-badge
                    >
                    <a-badge variant="secondary" size="sm"
                      >Score ${compactFormat(score.get())}</a-badge
                    >
                    <a-text variant="small" style="color: var(--muted-foreground)">
                      ${
                        this.nextLevelScore > 0
                          ? html`${compactFormat(this.nextLevelScore)} to Level
                            ${this.nextLevel}`
                          : html`Max level`
                      }
                    </a-text>
                  </div>
                  <div class="progress-bar">
                    <div
                      class="progress"
                      style="width: ${Math.max(0, Math.min(100, this.nextLevelScore > 0 ? (score.get() / this.nextLevelScore) * 100 : 100))}%;"
                    ></div>
                  </div>
                `
        }

        <slot></slot>
      </a-card>
    `;
  }
}
