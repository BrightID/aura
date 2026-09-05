import { VercelRequest, VercelResponse } from '@vercel/node';
import { createHmac } from 'crypto';
import { eq } from 'drizzle-orm';
import { getAuth } from 'firebase-admin/auth';
import { z } from 'zod';
import withCors from '../lib/cors.js';
import { db } from '../lib/db.js';
import setupFirebaseApp from '../lib/firebase.js';
import { paymentsTable, projectsTable } from '../lib/schema.js';

setupFirebaseApp();

const schema = z.object({
  projectId: z.number().int(),
  planId: z.number().int(),
  amount: z.number().positive(),
  isYearly: z.boolean().default(false),
  successUrl: z.url(),
  cancelUrl: z.url(),
});

const MOONPAY_WIDGET = 'https://buy.moonpay.com';

async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST')
    return res.status(405).json({ error: 'Method not allowed' });

  const token = req.headers['authorization']?.split('Bearer ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const publishableKey = process.env.MOONPAY_PUBLISHABLE_KEY;
  const secretKey = process.env.MOONPAY_SECRET_KEY;
  if (!publishableKey || !secretKey)
    return res.status(500).json({ error: 'Payment provider not configured' });

  try {
    const { uid } = await getAuth().verifyIdToken(token);
    const { projectId, planId, amount, isYearly, successUrl, cancelUrl } =
      schema.parse(req.body);

    const project = await db
      .select({ creatorId: projectsTable.creatorId, name: projectsTable.name })
      .from(projectsTable)
      .where(eq(projectsTable.id, projectId))
      .limit(1);

    if (!project[0] || project[0].creatorId !== uid)
      return res.status(403).json({ error: 'Forbidden' });

    const orderId = `${projectId}-${planId}-${isYearly ? 'y' : 'm'}-${Date.now()}`;

    const params = new URLSearchParams({
      apiKey: publishableKey,
      baseCurrencyAmount: String(amount),
      baseCurrencyCode: 'usd',
      externalTransactionId: orderId,
      redirectURL: `${successUrl}?order_id=${orderId}`,
      cancelURL: cancelUrl,
    });

    const queryString = `?${params.toString()}`;
    const signature = createHmac('sha256', secretKey)
      .update(queryString)
      .digest('base64');
    params.append('signature', signature);

    const widgetUrl = `${MOONPAY_WIDGET}?${params.toString()}`;

    await db.insert(paymentsTable).values({
      orderId,
      projectId,
      planId,
      userId: uid,
      isYearly,
      amount,
      nowpaymentsId: orderId,
      status: 'pending',
    });

    return res.json({ orderId, widgetUrl });
  } catch (error) {
    if (error instanceof z.ZodError)
      return res.status(400).json(z.treeifyError(error));
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default withCors(handler);
