import { sql } from 'drizzle-orm';
import {
  boolean,
  decimal,
  integer,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core';

export const usersTable = pgTable('users', {
  id: varchar({ length: 43 }).notNull().primaryKey(),
  createdAt: timestamp().defaultNow(),
  integrations: varchar({ length: 255 }).notNull().array().default([]),
}).enableRLS();

export const auraPlayersSocialTable = pgTable('socialRecords', {
  hash: varchar({ length: 300 }).primaryKey(),
}).enableRLS();

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
  brightIdAppId: varchar({ length: 500 }).references(
    () => brightIdAppsTable.key,
  ),
  deadline: timestamp(),

  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().default(sql`CURRENT_TIMESTAMP`),
}).enableRLS();

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
  updatedAt: timestamp().default(sql`CURRENT_TIMESTAMP`),
}).enableRLS();

export const upgradeRequest = pgTable('upgrade_requests', {
  projectId: integer().references(() => projectsTable.id, {
    onDelete: 'cascade',
  }),
  createdAt: timestamp().defaultNow(),
  planId: integer().references(() => verificationPlansTable.id, {
    onDelete: 'cascade',
  }),
}).enableRLS();

export const paymentsTable = pgTable('payments', {
  id: serial('id').primaryKey(),
  orderId: varchar('order_id', { length: 100 }).notNull().unique(),
  projectId: integer('project_id')
    .notNull()
    .references(() => projectsTable.id, { onDelete: 'cascade' }),
  planId: integer('plan_id').notNull(),
  userId: varchar('user_id', { length: 43 }).notNull(),
  isYearly: boolean('is_yearly').default(false),
  amount: integer('amount').notNull(),
  nowpaymentsId: varchar('nowpayments_id', { length: 50 }),
  status: varchar('status', { length: 30 }).default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}).enableRLS();

export const verificationsTable = pgTable(
  'verifications',
  {
    id: serial().primaryKey(),
    userId: varchar({ length: 43 }).notNull(),
    projectId: integer()
      .notNull()
      .references(() => projectsTable.id, { onDelete: 'cascade' }),
    client: varchar({ length: 100 }).notNull(),
    signature: varchar({ length: 500 }).notNull().unique(),
    auraScore: integer(),
    auraLevel: integer(),
    verifiedAt: timestamp().notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('verifications_user_project_uidx').on(
      table.userId,
      table.projectId,
    ),
  ],
).enableRLS();

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
  joined: timestamp('joined').notNull().defaultNow(),
}).enableRLS();

// Vouch practice rooms (apps/vouch). Practice data only: invented people and
// answers, never sent to the BrightID network.

/** One shared practice world per room, written by compare-and-set on `version`. */
export const vouchRoomsTable = pgTable('vouch_rooms', {
  room: varchar({ length: 40 }).primaryKey(),
  version: integer().notNull().default(0),
  // Goes up only on reset, so a tab from before the reset can't write the old world back.
  generation: integer().notNull().default(1),
  // Stored as text, not jsonb: jsonb reorders keys, and clients compare worlds as JSON.
  world: text(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}).enableRLS();

/** Who is in a room: one row per browser, refreshed by heartbeats. */
export const vouchPresenceTable = pgTable(
  'vouch_presence',
  {
    room: varchar({ length: 40 }).notNull(),
    browserId: varchar('browser_id', { length: 64 }).notNull(),
    persona: varchar({ length: 80 }).notNull(),
    seenAt: timestamp('seen_at').notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.room, table.browserId] })],
).enableRLS();

/** The first browser to claim an invite token wins it. */
export const vouchClaimsTable = pgTable(
  'vouch_claims',
  {
    room: varchar({ length: 40 }).notNull(),
    token: varchar({ length: 32 }).notNull(),
    claimedBy: varchar('claimed_by', { length: 80 }).notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.room, table.token] })],
).enableRLS();
