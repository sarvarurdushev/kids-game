CREATE TABLE "word_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"word" text NOT NULL,
	"box" integer DEFAULT 1 NOT NULL,
	"due_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_reviewed_at" timestamp with time zone,
	"review_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "word_progress" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "word_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"word" text NOT NULL,
	"knew_it" boolean NOT NULL,
	"reviewed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "word_reviews" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "word_progress" ADD CONSTRAINT "word_progress_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "word_reviews" ADD CONSTRAINT "word_reviews_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "word_progress_student_word_idx" ON "word_progress" USING btree ("student_id","word");--> statement-breakpoint
CREATE INDEX "word_reviews_student_reviewed_idx" ON "word_reviews" USING btree ("student_id","reviewed_at");