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
    .title {
      margin-top: 10px;
    }

    .filter {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      align-items: center;
    }

    .filter button {
      padding: 10px 15px;
      display: flex;

      border-radius: 4000px;
      cursor: pointer;

      color: rgba(255, 255, 255, 0.64);

      text-align: center;
      font-size: 11px;
      font-style: normal;
      font-weight: 400;
      line-height: normal;

      border: 1px solid rgba(93, 93, 93, 0.32);

      background: #161629;
    }

    main {
      margin-top: 30px;
      display: flex;
      flex-direction: column;
      gap: 20px;
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
      <h1 class="title">Verifiers</h1>

      <section class="filter">
        <button>Level 1</button>
        <button>Level 2</button>
        <button>Level 3</button>
        <button>Evaluated</button>
        <button>Didn't evaluate</button>
      </section>

      <main>
        ${isLoading.get()
          ? html`
              <verification-card-skeleton></verification-card-skeleton>
              <verification-card-skeleton></verification-card-skeleton>
              <verification-card-skeleton></verification-card-skeleton>
            `
          : map(verifications.get(), (item, key) => {
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
                  .progressPercent=${((verification?.score ?? 0) / this.nextLevelScore(level)) *
                  100}
                ></verifier-card>
              `
            })}
      </main>
    `
  }
}
