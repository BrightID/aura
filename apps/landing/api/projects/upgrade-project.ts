import { VercelRequest, VercelResponse } from '@vercel/node';
import { and, eq } from 'drizzle-orm';
import { getAuth } from 'firebase-admin/auth';
import { z } from 'zod';
import { paymentSettled, planChargeAmount, planGrant } from '../lib/billing.js';
import withCors from '../lib/cors.js';
import { db } from '../lib/db.js';
import setupFirebaseApp from '../lib/firebase.js';
import {
  paymentsTable,
  projectsTable,
  verificationPlansTable,
} from '../lib/schema.js';

setupFirebaseApp();

const upgradeSchema = z.object({
  planId: z.number().int(),
  projectId: z.number(),
  orderId: z.string(),
  isYearly: z.boolean().optional().default(false),
});

async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const token = req.headers['authorization']?.split('Bearer ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const { uid } = await getAuth().verifyIdToken(token);
    const { planId, projectId, orderId, isYearly } = upgradeSchema.parse(
      req.body,
    );

    const [project, plan, payment] = await Promise.all([
      db
        .select({ creatorId: projectsTable.creatorId })
        .from(projectsTable)
        .where(eq(projectsTable.id, projectId))
        .limit(1),
      db
        .select({
          tokens: verificationPlansTable.tokens,
          monthlyPrice: verificationPlansTable.monthlyPrice,
          yearlyPrice: verificationPlansTable.yearlyPrice,
        })
        .from(verificationPlansTable)
        .where(
          and(
            eq(verificationPlansTable.id, planId),
            eq(verificationPlansTable.isActive, true),
          ),
        )
        .limit(1),
      db
        .select({
          status: paymentsTable.status,
          userId: paymentsTable.userId,
          projectId: paymentsTable.projectId,
          planId: paymentsTable.planId,
          isYearly: paymentsTable.isYearly,
          amount: paymentsTable.amount,
        })
        .from(paymentsTable)
        .where(eq(paymentsTable.orderId, orderId))
        .limit(1),
    ]);

    if (!project[0] || project[0].creatorId !== uid)
      return res.status(403).json({ error: 'Forbidden' });
    if (!plan[0]) return res.status(400).json({ error: 'Plan not found' });
    if (!payment[0] || payment[0].userId !== uid)
      return res.status(400).json({ error: 'Payment record not found' });

    const row = payment[0];
    const matches =
      row.projectId === projectId &&
      row.planId === planId &&
      Boolean(row.isYearly) === isYearly;

    if (!matches)
      return res.status(400).json({ error: 'Payment does not match this plan' });

    if (!paymentSettled(row.status))
      return res
        .status(402)
        .json({ error: 'Payment not completed', status: row.status });

    if (row.status === 'finished') {
      const price = planChargeAmount(plan[0], isYearly);
      if (price == null || row.amount !== price)
        return res
          .status(400)
          .json({ error: 'Payment amount does not match plan price' });

      const now = new Date();
      await db.transaction(async (tx) => {
        await tx
          .update(projectsTable)
          .set(planGrant(planId, plan[0].tokens ?? 0, isYearly))
          .where(eq(projectsTable.id, projectId));
        // Required. Without this status update, the payment would stay `finished`. The next POST of this route would grant that plan's full token count again.
        await tx
          .update(paymentsTable)
          .set({ status: 'completed', updatedAt: now })
          .where(eq(paymentsTable.orderId, orderId));
      });
    }

    return res.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json(z.treeifyError(error));
    }
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default withCors(handler);
