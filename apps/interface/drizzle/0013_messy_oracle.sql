CREATE TABLE "brightid_apps" (
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
);
--> statement-breakpoint
CREATE TABLE "upgrade_requests" (
	"projectId" integer,
	"createdAt" timestamp DEFAULT now(),
	"planId" integer
);
--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN "features" text[] DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN "popular" boolean;--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN "monthlyPrice" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN "yearlyPrice" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "upgrade_requests" ADD CONSTRAINT "upgrade_requests_projectId_projects_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "upgrade_requests" ADD CONSTRAINT "upgrade_requests_planId_plans_id_fk" FOREIGN KEY ("planId") REFERENCES "public"."plans"("id") ON DELETE cascade ON UPDATE no action;