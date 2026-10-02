# @aura/demo-integration

A minimal standalone app that shows how a **third-party site** integrates Aura
verification by embedding the interface iframe and receiving the verification
**signature** over `postMessage`. It mirrors the reference `/dev` page in the
interface app (`apps/interface/src/routes/dev.ts`) but as an external integrator
rather than same-origin code.

## What it does

1. Embeds `<iframe src="{BASE_URL}/embed/projects/{PROJECT_ID}">`, which renders
   the `app-verification-embed` widget (`packages/widgets/src/verification`).
2. The user logs in (BrightID / passkey) and runs verification **inside** the
   iframe — the demo never handles credentials.
3. On success the widget calls the interface `POST /api/projects/:id/verify`
   endpoint, gets a signature, and posts to the parent:

   ```json
   {
     "app": "aura",
     "type": "verification-success",
     "data": {
       "brightId": "…",
       "signature": "<base64 nacl detached signature>",
       "publicKey": "<base64 node public key>",
       "verificationHash": "<sha256 of the verification expression>",
       "auraLevel": 2,
       "auraScore": 1234
     }
   }
   ```

   `signature` is a string. This endpoint does not return an Ethereum `{ r, s, v }` signature. BrightIDs are longer than 32 bytes, so the node signs with nacl.

4. This page listens for that message (validating `e.origin`), then renders the
   `brightId`, `signature`, level, score, and a raw message log.

## Run

```bash
bun install
bun --filter @aura/demo-integration dev   # http://localhost:5175
```

Base URL and project id are editable at runtime in the UI, or preset via env:

```bash
cp .env.example .env
```

- `VITE_AURA_EMBED_BASE_URL` — origin serving `/embed/projects/:id`
  (default `https://aura.brightid.org/interface`; use
  `http://localhost:5176/interface` to test against the landing host).
- `VITE_AURA_PROJECT_ID` — project to verify against (default `9`).

## Integrating in your own app

The whole contract is: embed the iframe and listen for `message`.

```js
const iframe = document.createElement('iframe');
iframe.src = 'https://aura.brightid.org/interface/embed/projects/9';
document.body.append(iframe);

window.addEventListener('message', (e) => {
  if (e.origin !== 'https://aura.brightid.org') return;
  let msg;
  try {
    msg = JSON.parse(e.data);
  } catch {
    return;
  }
  if (msg.app !== 'aura') return;
  if (msg.type === 'verification-success') {
    const { brightId, signature, publicKey, verificationHash, auraLevel, auraScore } = msg.data;
    // signature is a base64 nacl detached sig, not { r, s, v }.
    // The node message is `${appKey},${brightId},${verificationHash}`
    // (no timestamp; includeHash defaults to true). Check verificationHash
    // equals sha256 of the expression you expect, then:
    // nacl.sign.detached.verify(messageBytes, sigBytes, publicKeyBytes)
  }
});
```
