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
    .profile-card {
      background-image: linear-gradient(
        to top right,
        rgba(46, 51, 90, 0.26),
        rgba(28, 27, 51, 0.26) 100%
      );
      backdrop-filter: blur(21px);
      border-radius: 24px;
      padding: 25px 20px;
      border-top: 1px solid #ffffff30;
    }

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
    }

    .profile-picture img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .profile-info {
      flex: 1 1 auto;
    }

    .profile-info h2 {
      margin: 0;
      font-size: medium;
      font-weight: 700;
    }

    .profile-info p {
      margin: 4px 0 12px 0px;
      color: #dadada;
      font-size: smaller;
    }

    .profile-stats {
      font-size: 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      margin-top: 14px;
      max-width: 250px;
    }

    .stat {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .stat span:first-child {
      color: #dadada;
    }

    .stat span:last-child {
      font-weight: 700;
      font-size: 12px;
    }

    .level-progress {
      color: #ebebeb;
      font-size: 9px;
      font-weight: 300;
      letter-spacing: 1px;
    }

    .progress-bar {
      width: 100%;
      height: 12px;
      background-color: #313042;
      border-radius: 2px;
      overflow: hidden;
    }

    .progress {
      height: 100%;
      background-color: #5500ff;
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

    const fetchData = queryClient.ensureQueryData({
      queryKey: ['profile', brightId],
      queryFn: () => getBrightId(brightId)
    })

    fetchData.then((res) => {
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
      <div class="profile-card">
        <div class="profile-header">
          <div class="profile-picture">
            <img src=${this.image || this.defaultUserImage} alt="Profile picture" />
          </div>
          <div class="profile-info">
            <h2>${this.firstName + ' ' + this.lastName}</h2>
            <p>${this.email}</p>
            <div class="profile-stats">
              <div class="stat">
                <span>Level</span>
                <span>${level.get()}</span>
              </div>
              <div class="stat">
                <span>Score</span>
                <span>${compactFormat(score.get())}</span>
              </div>
              <div class="level-progress">
                ${this.nextLevel
                  ? html` Level ${level.get() + 1} at
                    ${level.get() + 1 > subjectLevelPoints.length
                      ? 'max-level'
                      : compactFormat(this.nextLevelScore)}`
                  : html`Max Level`}
              </div>
            </div>
          </div>
        </div>
        <div class="progress-bar">
          <div class="progress" style="width: ${(score.get() / this.nextLevelScore) * 100}%;"></div>
        </div>
        <slot></slot>
      </div>
    `
  }
}
