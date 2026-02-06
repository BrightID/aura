import { sql } from 'drizzle-orm'
import {
  boolean,
  decimal,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  varchar
} from 'drizzle-orm/pg-core'

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
  requirementLevel: integer(),
  isActive: boolean().notNull().default(true),
  image: varchar({ length: 1000 }),
  landingMarkdown: text(),
  creatorId: varchar({ length: 100 }).notNull(),
  logoUrl: varchar({ length: 1000 }),
  websiteUrl: varchar({ length: 1000 }),
  remainingtokens: integer().default(0),
  selectedPlanId: integer().references(() => verificationPlansTable.id),
  brightIdAppId: varchar({ length: 500 }).references(() => brightIdAppsTable.key),
  deadline: timestamp(),

  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().default(sql`CURRENT_TIMESTAMP`)
})

export const verificationPlansTable = pgTable('plans', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  isActive: boolean().default(true),
  tokens: integer().default(100),
  pricePerExcess: decimal().default('1'),
  features: text().array().default([]),
  description: text(),
  isRecommended: boolean(),
  popular: boolean(),
  monthlyPrice: integer().default(0),
  yearlyPrice: integer().default(0),
  order: integer().default(0),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().default(sql`CURRENT_TIMESTAMP`)
})

export const upgradeRequest = pgTable('upgrade_requests', {
  projectId: integer().references(() => projectsTable.id, { onDelete: 'cascade' }),
  createdAt: timestamp().defaultNow(),
  planId: integer().references(() => verificationPlansTable.id, { onDelete: 'cascade' })
})

export const verificationsTable = pgTable('verifications', {
  id: serial().primaryKey(),
  userId: varchar({ length: 43 }).notNull(),
  projectId: integer()
    .notNull()
    .references(() => projectsTable.id, { onDelete: 'cascade' }),
  client: varchar({ length: 100 }).notNull(),
  signature: varchar({ length: 500 }).notNull().unique(),
  auraScore: integer(),
  auraLevel: integer(),
  verifiedAt: timestamp().notNull().defaultNow()
})

export const brightIdAppsTable = pgTable('brightid_apps', {
  key: text('key').primaryKey(), // Unique key
  name: text('name').notNull(), // Friendly name
  sponsoring: boolean('sponsoring').notNull().default(true),
  testing: boolean('testing').notNull().default(false),
  idsAsHex: boolean('ids_as_hex').notNull().default(false),
  soulbound: boolean('soulbound').notNull().default(false),
  soulboundMessage: text('soulbound_message'),
  usingBlindSig: boolean('using_blind_sig').notNull().default(false),
  verifications: text('verifications'), // \n-separated logic
  verificationExpirationLength: integer('verification_expiration_length'), // ms
  nodeUrl: text('node_url'),
  context: text('context'), // Required if soulbound
  description: text('description'),
  links: text('links'), // JSON string recommended
  images: text('images'), // JSON string recommended
  callbackUrl: text('callback_url'),
  joined: timestamp('joined').notNull().defaultNow()
})
