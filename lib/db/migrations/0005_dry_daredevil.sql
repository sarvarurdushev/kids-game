ALTER TABLE "students" ADD COLUMN "pet_happiness" integer DEFAULT 70 NOT NULL;--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "pet_last_interaction_at" timestamp with time zone;