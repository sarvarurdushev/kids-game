ALTER TYPE "public"."avatar_slot" ADD VALUE 'species' BEFORE 'hair';--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "equipped_species_id" uuid;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_equipped_species_id_avatar_items_id_fk" FOREIGN KEY ("equipped_species_id") REFERENCES "public"."avatar_items"("id") ON DELETE no action ON UPDATE no action;