import { css, html, LitElement, type CSSResultGroup } from 'lit'
import { customElement } from 'lit/decorators.js'

import '@/components/common/verifier-card'
import '@/components/common/verifier-card-skeleton'
import { queryClient } from '@/utils/apis'
import { fetchInboundConnections } from '@/utils/apis/notifications'
import { userBrightId } from '@/states/user'
import { signal, SignalWatcher } from '@lit-labs/signals'
import type { AuraNodeBrightIdConnection } from '@/types/brightid'
import { map } from 'lit/directives/map.js'
import { createBlockiesImage } from '@/utils/image'
import { EvaluationCategory, getAuraVerification } from '@/utils/aura'
import { subjectLevelPoints } from '@/lib/data/levels'

const verifications = signal([] as AuraNodeBrightIdConnection[])
const isLoading = signal(true)

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

    main {
      margin-top: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
  `

  constructor() {
    super()
    this.fetchInbounds()
  }

  private async fetchInbounds() {
    const res = await queryClient.ensureQueryData({
      queryKey: ['notifications'],
      queryFn: () => fetchInboundConnections(userBrightId.get())
    })

    isLoading.set(false)
    verifications.set(res)
  }

  private nextLevelScore(level: number) {
    return subjectLevelPoints[level + 1] || 0
  }

  protected render() {
    return html`
      <a-head level="1">Verifiers</a-head>

      <div class="filter">
        <a-button variant="ghost" size="sm">Level 1</a-button>
        <a-button variant="ghost" size="sm">Level 2</a-button>
        <a-button variant="ghost" size="sm">Level 3</a-button>
        <a-button variant="ghost" size="sm">Evaluated</a-button>
        <a-button variant="ghost" size="sm">Didn't evaluate</a-button>
      </div>

      <main>
        ${isLoading.get()
          ? html`
              <verification-card-skeleton></verification-card-skeleton>
              <verification-card-skeleton></verification-card-skeleton>
              <verification-card-skeleton></verification-card-skeleton>
            `
          : map(verifications.get(), (item) => {
              const verification = getAuraVerification(
                item.verifications,
                EvaluationCategory.PLAYER
              )
              const level = verification?.level ?? 0

              return html`
                <verifier-card
                  .verifierName=${item.id.slice(0, 7)}
                  verifierEmail=""
                  .verifierPicture=${createBlockiesImage(item.id)}
                  .verifierLevel=${level}
                  .progressPercent=${((verification?.score ?? 0) / this.nextLevelScore(level)) * 100}
                ></verifier-card>
              `
            })}
      </main>
    `
  }
}
