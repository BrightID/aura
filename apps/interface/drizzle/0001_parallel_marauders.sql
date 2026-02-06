ALTER TABLE "notifications" ALTER COLUMN "toUserId" SET DATA TYPE varchar(43);--> statement-breakpoint
ALTER TABLE "notifications" ALTER COLUMN "fromUserId" SET DATA TYPE varchar(43);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DATA TYPE varchar(43);