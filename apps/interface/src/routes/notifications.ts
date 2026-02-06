import { css, html, LitElement, type CSSResultGroup } from 'lit'
import { customElement } from 'lit/decorators.js'
import thumbsUpGreen from '@/assets/icons/thumbs-up.svg'

import '@/components/common/notification-card'
import { notificationItems } from '@/lib/notifications'
import { createBlockiesImage } from '@/utils/image'

@customElement('notifications-page')
export class NotificationsPage extends LitElement {
  static styles?: CSSResultGroup = css`
    section {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .filter {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .chip {
      border-radius: 13px;
      border: 1px solid rgba(93, 93, 93, 0.32);
      background: #161629;
      padding: 5px 10px;
      font-size: 14px;
      color: rgba(255, 255, 255, 0.64);
      cursor: pointer;
    }

    .chip.active {
      background: #28284a;
      color: #fff;
      border-color: #ccc;
    }

    h1 {
      margin-top: 0;
    }

    .no-notification-text {
      margin-top: 12px;
    }
  `

  private activeFilter: string = 'All'

  private filters = [
    { label: 'All', type: null },
    { label: 'Alert', type: 'alert' },
    { label: 'Evaluations', type: 'evaluation' },
    { label: 'Level', type: 'level' }
  ]

  private setFilter(filter: string) {
    this.activeFilter = filter
    this.requestUpdate()
  }

  protected render() {
    // Filter notifications based on active chip
    const items = notificationItems.get()
    const filtered =
      this.activeFilter === 'All'
        ? items
        : items.filter((item) => {
            if (this.activeFilter === 'Evaluations') return item.changeType === 'evaluation'
            if (this.activeFilter === 'Level') return item.changeType === 'level'
            return true
          })

    return html`
      <section>
        <h1>Notifications</h1>
        <div class="filter">
          ${this.filters.map(
            (f) => html`
              <button
                class="chip${this.activeFilter === f.label ? ' active' : ''}"
                @click=${() => this.setFilter(f.label)}
              >
                ${f.label}
              </button>
            `
          )}
        </div>
        ${filtered.length === 0
          ? html`
              <div style="text-align:center; margin: 48px 0; color: #888;">
                <svg width="48" height="48" fill="none" viewBox="0 0 48 48">
                  <circle cx="24" cy="24" r="22" stroke="#ddd" stroke-width="2" fill="none" />
                  <path
                    d="M16 32h16M24 16v8"
                    stroke="#ddd"
                    stroke-width="2"
                    stroke-linecap="round"
                  />
                  <circle cx="24" cy="28" r="1.5" fill="#ddd" />
                </svg>
                <div class="no-notification-text">No notifications yet</div>
              </div>
            `
          : filtered.map(
              (item) => html`
                <notification-card
                  .userName="${item.profileId}"
                  .timestamp="${item.createdAt}"
                  .description="${item.description}"
                  .icon="${thumbsUpGreen}"
                  .profileImage="${createBlockiesImage(item.profileId)}"
                ></notification-card>
              `
            )}
      </section>
    `
  }
}
