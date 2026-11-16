import type { VercelRequest, VercelResponse } from '@vercel/node';
import withCors from '../lib/cors.js';
import { beat, present, roomFrom } from '../lib/vouch-room.js';

// POST /api/vouch/presence?room=R { browserId, persona } -> 200 { here }
// GET  /api/vouch/presence?room=R -> 200 { here }
// `here` lists the browsers seen in the last 30 s: [{ browserId, persona, at }].
async function handler(req: VercelRequest, res: VercelResponse) {
  const room = roomFrom(req);
  if (!room) return res.status(400).json({ error: 'bad room' });
  if (req.method === 'POST') {
    const { browserId, persona } = req.body ?? {};
    if (
      typeof browserId !== 'string' ||
      !/^[\w-]{6,64}$/.test(browserId) ||
      typeof persona !== 'string' ||
      persona.length > 80
    )
      return res.status(400).json({ error: 'send { browserId, persona }' });
    await beat(room, browserId, persona);
  } else if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).end();
  }
  return res.status(200).json({ here: await present(room) });
}

export default withCors(handler);
