import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
if (!url) throw new Error('DATABASE_URL is not set');

export const sql = neon(url);
export const db = drizzle(sql);

