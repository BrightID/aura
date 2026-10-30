import { createHmac, timingSafeEqual } from 'crypto';

const SETTLED = new Set(['completed', 'finished']);

export function planChargeAmount(
  plan: { monthlyPrice: number | null; yearlyPrice: number | null },
  isYearly: boolean,
): number | null {
  const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
  if (price == null || !Number.isInteger(price) || price <= 0) return null;
  return price;
}

export function paidAmountMatches(paid: unknown, expected: number): boolean {
  const value = typeof paid === 'number' ? paid : Number(paid);
  return Number.isFinite(value) && Math.abs(value - expected) < 0.001;
}

export function paymentSettled(status: string | null | undefined): boolean {
  return status != null && SETTLED.has(status);
}

export function subscriptionDeadline(from: Date, isYearly: boolean): Date {
  const deadline = new Date(from);
  deadline.setMonth(deadline.getMonth() + (isYearly ? 12 : 1));
  return deadline;
}

export function planGrant(
  planId: number,
  tokens: number,
  isYearly: boolean,
  now = new Date(),
) {
  return {
    selectedPlanId: planId,
    remainingtokens: tokens,
    deadline: subscriptionDeadline(now, isYearly),
    updatedAt: now,
  };
}

type MoonpayCharge = {
  baseCurrencyAmount?: unknown;
  baseCurrency?: { code?: string } | string | null;
};

export function moonpayChargeAccepted(
  data: MoonpayCharge,
  expectedAmount: number,
): boolean {
  const currency = data.baseCurrency;
  const code =
    typeof currency === 'string' ? currency : currency?.code;
  if (code != null && code.toLowerCase() !== 'usd') return false;
  return paidAmountMatches(data.baseCurrencyAmount, expectedAmount);
}

export function verifyMoonpaySignature(
  rawBody: string,
  sigHeader: string,
  secret: string,
): boolean {
  const parts = Object.fromEntries(
    sigHeader.split(',').map((part) => {
      const index = part.indexOf('=');
      return index === -1
        ? [part, '']
        : [part.slice(0, index), part.slice(index + 1)];
    }),
  );
  const timestamp = parts.t;
  const signature = parts.s;
  if (!timestamp || !signature) return false;
  const expected = createHmac('sha256', secret)
    .update(`${timestamp}.${rawBody}`)
    .digest('hex');
  const actual = Buffer.from(signature);
  const computed = Buffer.from(expected);
  if (actual.length !== computed.length) return false;
  return timingSafeEqual(actual, computed);
}
