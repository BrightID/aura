import { LightElement } from '@aura/widgets/light-element';
import { signal, SignalWatcher } from '@lit-labs/signals';
import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import platform from 'platform';
import nacl from 'tweetnacl';

import { AURA_NODE_URL } from '@/lib/constants/domains';
import { IMPORT_PREFIX, RECOVERY_CHANNEL_TTL } from '@/lib/constants/time';
import {
  aesKey,
  brightIDKeyGenerationTimestamp,
  privateKey,
  publicKey,
  recoveryId,
} from '@/lib/data/brightid';
import { pushRouter } from '@/router';
import { userBrightId, userFirstName } from '@/states/user';
import { auraNodeAPI } from '@/utils/apis';
import { buildRecoveryChannelQrUrl, urlTypesOfActions } from '@/utils/brightid';
import { decryptData } from '@/utils/decoding';
import {
  b64ToUint8Array,
  b64ToUrlSafeB64,
  hash,
  UInt8ArrayEqual,
  uInt8ArrayToB64,
  urlSafeRandomKey,
} from '@/utils/encoding';
import QrCodeWithLogo from 'qrcode-with-logos';

import '@/components/landing/footer-section';
import '@/components/landing/hero-section';
import './brightid.css';

const brightIDQRLink = signal('');
const brightIDQrImage = signal('');

const interval = signal(null as null | number | NodeJS.Timeout);

@customElement('brightid-login')
export class BrightIDLoginElement extends SignalWatcher(LightElement) {
  @property({ type: Boolean })
  withoutTitle = false;

  constructor() {
    super();

    if (!brightIDQRLink.get()) this.setupBrightIDSuperAppLogin();
  }

  protected async setupRecovery() {
    const { publicKey: _public, secretKey: _secret } = nacl.sign.keyPair();

    const key = await urlSafeRandomKey(16);

    publicKey.set(_public);
    privateKey.set(btoa(uInt8ArrayToB64(_secret)));
    brightIDKeyGenerationTimestamp.set(Date.now());

    aesKey.set(key);
  }

  protected async createRecoveryChannel(location: string) {
    const channelId = hash(aesKey.get());

    const pubk = publicKey.get();

    if (!pubk) return;

    const dataObj = {
      signingKey: uInt8ArrayToB64(pubk),
      timestamp: brightIDKeyGenerationTimestamp.get(),
    };

    const requestedTtl = RECOVERY_CHANNEL_TTL;

    const requestedTtlSecs = requestedTtl
      ? Math.floor(requestedTtl / 1000)
      : undefined;

    const body = {
      data: dataObj,
      uuid: 'data',
      requestedTtl: requestedTtlSecs,
    };

    let retries = 0;
    let result = await auraNodeAPI.POST(
      `/upload/${channelId}` as never,
      { body } as never,
    );
  }

  protected async checkRecoveryState() {
    const channelId = hash(aesKey.get());

    const listRes = await auraNodeAPI.GET(`/list/${channelId}` as never);

    const data: any | undefined = listRes.data;

    if (!!data && 'profileIds' in data) {
      return data.profileIds;
    } else {
      throw new Error(
        `list for channel ${channelId}: Unexpected response format`,
      );
    }
  }

  protected async downloadBackup(
    channelId: string,
    aesKey: string,
    dataIds: Array<string>,
  ) {
    const prefix = `${IMPORT_PREFIX}userinfo_`;
    const signingKey = publicKey.get();

    if (!signingKey) return;
    const isUserInfo = (id: string) => id.startsWith(prefix);
    const uploader = (id: string) => id.replace(prefix, '').split(':')[1];
    const userInfoDataId = dataIds.find(
      (dataId) =>
        isUserInfo(dataId) &&
        uploader(dataId) !== b64ToUrlSafeB64(uInt8ArrayToB64(signingKey)),
    );
    if (!userInfoDataId) {
      return false;
    }

    const res = await auraNodeAPI.GET(
      `/download/${channelId}/${userInfoDataId}` as never,
    );

    const encryptedData: any | undefined = res.data;

    if (!encryptedData?.data) return false;

    await auraNodeAPI.DELETE(`/${channelId}/${userInfoDataId}` as never);

    const info = decryptData(encryptedData.data, aesKey);

    recoveryId.set(info.id);
    if (info.name) {
      userFirstName.set(info.name);
    }

    console.log({ info });
    userBrightId.set(info.id);

    return true;
  }

  protected verifyKeyPair(publicKey: string, pk: Uint8Array) {
    let pubKeyUInt8: Uint8Array;
    try {
      pubKeyUInt8 = b64ToUint8Array(publicKey);
    } catch {
      throw Error(`publicKey is not base64-encoded`);
    }
    if (pubKeyUInt8.length !== nacl.sign.publicKeyLength) {
      throw Error(
        `publicKey size wrong, expected: ${nacl.sign.publicKeyLength} - Actual: ${pubKeyUInt8.length}`,
      );
    }

    if (!pk) {
      throw Error(`Invalid keypair: secretKey undefined`);
    }
    if (pk.length !== nacl.sign.secretKeyLength) {
      throw Error(
        `secretKey size wrong, expected: ${nacl.sign.secretKeyLength} - actual: ${pk.length}`,
      );
    }

    const { publicKey: newPub } = nacl.sign.keyPair.fromSecretKey(pk);
    if (!UInt8ArrayEqual(newPub, pubKeyUInt8)) {
      throw Error(`publicKey does not match secretKey`);
    }
  }

  protected generateBrightIDQRCodeShare() {
    const url = new URL(`${AURA_NODE_URL}/profile`);

    if (aesKey.get()) {
      const channelUrl = url.href;
      const browser = platform.name;
      const os = platform.os?.family;
      const now = new Date();
      const monthYear = now.toLocaleString('en-US', {
        month: 'short',
        year: 'numeric',
      });

      const deviceInfo = `${browser} ${os} ${monthYear}`;

      const newQrUrl = buildRecoveryChannelQrUrl({
        aesKey: aesKey.get(),
        url: { href: channelUrl },
        t: urlTypesOfActions['superapp'],
        changePrimaryDevice: false,
        name: `Aura Verified ${deviceInfo}`,
      });

      const link = `https://app.brightid.org/connection-code/${encodeURIComponent(newQrUrl.href)}`;

      const qrCode = new QrCodeWithLogo({
        width: this.withoutTitle ? 300 : 350,
        content: link,
        logo: {
          src: '/interface/images/brightid-qrcode-logo.svg',
          bgColor: '#333',
          borderWidth: 5,
        },
        cornersOptions: {
          radius: 50,
        },
        nodeQrCodeOptions: {},
        dotsOptions: {
          color: '#111',
          type: 'dot-small',
        },
      });

      qrCode.getImage().then((res) => {
        brightIDQrImage.set(res.src);
      });

      brightIDQRLink.set(link);
    }
  }

  protected async setupBrightIDSuperAppLogin() {
    if (!privateKey.get() || !aesKey.get() || !publicKey.get())
      await this.setupRecovery();

    this.generateBrightIDQRCodeShare();

    await this.createRecoveryChannel(window.location.href);

    interval.set(
      setInterval(async () => {
        const res = await this.checkRecoveryState();

        const channelId = hash(aesKey.get());

        const isCompleted = await this.downloadBackup(
          channelId,
          aesKey.get(),
          res,
        );

        if (isCompleted) {
          pushRouter('/home');
        }
      }, 5000),
    );
  }

  protected clearInterval() {
    if (!interval.get()) return;

    clearInterval(interval.get()!);
  }

  disconnectedCallback(): void {
    this.clearInterval();
  }

  protected offBrightIDSection() {
    this.dispatchEvent(
      new CustomEvent('offBrightIDSection', { bubbles: true, composed: true }),
    );
  }

  protected render() {
    return html`
      <a class="back" href="/interface/login">Back</a>

      <hero-section title="Sign in with BrightID"></hero-section>

      <div class="a-card" data-variant="default">
        <div class="qr-code">
          ${
            brightIDQrImage.get()
              ? html`<img
                  .src=${brightIDQrImage.get()}
                  alt="Scan with BrightID to sign in"
                />`
              : html`<div
                  class="a-skeleton"
                  style="width: min(100%, 320px); height: 320px"
                ></div>`
          }
        </div>
      </div>
      <div class="instructions">
        <p class="a-text" data-variant="muted">Steps</p>

        <ol>
          <li>
            Download BrightID from
            <a href="https://www.brightid.org/">brightid.org</a>.
          </li>
          <li>
            Scan the QR code, or
            <a href="${brightIDQRLink.get()}">open this link</a>
            in the app.
          </li>
        </ol>
      </div>

      <footer-section></footer-section>
    `;
  }
}
