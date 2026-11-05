import { icon } from '../icon';
import { LightElement } from '../light-element';
import brightIDIcon from '@/assets/icons/brightid.svg';
import { AURA_NODE_URL } from '@/lib/constants/domains';
import { IMPORT_PREFIX, RECOVERY_CHANNEL_TTL } from '@/lib/constants/time';
import {
  aesKey,
  brightIDKeyGenerationTimestamp,
  privateKey,
  publicKey,
  recoveryId,
} from '@/lib/data/brightid';
import { userBrightId, userFirstName } from '@/states/user';
import { auraNodeAPI } from '@/utils/apis';
import { buildRecoveryChannelQrUrl, urlTypesOfActions } from '@/utils/brightid';
import { decryptData } from '@/utils/decoding';
import {
  b64ToUrlSafeB64,
  hash,
  uInt8ArrayToB64,
  urlSafeRandomKey,
} from '@/utils/encoding';
import { html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import nacl from 'tweetnacl';
import platform from 'platform';
import QrCodeWithLogo from 'qrcode-with-logos';
import './shared-styles.css';
import './brightid-qr.css';

@customElement('verification-brightid-qr')
export class VerificationBrightIDQrElement extends LightElement {
  @state() private qrSrc = '';
  @state() private deeplink = '';
  @state() private status: 'loading' | 'ready' | 'scanning' | 'error' =
    'loading';
  @state() private errorMsg = '';

  private _pollInterval: ReturnType<typeof setInterval> | null = null;

  async connectedCallback() {
    super.connectedCallback();
    await this._setup();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._clearPoll();
  }

  private async _setup() {
    try {
      if (!privateKey.get() || !aesKey.get() || !publicKey.get()) {
        await this._generateKeyPair();
      }
      await this._createChannel();
      this._buildQRCode();
      this._startPolling();
    } catch (err) {
      this.status = 'error';
      this.errorMsg =
        err instanceof Error
          ? err.message
          : 'Failed to create BrightID channel';
    }
  }

  private async _generateKeyPair() {
    const { publicKey: pub, secretKey: sec } = nacl.sign.keyPair();
    const key = await urlSafeRandomKey(16);
    publicKey.set(pub);
    privateKey.set(btoa(uInt8ArrayToB64(sec)));
    brightIDKeyGenerationTimestamp.set(Date.now());
    aesKey.set(key);
  }

  private async _createChannel() {
    const channelId = hash(aesKey.get());
    const pub = publicKey.get();
    if (!pub) throw new Error('No public key');

    const body = {
      data: {
        signingKey: uInt8ArrayToB64(pub),
        timestamp: brightIDKeyGenerationTimestamp.get(),
      },
      uuid: 'data',
      requestedTtl: Math.floor(RECOVERY_CHANNEL_TTL / 1000),
    };

    await auraNodeAPI.POST(`/upload/${channelId}` as never, { body } as never);
  }

  private _buildQRCode() {
    const channelUrl = `${AURA_NODE_URL}/profile`;

    const browser = platform.name;
    const os = platform.os?.family;
    const monthYear = new Date().toLocaleString('en-US', {
      month: 'short',
      year: 'numeric',
    });
    const deviceInfo = `${browser} ${os} ${monthYear}`;

    const qrUrl = buildRecoveryChannelQrUrl({
      aesKey: aesKey.get(),
      url: { href: channelUrl },
      t: urlTypesOfActions['superapp'],
      changePrimaryDevice: false,
      name: `Aura Verified ${deviceInfo}`,
    });

    this.deeplink = `https://app.brightid.org/connection-code/${encodeURIComponent(qrUrl.href)}`;

    const qrCode = new QrCodeWithLogo({
      width: 300,
      content: this.deeplink,
      logo: {
        src: '/images/brightid-qrcode-logo.svg',
        bgColor: '#333',
        borderWidth: 5,
      },
      cornersOptions: { radius: 50 },
      nodeQrCodeOptions: {},
      dotsOptions: { color: '#111', type: 'dot-small' },
    });

    qrCode.getImage().then((res) => {
      this.qrSrc = res.src;
      this.status = 'ready';
    });
  }

  private _startPolling() {
    this._pollInterval = setInterval(() => this._poll(), 5000);
  }

  private async _poll() {
    try {
      const channelId = hash(aesKey.get());

      const listRes = await auraNodeAPI.GET(`/list/${channelId}` as never);
      const data: any = listRes.data;

      if (!data || !('profileIds' in data)) return;

      const profileIds: string[] = data.profileIds;
      const prefix = `${IMPORT_PREFIX}userinfo_`;
      const signingKey = publicKey.get();

      if (!signingKey) return;

      const myKey = b64ToUrlSafeB64(uInt8ArrayToB64(signingKey));
      const targetId = profileIds.find(
        (id) =>
          id.startsWith(prefix) &&
          id.replace(prefix, '').split(':')[1] !== myKey,
      );
      if (!targetId) return;

      this.status = 'scanning';

      const res = await auraNodeAPI.GET(
        `/download/${channelId}/${targetId}` as never,
      );
      const encryptedData: any = res.data;
      if (!encryptedData?.data) return;

      await auraNodeAPI.DELETE(`/${channelId}/${targetId}` as never);

      const info = decryptData(encryptedData.data, aesKey.get());

      recoveryId.set(info.id);
      if (info.name) userFirstName.set(info.name);
      userBrightId.set(info.id);

      this._clearPoll();
      this._emit('connected');
    } catch {
      // silently retry on next interval
    }
  }

  private _clearPoll() {
    if (this._pollInterval !== null) {
      clearInterval(this._pollInterval);
      this._pollInterval = null;
    }
  }

  protected render() {
    return html`
      <div class="stack">
        <div class="page-header">
          <button
            class="back-btn"
            aria-label="Go back"
            @click=${() => this._emit('back')}
          >
            ${icon('lucide:chevron-left')}
          </button>
          <img src=${brightIDIcon} class="header-icon" alt="BrightID" />
          <h2 class="title">Connect with BrightID</h2>
        </div>

        <div class="qr-card">
          ${
            this.status === 'loading'
              ? html`<div class="qr-skeleton"></div>`
              : html`
                  <div class="qr-frame">
                    <img src=${this.qrSrc} alt="BrightID connection QR code" />
                  </div>
                `
          }
          ${
            this.status === 'scanning'
              ? html`
                  <span class="scanning-badge">
                    <span class="scanning-dot"></span>
                    BrightID connected — verifying…
                  </span>
                `
              : html`<p class="qr-caption">
                  Scan with the BrightID app to connect your identity
                </p>`
          }
        </div>

        ${
          this.deeplink
            ? html`
                <a
                  href=${this.deeplink}
                  class="open-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ${icon('lucide:smartphone')} Open in BrightID app instead
                </a>
              `
            : ''
        }

        <div class="steps">
          <div class="step-row">
            <span class="step-num">1</span>
            <span class="step-text">
              Don't have BrightID?
              <a
                href="https://www.brightid.org/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Download it here
              </a>
            </span>
          </div>
          <div class="step-row">
            <span class="step-num">2</span>
            <span class="step-text"
              >Open BrightID and tap the QR scan icon</span
            >
          </div>
          <div class="step-row">
            <span class="step-num">3</span>
            <span class="step-text"
              >Scan the code above — this page will update automatically</span
            >
          </div>
        </div>

        ${
          this.status === 'error'
            ? html`<p class="error-msg">${this.errorMsg}</p>`
            : ''
        }
      </div>
    `;
  }

  private _emit(event: string) {
    this.dispatchEvent(
      new CustomEvent(event, { bubbles: true, composed: true }),
    );
  }
}
