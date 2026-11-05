import { LightElement } from '@aura/widgets/light-element';
import { subjectLevelPoints } from '@/lib/data/levels';
import { userBrightId } from '@/states/user';
import { getBrightId, queryClient } from '@/utils/apis';
import { EvaluationCategory, getAuraVerification } from '@/utils/aura';
import { createBlockiesImage } from '@/utils/image';
import { compactFormat } from '@/utils/number';
import { signal, SignalWatcher } from '@lit-labs/signals';
import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import './profile-card.css';

const score = signal(0);
const level = signal(0);
const profileLoaded = signal(false);
const profileError = signal(false);

@customElement('profile-card')
export class ProfileCard extends SignalWatcher(LightElement) {
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
      <div class="a-card" data-variant="default">
        <div class="profile-header">
          <div class="profile-picture">
            <img
              src=${this.image || this.defaultUserImage}
              alt="Profile picture"
            />
          </div>
          <div class="profile-info">
            <h5
              class="a-head"
              data-level="5"
              style="margin: 0; font-size: 1rem"
              title=${this.displayName}
            >
              <span class="ellipsis">${this.displayName}</span>
            </h5>
            ${
              this.email
                ? html`<p
                    class="a-text"
                    data-variant="muted"
                    style="margin-top: 2px; display: block"
                    title=${this.email}
                  >
                    <span class="ellipsis">${this.email}</span>
                  </p>`
                : ''
            }
          </div>
        </div>
        ${
          profileError.get()
            ? html`<p class="a-text" data-variant="muted">
                Could not load your level.
              </p>`
            : !profileLoaded.get()
              ? html`<div class="a-skeleton" style="height: 2.5rem"></div>`
              : html`
                  <div class="profile-stats">
                    <span
                      class="a-badge"
                      data-variant="secondary"
                      data-size="sm"
                      >Level ${level.get()}</span
                    >
                    <span
                      class="a-badge"
                      data-variant="secondary"
                      data-size="sm"
                      >Score ${compactFormat(score.get())}</span
                    >
                    <p
                      class="a-text"
                      data-variant="small"
                      style="color: var(--muted-foreground)"
                    >
                      ${
                        this.nextLevelScore > 0
                          ? html`${compactFormat(this.nextLevelScore)} to Level
                            ${this.nextLevel}`
                          : html`Max level`
                      }
                    </p>
                  </div>
                  <div class="progress-bar">
                    <div
                      class="progress"
                      style="width: ${Math.max(0, Math.min(100, this.nextLevelScore > 0 ? (score.get() / this.nextLevelScore) * 100 : 100))}%;"
                    ></div>
                  </div>
                `
        }
        ${this.slotted}
      </div>
    `;
  }
}
