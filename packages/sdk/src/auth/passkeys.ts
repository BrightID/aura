import nacl from "tweetnacl"

export interface PasskeyConfig {
  /**
   * safe:   private key is never stored — passkey tap required on every sign()
   * cached: seed is stored in localStorage — no tap needed after first login
   */
  mode: "safe" | "cached"
}

interface PublicIdentity {
  publicKey: Uint8Array
  publicKeyBase64: string
  mode: "safe" | "cached"
}

export interface SignResult {
  signature: Uint8Array
  message: Uint8Array
}

interface PRFExtensionResult {
  prf?: { results?: { first?: ArrayBuffer } }
}

const LS_CRED_ID = "brightid_cred_id"
const LS_PUB_KEY = "brightid_pub_key"
const LS_SEED = "brightid_seed"

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

function restoreFromCache(): {
  seed: Uint8Array
  keypair: nacl.SignKeyPair
  publicKeyBase64: string
} | null {
  const savedSeed = localStorage.getItem(LS_SEED)
  const savedPub = localStorage.getItem(LS_PUB_KEY)
  if (!savedSeed || !savedPub) return null

  const seed = base64ToUint8(savedSeed)
  const keypair = nacl.sign.keyPair.fromSeed(seed)
  const pubBase64 = uint8ToBase64(keypair.publicKey)

  // Sanity check — if localStorage is corrupted or tampered with, wipe and bail
  if (pubBase64 !== savedPub) {
    console.warn("Cached seed mismatch — clearing corrupted cache")
    localStorage.removeItem(LS_SEED)
    return null
  }

  return { seed, keypair, publicKeyBase64: pubBase64 }
}

function persistSeed(seed: Uint8Array): void {
  localStorage.setItem(LS_SEED, uint8ToBase64(seed))
}

function clearSeed(): void {
  localStorage.removeItem(LS_SEED)
}

export async function registerWithPasskey(
  config: PasskeyConfig,
): Promise<PublicIdentity> {
  const savedPub = localStorage.getItem(LS_PUB_KEY)
  const savedId = localStorage.getItem(LS_CRED_ID)

  // Already registered on this device
  if (savedPub && savedId) {
    console.log("Already registered on this device")

    // ── Mode migration ───────────────────────────────────
    // Was safe, now wants cached → silently store the seed
    if (config.mode === "cached" && !localStorage.getItem(LS_SEED)) {
      console.log("Migrating safe → cached: re-deriving to store seed")
      const { seed, keypair } = await deriveEddsa()
      try {
        persistSeed(seed)
      } finally {
        wipe(seed)
        wipe(keypair.secretKey)
      }
    }

    // Was cached, now wants safe → wipe the stored seed
    if (config.mode === "safe" && localStorage.getItem(LS_SEED)) {
      console.log("Migrating cached → safe: wiping stored seed")
      clearSeed()
    }

    return {
      publicKey: base64ToUint8(savedPub),
      publicKeyBase64: savedPub,
      mode: config.mode,
    }
  }

  // First time — tap passkey and register
  const { seed, keypair, publicKeyBase64 } = await deriveEddsa()

  try {
    await mockApi_register(publicKeyBase64)

    if (config.mode === "cached") {
      persistSeed(seed)
    }
    // safe mode: seed never touches localStorage
  } finally {
    wipe(seed)
    wipe(keypair.secretKey)
  }

  console.log(`Registered (${config.mode} mode). Public key:`, publicKeyBase64)
  return {
    publicKey: keypair.publicKey,
    publicKeyBase64,
    mode: config.mode,
  }
}

export async function loginWithPasskey(
  config: PasskeyConfig,
): Promise<PublicIdentity> {
  // ── Cached mode ──────────────────────────────────────
  // If a seed is already in localStorage, restore silently — no tap needed.
  // If not cached yet, fall through to passkey tap and then store the seed.
  if (config.mode === "cached") {
    const cached = restoreFromCache()
    if (cached) {
      const { seed, keypair, publicKeyBase64 } = cached
      // Wipe — we only needed the keypair to rebuild PublicIdentity
      wipe(seed)
      wipe(keypair.secretKey)
      console.log("Logged in from cache (no tap needed)")
      return { publicKey: keypair.publicKey, publicKeyBase64, mode: "cached" }
    }

    // No cache yet — tap passkey and store seed for next time
    const { seed, keypair, publicKeyBase64 } = await deriveEddsa()
    try {
      const exists = await mockApi_checkExists(publicKeyBase64)
      if (!exists)
        throw new Error(
          "No account found for this passkey. Please register first.",
        )
      persistSeed(seed)
    } finally {
      wipe(seed)
      wipe(keypair.secretKey)
    }

    console.log("Logged in (cached mode — seed stored for future sessions)")
    return { publicKey: keypair.publicKey, publicKeyBase64, mode: "cached" }
  }

  // ── Safe mode ────────────────────────────────────────
  // Always tap passkey. Wipe secrets immediately. Seed never stored.
  // Also handles safe → cached migration if there's a stored seed to clear.
  if (localStorage.getItem(LS_SEED)) {
    console.log("Switching to safe mode — wiping stored seed")
    clearSeed()
  }

  const { seed, keypair, publicKeyBase64 } = await deriveEddsa()
  try {
    const exists = await mockApi_checkExists(publicKeyBase64)
    if (!exists)
      throw new Error(
        "No account found for this passkey. Please register first.",
      )
  } finally {
    wipe(seed)
    wipe(keypair.secretKey)
  }

  console.log("Logged in (safe mode — passkey tap required to sign)")
  return { publicKey: keypair.publicKey, publicKeyBase64, mode: "safe" }
}

export async function signWithPasskey(
  message: Uint8Array,
  config: PasskeyConfig,
): Promise<SignResult> {
  // ── Cached mode ──────────────────────────────────────
  // Restore from localStorage — no passkey tap needed
  if (config.mode === "cached") {
    const cached = restoreFromCache()
    if (cached) {
      const { seed, keypair } = cached
      let signature: Uint8Array
      try {
        signature = nacl.sign.detached(message, keypair.secretKey)
      } finally {
        wipe(seed)
        wipe(keypair.secretKey)
      }
      return { signature, message }
    }

    // Cache is gone (user cleared storage?) — fall back to passkey tap
    console.warn("Cached seed missing — falling back to passkey tap")
  }

  // ── Safe mode (or cache miss fallback) ──────────────
  // Tap passkey, sign, wipe immediately
  const { seed, keypair } = await deriveEddsa()
  let signature: Uint8Array
  try {
    signature = nacl.sign.detached(message, keypair.secretKey)
  } finally {
    wipe(seed)
    wipe(keypair.secretKey)
  }

  return { signature, message }
}

export function passkeyLogout(): void {
  clearSeed()
}
