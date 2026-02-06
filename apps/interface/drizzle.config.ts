import 'dotenv/config'
import { config } from 'dotenv'
import { defineConfig } from 'drizzle-kit'

config({
  path: '.env.local'
})

if (!process.env.DATABASE_URL)
  throw new Error(
    'DATABASE_URL is not defined, you should configure it inside your .env file first'
  )

export default defineConfig({
  out: './drizzle',
  schema: './api/lib/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!
  }
})
