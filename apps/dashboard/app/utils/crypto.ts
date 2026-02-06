import { Buffer } from "buffer"

export function strToUint8Array(s: string) {
  return new TextEncoder().encode(s)
}

export function b64FromUint8Array(a: string) {
  return Buffer.from(a).toString("base64")
}

export function b64ToUint8Array(b: string) {
  return Uint8Array.from(Buffer.from(b, "base64"))
}
