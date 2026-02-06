import B64 from 'base64-js'
import CryptoJS from 'crypto-js'
import { compose } from 'ramda'

export const UInt8ArrayEqual = (first: Uint8Array, second: Uint8Array) => {
  // first compare bytelength
  if (first.byteLength !== second.byteLength) return false
  // bytelength matches, now compare each array element
  return first.every((value, index) => value === second[index])
}

export function uInt8ArrayToB64(array: Uint8Array): string {
  return B64.fromByteArray(array)
}

export function b64ToUint8Array(str: string): Uint8Array {
  const byteArray = B64.toByteArray(str)
  if (Array.isArray(byteArray)) {
    return new Uint8Array(byteArray)
  } else {
    const plainArray = Object.values(byteArray)
    return new Uint8Array(plainArray)
  }
}

export function strToUint8Array(str: string): Uint8Array {
  const encoder = new TextEncoder() // Default encoding is utf-8
  return encoder.encode(str)
}

export const objValues = (obj: Record<string, string>) => Object.values(obj).map(parseFloat)

export const objToUint8 = (obj: Record<string, string>) => new Uint8Array(objValues(obj))

export function b64ToUrlSafeB64(s: string) {
  const alts = {
    '/': '_',
    '+': '-',
    '=': ''
  }
  return s.replace(/[/+=]/g, (c) => alts[c as keyof typeof alts])
}

export const objToB64 = compose(uInt8ArrayToB64, objToUint8)

export const hash = (data: string) => {
  const h = CryptoJS.SHA256(data)
  const b = h.toString(CryptoJS.enc.Base64)
  return b64ToUrlSafeB64(b)
}

// Generating random bytes with crypto-js
export function randomBytes(size: number): string {
  return CryptoJS.lib.WordArray.random(size).toString()
}

export const randomKey = (size: number) => Promise.resolve(randomBytes(size))

export const urlSafeRandomKey = async (size = 9) => {
  const key = await randomKey(size)
  return b64ToUrlSafeB64(key)
}
