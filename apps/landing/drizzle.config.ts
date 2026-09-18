import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

// Platform env (Vercel/Neon) wins. Local files only if nothing is set.
if (!process.env.DATABASE_URL && !process.env.POSTGRES_URL) {
  config({ path: '.env.local' });
  config({ path: '.env' });
}

const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!url) {
  throw new Error('DATABASE_URL or POSTGRES_URL is required');
}

export default defineConfig({
  out: './drizzle',
  schema: './api/lib/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url,
  },
});
