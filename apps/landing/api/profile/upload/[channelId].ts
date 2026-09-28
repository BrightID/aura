import { VercelRequest, VercelResponse } from '@vercel/node';

const NODE_UPLOAD = 'https://aura-node.brightid.org/profile/upload';

// Same-origin proxy. Top-level external rewrites are ignored under
// Vercel Services, so POST /profile/upload was served as index.html (405).
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const raw = req.query['channelId'];
  const channelId = Array.isArray(raw) ? raw[0] : raw;
  if (!channelId) {
    res.status(400).json({ error: 'Missing channel id' });
    return;
  }

  const payload =
    typeof req.body === 'string' ? req.body : JSON.stringify(req.body ?? {});

  try {
    const upstream = await fetch(
      `${NODE_UPLOAD}/${encodeURIComponent(channelId)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
      },
    );
    const text = await upstream.text();
    const contentType = upstream.headers.get('content-type');
    if (contentType) res.setHeader('Content-Type', contentType);
    res.status(upstream.status).send(text);
  } catch (e) {
    console.error('profile upload proxy', e);
    res.status(502).json({ error: 'Upload proxy failed' });
  }
}
