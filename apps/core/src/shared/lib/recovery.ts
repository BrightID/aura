import {
  downloadFromChannel,
  listChannel,
  uploadToChannel,
} from "@/shared/lib/channel"
import { b64ToUrlSafeB64, decryptData, hash } from "@/shared/lib/crypto"

export const RECOVERY_CHANNEL_TTL = 24 * 60 * 60 * 1000 // 1 day
export const CHANNEL_POLL_INTERVAL = 3000

const IMPORT_PREFIX = "sig_"
const QR_TYPE_ADD_SUPER_USER_APP = "5"

export interface RecoveredUser {
  id: string
  name?: string
  password: string
}

/** Build the channel url embedded in the QR code. */
export function buildRecoveryChannelQrUrl({
  aesKey,
  href,
  name,
}: {
  aesKey: string
  href: string
  name?: string
}): string {
  const url = new URL(href)
  url.searchParams.append("aes", aesKey)
  url.searchParams.append("t", QR_TYPE_ADD_SUPER_USER_APP)
  if (name) url.searchParams.append("n", name)
  url.searchParams.append("p", "false")
  return url.href
}

/** Upload our recovery signing key to the freshly created channel. */
export async function uploadRecoveryData({
  channelUrl,
  aesKey,
  publicKey,
  timestamp,
}: {
  channelUrl: string
  aesKey: string
  publicKey: string
  timestamp: number
}): Promise<void> {
  const channelId = hash(aesKey)
  const data = JSON.stringify({ signingKey: publicKey, timestamp })
  await uploadToChannel({
    channelUrl,
    channelId,
    data,
    dataId: "data",
    requestedTtl: RECOVERY_CHANNEL_TTL,
  })
}

/**
 * Poll the channel once: look for the encrypted user-info the scanner uploaded
 * and, if present, decrypt and return it. Returns null until the phone scans.
 */
export async function pollRecoveredUser({
  channelUrl,
  channelId,
  aesKey,
  signingKey,
}: {
  channelUrl: string
  channelId: string
  aesKey: string
  signingKey: string
}): Promise<RecoveredUser | null> {
  const dataIds = await listChannel({ channelUrl, channelId })

  const prefix = `${IMPORT_PREFIX}userinfo_`
  const self = b64ToUrlSafeB64(signingKey)
  const dataId = dataIds.find(
    (id) =>
      id.startsWith(prefix) && id.replace(prefix, "").split(":")[1] !== self,
  )
  if (!dataId) return null

  const encrypted = await downloadFromChannel({
    channelUrl,
    channelId,
    dataId,
    deleteAfterDownload: true,
  })
  const info = JSON.parse(decryptData(encrypted, aesKey)) as RecoveredUser
  return info
}
