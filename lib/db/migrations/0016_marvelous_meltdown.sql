CREATE TABLE "room_placements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"avatar_item_id" uuid NOT NULL,
	"slot" "avatar_slot" NOT NULL,
	"position" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "room_placements" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "students" DROP CONSTRAINT "students_equipped_furniture_id_avatar_items_id_fk";
--> statement-breakpoint
ALTER TABLE "students" DROP CONSTRAINT "students_equipped_furniture_small_id_avatar_items_id_fk";
--> statement-breakpoint
ALTER TABLE "room_placements" ADD CONSTRAINT "room_placements_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "room_placements" ADD CONSTRAINT "room_placements_avatar_item_id_avatar_items_id_fk" FOREIGN KEY ("avatar_item_id") REFERENCES "public"."avatar_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "room_placements_student_slot_position_idx" ON "room_placements" USING btree ("student_id","slot","position");--> statement-breakpoint
CREATE UNIQUE INDEX "room_placements_student_item_idx" ON "room_placements" USING btree ("student_id","avatar_item_id");--> statement-breakpoint
-- Manual data migration (hand-added, not drizzle-kit generated): move each
-- existing single-equipped furniture/furniture_small value into
-- room_placements at position 0 before the columns holding them are
-- dropped, so no student loses what they had on display.
INSERT INTO "room_placements" ("id", "student_id", "avatar_item_id", "slot", "position")
SELECT gen_random_uuid(), "id", "equipped_furniture_id", 'furniture', 0
FROM "students"
WHERE "equipped_furniture_id" IS NOT NULL;
--> statement-breakpoint
INSERT INTO "room_placements" ("id", "student_id", "avatar_item_id", "slot", "position")
SELECT gen_random_uuid(), "id", "equipped_furniture_small_id", 'furniture_small', 0
FROM "students"
WHERE "equipped_furniture_small_id" IS NOT NULL;
--> statement-breakpoint
ALTER TABLE "students" DROP COLUMN "equipped_furniture_id";--> statement-breakpoint
ALTER TABLE "students" DROP COLUMN "equipped_furniture_small_id";