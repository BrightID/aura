import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { neon } from '@neondatabase/serverless';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function env(name: string) {
  return process.env[name]?.trim().replace(/^["']|["']$/g, '');
}

if (!env('DATABASE_URL') && !env('POSTGRES_URL')) {
  const { config } = await import('dotenv');
  config({ path: resolve(root, '.env.local') });
  config({ path: resolve(root, '.env') });
}

const url = env('DATABASE_URL') || env('POSTGRES_URL');
if (!url) {
  console.error(
    'ensure-db: DATABASE_URL or POSTGRES_URL missing on this host. Set it on Vercel — local .env is not deployed.',
  );
  process.exit(1);
}

const clientProject = env('VITE_SOME_FIREBASE_PROJECT_ID');
const adminProject = env('FIREBASE_PROJECT_ID');
if (clientProject && adminProject && clientProject !== adminProject) {
  console.error(
    `ensure-db: Firebase project mismatch: VITE_SOME_FIREBASE_PROJECT_ID=${clientProject} FIREBASE_PROJECT_ID=${adminProject}`,
  );
  process.exit(1);
}

let host = '(unparsed)';
try {
  host = new URL(url.replace(/^postgres(?:ql)?:/, 'https:')).host;
} catch {
  /* keep fallback */
}
console.log('ensure-db: schema push →', host);

const push = spawnSync('bunx', ['drizzle-kit', 'push', '--force'], {
  cwd: root,
  stdio: 'inherit',
  env: { ...process.env, DATABASE_URL: url },
});
if (push.status !== 0) process.exit(push.status ?? 1);

const sql = neon(url);
await sql`CREATE SCHEMA IF NOT EXISTS drizzle`;
await sql`CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (
  id SERIAL PRIMARY KEY,
  hash text NOT NULL,
  created_at bigint
)`;
const existing =
  await sql`SELECT created_at FROM drizzle.__drizzle_migrations`;
if (existing.length === 0) {
  const journal = JSON.parse(
    readFileSync(resolve(root, 'drizzle/meta/_journal.json'), 'utf8'),
  ) as { entries: { tag: string; when: number }[] };
  for (const entry of journal.entries) {
    const query = readFileSync(
      resolve(root, `drizzle/${entry.tag}.sql`),
    ).toString();
    const hash = createHash('sha256').update(query).digest('hex');
    await sql`INSERT INTO drizzle.__drizzle_migrations (hash, created_at) VALUES (${hash}, ${entry.when})`;
  }
  console.log('ensure-db: baselined', journal.entries.length, 'migrations');
} else {
  console.log('ensure-db: journal already has', existing.length, 'rows');
}
