import { css, html, LitElement, type CSSResultGroup } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import thumbsUpGreen from '@/assets/icons/thumbs-up.svg';

@customElement('notification-card')
export class NotificationCard extends LitElement {
  @property({ type: String }) userName = '';
  @property({ type: Number }) timestamp = 0;
  @property({ type: String }) description = '';
  @property({ type: String }) icon = thumbsUpGreen;
  @property({ type: String }) profileImage = '';

  static styles?: CSSResultGroup | undefined = css`
    .row {
      display: flex;
      gap: 12px;
      align-items: flex-start;
      min-width: 0;
    }

    .profile-section {
      width: 44px;
      height: 44px;
      flex-shrink: 0;
      border-radius: 999px;
      background: var(--muted) center / cover no-repeat;
    }

    .content {
      flex: 1 1 auto;
      min-width: 0;
    }

    .title-section {
      display: flex;
      align-items: baseline;
      flex-wrap: wrap;
      gap: 4px 12px;
      text-align: left;
    }

    .timestamp {
      color: var(--muted-foreground);
      font-size: 12px;
      font-weight: 400;
      line-height: 1.35;
      white-space: nowrap;
    }

    .user-name {
      min-width: 0;
      max-width: 100%;
      white-space: nowrap;
      overflow: hidden;
      color: var(--foreground);
      text-overflow: ellipsis;
      font-size: 17px;
      font-weight: 700;
      letter-spacing: -0.34px;
    }

    .notification-description {
      display: flex;
      align-items: flex-start;
      gap: 6px;
      color: var(--muted-foreground);
      font-size: 15px;
      margin-top: 10px;
      text-align: left;
      font-weight: 400;
      line-height: 1.35;
    }

    .notification-description span {
      min-width: 0;
      overflow-wrap: anywhere;
    }

    .notification-description img {
      flex-shrink: 0;
      margin-top: 2px;
    }
  `;

  private formatTimestamp(ts: number) {
    if (!ts) return '';
    const date = new Date(ts);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  }

  protected render() {
    const image = this.profileImage
      ? `background-image: url('${this.profileImage}');`
      : '';
    return html`
      <a-card variant="default">
        <div class="row">
          <div class="profile-section" style=${image}></div>
          <div class="content">
            <div class="title-section">
              <span class="user-name" title=${this.userName}
                >${this.userName}</span
              >
              <span class="timestamp">${this.formatTimestamp(this.timestamp)}</span>
            </div>
            <div class="notification-description">
              <span>${this.description}</span>
              <img width="16" height="16" src="${this.icon}" alt="" />
            </div>
          </div>
        </div>
      </a-card>
    `;
  }
}
