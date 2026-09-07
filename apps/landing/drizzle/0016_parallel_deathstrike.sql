CREATE TABLE "payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" varchar(100) NOT NULL,
	"project_id" integer NOT NULL,
	"plan_id" integer NOT NULL,
	"user_id" varchar(43) NOT NULL,
	"is_yearly" boolean DEFAULT false,
	"amount" integer NOT NULL,
	"nowpayments_id" varchar(50),
	"status" varchar(30) DEFAULT 'pending',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "payments_order_id_unique" UNIQUE("order_id")
);
--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;