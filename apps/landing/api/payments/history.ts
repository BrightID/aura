import { VercelRequest, VercelResponse } from '@vercel/node';
import { desc, eq } from 'drizzle-orm';
import { requireUid } from '../lib/auth.js';
import withCors from '../lib/cors.js';
import { db } from '../lib/db.js';
import { sendInternalError } from '../lib/http-error.js';
import { paymentsTable, projectsTable } from '../lib/schema.js';

async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET')
    return res.status(405).json({ error: 'Method not allowed' });

  const uid = await requireUid(req, res);
  if (!uid) return;

  try {
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
      .limit(50);

    return res.json({ payments });
  } catch (error) {
    return sendInternalError(res, error);
  }
}

export default withCors(handler);
