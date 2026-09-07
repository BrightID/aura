CREATE TABLE "plans" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "plans_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"isActive" boolean DEFAULT true,
	"tokens" integer DEFAULT 100,
	"pricePerExcess" integer DEFAULT 1,
	"description" text,
	"isRecommended" boolean,
	"order" integer DEFAULT 0,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "logoUrl" varchar(1000);--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "websiteUrl" varchar(1000);--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "remainingtokens" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "selectedPlanId" integer;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "brightIdAppId" varchar(500);--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_selectedPlanId_plans_id_fk" FOREIGN KEY ("selectedPlanId") REFERENCES "public"."plans"("id") ON DELETE no action ON UPDATE no action;