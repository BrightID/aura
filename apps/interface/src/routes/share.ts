import moreIcon from '@/assets/icons/thirdparties/more.svg'
import smsIcon from '@/assets/icons/thirdparties/sms.svg'
import telegramIcon from '@/assets/icons/thirdparties/telegram.svg'
import whatsappIcon from '@/assets/icons/thirdparties/whatsapp.svg'
import xIcon from '@/assets/icons/thirdparties/x.svg'
import { userBrightId } from '@/states/user'
import { signal, SignalWatcher } from '@lit-labs/signals'
import { css, html, LitElement, type CSSResultGroup } from 'lit'
import { customElement } from 'lit/decorators.js'
import QrCodeWithLogo from 'qrcode-with-logos'

import '@/components/common/gravatar-profile'
import '@/components/contacts-section'

const gravatarEmail = signal('')

const nickname = signal('')

const hashedEmail = signal('')

const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g

async function getGravatarHash(email: string) {
  const msgBuffer = new TextEncoder().encode(email.trim().toLowerCase())
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

@customElement('share-page')
export class SharePage extends SignalWatcher(LitElement) {
  static styles?: CSSResultGroup = css`
    .container {
      display: flex;
      flex-direction: column;
      color: #ffffff;
    }

    .main-content {
      flex: 1;
      padding: 0rem 1rem;
      max-width: 480px;
      margin: 0 auto;
      width: 100%;
    }

    .header {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      margin-bottom: 2rem;
    }

    .header {
      margin-bottom: 1.5rem;
    }

    .platform-buttons {
      display: flex;
      justify-content: start;
      gap: 12px;
      margin-top: 1.5rem;
    }

    .platform-button {
      display: flex;
      flex-direction: column;
      align-items: center;
      background: none;
      border: none;
      cursor: pointer;
      color: #ffffff;
      font-size: 12px;
      font-style: normal;
      font-weight: 400;
      line-height: 63.537%;
    }

    .platform-icon {
      width: 3rem;
      height: 3rem;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(to bottom, rgba(46, 51, 90, 0.26), rgba(28, 27, 51, 0.26) 100%);
      margin-bottom: 0.25rem;
    }

    .platform-label {
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }

    * {
      box-sizing: border-box;
    }

    .qr-code {
      display: flex;
      justify-content: center;
      margin-bottom: 0.5rem;
    }

    .qr-image {
      object-fit: contain;
      width: 240px;
      height: 240px;
      border-radius: 12px;
    }

    .profile-link {
      text-align: center;
      margin-top: 0.5rem;
    }

    .link {
      color: var(--accent);
      text-decoration: underline;
    }

    .social-buttons {
      display: flex;
      justify-content: space-around;
      margin-bottom: 3rem;
    }

    .social-button {
      display: flex;
      flex-direction: column;
      align-items: center;
      background: none;
      border: none;
      cursor: pointer;
      color: #ffffff;
    }

    .social-icon {
      width: 3rem;
      height: 3rem;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(to bottom, rgba(46, 51, 90, 0.26), rgba(28, 27, 51, 0.26) 100%);
      margin-bottom: 0.25rem;
    }

    .social-label {
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }

  `

  constructor() {
    super()

    this.generateQRCodeLink()
  }

  protected generateQRCodeLink() {
    const qrCode = new QrCodeWithLogo({
      width: 300,
      content: this.profileLink,
      logo: {
        src: '/images/brightId.svg',
        bgColor: '#333',
        borderWidth: 5
      },
      dotsOptions: {
        color: '#111'
      }
    })

    qrCode.getImage().then((res) => {
      this.linkImage.set(res.src)
    })
  }

  private get profileLink() {
    let queryParams = ''

    if (hashedEmail.get()) {
      queryParams = '?gravatar=' + encodeURIComponent(hashedEmail.get())
    }
    const name = nickname.get()
    if (name) {
      queryParams =
        queryParams.length > 0 ? queryParams + '&name=' + encodeURIComponent(name) : '?name=' + name
    }

    return (
      `https://aura-dev.vercel.app/subject/${encodeURIComponent(userBrightId.get())}/` + queryParams
    )
  }

  private isEmailValid() {
    return emailRegex.test(gravatarEmail.get())
  }

  private onNicknameChange(event: Event) {
    const value = event instanceof CustomEvent ? (event.detail as string) : (event.target as HTMLInputElement).value

    nickname.set(value)
    this.generateQRCodeLink()
  }

  private onEmailChange(event: Event) {
    const value = event instanceof CustomEvent ? (event.detail as string) : (event.target as HTMLInputElement).value

    gravatarEmail.set(value)
    if (this.isEmailValid()) {
      getGravatarHash(value).then((res) => {
        hashedEmail.set(res)
        this.generateQRCodeLink()
      })
    } else {
      this.generateQRCodeLink()
      hashedEmail.set('')
    }
  }

  linkImage = signal('')

  private handleShare(platform: string) {
    const url = this.profileLink
    const text = 'Check out my Aura profile!'
    let shareUrl = ''

    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
          url
        )}&text=${encodeURIComponent(text)}`
        window.open(shareUrl, '_blank')
        break
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`
        window.open(shareUrl, '_blank')
        break
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(
          text
        )}`
        window.open(shareUrl, '_blank')
        break
      case 'sms':
        shareUrl = `sms:?body=${encodeURIComponent(text + ' ' + url)}`
        window.open(shareUrl)
        break
      case 'more':
        if (navigator.share) {
          navigator.share({ title: 'Aura Profile', text, url })
        } else {
          navigator.clipboard.writeText(url)
          alert('Link copied to clipboard!')
        }
        break
      default:
        break
    }
  }

  protected render() {
    return html` <div class="container">
      <main class="main-content">
        <div class="header">
          <a-head level="1">Find Verifiers</a-head>
          <a-text variant="muted">
            Share your profile to relative aura players and ask for evaluation
          </a-text>
        </div>

        <contacts-section></contacts-section>

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

        <a-card style="margin-bottom: 1.5rem; text-align: center">
          <div class="qr-code">
            <img class="qr-image" .src="${this.linkImage.get()}" alt="qr code" />
          </div>

          <a-separator></a-separator>

          <div class="profile-link">
            <a href="${this.profileLink}" target="_blank" class="link"> Aura Profile Link </a>
          </div>
        </a-card>

        <div class="social-buttons">
          <button class="social-button" @click=${() => this.handleShare('twitter')}>
            <div class="social-icon twitter">
              <img src="${xIcon}" width="24" height="24" alt="x" />
            </div>
            <span class="social-label">Twitter</span>
          </button>
          <button class="social-button" @click=${() => this.handleShare('whatsapp')}>
            <div class="social-icon whatsapp">
              <img src="${whatsappIcon}" width="24" height="24" alt="whatsapp" />
            </div>
            <span class="social-label">Whatsapp</span>
          </button>
          <button class="social-button" @click=${() => this.handleShare('telegram')}>
            <div class="social-icon telegram">
              <img src="${telegramIcon}" width="24" height="24" alt="telegram" />
            </div>
            <span class="social-label">Telegram</span>
          </button>
          <button class="social-button" @click=${() => this.handleShare('sms')}>
            <div class="social-icon sms">
              <img src="${smsIcon}" width="24" height="24" alt="sms" />
            </div>
            <span class="social-label">SMS</span>
          </button>
          <button class="social-button" @click=${() => this.handleShare('more')}>
            <div class="social-icon more">
              <img src="${moreIcon}" width="24" height="24" alt="x" />
            </div>
            <span class="social-label">More</span>
          </button>
        </div>
      </main>
    </div>`
  }
}
