import { subjectLevelPoints } from '@/lib/data/levels'
import { userBrightId } from '@/states/user'
import { getBrightId, queryClient } from '@/utils/apis'
import { EvaluationCategory, getAuraVerification } from '@/utils/aura'
import { createBlockiesImage } from '@/utils/image'
import { compactFormat } from '@/utils/number'
import { signal, SignalWatcher } from '@lit-labs/signals'
import { css, html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'

const score = signal(0)
const level = signal(0)

@customElement('profile-card')
export class ProfileCard extends SignalWatcher(LitElement) {
  static styles = css`
    .profile-header {
      display: flex;
      align-items: center;
      text-align: left;
      gap: 24px;
      margin-bottom: 16px;
    }

    .profile-picture {
      width: 64px;
      height: 64px;
      border-radius: 6px;
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
    }

    .profile-stats {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: 10px;
      flex-wrap: wrap;
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
  `

  @property({})
  firstName = 'User'

  @property({})
  lastName = 'User'

  @property({})
  email = 'user@email.com'

  @property({})
  image = createBlockiesImage(userBrightId.get())

  defaultUserImage = createBlockiesImage(userBrightId.get())

  constructor() {
    super()

    const brightId = userBrightId.get()

    queryClient
      .ensureQueryData({
        queryKey: ['profile', brightId],
        queryFn: () => getBrightId(brightId)
      })
      .then((res) => {
        if (res) {
          const verification = getAuraVerification(res.verifications, EvaluationCategory.SUBJECT)
          if (!verification) return
          score.set(verification.score)
          level.set(verification.level)
        }
      })
  }

  private get nextLevel() {
    return level.get() + 1
  }

  private get nextLevelScore() {
    return subjectLevelPoints[this.nextLevel] || 0
  }

  protected render() {
    return html`
      <a-card variant="glass">
        <div class="profile-header">
          <div class="profile-picture">
            <img src=${this.image || this.defaultUserImage} alt="Profile picture" />
          </div>
          <div class="profile-info">
            <a-head level="5" style="margin: 0; font-size: 1rem">
              ${this.firstName + ' ' + this.lastName}
            </a-head>
            <a-text variant="muted" style="margin-top: 2px; display: block">${this.email}</a-text>

            <div class="profile-stats">
              <a-badge variant="secondary" size="sm">Level ${level.get()}</a-badge>
              <a-badge variant="secondary" size="sm">Score ${compactFormat(score.get())}</a-badge>
              <a-text variant="small" style="color: var(--muted-foreground)">
                ${this.nextLevel
                  ? html`Level ${level.get() + 1} at
                      ${level.get() + 1 > subjectLevelPoints.length
                        ? 'max-level'
                        : compactFormat(this.nextLevelScore)}`
                  : html`Max Level`}
              </a-text>
            </div>
          </div>
        </div>

        <div class="progress-bar">
          <div class="progress" style="width: ${(score.get() / this.nextLevelScore) * 100}%;"></div>
        </div>

        <slot></slot>
      </a-card>
    `
  }
}
