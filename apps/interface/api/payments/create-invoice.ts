import { VercelRequest, VercelResponse } from '@vercel/node'
import { eq } from 'drizzle-orm'
import { getAuth } from 'firebase-admin/auth'
import { z } from 'zod'
import withCors from '../lib/cors.js'
import { db } from '../lib/db.js'
import setupFirebaseApp from '../lib/firebase.js'
import { paymentsTable, projectsTable } from '../lib/schema.js'

setupFirebaseApp()

const schema = z.object({
  projectId: z.number().int(),
  planId: z.number().int(),
  amount: z.number().positive(),
  isYearly: z.boolean().default(false),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
})

const NP_BASE = 'https://api.nowpayments.io/v1'

async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const token = req.headers['authorization']?.split('Bearer ')[1]
  if (!token) return res.status(401).json({ error: 'Unauthorized' })

  const apiKey = process.env.NOWPAYMENTS_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'Payment provider not configured' })

  try {
    const { uid } = await getAuth().verifyIdToken(token)
    const { projectId, planId, amount, isYearly, successUrl, cancelUrl } = schema.parse(req.body)

    const project = await db
      .select({ creatorId: projectsTable.creatorId, name: projectsTable.name })
      .from(projectsTable)
      .where(eq(projectsTable.id, projectId))
      .limit(1)

    if (!project[0] || project[0].creatorId !== uid)
      return res.status(403).json({ error: 'Forbidden' })

    const orderId = `${projectId}-${planId}-${isYearly ? 'y' : 'm'}-${Date.now()}`
    const webhookUrl = `${process.env.API_BASE_URL ?? ''}/api/payments/webhook`

    const npRes = await fetch(`${NP_BASE}/invoice`, {
      method: 'POST',
      headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        price_amount: amount,
        price_currency: 'usd',
        order_id: orderId,
        order_description: `${project[0].name} — ${isYearly ? 'yearly' : 'monthly'} plan #${planId}`,
        success_url: `${successUrl}?order_id=${orderId}`,
        cancel_url: cancelUrl,
        ipn_callback_url: webhookUrl,
      }),
    })

    if (!npRes.ok) {
      console.error('NOWPayments error:', await npRes.text())
      return res.status(502).json({ error: 'Failed to create invoice' })
    }

    const invoice = await npRes.json() as { id: string; invoice_url: string }

    await db.insert(paymentsTable).values({
      orderId,
      projectId,
      planId,
      userId: uid,
      isYearly,
      amount,
      nowpaymentsId: invoice.id,
      status: 'pending',
    })

    return res.json({ orderId, invoiceId: invoice.id, invoiceUrl: invoice.invoice_url })
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json(z.treeifyError(error))
    console.error(error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export default withCors(handler)
