import { VercelRequest, VercelResponse } from '@vercel/node'
import { eq } from 'drizzle-orm'
import { getAuth } from 'firebase-admin/auth'
import { z, ZodError } from 'zod'
import withCors from '../lib/cors.js'
import { db } from '../lib/db.js'
import setupFirebaseApp from '../lib/firebase.js'
import { projectsTable } from '../lib/schema.js'

setupFirebaseApp()

const updateSchema = z.object({
  id: z.number(),
  name: z.string().min(1).max(255).optional(),
  description: z.string().min(1).max(255).optional(),
  requirementLevel: z.number().int().positive().optional().nullable(),
  image: z.url().optional().nullable(),
  landingMarkdown: z.string().optional().nullable(),
  logoUrl: z.url().optional().nullable(),
  isActive: z.boolean().default(true),
  websiteUrl: z.url().optional().nullable(),
  remainingtokens: z.number().int().min(0).optional(),
  brightIdAppId: z.string().max(500).optional().nullable(),
  deadline: z.coerce.date().optional().nullable()
})

async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PATCH' && req.method !== 'POST') {
    res.status(405).end()
    return
  }
  const token = req.headers['authorization']?.split('Bearer ')[1]
  if (!token) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { uid } = await getAuth().verifyIdToken(token)
    const { id, ...body } = updateSchema.parse(req.body)

    const project = await db
      .select({ creatorId: projectsTable.creatorId })
      .from(projectsTable)
      .where(eq(projectsTable.id, Number(id)))
      .limit(1)

    if (!project[0] || project[0].creatorId !== uid)
      return res.status(403).json({ error: 'Forbidden' })

    await db
      .update(projectsTable)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(projectsTable.id, Number(id)))

    return res.json({ success: true })
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json(z.treeifyError(error))
    }
    console.log(error)
    return res.status(400).json({ error: 'Invalid request' })
  }
}

export default withCors(handler)
