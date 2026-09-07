CREATE TABLE "verifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" varchar(43) NOT NULL,
	"projectId" integer NOT NULL,
	"client" varchar(100) NOT NULL,
	"signature" varchar(500) NOT NULL,
	"auraScore" integer,
	"auraLevel" integer,
	"verifiedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "verifications_signature_unique" UNIQUE("signature")
);
--> statement-breakpoint
ALTER TABLE "verifications" ADD CONSTRAINT "verifications_projectId_projects_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;