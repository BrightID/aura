import { VercelRequest, VercelResponse } from '@vercel/node';
import { and, eq, sql } from 'drizzle-orm';
import { requireUid } from './lib/auth.js';
import withCors from './lib/cors.js';
import { db } from './lib/db.js';
import { projectsTable, verificationsTable } from './lib/schema.js';
import { usageDay, usageWindow } from './lib/usage-window.js';

async function handler(req: VercelRequest, res: VercelResponse) {
  const uid = await requireUid(req, res);
  if (!uid) return;

  try {
    const projectId = Number(req.query.id);

    const [project] = await db
      .select({ creatorId: projectsTable.creatorId })
      .from(projectsTable)
      .where(eq(projectsTable.id, projectId));

    if (!project || project.creatorId !== uid)
      return res.status(403).json({ error: 'Forbidden' });

    const usage = await db
      .select({
        date: sql`DATE(${verificationsTable.verifiedAt})`.as('date'),
        verifications: sql<number>`COUNT(*)::int`,
      })
      .from(verificationsTable)
      .where(
        and(
          eq(verificationsTable.projectId, projectId),
          sql`${verificationsTable.verifiedAt} >= CURRENT_DATE - INTERVAL '90 days'`,
        ),
      )
      .groupBy(sql`DATE(${verificationsTable.verifiedAt})`)
      .orderBy(sql`date`);

    const counts = new Map<string, number>();
    for (const row of usage) {
      const day = usageDay(row.date);
      if (day) counts.set(day, Number(row.verifications) || 0);
    }

    const filledData = usageWindow().map((date) => ({
      date,
      verifications: counts.get(date) ?? 0,
    }));

    return res.json({ data: filledData });
  } catch {
    return res.status(400).json({ error: 'Invalid request' });
  }
}

export default withCors(handler);
