import { LightElement } from '@aura/widgets/light-element';
import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import thumbsUpGreen from '@/assets/icons/thumbs-up.svg';
import './notification-card.css';

@customElement('notification-card')
export class NotificationCard extends LightElement {
  @property({ type: String }) userName = '';
  @property({ type: Number }) timestamp = 0;
  @property({ type: String }) description = '';
  @property({ type: String }) icon = thumbsUpGreen;
  @property({ type: String }) profileImage = '';

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
      <div class="a-card" data-variant="default">
        <div class="row">
          <div class="profile-section" style=${image}></div>
          <div class="content">
            <div class="title-section">
              <span class="user-name" title=${this.userName}
                >${this.userName}</span
              >
              <span class="timestamp"
                >${this.formatTimestamp(this.timestamp)}</span
              >
            </div>
            <div class="notification-description">
              <span>${this.description}</span>
              <img width="16" height="16" src="${this.icon}" alt="" />
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
