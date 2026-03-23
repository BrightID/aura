import brightIDIcon from '@/assets/icons/brightid.svg'
import { AURA_NODE_URL, AURA_NODE_URL_PROXY } from '@/lib/constants/domains'
import { IMPORT_PREFIX, RECOVERY_CHANNEL_TTL } from '@/lib/constants/time'
import {
  aesKey,
  brightIDKeyGenerationTimestamp,
  privateKey,
  publicKey,
  recoveryId
} from '@/lib/data/brightid'
import { userBrightId, userFirstName } from '@/states/user'
import { auraNodeAPI } from '@/utils/apis'
import { buildRecoveryChannelQrUrl, urlTypesOfActions } from '@/utils/brightid'
import { decryptData } from '@/utils/decoding'
import {
  b64ToUrlSafeB64,
  hash,
  uInt8ArrayToB64,
  urlSafeRandomKey
} from '@/utils/encoding'
import { css, type CSSResultGroup, html, LitElement } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import nacl from 'tweetnacl'
import platform from 'platform'
import QrCodeWithLogo from 'qrcode-with-logos'

@customElement('verification-brightid-qr')
export class VerificationBrightIDQrElement extends LitElement {
  @state() private qrSrc = ''
  @state() private deeplink = ''
  @state() private status: 'loading' | 'ready' | 'scanning' | 'error' = 'loading'
  @state() private errorMsg = ''

  private _pollInterval: ReturnType<typeof setInterval> | null = null

  static styles: CSSResultGroup = css`
    :host {
      display: block;
      font-size: inherit;
    }

    .stack {
      display: flex;
      flex-direction: column;
      gap: 1.25em;
    }

    /* Header */
    .page-header {
      display: flex;
      align-items: center;
      gap: 0.75em;
    }
    .back-btn {
      padding: 0.375em;
      margin-left: -0.375em;
      border-radius: 0.5em;
      background: none;
      border: none;
      cursor: pointer;
      color: var(--muted-foreground);
      transition: background 0.15s;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .back-btn:hover {
      background: var(--secondary);
    }
    .back-btn svg {
      width: 1.25em;
      height: 1.25em;
    }
    .header-icon {
      width: 1.5em;
      height: 1.5em;
      flex-shrink: 0;
    }
    .title {
      margin: 0;
      font-size: 1em;
      font-weight: 600;
      color: var(--foreground);
    }

    /* QR card */
    .qr-card {
      background: var(--secondary);
      border: 1px solid var(--border);
      border-radius: var(--radius, 0.75rem);
      padding: 1.25em;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1em;
    }
    .qr-frame {
      width: 11em;
      height: 11em;
      border-radius: 0.75em;
      overflow: hidden;
      background: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .qr-frame img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    .qr-caption {
      margin: 0;
      font-size: 0.8em;
      color: var(--muted-foreground);
      text-align: center;
      line-height: 1.4;
    }

    /* Loading skeleton */
    .qr-skeleton {
      width: 11em;
      height: 11em;
      border-radius: 0.75em;
      background: linear-gradient(
        90deg,
        var(--border) 25%,
        rgba(128, 128, 128, 0.08) 50%,
        var(--border) 75%
      );
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }
    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    /* Scanning indicator */
    .scanning-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.375em;
      font-size: 0.75em;
      color: var(--aura-success, #22c55e);
      background: rgba(34, 197, 94, 0.1);
      border: 1px solid rgba(34, 197, 94, 0.25);
      padding: 0.25em 0.625em;
      border-radius: 9999px;
    }
    .scanning-dot {
      width: 0.5em;
      height: 0.5em;
      border-radius: 9999px;
      background: currentColor;
      animation: pulse 1s ease-in-out infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; }
    }

    /* Steps */
    .steps {
      display: flex;
      flex-direction: column;
      gap: 0.5em;
    }
    .step-row {
      display: flex;
      gap: 0.625em;
      align-items: flex-start;
    }
    .step-num {
      flex-shrink: 0;
      width: 1.375em;
      height: 1.375em;
      border-radius: 9999px;
      background: rgba(var(--primary-rgb, 99, 102, 241), 0.1);
      color: var(--primary);
      font-size: 0.7em;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: 0.1em;
    }
    .step-text {
      font-size: 0.8125em;
      color: var(--muted-foreground);
      line-height: 1.5;
    }
    .step-text a {
      color: var(--primary);
      text-decoration: none;
    }
    .step-text a:hover {
      text-decoration: underline;
    }

    /* Open in app link */
    .open-link {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.375em;
      font-size: 0.8125em;
      color: var(--primary);
      text-decoration: none;
      padding: 0.5em;
      border-radius: 0.5em;
      transition: background 0.15s;
    }
    .open-link:hover {
      background: rgba(var(--primary-rgb, 99, 102, 241), 0.08);
    }
    .open-link svg {
      width: 0.875em;
      height: 0.875em;
      flex-shrink: 0;
    }

    /* Error */
    .error-msg {
      padding: 0.625em 0.75em;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
      border-radius: 0.5em;
      font-size: 0.75em;
      color: var(--destructive);
    }
  `

  async connectedCallback() {
    super.connectedCallback()
    await this._setup()
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    this._clearPoll()
  }

  private async _setup() {
    try {
      if (!privateKey.get() || !aesKey.get() || !publicKey.get()) {
        await this._generateKeyPair()
      }
      await this._createChannel()
      this._buildQRCode()
      this._startPolling()
    } catch (err) {
      this.status = 'error'
      this.errorMsg = err instanceof Error ? err.message : 'Failed to create BrightID channel'
    }
  }

  private async _generateKeyPair() {
    const { publicKey: pub, secretKey: sec } = nacl.sign.keyPair()
    const key = await urlSafeRandomKey(16)
    publicKey.set(pub)
    privateKey.set(btoa(uInt8ArrayToB64(sec)))
    brightIDKeyGenerationTimestamp.set(Date.now())
    aesKey.set(key)
  }

  private async _createChannel() {
    const channelId = hash(aesKey.get())
    const pub = publicKey.get()
    if (!pub) throw new Error('No public key')

    const body = {
      data: {
        signingKey: uInt8ArrayToB64(pub),
        timestamp: brightIDKeyGenerationTimestamp.get()
      },
      uuid: 'data',
      requestedTtl: Math.floor(RECOVERY_CHANNEL_TTL / 1000)
    }

    await auraNodeAPI.POST(`/upload/${channelId}` as never, { body } as never)
  }

  private _buildQRCode() {
    const baseUrl = AURA_NODE_URL_PROXY
    const channelUrl = `${location.origin}${baseUrl}/profile`

    const browser = platform.name
    const os = platform.os?.family
    const monthYear = new Date().toLocaleString('en-US', { month: 'short', year: 'numeric' })
    const deviceInfo = `${browser} ${os} ${monthYear}`

    const qrUrl = buildRecoveryChannelQrUrl({
      aesKey: aesKey.get(),
      url: {
        href: channelUrl.startsWith('/')
          ? channelUrl.replace(AURA_NODE_URL_PROXY, AURA_NODE_URL)
          : channelUrl
      },
      t: urlTypesOfActions['superapp'],
      changePrimaryDevice: false,
      name: `Aura Verified ${deviceInfo}`
    })

    this.deeplink = `https://app.brightid.org/connection-code/${encodeURIComponent(qrUrl.href)}`

    const qrCode = new QrCodeWithLogo({
      width: 300,
      content: this.deeplink,
      logo: {
        src: '/images/brightid-qrcode-logo.svg',
        bgColor: '#333',
        borderWidth: 5
      },
      cornersOptions: { radius: 50 },
      nodeQrCodeOptions: {},
      dotsOptions: { color: '#111', type: 'dot-small' }
    })

    qrCode.getImage().then((res) => {
      this.qrSrc = res.src
      this.status = 'ready'
    })
  }

  private _startPolling() {
    this._pollInterval = setInterval(() => this._poll(), 5000)
  }

  private async _poll() {
    try {
      const channelId = hash(aesKey.get())

      const listRes = await auraNodeAPI.GET(`/list/${channelId}` as never)
      const data: any = listRes.data

      if (!data || !('profileIds' in data)) return

      const profileIds: string[] = data.profileIds
      const prefix = `${IMPORT_PREFIX}userinfo_`
      const signingKey = publicKey.get()

      if (!signingKey) return

      const myKey = b64ToUrlSafeB64(uInt8ArrayToB64(signingKey))
      const targetId = profileIds.find(
        (id) => id.startsWith(prefix) && id.replace(prefix, '').split(':')[1] !== myKey
      )
      if (!targetId) return

      this.status = 'scanning'

      const res = await auraNodeAPI.GET(`/download/${channelId}/${targetId}` as never)
      const encryptedData: any = res.data
      if (!encryptedData?.data) return

      await auraNodeAPI.DELETE(`/${channelId}/${targetId}` as never)

      const info = decryptData(encryptedData.data, aesKey.get())

      recoveryId.set(info.id)
      if (info.name) userFirstName.set(info.name)
      userBrightId.set(info.id)

      this._clearPoll()
      this._emit('connected')
    } catch {
      // silently retry on next interval
    }
  }

  private _clearPoll() {
    if (this._pollInterval !== null) {
      clearInterval(this._pollInterval)
      this._pollInterval = null
    }
  }

  protected render() {
    return html`
      <div class="stack">
        <div class="page-header">
          <button class="back-btn" aria-label="Go back" @click=${() => this._emit('back')}>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <img src=${brightIDIcon} class="header-icon" alt="BrightID" />
          <h2 class="title">Connect with BrightID</h2>
        </div>

        <div class="qr-card">
          ${this.status === 'loading'
            ? html`<div class="qr-skeleton"></div>`
            : html`
                <div class="qr-frame">
                  <img src=${this.qrSrc} alt="BrightID connection QR code" />
                </div>
              `}

          ${this.status === 'scanning'
            ? html`
                <span class="scanning-badge">
                  <span class="scanning-dot"></span>
                  BrightID connected — verifying…
                </span>
              `
            : html`<p class="qr-caption">Scan with the BrightID app to connect your identity</p>`}
        </div>

        ${this.deeplink
          ? html`
              <a href=${this.deeplink} class="open-link" target="_blank" rel="noopener noreferrer">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Open in BrightID app instead
              </a>
            `
          : ''}

        <div class="steps">
          <div class="step-row">
            <span class="step-num">1</span>
            <span class="step-text">
              Don't have BrightID?
              <a href="https://www.brightid.org/" target="_blank" rel="noopener noreferrer">
                Download it here
              </a>
            </span>
          </div>
          <div class="step-row">
            <span class="step-num">2</span>
            <span class="step-text">Open BrightID and tap the QR scan icon</span>
          </div>
          <div class="step-row">
            <span class="step-num">3</span>
            <span class="step-text">Scan the code above — this page will update automatically</span>
          </div>
        </div>

        ${this.status === 'error'
          ? html`<p class="error-msg">${this.errorMsg}</p>`
          : ''}
      </div>
    `
  }

  private _emit(event: string) {
    this.dispatchEvent(new CustomEvent(event, { bubbles: true, composed: true }))
  }
}
