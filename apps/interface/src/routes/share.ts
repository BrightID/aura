import { LightElement } from '@aura/widgets/light-element';
import brightIDIcon from '@/assets/icons/brightid.svg';
import moreIcon from '@/assets/icons/thirdparties/more.svg';
import smsIcon from '@/assets/icons/thirdparties/sms.svg';
import telegramIcon from '@/assets/icons/thirdparties/telegram.svg';
import whatsappIcon from '@/assets/icons/thirdparties/whatsapp.svg';
import xIcon from '@/assets/icons/thirdparties/x.svg';
import { pushRouter } from '@/router';
import { userBrightId } from '@/states/user';
import { signal, SignalWatcher } from '@lit-labs/signals';
import { html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import QrCodeWithLogo from 'qrcode-with-logos';

import '@/components/common/gravatar-profile';
import './share.css';

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
export class SharePage extends SignalWatcher(LightElement) {
  @state() private contactsReady = false;
  @state() private contactsFailed = false;

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
    const value = (event.target as HTMLInputElement).value;

    nickname.set(value);
    this.generateQRCodeLink();
  }

  private onEmailChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;

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
        <div class="a-card gate" data-variant="default">
          <h2 class="a-head">Share</h2>
          <p class="a-text" data-variant="muted">
            Sign in to share your profile.
          </p>
          <button
            class="a-button"
            type="button"
            @click=${() => pushRouter('/login')}
          >
            Sign in
          </button>
        </div>
      `;
    }

    return html` <div class="container">
      <main class="main-content">
        <div class="header">
          <h1 class="a-head" data-level="1">Share</h1>
          <p class="a-text" data-variant="muted">
            Share your profile with Aura players and ask them to evaluate you.
          </p>
        </div>

        ${
          this.contactsFailed
            ? html`<p class="a-text" data-variant="muted">
                Contacts are unavailable in this session.
              </p>`
            : this.contactsReady
              ? html`<contacts-section></contacts-section>`
              : html`<div class="a-skeleton" style="height: 4rem"></div>`
        }

        <gravatar-profile .hashedEmail=${hashedEmail.get()}></gravatar-profile>

        <label class="a-field">
          Gravatar Email
          <input
            class="a-input"
            type="email"
            placeholder="gravatar@email.com"
            .value=${gravatarEmail.get()}
            @input=${this.onEmailChange}
          />
        </label>

        <label class="a-field">
          Your nickname
          <input
            class="a-input"
            .value=${nickname.get()}
            @input=${this.onNicknameChange}
            placeholder="Your name"
          />
        </label>

        <div class="a-card" data-variant="default" style="text-align: center">
          <div class="qr-code">
            ${
              this.linkImage.get()
                ? html`<img
                    class="qr-image"
                    src="${this.linkImage.get()}"
                    alt="Profile QR code"
                  />`
                : html`<div
                    class="a-skeleton"
                    style="width: 240px; height: 240px; border-radius: 12px"
                  ></div>`
            }
          </div>

          <hr class="a-separator my-6" />

          <div class="profile-link">
            <a href="${this.profileLink}" target="_blank" class="link">
              Aura Profile Link
            </a>
          </div>
        </div>

        <div class="social-buttons">
          <button
            class="a-button"
            type="button"
            data-variant="ghost"
            @click=${() => this.handleShare('twitter')}
          >
            <span class="social-icon">
              <img src="${xIcon}" width="24" height="24" alt="" />
            </span>
            <span class="social-label">X</span>
          </button>
          <button
            class="a-button"
            type="button"
            data-variant="ghost"
            @click=${() => this.handleShare('whatsapp')}
          >
            <span class="social-icon">
              <img src="${whatsappIcon}" width="24" height="24" alt="" />
            </span>
            <span class="social-label">WhatsApp</span>
          </button>
          <button
            class="a-button"
            type="button"
            data-variant="ghost"
            @click=${() => this.handleShare('telegram')}
          >
            <span class="social-icon">
              <img src="${telegramIcon}" width="24" height="24" alt="" />
            </span>
            <span class="social-label">Telegram</span>
          </button>
          <button
            class="a-button"
            type="button"
            data-variant="ghost"
            @click=${() => this.handleShare('sms')}
          >
            <span class="social-icon">
              <img src="${smsIcon}" width="24" height="24" alt="" />
            </span>
            <span class="social-label">SMS</span>
          </button>
          <button
            class="a-button"
            type="button"
            data-variant="ghost"
            @click=${() => this.handleShare('more')}
          >
            <span class="social-icon">
              <img src="${moreIcon}" width="24" height="24" alt="" />
            </span>
            <span class="social-label">More</span>
          </button>
        </div>
      </main>
    </div>`;
  }
}
