import { VercelRequest, VercelResponse } from '@vercel/node'
import { inArray } from 'drizzle-orm'
import { z } from 'zod'
import { db } from './lib/db.js'
import { auraPlayersSocialTable } from './lib/schema.js'

const hashSchema = z.array(
  z.string().regex(/^\$2[ab]\$[0-9]{2}\$[A-Za-z0-9./]{53}$/, 'Invalid bcrypt hash')
)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).send('Method not allowed')
    return
  }

  try {
    const { hashes } = req.body
    const validateds = hashSchema.parse(hashes)

    const results = await db
      .select()
      .from(auraPlayersSocialTable)
      .where(inArray(auraPlayersSocialTable.hash, validateds))

    res.status(200).json(results)
  } catch (error) {
    console.log(error)
    res.status(404).json({ error: 'Not found' })
  }
}
