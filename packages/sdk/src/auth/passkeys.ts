import nacl from "tweetnacl"

interface PublicIdentity {
  publicKey: Uint8Array
  publicKeyBase64: string
}

export interface SignResult {
  signature: Uint8Array
  message: Uint8Array
}

interface PRFExtensionResult {
  prf?: { results?: { first?: ArrayBuffer } }
}

const LS_CRED_ID = "brightid_cred_id"
const LS_PUB_KEY = "brightid_pub_key" // safe to store — public key is not secret

const safeCopy = (bytes: Uint8Array): Uint8Array<ArrayBuffer> =>
  new Uint8Array(
    bytes.buffer.slice(
      bytes.byteOffset,
      bytes.byteOffset + bytes.byteLength,
    ) as ArrayBuffer,
  )

function uint8ToBase64(bytes: Uint8Array): string {
  let binary = ""
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

function base64ToUint8(base64: string): Uint8Array {
  return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
}

async function hkdf(
  inputKeyMaterial: Uint8Array,
  salt: Uint8Array,
  info: string,
  outputLength: number = 32,
): Promise<Uint8Array> {
  const baseKey = await crypto.subtle.importKey(
    "raw",
    safeCopy(inputKeyMaterial),
    { name: "HKDF" },
    false,
    ["deriveBits"],
  )
  const derived = await crypto.subtle.deriveBits(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: salt as BufferSource,
      info: new TextEncoder().encode(info),
    },
    baseKey,
    outputLength * 8,
  )
  return new Uint8Array(derived)
}

function wipe(bytes: Uint8Array): void {
  bytes.fill(0)
}

const mockDatabase = new Map<string, { publicKey: string }>()

async function mockApi_register(publicKeyBase64: string): Promise<void> {
  console.log("[mock API] Registering:", publicKeyBase64)
  if (mockDatabase.has(publicKeyBase64)) {
    console.log("[mock API] Already exists, skipping")
    return
  }
  mockDatabase.set(publicKeyBase64, { publicKey: publicKeyBase64 })
}

async function mockApi_checkExists(publicKeyBase64: string): Promise<boolean> {
  return mockDatabase.has(publicKeyBase64)
}

async function deriveEddsa() {
  const prfSalt = new TextEncoder().encode("BrightID")

  const savedId = localStorage.getItem(LS_CRED_ID)
  const savedPubKey = localStorage.getItem(LS_PUB_KEY)

  let allowCredentials: PublicKeyCredentialDescriptor[] = []
  if (savedId) {
    allowCredentials = [
      { id: base64ToUint8(savedId) as BufferSource, type: "public-key" },
    ]
  }

  const assertion = (await navigator.credentials.get({
    publicKey: {
      challenge: crypto.getRandomValues(new Uint8Array(32)),
      allowCredentials,
      userVerification: "required",
      extensions: {
        prf: { eval: { first: prfSalt } },
      } as AuthenticationExtensionsClientInputs,
    },
  })) as PublicKeyCredential | null

  if (!assertion) throw new Error("Passkey prompt cancelled")

  const extensions = assertion.getClientExtensionResults() as PRFExtensionResult

  const prfBytes = extensions.prf?.results?.first
  if (!prfBytes) {
    throw new Error(
      "PRF not supported by this authenticator. " +
        "Try Chrome on desktop, or Safari 17.5+ on iOS.",
    )
  }

  const seed = await hkdf(
    new Uint8Array(prfBytes),
    new TextEncoder().encode("BrightID"),
    "BrightID Ed25519 Identity v1",
  )

  const keypair = nacl.sign.keyPair.fromSeed(seed)
  const derivedPubKeyBase64 = uint8ToBase64(keypair.publicKey)

  if (savedPubKey && savedPubKey !== derivedPubKeyBase64) {
    wipe(seed)
    wipe(keypair.secretKey)
    throw new Error(
      "Wrong passkey selected — this would produce a different identity. " +
        "Please use the passkey you originally registered with.",
    )
  }

  localStorage.setItem(
    LS_CRED_ID,
    uint8ToBase64(new Uint8Array(assertion.rawId)),
  )
  localStorage.setItem(LS_PUB_KEY, derivedPubKeyBase64)

  return { seed, keypair, publicKeyBase64: derivedPubKeyBase64 }
}

export async function registerWithPasskey(): Promise<PublicIdentity> {
  const savedPub = localStorage.getItem(LS_PUB_KEY)
  const savedId = localStorage.getItem(LS_CRED_ID)
  if (savedPub && savedId) {
    console.log("Already registered on this device")
    return {
      publicKey: base64ToUint8(savedPub),
      publicKeyBase64: savedPub,
    }
  }

  const { seed, keypair, publicKeyBase64 } = await deriveEddsa()

  try {
    await mockApi_register(publicKeyBase64)
  } finally {
    wipe(seed)
    wipe(keypair.secretKey)
  }

  console.log("Registered. Public key:", publicKeyBase64)
  return {
    publicKey: keypair.publicKey,
    publicKeyBase64,
  }
}

export async function loginWithPasskeys(): Promise<PublicIdentity> {
  // Trigger passkey tap — deriveEddsa() validates the credential ID + public
  // key fingerprint internally and throws if the wrong passkey is used
  const { seed, keypair, publicKeyBase64 } = await deriveEddsa()

  try {
    const exists = await mockApi_checkExists(publicKeyBase64)
    if (!exists) {
      throw new Error(
        "No account found for this passkey. Please register first.",
      )
    }
  } finally {
    wipe(seed)
    wipe(keypair.secretKey)
  }

  console.log("Logged in. Public key:", publicKeyBase64)
  return {
    publicKey: keypair.publicKey,
    publicKeyBase64,
  }
}

export async function signWithPasskey(
  message: Uint8Array,
): Promise<SignResult> {
  const { seed, keypair } = await deriveEddsa()

  let signature: Uint8Array
  try {
    signature = nacl.sign.detached(message, keypair.secretKey)
  } finally {
    // Wipe immediately after signing — private key's job is done
    wipe(seed)
    wipe(keypair.secretKey)
  }

  return { signature, message }
}

export function passkeyLogout(): void {}
