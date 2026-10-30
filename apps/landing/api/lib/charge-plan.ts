import { and, eq } from 'drizzle-orm';
import { planChargeAmount } from './billing.js';
import { db } from './db.js';
import { verificationPlansTable } from './schema.js';

export async function chargeForPlan(planId: number, isYearly: boolean) {
  const [plan] = await db
    .select({
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
    .limit(1);

  if (!plan) return null;
  return planChargeAmount(plan, isYearly);
}
