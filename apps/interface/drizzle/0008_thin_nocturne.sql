ALTER TABLE "projects" ALTER COLUMN "deadline" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "landingMarkdown" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "creatorId" varchar(43);--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_creatorId_users_id_fk" FOREIGN KEY ("creatorId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;