import { afterAll, expect, spyOn, test } from 'bun:test';
import { getTableName } from 'drizzle-orm';
import { getTableConfig } from 'drizzle-orm/pg-core';
import postgres from 'postgres';

// These tests construct the client without opening a database connection.
process.env.DATABASE_URL = 'postgres://postgres:test@localhost:5432/postgres';
const { db, sql } = await import('../api/lib/db');
const schema = await import('../api/lib/schema');
const { ensureSchema } = await import('../api/lib/ensure-schema');

afterAll(() => sql.end());

test('server client requires TLS and supports Supabase pooling', () => {
  expect(sql.options.ssl).toBe('require');
  expect(sql.options.prepare).toBe(false);
  expect(sql.options.max).toBe(1);
  const query = db.select().from(schema.usersTable).toSQL();
  expect(query.sql).toContain('from "users"');
});

test('all app tables deny public API access by default', () => {
  expect(Object.values(schema)).toHaveLength(8);
  for (const table of Object.values(schema)) {
    expect(getTableConfig(table).enableRLS).toBe(true);
  }
});

test('schema setup retries failures and enables RLS on every table', async () => {
  const transaction = spyOn(sql, 'begin').mockImplementation(async (fn) =>
    fn(sql),
  );
  const execute = spyOn(sql, 'unsafe');
  try {
    execute.mockRejectedValueOnce(new Error('connection interrupted'));
    await expect(ensureSchema()).rejects.toThrow('connection interrupted');
    execute.mockResolvedValue([]);
    await ensureSchema();
    for (const table of Object.values(schema)) {
      expect(execute).toHaveBeenCalledWith(
        `ALTER TABLE "${getTableName(table)}" ENABLE ROW LEVEL SECURITY`,
      );
    }
    const calls = execute.mock.calls.length;
    await ensureSchema();
    expect(execute.mock.calls).toHaveLength(calls);
  } finally {
    execute.mockRestore();
    transaction.mockRestore();
  }
});

test('schema tool connection URL requires TLS', async () => {
  const { default: config } = await import('../drizzle.config');
  const client = postgres(config.dbCredentials!.url, { max: 1 });
  try {
    expect(client.options.ssl).toBe('require');
  } finally {
    await client.end();
  }
});
