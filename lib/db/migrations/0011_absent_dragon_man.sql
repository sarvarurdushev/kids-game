CREATE TABLE "quest_claims" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"quest_key" text NOT NULL,
	"period_start" date NOT NULL,
	"coins_awarded" integer DEFAULT 0 NOT NULL,
	"gold_stars_awarded" integer DEFAULT 0 NOT NULL,
	"claimed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "quest_claims" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "quest_claims" ADD CONSTRAINT "quest_claims_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "quest_claims_student_quest_period_idx" ON "quest_claims" USING btree ("student_id","quest_key","period_start");