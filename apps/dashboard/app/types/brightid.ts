export type BrightIdApp = {
  key: string
  name: string
  sponsoring: boolean
  testing: boolean
  idsAsHex: boolean
  soulbound: boolean
  soulboundMessage: string | null
  usingBlindSig: boolean
  verifications: string | null // \n-separated
  verificationExpiration: number | null // ms
  nodeUrl: string | null
  context: string | null
  description: string | null
  links: string | null // JSON string
  images: string | null // JSON string
  callbackUrl: string | null
  joined: Date
}
