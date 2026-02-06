import { drizzle } from 'drizzle-orm/neon-serverless'

// export const db = drizzle(import.meta.env.DATABASE_URL!)
export const db = drizzle(process.env.DATABASE_URL!)
