ALTER TYPE "public"."avatar_slot" ADD VALUE 'furniture_small';--> statement-breakpoint
ALTER TYPE "public"."avatar_slot" ADD VALUE 'furniture_wall';--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "equipped_furniture_small_id" uuid;--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "equipped_furniture_wall_id" uuid;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_equipped_furniture_small_id_avatar_items_id_fk" FOREIGN KEY ("equipped_furniture_small_id") REFERENCES "public"."avatar_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_equipped_furniture_wall_id_avatar_items_id_fk" FOREIGN KEY ("equipped_furniture_wall_id") REFERENCES "public"."avatar_items"("id") ON DELETE no action ON UPDATE no action;