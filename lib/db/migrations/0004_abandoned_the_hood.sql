ALTER TYPE "public"."avatar_acquisition_method" ADD VALUE 'case_unlock';--> statement-breakpoint
CREATE TABLE "avatar_case_rarity_odds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"case_type_id" uuid NOT NULL,
	"rarity" "rarity" NOT NULL,
	"weight" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "avatar_case_rarity_odds" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "avatar_case_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"name" text NOT NULL,
	"slot" "avatar_slot" DEFAULT 'species' NOT NULL,
	"coin_cost" integer NOT NULL,
	"icon_url" text,
	"active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
ALTER TABLE "avatar_case_types" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "avatar_case_grants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"case_type_id" uuid NOT NULL,
	"source" text NOT NULL,
	"granted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"opened_at" timestamp with time zone,
	"opened_result" jsonb
);
--> statement-breakpoint
ALTER TABLE "avatar_case_grants" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "avatar_items" ADD COLUMN "bundled_item_keys" jsonb;--> statement-breakpoint
ALTER TABLE "avatar_case_rarity_odds" ADD CONSTRAINT "avatar_case_rarity_odds_case_type_id_avatar_case_types_id_fk" FOREIGN KEY ("case_type_id") REFERENCES "public"."avatar_case_types"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "avatar_case_grants" ADD CONSTRAINT "avatar_case_grants_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "avatar_case_grants" ADD CONSTRAINT "avatar_case_grants_case_type_id_avatar_case_types_id_fk" FOREIGN KEY ("case_type_id") REFERENCES "public"."avatar_case_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "avatar_case_rarity_odds_case_rarity_idx" ON "avatar_case_rarity_odds" USING btree ("case_type_id","rarity");--> statement-breakpoint
CREATE UNIQUE INDEX "avatar_case_types_key_idx" ON "avatar_case_types" USING btree ("key");--> statement-breakpoint
CREATE INDEX "avatar_case_grants_student_unopened_idx" ON "avatar_case_grants" USING btree ("student_id","opened_at");