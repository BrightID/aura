import { VercelRequest, VercelResponse } from '@vercel/node'
import { and, eq } from 'drizzle-orm'
import { getAuth } from 'firebase-admin/auth'
import { z } from 'zod'
import withCors from '../lib/cors.js'
import { db } from '../lib/db.js'
import setupFirebaseApp from '../lib/firebase.js'
import { projectsTable, upgradeRequest, verificationPlansTable } from '../lib/schema.js'

setupFirebaseApp()

const upgradeSchema = z.object({
  planId: z.number().int(),
  projectId: z.number()
})

async function handler(req: VercelRequest, res: VercelResponse) {
  const token = req.headers['authorization']?.split('Bearer ')[1]
  if (!token) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { uid } = await getAuth().verifyIdToken(token)
    const { planId, projectId } = upgradeSchema.parse(req.body)

    const [project, plan] = await Promise.all([
      db
        .select({ creatorId: projectsTable.creatorId })
        .from(projectsTable)
        .where(eq(projectsTable.id, projectId))
        .limit(1),
      db
        .select({ tokens: verificationPlansTable.tokens })
        .from(verificationPlansTable)
        .where(
          and(eq(verificationPlansTable.id, planId), eq(verificationPlansTable.isActive, true))
        )
        .limit(1)
    ])

    if (!project[0] || project[0].creatorId !== uid)
      return res.status(403).json({ error: 'Forbidden' })
    if (!plan[0]) return res.status(400).json({ error: 'Plan not found' })

    await db.insert(upgradeRequest).values({
      planId: planId,
      projectId: projectId
    })

    // await db
    //   .update(projectsTable)
    //   .set({
    //     selectedPlanId: planId,
    //     remainingtokens: plan[0].tokens,
    //     updatedAt: new Date()
    //   })
    //   .where(eq(projectsTable.id, projectId))

    return res.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json(z.treeifyError(error))
    }

    console.log(error)

    return res.status(400).json({ error: 'Invalid request' })
  }
}

export default withCors(handler)
