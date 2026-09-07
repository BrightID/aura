ALTER TABLE "projects" DROP CONSTRAINT "projects_creatorId_users_id_fk";
--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "creatorId" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "creatorId" SET NOT NULL;