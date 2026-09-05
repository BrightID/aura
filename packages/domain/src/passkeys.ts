import nacl from 'tweetnacl';
import {
  b64ToUint8Array,
  b64ToUrlSafeB64,
  strToUint8Array,
  uInt8ArrayToB64,
} from './crypto';

export interface PasskeyIdentity {
  id: string;
  publicKey: string;
  privateKey: string;
}

interface PRFExtensionResult {
  prf?: { results?: { first?: ArrayBuffer } };
}

const LS_CRED_ID = 'aura_passkey_cred_id';
const LS_PUB_KEY = 'aura_passkey_pub_key';

const PRF_SALT = 'BrightID';
const HKDF_INFO = 'BrightID Ed25519 Identity v1';

const PRF_UNSUPPORTED_MESSAGE =
  "This device's passkeys don't support key derivation (PRF). " +
  'Try Chrome on desktop, or Safari 17.5+ on iOS.';

async function hkdf(inputKeyMaterial: Uint8Array): Promise<Uint8Array> {
  const baseKey = await crypto.subtle.importKey(
    'raw',
    inputKeyMaterial as BufferSource,
    { name: 'HKDF' },
    false,
    ['deriveBits'],
  );
  const derived = await crypto.subtle.deriveBits(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: strToUint8Array(PRF_SALT) as BufferSource,
      info: strToUint8Array(HKDF_INFO) as BufferSource,
    },
    baseKey,
    32 * 8,
  );
  return new Uint8Array(derived);
}

function identityFromSeed(seed: Uint8Array): PasskeyIdentity {
  const keypair = nacl.sign.keyPair.fromSeed(seed);

  seed.fill(0);
  const publicKey = uInt8ArrayToB64(keypair.publicKey);
  return {
    id: b64ToUrlSafeB64(publicKey),
    publicKey,
    privateKey: uInt8ArrayToB64(keypair.secretKey),
  };
}

function rememberCredential(rawId: ArrayBuffer, publicKey: string): void {
  localStorage.setItem(LS_CRED_ID, uInt8ArrayToB64(new Uint8Array(rawId)));
  localStorage.setItem(LS_PUB_KEY, publicKey);
}

export function hasPasskeyCredential(): boolean {
  return !!localStorage.getItem(LS_CRED_ID);
}

export function clearPasskeyCredential(): void {
  localStorage.removeItem(LS_CRED_ID);
  localStorage.removeItem(LS_PUB_KEY);
}

export async function createPasskeyIdentity(
  username: string,
): Promise<PasskeyIdentity> {
  const credential = (await navigator.credentials.create({
    publicKey: {
      challenge: crypto.getRandomValues(new Uint8Array(32)),
      rp: { name: 'Aura' },
      user: {
        id: crypto.getRandomValues(new Uint8Array(16)),
        name: username,
        displayName: username,
      },
      pubKeyCredParams: [
        { type: 'public-key', alg: -7 }, // ES256
        { type: 'public-key', alg: -257 }, // RS256
      ],
      authenticatorSelection: {
        userVerification: 'required',
        residentKey: 'required',
      },
      extensions: {
        prf: { eval: { first: strToUint8Array(PRF_SALT) } },
      } as AuthenticationExtensionsClientInputs,
    },
  })) as PublicKeyCredential | null;

  if (!credential) throw new Error('Passkey creation was cancelled');

  // Persist the credential id so the fallback assertion targets it
  localStorage.setItem(
    LS_CRED_ID,
    uInt8ArrayToB64(new Uint8Array(credential.rawId)),
  );

  const extensions =
    credential.getClientExtensionResults() as PRFExtensionResult;
  const prfFromCreate = extensions.prf?.results?.first;
  if (!prfFromCreate) return getPasskeyIdentity();

  const identity = identityFromSeed(await hkdf(new Uint8Array(prfFromCreate)));
  rememberCredential(credential.rawId, identity.publicKey);
  return identity;
}

export async function getPasskeyIdentity(): Promise<PasskeyIdentity> {
  const savedId = localStorage.getItem(LS_CRED_ID);
  const savedPubKey = localStorage.getItem(LS_PUB_KEY);

  const assertion = (await navigator.credentials.get({
    publicKey: {
      challenge: crypto.getRandomValues(new Uint8Array(32)),
      allowCredentials: savedId
        ? [{ id: b64ToUint8Array(savedId) as BufferSource, type: 'public-key' }]
        : [],
      userVerification: 'required',
      extensions: {
        prf: { eval: { first: strToUint8Array(PRF_SALT) } },
      } as AuthenticationExtensionsClientInputs,
    },
  })) as PublicKeyCredential | null;

  if (!assertion) throw new Error('Passkey prompt was cancelled');

  const extensions =
    assertion.getClientExtensionResults() as PRFExtensionResult;
  const prfBytes = extensions.prf?.results?.first;
  if (!prfBytes) throw new Error(PRF_UNSUPPORTED_MESSAGE);

  const identity = identityFromSeed(await hkdf(new Uint8Array(prfBytes)));

  if (savedPubKey && savedPubKey !== identity.publicKey) {
    throw new Error(
      'Wrong passkey selected — this would produce a different identity. ' +
        'Please use the passkey you originally registered with.',
    );
  }

  rememberCredential(assertion.rawId, identity.publicKey);
  return identity;
}
