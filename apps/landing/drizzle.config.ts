import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

// Platform environment wins over local files.
if (
  !process.env.DIRECT_URL &&
  !process.env.DATABASE_URL &&
  !process.env.POSTGRES_URL
) {
  config({ path: '.env.local' });
  config({ path: '.env' });
}

const url =
  process.env.DIRECT_URL ||
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL;
if (!url) {
  throw new Error('DIRECT_URL, DATABASE_URL or POSTGRES_URL is required');
}

// Drizzle Kit ignores sibling SSL options when credentials contain a URL.
const connectionUrl = new URL(url);
connectionUrl.searchParams.set('sslmode', 'require');

export default defineConfig({
  out: './drizzle',
  schema: './api/lib/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: connectionUrl.toString(),
  },
});
