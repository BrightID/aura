import brightIDIcon from '@/assets/icons/brightid.svg';
import moreIcon from '@/assets/icons/thirdparties/more.svg';
import smsIcon from '@/assets/icons/thirdparties/sms.svg';
import telegramIcon from '@/assets/icons/thirdparties/telegram.svg';
import whatsappIcon from '@/assets/icons/thirdparties/whatsapp.svg';
import xIcon from '@/assets/icons/thirdparties/x.svg';
import { pushRouter } from '@/router';
import { userBrightId } from '@/states/user';
import { signal, SignalWatcher } from '@lit-labs/signals';
import { css, html, LitElement, type CSSResultGroup } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import QrCodeWithLogo from 'qrcode-with-logos';

import '@/components/common/gravatar-profile';

const gravatarEmail = signal('');

const nickname = signal('');

const hashedEmail = signal('');

const emailRegex = /^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/;

async function getGravatarHash(email: string) {
  const msgBuffer = new TextEncoder().encode(email.trim().toLowerCase());
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

@customElement('share-page')
export class SharePage extends SignalWatcher(LitElement) {
  @state() private contactsReady = false;
  @state() private contactsFailed = false;
  static styles?: CSSResultGroup = css`
    .container {
      display: flex;
      flex-direction: column;
      color: var(--foreground);
    }

    .main-content {
      flex: 1;
      width: 100%;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .header {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      text-align: left;
      gap: 6px;
    }

    * {
      box-sizing: border-box;
    }

    .gate a-button {
      width: 100%;
      margin-top: 16px;
    }

    .qr-code {
      display: flex;
      justify-content: center;
      margin-bottom: 0.5rem;
    }

    .qr-image {
      object-fit: contain;
      width: min(240px, 100%);
      height: auto;
      aspect-ratio: 1;
      border-radius: var(--radius);
    }

    .profile-link {
      text-align: center;
      margin-top: 0.5rem;
    }

    .link {
      color: var(--primary);
      text-decoration: underline;
    }

    .social-buttons {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 8px 12px;
    }

    .social-buttons a-button {
      flex: 0 0 5.5rem;
    }

    .social-buttons a-button::part(button) {
      flex-direction: column;
      height: auto;
      gap: 6px;
      padding: 8px 4px;
      color: var(--foreground);
    }

    .social-icon {
      width: 3rem;
      height: 3rem;
      border-radius: var(--radius);
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--muted);
    }

    .social-label {
      display: block;
      font-size: 0.75rem;
      line-height: 1.2;
      text-align: center;
      white-space: nowrap;
    }
  `;

  constructor() {
    super();
    this.generateQRCodeLink();
  }

  override connectedCallback(): void {
    super.connectedCallback();
    if (!userBrightId.get()) return;
    import('@/components/contacts-section')
      .then(() => {
        this.contactsReady = true;
      })
      .catch(() => {
        this.contactsFailed = true;
      });
  }

  protected generateQRCodeLink() {
    const build = (withLogo: boolean) =>
      new QrCodeWithLogo({
        width: 300,
        content: this.profileLink,
        nodeQrCodeOptions: {
          margin: 1,
          errorCorrectionLevel: 'H',
          color: { dark: '#111111', light: '#ffffff' },
        },
        ...(withLogo
          ? {
              logo: {
                src: brightIDIcon,
                bgColor: '#ffffff',
                borderColor: '#ffffff',
                borderWidth: 4,
              },
            }
          : {}),
      });

    build(true)
      .getImage()
      .then((res) => this.linkImage.set(res.src))
      .catch(() => {
        build(false)
          .getImage()
          .then((res) => this.linkImage.set(res.src))
          .catch(() => this.linkImage.set(''));
      });
  }

  private get profileLink() {
    let queryParams = '';

    if (hashedEmail.get()) {
      queryParams = '?gravatar=' + encodeURIComponent(hashedEmail.get());
    }
    const name = nickname.get();
    if (name) {
      queryParams =
        queryParams.length > 0
          ? queryParams + '&name=' + encodeURIComponent(name)
          : '?name=' + name;
    }

    return (
      `/core/subject/${encodeURIComponent(userBrightId.get())}/` + queryParams
    );
  }

  private isEmailValid() {
    return emailRegex.test(gravatarEmail.get());
  }

  private onNicknameChange(event: Event) {
    const value =
      event instanceof CustomEvent
        ? (event.detail as string)
        : (event.target as HTMLInputElement).value;

    nickname.set(value);
    this.generateQRCodeLink();
  }

  private onEmailChange(event: Event) {
    const value =
      event instanceof CustomEvent
        ? (event.detail as string)
        : (event.target as HTMLInputElement).value;

    gravatarEmail.set(value);
    if (this.isEmailValid()) {
      getGravatarHash(value).then((res) => {
        hashedEmail.set(res);
        this.generateQRCodeLink();
      });
    } else {
      this.generateQRCodeLink();
      hashedEmail.set('');
    }
  }

  linkImage = signal('');

  private handleShare(platform: string) {
    const url = this.profileLink;
    const text = 'Check out my Aura profile!';
    let shareUrl = '';

    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
          url,
        )}&text=${encodeURIComponent(text)}`;
        window.open(shareUrl, '_blank');
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
        window.open(shareUrl, '_blank');
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(
          text,
        )}`;
        window.open(shareUrl, '_blank');
        break;
      case 'sms':
        shareUrl = `sms:?body=${encodeURIComponent(text + ' ' + url)}`;
        window.open(shareUrl);
        break;
      case 'more':
        if (navigator.share) {
          navigator.share({ title: 'Aura Profile', text, url });
        } else {
          navigator.clipboard.writeText(url);
          alert('Link copied to clipboard!');
        }
        break;
      default:
        break;
    }
  }

  protected render() {
    if (!userBrightId.get()) {
      return html`
        <a-card variant="default" class="gate">
          <a-head level="2">Share</a-head>
          <a-text variant="muted">Sign in to share your profile.</a-text>
          <a-button @click=${() => pushRouter('/login')}>Sign in</a-button>
        </a-card>
      `;
    }

    return html` <div class="container">
      <main class="main-content">
        <div class="header">
          <a-head level="1">Share</a-head>
          <a-text variant="muted">
            Share your profile with Aura players and ask them to evaluate you.
          </a-text>
        </div>

        ${
          this.contactsFailed
            ? html`<a-text variant="muted">
                Contacts are unavailable in this session.
              </a-text>`
            : this.contactsReady
              ? html`<contacts-section></contacts-section>`
              : html`<a-skeleton style="height: 4rem"></a-skeleton>`
        }

        <gravatar-profile .hashedEmail=${hashedEmail.get()}></gravatar-profile>

        <a-input
          label="Gravatar Email"
          type="email"
          placeholder="gravatar@email.com"
          .value=${gravatarEmail.get()}
          @change=${this.onEmailChange}
        ></a-input>

        <a-input
          label="Your nickname"
          .value=${nickname.get()}
          @change=${this.onNicknameChange}
          placeholder="Your name"
        ></a-input>

        <a-card variant="default" style="text-align: center">
          <div class="qr-code">
            ${
              this.linkImage.get()
                ? html`<img
                    class="qr-image"
                    src="${this.linkImage.get()}"
                    alt="Profile QR code"
                  />`
                : html`<a-skeleton
                    style="width: 240px; height: 240px; border-radius: 12px"
                  ></a-skeleton>`
            }
          </div>

          <a-separator></a-separator>

          <div class="profile-link">
            <a href="${this.profileLink}" target="_blank" class="link">
              Aura Profile Link
            </a>
          </div>
        </a-card>

        <div class="social-buttons">
          <a-button variant="ghost" @click=${() => this.handleShare('twitter')}>
            <span class="social-icon">
              <img src="${xIcon}" width="24" height="24" alt="" />
            </span>
            <span class="social-label">X</span>
          </a-button>
          <a-button variant="ghost" @click=${() => this.handleShare('whatsapp')}>
            <span class="social-icon">
              <img src="${whatsappIcon}" width="24" height="24" alt="" />
            </span>
            <span class="social-label">WhatsApp</span>
          </a-button>
          <a-button variant="ghost" @click=${() => this.handleShare('telegram')}>
            <span class="social-icon">
              <img src="${telegramIcon}" width="24" height="24" alt="" />
            </span>
            <span class="social-label">Telegram</span>
          </a-button>
          <a-button variant="ghost" @click=${() => this.handleShare('sms')}>
            <span class="social-icon">
              <img src="${smsIcon}" width="24" height="24" alt="" />
            </span>
            <span class="social-label">SMS</span>
          </a-button>
          <a-button variant="ghost" @click=${() => this.handleShare('more')}>
            <span class="social-icon">
              <img src="${moreIcon}" width="24" height="24" alt="" />
            </span>
            <span class="social-label">More</span>
          </a-button>
        </div>
      </main>
    </div>`;
  }
}
