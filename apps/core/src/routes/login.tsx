import { generateB64Keypair, hash, urlSafeRandomKey } from "@aura/domain/crypto"
import {
  createPasskeyIdentity,
  getPasskeyIdentity,
  hasPasskeyCredential,
  type PasskeyIdentity,
} from "@aura/domain/passkeys"
import {
  buildRecoveryChannelQrUrl,
  CHANNEL_POLL_INTERVAL,
  pollRecoveredUser,
  uploadRecoveryData,
} from "@aura/domain/recovery"
import { toast } from "@aura/ui"
import { useNavigate, useSearchParams } from "@solidjs/router"
import { createMutation, createQuery } from "@tanstack/solid-query"
import QRCode from "qrcode"
import { createEffect, createMemo, createSignal, onMount, Show } from "solid-js"
import FadeIn from "@/components/motions/fade-in"
import { AURA_NODE_URL, AURA_NODE_URL_PROXY } from "@/shared/lib/urls"
import { authStore, setAuthStore, setKeypair } from "@/store/auth"
import {
  initRecovery,
  isRecoveryKeypairStale,
  recoveryStore,
  resetRecovery,
  setRecoverStep,
  setRecoveryChannel,
  setRecoveryError,
} from "@/store/recovery"

const QR_SIZE = 270

export default function LoginPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [recovered, setRecovered] = createSignal(false)

  function setupRecovery() {
    if (isRecoveryKeypairStale()) {
      const { publicKey, privateKey } = generateB64Keypair()
      setKeypair(privateKey, publicKey)
      initRecovery(urlSafeRandomKey(16), Date.now())
    }
  }

  const createChannel = createMutation(() => ({
    mutationFn: async () => {
      const href = `${AURA_NODE_URL_PROXY}/profile`
      setRecoveryChannel(hash(recoveryStore.aesKey), href)
      await uploadRecoveryData({
        channelUrl: href,
        aesKey: recoveryStore.aesKey,
        publicKey: authStore.publicKey,
        timestamp: recoveryStore.timestamp,
      })
    },
    onSuccess: () => setRecoverStep("INITIALIZED"),
    onError: (e: unknown) => setRecoveryError(String(e)),
  }))

  onMount(() => {
    if (recoveryStore.recoverStep !== "NOT_STARTED") return
    setupRecovery()
    setRecoverStep("INITIALIZING")
    createChannel.mutate()
  })

  createQuery(() => ({
    queryKey: ["recovery-channel", recoveryStore.channel.channelId],
    queryFn: async () => {
      const user = await pollRecoveredUser({
        channelUrl: recoveryStore.channel.url!.href,
        channelId: recoveryStore.channel.channelId,
        aesKey: recoveryStore.aesKey,
        signingKey: authStore.publicKey,
      })
      if (user?.id && user.password) {
        // recovered user → auth store is the source of truth
        setAuthStore("user", { brightId: user.id, password: user.password })
        setAuthStore("authMethod", "brightid")
        setRecovered(true)
      }
      return user ?? null
    },
    enabled:
      recoveryStore.recoverStep === "INITIALIZED" &&
      !!recoveryStore.channel.url &&
      !recovered(),
    refetchInterval: CHANNEL_POLL_INTERVAL,
    retry: false,
  }))

  // Passkey login: derive a deterministic Ed25519 identity from the passkey's
  // PRF output — same passkey, same identity, no channel or backup involved.
  function completePasskeyLogin(identity: PasskeyIdentity) {
    setKeypair(identity.privateKey, identity.publicKey)
    setAuthStore("user", { brightId: identity.id, password: "" })
    setAuthStore("authMethod", "passkey")
    // Drop the half-open recovery channel keyed to the previous keypair
    resetRecovery()
    const next = typeof params.next === "string" ? params.next : "/home"
    navigate(next, { replace: true })
  }

  const passkeyError = (title: string) => (e: unknown) =>
    toast.error(title, {
      description: e instanceof Error ? e.message : String(e),
    })

  const passkeySignIn = createMutation(() => ({
    mutationFn: getPasskeyIdentity,
    onSuccess: completePasskeyLogin,
    onError: passkeyError("Passkey sign-in failed"),
  }))

  const passkeyCreate = createMutation(() => ({
    mutationFn: () => createPasskeyIdentity("Aura"),
    onSuccess: completePasskeyLogin,
    onError: passkeyError("Could not create a passkey"),
  }))

  const passkeyBusy = () => passkeySignIn.isPending || passkeyCreate.isPending

  const monthYear = new Date().toLocaleString("en-US", {
    month: "short",
    year: "numeric",
  })
  const qrUrl = createMemo(() => {
    const { aesKey, channel } = recoveryStore
    if (!aesKey || !channel.url) return undefined
    const href = channel.url.href.startsWith("/")
      ? channel.url.href.replace(AURA_NODE_URL_PROXY, AURA_NODE_URL)
      : channel.url.href
    return buildRecoveryChannelQrUrl({
      aesKey,
      href,
      name: `Aura ${monthYear}`,
    })
  })
  const universalLink = createMemo(() => {
    const u = qrUrl()
    return u
      ? `https://app.brightid.org/connection-code/${encodeURIComponent(u)}`
      : undefined
  })

  const [qrImage, setQrImage] = createSignal<string>()

  createEffect(() => {
    const link = universalLink()
    if (!link) return
    QRCode.toDataURL(link, { width: QR_SIZE, margin: 2 })
      .then(setQrImage)
      .catch((e) => console.error("qr render failed", e))
  })

  // Recovered → redirect (session already stored on the auth store).
  const [importing, setImporting] = createSignal(false)
  createEffect(() => {
    if (!recovered()) return
    setImporting(true)
    const next = typeof params.next === "string" ? params.next : "/home"
    resetRecovery()
    navigate(next, { replace: true })
  })

  function copyLink() {
    const link = universalLink()
    if (!link) return
    navigator.clipboard
      ?.writeText(link)
      .then(() =>
        toast.success("Link copied", {
          description: "Open it with the BrightID app.",
        }),
      )
      .catch(() => toast.error("Could not copy the link"))
  }

  return (
    <div class="flex min-h-[calc(100vh-80px)] flex-col px-5.5 pt-20 pb-4">
      <Show
        when={!importing()}
        fallback={
          <section
            data-testid="login-download-state"
            class="content mb-6 pl-5 pr-12"
          >
            <a-head class="mb-6 text-5xl">Login</a-head>
            <a-text size="lg" class="font-medium">
              Downloading backup data...
            </a-text>
          </section>
        }
      >
        <section class="content mb-6 pl-5 pr-12">
          <FadeIn delay={0.1}>
            <a-head data-testid="recovery-title" class="mb-6 text-5xl">
              Login
            </a-head>
          </FadeIn>
          <FadeIn delay={0.15}>
            <a-text size="lg" class="font-medium">
              Scan this code with the BrightID app to log in to your Aura
              account.
            </a-text>
          </FadeIn>
        </section>

        <a
          class="mb-3 flex flex-col items-center gap-6 pl-8 pr-10"
          href={universalLink()}
          target="_blank"
          rel="noreferrer"
          data-testid={universalLink() ? "import-universal-qr-code" : undefined}
        >
          <Show when={qrImage()}>
            <FadeIn delay={0.2}>
              <img
                id="qr-code"
                src={qrImage()}
                width={QR_SIZE}
                height={QR_SIZE}
                alt="login qr code"
                class="rounded-lg bg-white p-2"
              />
            </FadeIn>
          </Show>

          <FadeIn delay={0.25}>
            <div class="flex items-center gap-2">
              <hr class="h-px w-12" />
              <a-text>Or</a-text>
              <hr class="h-px w-12" />
            </div>
          </FadeIn>
          <FadeIn delay={0.25}>
            <a-text size="lg" class="font-medium">
              Open the link below on your phone
            </a-text>
          </FadeIn>
        </a>

        <FadeIn delay={0.3}>
          <section class="actions mb-auto pb-16 text-center">
            <span class="bg-muted flex w-full items-center justify-between gap-2 rounded-lg py-2 pl-3 pr-2.5">
              <a
                href={universalLink()}
                target="_blank"
                rel="noreferrer"
                data-testid={
                  universalLink() ? "import-universal-link" : undefined
                }
                class="line-clamp-1 text-ellipsis text-left font-medium text-foreground underline"
              >
                {universalLink()}
              </a>
              <button type="button" onClick={copyLink} aria-label="Copy link">
                <a-icon name="copy" />
              </button>
            </span>

            <div class="mt-8 flex items-center justify-center gap-2">
              <hr class="h-px w-12" />
              <a-text>Or</a-text>
              <hr class="h-px w-12" />
            </div>

            <a-button
              class="mt-6 w-full"
              size="lg"
              data-testid="passkey-sign-in"
              onClick={() => !passkeyBusy() && passkeySignIn.mutate()}
            >
              {passkeySignIn.isPending
                ? "Waiting for passkey..."
                : "Sign in with passkey"}
            </a-button>
            <button
              type="button"
              data-testid="passkey-create"
              class="text-muted-foreground mt-3 text-sm underline"
              onClick={() => !passkeyBusy() && passkeyCreate.mutate()}
            >
              {hasPasskeyCredential()
                ? "Create a new passkey identity"
                : "New to Aura? Create a passkey"}
            </button>
          </section>
        </FadeIn>

        <FadeIn delay={0.35}>
          <footer class="text-muted-foreground flex justify-between text-sm">
            <span class="flex gap-1">
              <a-text class="font-light">Version</a-text>
              <a-text data-testid="app-version">{__APP_VERSION__}</a-text>
            </span>
            <span class="flex gap-1">
              <a-text class="text-muted-foreground/70">Powered by:</a-text>
              <a-text class="font-light">BrightID</a-text>
            </span>
          </footer>
        </FadeIn>
      </Show>
    </div>
  )
}
