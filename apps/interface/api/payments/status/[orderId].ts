import { VercelRequest, VercelResponse } from '@vercel/node'
import { eq } from 'drizzle-orm'
import { getAuth } from 'firebase-admin/auth'
import withCors from '../../lib/cors.js'
import { db } from '../../lib/db.js'
import setupFirebaseApp from '../../lib/firebase.js'
import { paymentsTable } from '../../lib/schema.js'

setupFirebaseApp()

async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const token = req.headers['authorization']?.split('Bearer ')[1]
  if (!token) return res.status(401).json({ error: 'Unauthorized' })

  try {
    const { uid } = await getAuth().verifyIdToken(token)
    const orderId = req.query.orderId as string

    const payment = await db
      .select({
        orderId: paymentsTable.orderId,
        status: paymentsTable.status,
        planId: paymentsTable.planId,
        projectId: paymentsTable.projectId,
        isYearly: paymentsTable.isYearly,
        amount: paymentsTable.amount,
        userId: paymentsTable.userId,
      })
      .from(paymentsTable)
      .where(eq(paymentsTable.orderId, orderId))
      .limit(1)

    if (!payment[0]) return res.status(404).json({ error: 'Payment not found' })
    if (payment[0].userId !== uid) return res.status(403).json({ error: 'Forbidden' })

    return res.json({
      orderId: payment[0].orderId,
      status: payment[0].status,
      planId: payment[0].planId,
      projectId: payment[0].projectId,
      isYearly: payment[0].isYearly,
      amount: payment[0].amount,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export default withCors(handler)
