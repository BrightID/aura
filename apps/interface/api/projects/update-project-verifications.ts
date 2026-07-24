import { VercelRequest, VercelResponse } from '@vercel/node'
import { eq } from 'drizzle-orm'
import { getAuth } from 'firebase-admin/auth'
import { z, ZodError } from 'zod'
import withCors from '../lib/cors.js'
import { db } from '../lib/db.js'
import setupFirebaseApp from '../lib/firebase.js'
import { brightIdAppsTable, projectsTable } from '../lib/schema.js'

setupFirebaseApp()

const schema = z.object({
  projectId: z.number().int(),
  verifications: z.string() // may be empty (level 0 = no gating)
})

async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PATCH' && req.method !== 'POST') return res.status(405).end()

  const token = req.headers['authorization']?.split('Bearer ')[1]
  if (!token) return res.status(401).json({ error: 'Unauthorized' })

  try {
    const { uid } = await getAuth().verifyIdToken(token)
    const { projectId, verifications } = schema.parse(req.body)

    const [project] = await db
      .select({ creatorId: projectsTable.creatorId, brightIdAppId: projectsTable.brightIdAppId })
      .from(projectsTable)
      .where(eq(projectsTable.id, projectId))
      .limit(1)

    if (!project || project.creatorId !== uid) {
      return res.status(403).json({ error: 'Forbidden' })
    }

    if (!project.brightIdAppId) {
      // No BrightID app linked yet — nothing to sync. Report so the client can
      // tell the user the level saved but the script has no app to write to.
      return res.json({ success: true, updated: false, reason: 'no_linked_app' })
    }

    const updated = await db
      .update(brightIdAppsTable)
      .set({ verifications })
      .where(eq(brightIdAppsTable.key, project.brightIdAppId))
      .returning({ key: brightIdAppsTable.key })

    return res.json({ success: true, updated: updated.length > 0 })
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json(z.treeifyError(error))
    }
    console.error(error)
    return res.status(400).json({ error: 'Invalid request' })
  }
}

export default withCors(handler)
