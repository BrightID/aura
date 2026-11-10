import type { VercelRequest, VercelResponse } from '@vercel/node';
import withCors from '../lib/cors.js';
import { claim, roomFrom } from '../lib/vouch-room.js';

// POST /api/vouch/claim?room=R { token, id }
//   -> 200 { claimedBy: id } when this caller won the invite,
//      409 { claimedBy } when someone else claimed it first.
async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end();
  }
  const room = roomFrom(req);
  if (!room) return res.status(400).json({ error: 'bad room' });
  const { token, id } = req.body ?? {};
  if (
    typeof token !== 'string' ||
    !/^[0-9a-f]{32}$/.test(token) ||
    typeof id !== 'string' ||
    !/^[\w-]{1,80}$/.test(id)
  )
    return res.status(400).json({ error: 'send { token, id }' });
  const winner = await claim(room, token, id);
  return res.status(winner === id ? 200 : 409).json({ claimedBy: winner });
}

export default withCors(handler);
