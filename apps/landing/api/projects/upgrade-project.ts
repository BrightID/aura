import { VercelRequest, VercelResponse } from '@vercel/node';
import { and, eq } from 'drizzle-orm';
import { getAuth } from 'firebase-admin/auth';
import { z } from 'zod';
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
        .select({ tokens: verificationPlansTable.tokens })
        .from(verificationPlansTable)
        .where(
          and(
            eq(verificationPlansTable.id, planId),
            eq(verificationPlansTable.isActive, true),
          ),
        )
        .limit(1),
      db
        .select({ status: paymentsTable.status, userId: paymentsTable.userId })
        .from(paymentsTable)
        .where(eq(paymentsTable.orderId, orderId))
        .limit(1),
    ]);

    if (!project[0] || project[0].creatorId !== uid)
      return res.status(403).json({ error: 'Forbidden' });
    if (!plan[0]) return res.status(400).json({ error: 'Plan not found' });
    if (!payment[0] || payment[0].userId !== uid)
      return res.status(400).json({ error: 'Payment record not found' });
    if (payment[0].status !== 'finished')
      return res
        .status(402)
        .json({ error: 'Payment not completed', status: payment[0].status });

    const deadline = new Date();
    deadline.setMonth(deadline.getMonth() + (isYearly ? 12 : 1));

    await db
      .update(projectsTable)
      .set({
        selectedPlanId: planId,
        remainingtokens: plan[0].tokens ?? 0,
        deadline,
        updatedAt: new Date(),
      })
      .where(eq(projectsTable.id, projectId));

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
