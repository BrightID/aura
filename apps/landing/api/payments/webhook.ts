import { VercelRequest, VercelResponse } from '@vercel/node';
import { eq } from 'drizzle-orm';
import {
  moonpayChargeAccepted,
  planChargeAmount,
  planGrant,
  verifyMoonpaySignature,
} from '../lib/billing.js';
import withCors from '../lib/cors.js';
import { db } from '../lib/db.js';
import {
  paymentsTable,
  projectsTable,
  verificationPlansTable,
} from '../lib/schema.js';

const TERMINAL = new Set(['completed', 'failed']);

export const config = {
  api: {
    bodyParser: false,
  },
};

type MoonpayEvent = {
  type?: string;
  data?: {
    status?: string;
    externalTransactionId?: string;
    baseCurrencyAmount?: unknown;
    baseCurrency?: { code?: string } | string | null;
  };
};

async function readRawBody(req: VercelRequest): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
}

async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const secret = process.env.MOONPAY_WEBHOOK_SECRET;
  if (!secret) return res.status(500).end();

  const header = req.headers['moonpay-signature-v2'];
  const sigHeader = Array.isArray(header) ? header[0] : header;
  if (!sigHeader) return res.status(400).json({ error: 'Missing signature' });

  const rawBody = await readRawBody(req);
  if (!verifyMoonpaySignature(rawBody, sigHeader, secret)) {
    console.error('MoonPay webhook: invalid signature');
    return res.status(401).json({ error: 'Invalid signature' });
  }

  let event: MoonpayEvent;
  try {
    event = JSON.parse(rawBody) as MoonpayEvent;
  } catch {
    return res.status(400).json({ error: 'Invalid payload' });
  }

  if (event.type !== 'transaction_updated') return res.json({ received: true });

  const paymentStatus = event.data?.status?.toLowerCase();
  const orderId = event.data?.externalTransactionId;
  if (!paymentStatus || !orderId)
    return res.status(400).json({ error: 'Missing externalTransactionId' });

  if (!TERMINAL.has(paymentStatus)) return res.json({ received: true });

  try {
    await db.transaction(async (tx) => {
      const [payment] = await tx
        .select({
          projectId: paymentsTable.projectId,
          planId: paymentsTable.planId,
          isYearly: paymentsTable.isYearly,
          status: paymentsTable.status,
          amount: paymentsTable.amount,
        })
        .from(paymentsTable)
        .where(eq(paymentsTable.orderId, orderId))
        .limit(1)
        .for('update');

      if (!payment || payment.status === 'completed') return;

      if (paymentStatus === 'failed') {
        await tx
          .update(paymentsTable)
          .set({ status: 'failed', updatedAt: new Date() })
          .where(eq(paymentsTable.orderId, orderId));
        return;
      }

      const [plan] = await tx
        .select({
          tokens: verificationPlansTable.tokens,
          monthlyPrice: verificationPlansTable.monthlyPrice,
          yearlyPrice: verificationPlansTable.yearlyPrice,
        })
        .from(verificationPlansTable)
        .where(eq(verificationPlansTable.id, payment.planId))
        .limit(1);

      if (!plan) throw new Error('Plan missing for paid order');

      const yearly = payment.isYearly ?? false;
      const expected = planChargeAmount(plan, yearly);
      if (
        expected == null ||
        payment.amount !== expected ||
        !event.data ||
        !moonpayChargeAccepted(event.data, expected)
      ) {
        await tx
          .update(paymentsTable)
          .set({ status: 'failed', updatedAt: new Date() })
          .where(eq(paymentsTable.orderId, orderId));
        console.error('MoonPay webhook: amount mismatch', orderId);
        return;
      }

      const now = new Date();
      await tx
        .update(projectsTable)
        .set(planGrant(payment.planId, plan.tokens ?? 0, yearly, now))
        .where(eq(projectsTable.id, payment.projectId));
      await tx
        .update(paymentsTable)
        .set({ status: 'completed', updatedAt: now })
        .where(eq(paymentsTable.orderId, orderId));
    });

    return res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: 'Processing failed' });
  }
}

export default withCors(handler);
