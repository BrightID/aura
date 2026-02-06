import { sql } from 'drizzle-orm'
import { boolean, integer, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core'

export const usersTable = pgTable('users', {
  id: varchar({ length: 43 }).notNull().primaryKey(),
  createdAt: timestamp().defaultNow(),
  integrations: varchar({ length: 255 }).notNull().array().default([])
})

export const auraPlayersSocialTable = pgTable('socialRecords', {
  hash: varchar({ length: 300 }).primaryKey()
})

export const projectsTable = pgTable('projects', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  description: varchar({ length: 255 }).notNull(),
  requirementLevel: integer().notNull(),
  deadline: timestamp(),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().default(sql`CURRENT_TIMESTAMP`),
  isActive: boolean().notNull().default(true),
  image: varchar({ length: 1000 }),
  landingMarkdown: text(),
  creatorId: varchar({ length: 43 }).references(() => usersTable.id)
})
