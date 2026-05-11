import { VercelRequest, VercelResponse } from '@vercel/node'
import { createHmac } from 'crypto'
import { and, eq } from 'drizzle-orm'
import withCors from '../lib/cors.js'
import { db } from '../lib/db.js'
import { paymentsTable, projectsTable, verificationPlansTable } from '../lib/schema.js'

const TERMINAL = new Set(['finished', 'failed', 'refunded', 'expired', 'partially_paid'])

function verifySignature(payload: Record<string, unknown>, signature: string, secret: string): boolean {
  const sorted = Object.keys(payload)
    .sort()
    .reduce<Record<string, unknown>>((acc, k) => { acc[k] = payload[k]; return acc }, {})
  const hmac = createHmac('sha512', secret).update(JSON.stringify(sorted)).digest('hex')
  return hmac === signature
}

async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const secret = process.env.NOWPAYMENTS_IPN_SECRET
  if (!secret) return res.status(500).end()

  const signature = req.headers['x-nowpayments-sig'] as string | undefined
  if (!signature) return res.status(400).json({ error: 'Missing signature' })

  const body = req.body as Record<string, unknown>
  if (!verifySignature(body, signature, secret)) {
    console.error('NOWPayments webhook: invalid signature')
    return res.status(401).json({ error: 'Invalid signature' })
  }

  const paymentStatus = body.payment_status as string
  const orderId = body.order_id as string
  if (!orderId) return res.status(400).json({ error: 'Missing order_id' })

  // Acknowledge non-terminal statuses immediately
  if (!TERMINAL.has(paymentStatus)) return res.json({ received: true })

  try {
    const [payment] = await db
      .select({
        id: paymentsTable.id,
        projectId: paymentsTable.projectId,
        planId: paymentsTable.planId,
        isYearly: paymentsTable.isYearly,
        status: paymentsTable.status,
      })
      .from(paymentsTable)
      .where(eq(paymentsTable.orderId, orderId))
      .limit(1)

    if (!payment || payment.status === 'finished') return res.json({ received: true })

    await db
      .update(paymentsTable)
      .set({ status: paymentStatus, updatedAt: new Date() })
      .where(eq(paymentsTable.orderId, orderId))

    if (paymentStatus === 'finished') {
      const [plan] = await db
        .select({ tokens: verificationPlansTable.tokens })
        .from(verificationPlansTable)
        .where(and(eq(verificationPlansTable.id, payment.planId), eq(verificationPlansTable.isActive, true)))
        .limit(1)

      if (plan) {
        const deadline = new Date()
        deadline.setMonth(deadline.getMonth() + (payment.isYearly ? 12 : 1))

        await db
          .update(projectsTable)
          .set({
            selectedPlanId: payment.planId,
            remainingtokens: plan.tokens ?? 0,
            deadline,
            updatedAt: new Date(),
          })
          .where(eq(projectsTable.id, payment.projectId))
      }
    }

    return res.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return res.status(500).json({ error: 'Processing failed' })
  }
}

export default withCors(handler)
