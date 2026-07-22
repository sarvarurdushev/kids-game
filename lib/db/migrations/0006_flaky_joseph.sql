CREATE TABLE "student_game_unlocks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"game_key" text NOT NULL,
	"unlocked_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "student_game_unlocks" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "student_game_unlocks" ADD CONSTRAINT "student_game_unlocks_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "student_game_unlocks_student_game_idx" ON "student_game_unlocks" USING btree ("student_id","game_key");