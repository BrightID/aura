import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
if (!url) throw new Error('DATABASE_URL is not set');

// Supabase transaction pooler (port 6543) rejects prepared statements.
export const sql = postgres(url, { prepare: false, max: 1, ssl: 'require' });
export const db = drizzle(sql);
