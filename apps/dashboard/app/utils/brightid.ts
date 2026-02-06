import stringify from "fast-json-stable-stringify"
import B64 from "base64-js"
import nacl from "tweetnacl"
import axios from "axios"
import { Buffer } from "buffer"

const getMessage = (op: any) => {
  const signedOp: any = {}
  for (let k in op) {
    if (["sig", "sig1", "sig2", "hash"].includes(k)) {
      continue
    }
    signedOp[k] = op[k]
  }
  return stringify(signedOp)
}

type SponsorData = {
  hash: string
}

export const brightIdSponsor = async (
  key: string,
  app: string,
  appUserId: string
): Promise<SponsorData> => {
  const endpoint = "https://app.brightid.org/node/v6/operations"

  const timestamp = Date.now()
  const op = {
    name: "Sponsor",
    app,
    appUserId,
    timestamp,
    v: 6,
    sig: "",
  }

  const message = getMessage(op)
  const arrayedMessage = Buffer.from(message)

  const arrayedKey = B64.toByteArray(key)

  if (arrayedKey.length !== 64) {
    throw new Error(
      `Invalid key length: expected 64 bytes, got ${arrayedKey.length}`
    )
  }

  const signature = nacl.sign.detached(arrayedMessage, arrayedKey)
  op.sig = Buffer.from(signature).toString("base64")

  const res = await axios.post(endpoint, op)
  return res.data as SponsorData
}
