import { VercelRequest, VercelResponse } from '@vercel/node'
import { and, eq, sql } from 'drizzle-orm'
import { getAuth } from 'firebase-admin/auth'
import withCors from '../../lib/cors.js'
import { db } from '../../lib/db.js'
import { projectsTable, verificationsTable } from '../../lib/schema.js'

async function handler(req: VercelRequest, res: VercelResponse) {
  const token = req.headers['authorization']?.split('Bearer ')[1]
  if (!token) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { uid } = await getAuth().verifyIdToken(token)
    const projectId = Number(req.query.id)

    const [project] = await db
      .select({ creatorId: projectsTable.creatorId })
      .from(projectsTable)
      .where(eq(projectsTable.id, projectId))

    if (!project || project.creatorId !== uid) return res.status(403).json({ error: 'Forbidden' })

    const usage = await db
      .select({
        date: sql`DATE(${verificationsTable.verifiedAt})`.as('date'),
        verifications: sql<number>`COUNT(*)::int`
      })
      .from(verificationsTable)
      .where(
        and(
          eq(verificationsTable.projectId, projectId),
          sql`${verificationsTable.verifiedAt} >= CURRENT_DATE - INTERVAL '90 days'`
        )
      )
      .groupBy(sql`DATE(${verificationsTable.verifiedAt})`)
      .orderBy(sql`date`)

    const today = new Date()
    const dates = []
    for (
      let d = new Date(today);
      d >= new Date(today.setDate(today.getDate() - 89));
      d.setDate(d.getDate() - 1)
    ) {
      dates.push(new Date(d))
    }

    const filledData = dates.map((date) => {
      const iso = date.toISOString().split('T')[0]
      const found = usage.find((u) => u.date === iso)
      return {
        date: iso,
        verifications: found?.verifications || 0
      }
    })

    return res.json({ data: filledData })
  } catch (error) {
    return res.status(400).json({ error: 'Invalid request' })
  }
}

export default withCors(handler)
