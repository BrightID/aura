import { VercelRequest, VercelResponse } from '@vercel/node'
import { desc, eq } from 'drizzle-orm'
import { getAuth } from 'firebase-admin/auth'
import withCors from '../lib/cors.js'
import { db } from '../lib/db.js'
import setupFirebaseApp from '../lib/firebase.js'
import { paymentsTable, projectsTable } from '../lib/schema.js'

setupFirebaseApp()

async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const token = req.headers['authorization']?.split('Bearer ')[1]
  if (!token) return res.status(401).json({ error: 'Unauthorized' })

  try {
    const { uid } = await getAuth().verifyIdToken(token)

    const payments = await db
      .select({
        id: paymentsTable.id,
        orderId: paymentsTable.orderId,
        projectId: paymentsTable.projectId,
        projectName: projectsTable.name,
        planId: paymentsTable.planId,
        isYearly: paymentsTable.isYearly,
        amount: paymentsTable.amount,
        status: paymentsTable.status,
        createdAt: paymentsTable.createdAt,
        updatedAt: paymentsTable.updatedAt,
      })
      .from(paymentsTable)
      .leftJoin(projectsTable, eq(paymentsTable.projectId, projectsTable.id))
      .where(eq(paymentsTable.userId, uid))
      .orderBy(desc(paymentsTable.createdAt))
      .limit(50)

    return res.json({ payments })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export default withCors(handler)
