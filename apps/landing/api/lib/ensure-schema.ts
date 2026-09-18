import { sql } from './db.js';

const statements = [
  `CREATE TABLE IF NOT EXISTS "users" (
    "id" varchar(43) PRIMARY KEY NOT NULL,
    "createdAt" timestamp DEFAULT now(),
    "integrations" varchar(255)[] DEFAULT '{}' NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS "socialRecords" (
    "hash" varchar(300) PRIMARY KEY NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS "plans" (
    "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    "name" varchar(255) NOT NULL,
    "isActive" boolean DEFAULT true,
    "tokens" integer DEFAULT 100,
    "pricePerExcess" numeric DEFAULT '1',
    "features" text[] DEFAULT '{}',
    "description" text,
    "isRecommended" boolean,
    "popular" boolean,
    "monthlyPrice" integer DEFAULT 0,
    "yearlyPrice" integer DEFAULT 0,
    "order" integer DEFAULT 0,
    "createdAt" timestamp DEFAULT now(),
    "updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS "brightid_apps" (
    "key" text PRIMARY KEY NOT NULL,
    "name" text NOT NULL,
    "sponsoring" boolean DEFAULT true NOT NULL,
    "testing" boolean DEFAULT false NOT NULL,
    "ids_as_hex" boolean DEFAULT false NOT NULL,
    "soulbound" boolean DEFAULT false NOT NULL,
    "soulbound_message" text,
    "using_blind_sig" boolean DEFAULT false NOT NULL,
    "verifications" text,
    "verification_expiration_length" integer,
    "node_url" text,
    "context" text,
    "description" text,
    "links" text,
    "images" text,
    "callback_url" text,
    "joined" timestamp DEFAULT now() NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS "projects" (
    "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    "name" varchar(255) NOT NULL,
    "description" varchar(255) NOT NULL,
    "requirementLevel" integer,
    "isActive" boolean DEFAULT true NOT NULL,
    "image" varchar(1000),
    "landingMarkdown" text,
    "creatorId" varchar(100) NOT NULL,
    "logoUrl" varchar(1000),
    "websiteUrl" varchar(1000),
    "remainingtokens" integer DEFAULT 0,
    "selectedPlanId" integer REFERENCES "plans"("id"),
    "brightIdAppId" varchar(500) REFERENCES "brightid_apps"("key"),
    "deadline" timestamp,
    "createdAt" timestamp DEFAULT now(),
    "updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS "upgrade_requests" (
    "projectId" integer REFERENCES "projects"("id") ON DELETE cascade,
    "createdAt" timestamp DEFAULT now(),
    "planId" integer REFERENCES "plans"("id") ON DELETE cascade
  )`,
  `CREATE TABLE IF NOT EXISTS "payments" (
    "id" serial PRIMARY KEY NOT NULL,
    "order_id" varchar(100) NOT NULL,
    "project_id" integer NOT NULL REFERENCES "projects"("id") ON DELETE cascade,
    "plan_id" integer NOT NULL,
    "user_id" varchar(43) NOT NULL,
    "is_yearly" boolean DEFAULT false,
    "amount" integer NOT NULL,
    "nowpayments_id" varchar(50),
    "status" varchar(30) DEFAULT 'pending',
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now(),
    CONSTRAINT "payments_order_id_unique" UNIQUE("order_id")
  )`,
  `CREATE TABLE IF NOT EXISTS "verifications" (
    "id" serial PRIMARY KEY NOT NULL,
    "userId" varchar(43) NOT NULL,
    "projectId" integer NOT NULL REFERENCES "projects"("id") ON DELETE cascade,
    "client" varchar(100) NOT NULL,
    "signature" varchar(500) NOT NULL,
    "auraScore" integer,
    "auraLevel" integer,
    "verifiedAt" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "verifications_signature_unique" UNIQUE("signature")
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "verifications_user_project_uidx"
    ON "verifications" ("userId", "projectId")`,
];

let pending: Promise<void> | null = null;

async function apply() {
  for (const statement of statements) {
    await sql.query(statement);
  }
}

export function ensureSchema() {
  if (!pending) {
    pending = apply().catch((error) => {
      pending = null;
      throw error;
    });
  }
  return pending;
}
