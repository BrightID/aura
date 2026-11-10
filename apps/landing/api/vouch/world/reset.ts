import type { VercelRequest, VercelResponse } from '@vercel/node';
import withCors from '../../lib/cors.js';
import {
  clearClaims,
  read,
  roomFrom,
  validWorld,
  write,
} from '../../lib/vouch-room.js';

// POST /api/vouch/world/reset?room=R { teamCode, keep? } -> 200 { version, generation }
// Starts the room over and clears its invite claims. The room's world becomes
// `keep`, or null without it. Each browser lays that over its own copy of the
// seed, so the practice cast starts fresh. The client sends as `keep` the
// records of the real people who joined (new identities and the founders) and
// those between them. VOUCH_TEAM_CODE is set on the server; with it unset,
// every reset is refused.
async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end();
  }
  const room = roomFrom(req);
  if (!room) return res.status(400).json({ error: 'bad room' });
  const { teamCode, keep = null } = req.body ?? {};
  const code = process.env.VOUCH_TEAM_CODE;
  if (!code || teamCode !== code)
    return res.status(403).json({ error: 'wrong team code' });
  if (keep !== null) {
    const bad = validWorld(keep);
    if (bad) return res.status(400).json({ error: `keep: ${bad}` });
  }
  for (let i = 0; i < 5; i++) {
    const { version } = await read(room);
    const r = await write(room, version, 0, keep, true);
    if (r.ok) {
      await clearClaims(room);
      return res
        .status(200)
        .json({ version: r.version, generation: r.generation });
    }
  }
  return res.status(503).json({ error: 'busy, try again' });
}

export default withCors(handler);
