CREATE TABLE "game_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"game_key" text NOT NULL,
	"score" integer NOT NULL,
	"correct_count" integer NOT NULL,
	"total_count" integer NOT NULL,
	"xp_awarded" integer DEFAULT 0 NOT NULL,
	"coins_awarded" integer DEFAULT 0 NOT NULL,
	"rewarded" boolean DEFAULT true NOT NULL,
	"played_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "game_sessions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "game_sessions" ADD CONSTRAINT "game_sessions_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "game_sessions_student_game_played_idx" ON "game_sessions" USING btree ("student_id","game_key","played_at");