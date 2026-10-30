import { beforeEach, expect, mock, test } from 'bun:test';

let paymentStatus = 'finished';
let grantWrites = 0;
let paymentAmount = 100;
let planTokens: number | null = 10000;
const grants: { remaining: unknown; deadline?: Date }[] = [];

mock.module('../lib/firebase.ts', () => ({
  default: () => {},
}));

mock.module('firebase-admin/auth', () => ({
  getAuth: () => ({
    verifyIdToken: async () => ({ uid: 'user-1' }),
  }),
}));

mock.module('../lib/ensure-schema.ts', () => ({
  ensureSchema: async () => {},
}));

function selectChain(load: () => unknown[]) {
  const chain = {
    from() {
      return chain;
    },
    where() {
      return chain;
    },
    limit() {
      const promise = Promise.resolve(load());
      return Object.assign(promise, { for: () => promise });
    },
  };
  return chain;
}

mock.module('../lib/db.ts', () => ({
  db: {
    select(columns: Record<string, unknown>) {
      if ('creatorId' in columns) return selectChain(() => [{ creatorId: 'user-1' }]);
      if ('tokens' in columns) {
        return selectChain(() => [
          { tokens: planTokens, monthlyPrice: 100, yearlyPrice: 80 },
        ]);
      }
      return selectChain(() => [
        {
          status: paymentStatus,
          userId: 'user-1',
          projectId: 10,
          planId: 1,
          isYearly: false,
          amount: paymentAmount,
        },
      ]);
    },
    update() {
      return {
        set(values: Record<string, unknown>) {
          return {
            where() {
              if ('remainingtokens' in values) {
                grantWrites += 1;
                grants.push({
                  remaining: values.remainingtokens,
                  deadline: values.deadline as Date,
                });
              }
              if (typeof values.status === 'string') paymentStatus = values.status;
              return Promise.resolve();
            },
          };
        },
      };
    },
    transaction(run: (tx: unknown) => Promise<unknown>) {
      return run(this);
    },
  },
}));

const { default: upgrade } = await import('./upgrade-project.ts');

function response() {
  const res = {
    statusCode: 200,
    body: undefined as unknown,
    setHeader() {},
    status(code: number) {
      res.statusCode = code;
      return res;
    },
    json(body: unknown) {
      res.body = body;
      return res;
    },
    end() {
      return res;
    },
  };
  return res;
}

beforeEach(() => {
  paymentStatus = 'finished';
  grantWrites = 0;
  paymentAmount = 100;
  planTokens = 10000;
  grants.length = 0;
});

test('a legacy finished payment grants the plan once', async () => {
  const req = {
    method: 'POST',
    headers: { authorization: 'Bearer token' },
    body: { planId: 1, projectId: 10, orderId: 'legacy-order', isYearly: false },
  };

  const first = response();
  await upgrade(req, first);
  const second = response();
  await upgrade(req, second);

  expect(first.statusCode).toBe(200);
  expect(second.statusCode).toBe(200);
  expect(grantWrites).toBe(1);
  expect(paymentStatus).toBe('completed');
});

test('a finished payment with the wrong amount does not grant', async () => {
  paymentAmount = 50;
  const res = response();
  await upgrade(
    {
      method: 'POST',
      headers: { authorization: 'Bearer token' },
      body: { planId: 1, projectId: 10, orderId: 'legacy-order', isYearly: false },
    },
    res,
  );
  expect(res.statusCode).toBe(400);
  expect(grantWrites).toBe(0);
  expect(paymentStatus).toBe('finished');
});

test('a finished grant uses the monthly deadline and zero tokens when the plan has none', async () => {
  planTokens = null;
  const res = response();
  await upgrade(
    {
      method: 'POST',
      headers: { authorization: 'Bearer token' },
      body: { planId: 1, projectId: 10, orderId: 'legacy-order', isYearly: false },
    },
    res,
  );
  expect(grants).toHaveLength(1);
  expect(grants[0]?.remaining).toBe(0);
  const deadline = grants[0]?.deadline?.getTime() ?? 0;
  const span = deadline - Date.now();
  expect(span).toBeGreaterThan(20 * 24 * 60 * 60 * 1000);
  expect(span).toBeLessThan(40 * 24 * 60 * 60 * 1000);
});
