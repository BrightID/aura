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
     "app": "aura-get-verified",
     "type": "verification-success",
     "data": {
       "brightId": "…",
       "signature": { "r": "…", "s": "…", "v": 27 },
       "auraLevel": 2,
       "auraScore": 1234
     }
   }
   ```

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
  (default `https://aura-get-verified.vercel.app`; use `http://localhost:5173`
  to test against a local `apps/interface`).
- `VITE_AURA_PROJECT_ID` — project to verify against (default `9`).

## Integrating in your own app

The whole contract is: embed the iframe and listen for `message`.

```js
const iframe = document.createElement('iframe');
iframe.src = 'https://aura-get-verified.vercel.app/embed/projects/9';
document.body.append(iframe);

window.addEventListener('message', (e) => {
  if (e.origin !== 'https://aura-get-verified.vercel.app') return;
  let msg;
  try {
    msg = JSON.parse(e.data);
  } catch {
    return;
  }
  if (msg.app !== 'aura-get-verified') return;
  if (msg.type === 'verification-success') {
    const { brightId, signature, auraLevel, auraScore } = msg.data;
    // verify `signature` server-side, then grant access
  }
});
```
