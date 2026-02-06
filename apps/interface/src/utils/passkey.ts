export const b64urlToUint8Array = (b64url: string) =>
  Uint8Array.from(atob(b64url.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0))

export const uint8ArrayToB64url = (arr: Uint8Array) => {
  const b64 = btoa(String.fromCharCode(...new Uint8Array(arr)))
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
