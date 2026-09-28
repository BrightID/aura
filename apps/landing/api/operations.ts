import { VercelRequest, VercelResponse } from '@vercel/node';

const NODE_OPERATIONS =
  'https://aura-node.brightid.org/brightid/v6/operations';

// Flat file on purpose. Dynamic routes fall through to index.html.
// Upstream is /brightid/v6/operations. Bare /operations is an nginx 404.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const raw = req.query['hash'];
  const opHash = Array.isArray(raw) ? raw[0] : raw;

  if (req.method === 'GET' && !opHash) {
    res.status(400).json({ error: 'Missing hash' });
    return;
  }
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const url =
    req.method === 'GET'
      ? `${NODE_OPERATIONS}/${encodeURIComponent(opHash!)}`
      : NODE_OPERATIONS;
  const payload =
    req.method === 'POST'
      ? typeof req.body === 'string'
        ? req.body
        : JSON.stringify(req.body ?? {})
      : undefined;

  try {
    const upstream = await fetch(url, {
      method: req.method,
      headers:
        req.method === 'POST'
          ? { 'Content-Type': 'application/json' }
          : undefined,
      body: payload,
    });
    const text = await upstream.text();
    const contentType = upstream.headers.get('content-type');
    if (contentType) res.setHeader('Content-Type', contentType);
    res.status(upstream.status).send(text);
  } catch (e) {
    console.error('operations proxy', e);
    res.status(502).json({ error: 'Operations proxy failed' });
  }
}
