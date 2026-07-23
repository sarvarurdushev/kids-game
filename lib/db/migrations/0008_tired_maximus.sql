CREATE TABLE "room_sets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"name" text NOT NULL,
	"coin_price" integer NOT NULL,
	"wallpaper_item_id" uuid NOT NULL,
	"floor_item_id" uuid NOT NULL,
	"furniture_item_id" uuid NOT NULL,
	"active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
ALTER TABLE "room_sets" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "room_sets" ADD CONSTRAINT "room_sets_wallpaper_item_id_avatar_items_id_fk" FOREIGN KEY ("wallpaper_item_id") REFERENCES "public"."avatar_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "room_sets" ADD CONSTRAINT "room_sets_floor_item_id_avatar_items_id_fk" FOREIGN KEY ("floor_item_id") REFERENCES "public"."avatar_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "room_sets" ADD CONSTRAINT "room_sets_furniture_item_id_avatar_items_id_fk" FOREIGN KEY ("furniture_item_id") REFERENCES "public"."avatar_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "room_sets_key_idx" ON "room_sets" USING btree ("key");