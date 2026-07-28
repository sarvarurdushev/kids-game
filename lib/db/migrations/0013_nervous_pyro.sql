ALTER TABLE "room_sets" ALTER COLUMN "furniture_item_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "room_sets" ADD COLUMN "furniture_small_item_id" uuid;--> statement-breakpoint
ALTER TABLE "room_sets" ADD COLUMN "furniture_wall_item_id" uuid;--> statement-breakpoint
ALTER TABLE "room_sets" ADD CONSTRAINT "room_sets_furniture_small_item_id_avatar_items_id_fk" FOREIGN KEY ("furniture_small_item_id") REFERENCES "public"."avatar_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "room_sets" ADD CONSTRAINT "room_sets_furniture_wall_item_id_avatar_items_id_fk" FOREIGN KEY ("furniture_wall_item_id") REFERENCES "public"."avatar_items"("id") ON DELETE no action ON UPDATE no action;