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
compatibility. All eleven application tables, including the three Vouch room
tables below, have row-level security enabled
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

## Vouch practice rooms

`api/vouch/*` is the room server for Vouch's shared practice mode
(`apps/vouch`): several browsers open `/vouch/?room=<name>` on the landing
site and see one practice world. It stores invented people and answers in the
`vouch_rooms`, `vouch_presence` and `vouch_claims` tables, and never calls the
BrightID network. Each write to any room deletes the rooms nobody has written
to for 14 days, with their invite claims and presence rows.

Set `VOUCH_TEAM_CODE` in Vercel. Whoever runs a practice session types it in
the Vouch app to reset the room. Without it, every reset is refused.

To test the endpoints against a disposable Postgres that accepts TLS (the
test empties the three tables first, so never point it at a real database):

```sh
podman run -d --rm --name vouch-pg -e POSTGRES_PASSWORD=test -p 55432:5432 \
  docker.io/library/postgres:16 -c ssl=on \
  -c ssl_cert_file=/etc/ssl/certs/ssl-cert-snakeoil.pem \
  -c ssl_key_file=/etc/ssl/private/ssl-cert-snakeoil.key
VOUCH_TEST_DATABASE_URL=postgres://postgres:test@localhost:55432/postgres \
  bun test tests/vouch-room.test.ts
```

Run it on its own. Bun loads all test files into one process, so
`tests/database.test.ts` would create the database client first, with its
dummy URL, and close it when it finishes.
