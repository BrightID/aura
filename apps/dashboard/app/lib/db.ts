import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const url = import.meta.env.DATABASE_URL ?? import.meta.env.POSTGRES_URL;
if (!url) throw new Error('DATABASE_URL is not set');

// Supabase transaction pooler (port 6543) rejects prepared statements.
const sql = postgres(url, { prepare: false, max: 1, ssl: 'require' });
export const db = drizzle(sql);
