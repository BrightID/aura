# Landing database

The landing API uses Drizzle and Postgres.js to connect to Supabase Postgres.
Firebase still authenticates users; Supabase Auth is not part of this change.

## Configure a fresh database

1. Copy the connection URI from the Supabase **Connect** dialog into
   `apps/landing/.env` as `DATABASE_URL`. Use a pooler URI when the direct
   `db.<project>.supabase.co` host is unreachable over IPv6. Keep credentials
   server-side; never use a `VITE_` prefix.
2. Optionally set `DIRECT_URL` to a direct or session-pooler URI for schema
   management. The API uses `DATABASE_URL` (or the legacy `POSTGRES_URL`);
   Drizzle and `ensure-db` prefer `DIRECT_URL` when it is present.
3. From this directory, run `bun run ensure-db` against the fresh destination.
   This pushes the current schema, verifies every application table and column,
   and records the repository migrations as applied without replaying their SQL.
   It does not copy Neon records or seed plans. The existing script uses
   `drizzle-kit push --force`; review schema changes before running it against
   a database containing data.
4. Set the same database variables in Vercel before deploying. Local `.env`
   files are not deployed. The root Vercel build already runs `ensure-db`.
5. Verify login, project creation, verification, and payments in the deployed
   app before retiring Neon. Add the desired rows to `plans` in Supabase’s Table
   Editor before testing plan upgrades and payments. Configure each project’s
   BrightID app through its BrightID settings before testing verification.

TLS is required by the clients. Prepared statements are disabled for pooler
compatibility. All eight application tables have row-level security enabled
without public policies: the API connects with the Supabase database owner,
while public Supabase API clients cannot read or modify these tables. Runtime
schema initialization creates tables and enables RLS in one transaction.

To roll back, restore the previous Vercel database variables and deployment.
This does not copy any records written to Supabase back into Neon.

## Local checks

```sh
bun test tests/database.test.ts
bunx tsc --noEmit -p api
```

These checks do not connect to a live database.
