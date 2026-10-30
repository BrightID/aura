import { createHmac } from 'crypto';
import { expect, test } from 'bun:test';
import {
  moonpayChargeAccepted,
  paidAmountMatches,
  paymentSettled,
  planChargeAmount,
  planGrant,
  verifyMoonpaySignature,
} from './billing.ts';
import { isLoginEmail } from './email.ts';
import { usageDay, usageWindow } from './usage-window.ts';

test('login email stays valid across calls', () => {
  expect(isLoginEmail('a@b.co')).toBe(true);
  expect(isLoginEmail('a@b.co')).toBe(true);
  expect(isLoginEmail('not-an-email')).toBe(false);
});

test('usage window is 90 chronological days and does not run away', () => {
  const now = new Date('2026-10-30T18:00:00Z');
  const days = usageWindow(now);
  expect(days).toHaveLength(90);
  expect(days[0]).toBe('2026-08-02');
  expect(days.at(-1)).toBe('2026-10-30');
  expect(usageWindow(now)).toEqual(days);
  expect(usageDay('2026-10-30T18:00:00.000Z')).toBe('2026-10-30');
  expect(usageDay(new Date('2026-10-30T18:00:00.000Z'))).toBe('2026-10-30');
  expect(usageDay(new Date('not-a-date'))).toBe(null);
  expect(usageDay('hello')).toBe(null);
});

test('plan charge is the server price', () => {
  const plan = { monthlyPrice: 100, yearlyPrice: 80 };
  expect(planChargeAmount(plan, false)).toBe(100);
  expect(planChargeAmount(plan, true)).toBe(80);
  expect(planChargeAmount({ monthlyPrice: 0, yearlyPrice: 0 }, false)).toBe(
    null,
  );
  expect(planChargeAmount({ monthlyPrice: 1.5, yearlyPrice: 80 }, false)).toBe(
    null,
  );
  expect(
    planChargeAmount({ monthlyPrice: Number.NaN, yearlyPrice: 80 }, false),
  ).toBe(null);
});

test('settled payments are completed or legacy finished', () => {
  expect(paymentSettled('completed')).toBe(true);
  expect(paymentSettled('finished')).toBe(true);
  expect(paymentSettled('pending')).toBe(false);
});

test('moonpay signature uses the raw body', () => {
  const secret = 'whsec';
  const raw = '{"b": 1, "a": 2}';
  const stamp = '1700000000';
  const signature = createHmac('sha256', secret)
    .update(`${stamp}.${raw}`)
    .digest('hex');
  const header = `t=${stamp},s=${signature}`;
  expect(verifyMoonpaySignature(raw, header, secret)).toBe(true);
  expect(verifyMoonpaySignature(JSON.stringify(JSON.parse(raw)), header, secret)).toBe(
    false,
  );
  expect(verifyMoonpaySignature(raw, `t=${stamp}`, secret)).toBe(false);
  expect(verifyMoonpaySignature(raw, `s=${signature}`, secret)).toBe(false);
  expect(verifyMoonpaySignature(raw, `t=${stamp},s=ab`, secret)).toBe(false);
});

test('moonpay charge must be the usd amount we stored', () => {
  expect(paidAmountMatches('100.00', 100)).toBe(true);
  expect(
    moonpayChargeAccepted(
      { baseCurrencyAmount: 100, baseCurrency: { code: 'usd' } },
      100,
    ),
  ).toBe(true);
  expect(
    moonpayChargeAccepted(
      { baseCurrencyAmount: 1, baseCurrency: { code: 'usd' } },
      100,
    ),
  ).toBe(false);
  expect(
    moonpayChargeAccepted(
      { baseCurrencyAmount: 100, baseCurrency: { code: 'eur' } },
      100,
    ),
  ).toBe(false);
});

test('a plan grant records the plan, the token balance, and a deadline', () => {
  const now = new Date('2026-10-30T12:00:00Z');
  const grant = planGrant(1, 10000, false, now);
  expect(grant.selectedPlanId).toBe(1);
  expect(grant.remainingtokens).toBe(10000);
  expect(grant.updatedAt).toBe(now);
  expect(grant.deadline.toISOString()).toBe('2026-11-30T12:00:00.000Z');
});
