import type { VercelRequest, VercelResponse } from '@vercel/node';
import withCors from '../lib/cors.js';
import { read, roomFrom, validWorld, write } from '../lib/vouch-room.js';

// GET /api/vouch/world?room=R -> { version, generation, world }
// PUT /api/vouch/world?room=R { baseVersion, generation, world }
//   -> 200 { version, generation }, or 409 { version, generation, world } when
//      someone wrote first. The client merges the returned world into its own
//      and tries again. A 409 with a different generation means the room was
//      reset: the client drops its world and takes the server's.
// A version or generation: a whole number that fits the integer columns they are stored in.
const counter = (n: unknown) =>
  Number.isInteger(n) && (n as number) >= 0 && (n as number) <= 2 ** 31 - 1;

async function handler(req: VercelRequest, res: VercelResponse) {
  const room = roomFrom(req);
  if (!room)
    return res
      .status(400)
      .json({ error: 'room must be 3-40 lowercase letters, digits or dashes' });
  if (req.method === 'GET') return res.status(200).json(await read(room));
  if (req.method !== 'PUT') {
    res.setHeader('Allow', 'GET, PUT');
    return res.status(405).end();
  }
  const { baseVersion, generation, world } = req.body ?? {};
  if (!counter(baseVersion) || !counter(generation))
    return res
      .status(400)
      .json({ error: 'send { baseVersion, generation, world }' });
  const bad = validWorld(world);
  if (bad)
    return res
      .status(bad === 'world too large' ? 413 : 400)
      .json({ error: bad });
  const r = await write(room, baseVersion, generation, world);
  return r.ok
    ? res.status(200).json({ version: r.version, generation: r.generation })
    : res
        .status(409)
        .json({ version: r.version, generation: r.generation, world: r.world });
}

export default withCors(handler);
