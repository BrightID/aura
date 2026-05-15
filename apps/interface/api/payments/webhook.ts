import { VercelRequest, VercelResponse } from '@vercel/node'
import { createHmac } from 'crypto'
import { and, eq } from 'drizzle-orm'
import withCors from '../lib/cors.js'
import { db } from '../lib/db.js'
import { paymentsTable, projectsTable, verificationPlansTable } from '../lib/schema.js'

const TERMINAL = new Set(['completed', 'failed'])

function verifySignature(rawBody: string, sigHeader: string, secret: string): boolean {
  const parts = Object.fromEntries(sigHeader.split(',').map(p => p.split('=')))
  const { t: timestamp, s: signature } = parts
  if (!timestamp || !signature) return false
  const expected = createHmac('sha256', secret).update(`${timestamp}.${rawBody}`).digest('hex')
  return expected === signature
}

async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const secret = process.env.MOONPAY_WEBHOOK_SECRET
  if (!secret) return res.status(500).end()

  const sigHeader = req.headers['moonpay-signature-v2'] as string | undefined
  if (!sigHeader) return res.status(400).json({ error: 'Missing signature' })

  const rawBody = JSON.stringify(req.body)
  if (!verifySignature(rawBody, sigHeader, secret)) {
    console.error('MoonPay webhook: invalid signature')
    return res.status(401).json({ error: 'Invalid signature' })
  }

  const event = req.body as { type: string; data: { status: string; externalTransactionId: string } }
  if (event.type !== 'transaction_updated') return res.json({ received: true })

  const paymentStatus = event.data.status
  const orderId = event.data.externalTransactionId
  if (!orderId) return res.status(400).json({ error: 'Missing externalTransactionId' })

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

    if (!payment || payment.status === 'completed') return res.json({ received: true })

    await db
      .update(paymentsTable)
      .set({ status: paymentStatus, updatedAt: new Date() })
      .where(eq(paymentsTable.orderId, orderId))

    if (paymentStatus === 'completed') {
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
