ALTER TYPE "public"."avatar_slot" ADD VALUE 'wallpaper';--> statement-breakpoint
ALTER TYPE "public"."avatar_slot" ADD VALUE 'floor';--> statement-breakpoint
ALTER TYPE "public"."avatar_slot" ADD VALUE 'furniture';--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "equipped_wallpaper_id" uuid;--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "equipped_floor_id" uuid;--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "equipped_furniture_id" uuid;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_equipped_wallpaper_id_avatar_items_id_fk" FOREIGN KEY ("equipped_wallpaper_id") REFERENCES "public"."avatar_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_equipped_floor_id_avatar_items_id_fk" FOREIGN KEY ("equipped_floor_id") REFERENCES "public"."avatar_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_equipped_furniture_id_avatar_items_id_fk" FOREIGN KEY ("equipped_furniture_id") REFERENCES "public"."avatar_items"("id") ON DELETE no action ON UPDATE no action;