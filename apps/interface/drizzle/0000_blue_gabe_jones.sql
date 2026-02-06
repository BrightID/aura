CREATE TABLE "notifications" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "notifications_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"toUserId" varchar(32) NOT NULL,
	"message" varchar(255) NOT NULL,
	"fromUserId" varchar(32) NOT NULL,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(32),
	"email" varchar(255) NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"integrations" varchar(255)[] DEFAULT '{}',
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
