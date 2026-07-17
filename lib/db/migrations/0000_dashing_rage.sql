CREATE TYPE "public"."avatar_acquisition_method" AS ENUM('starter', 'level_unlock', 'achievement_unlock', 'coin_purchase');--> statement-breakpoint
CREATE TYPE "public"."avatar_slot" AS ENUM('hair', 'eyes', 'clothes', 'hat', 'accessory', 'background');--> statement-breakpoint
CREATE TYPE "public"."rarity" AS ENUM('common', 'rare', 'epic', 'legendary');--> statement-breakpoint
CREATE TYPE "public"."reward_rule_trigger" AS ENUM('boolean_field', 'score_threshold');--> statement-breakpoint
CREATE TYPE "public"."webhook_event_status" AS ENUM('pending', 'processed', 'failed');--> statement-breakpoint
CREATE TABLE "pin_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid,
	"ip" text,
	"success" boolean NOT NULL,
	"attempted_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "pin_attempts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "student_external_refs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"source_system" text NOT NULL,
	"external_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "student_external_refs" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "students" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"display_name" text NOT NULL,
	"enrollment_code" text NOT NULL,
	"pin_hash" text NOT NULL,
	"pin_length" integer DEFAULT 4 NOT NULL,
	"pin_locked_until" timestamp with time zone,
	"token_version" integer DEFAULT 1 NOT NULL,
	"xp_total" integer DEFAULT 0 NOT NULL,
	"coins_balance" integer DEFAULT 0 NOT NULL,
	"current_streak" integer DEFAULT 0 NOT NULL,
	"longest_streak" integer DEFAULT 0 NOT NULL,
	"last_claim_date" date,
	"equipped_hair_id" uuid,
	"equipped_eyes_id" uuid,
	"equipped_clothes_id" uuid,
	"equipped_hat_id" uuid,
	"equipped_accessory_id" uuid,
	"equipped_background_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "students" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "achievements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"badge_image_url" text,
	"event_key" text NOT NULL,
	"threshold" integer NOT NULL,
	"reward_coins" integer DEFAULT 0 NOT NULL,
	"reward_pack_type_id" uuid,
	"reward_avatar_item_id" uuid
);
--> statement-breakpoint
ALTER TABLE "achievements" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "avatar_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slot" "avatar_slot" NOT NULL,
	"key" text NOT NULL,
	"name" text NOT NULL,
	"image_url" text,
	"rarity" "rarity" DEFAULT 'common' NOT NULL,
	"acquisition_method" "avatar_acquisition_method" NOT NULL,
	"unlock_level" integer,
	"coin_price" integer,
	"active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
ALTER TABLE "avatar_items" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "characters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"universe_id" uuid NOT NULL,
	"key" text NOT NULL,
	"name" text NOT NULL,
	"rarity" "rarity" NOT NULL,
	"image_url" text,
	"flavor_text" text,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "characters" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "daily_reward_curve" (
	"cycle_day" integer PRIMARY KEY NOT NULL,
	"xp_reward" integer NOT NULL,
	"coin_reward" integer NOT NULL,
	"pack_type_id" uuid
);
--> statement-breakpoint
ALTER TABLE "daily_reward_curve" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "level_curve" (
	"level" integer PRIMARY KEY NOT NULL,
	"min_xp" integer NOT NULL,
	"bonus_coins" integer DEFAULT 0 NOT NULL,
	"bonus_pack_type_id" uuid
);
--> statement-breakpoint
ALTER TABLE "level_curve" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "pack_type_pool" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pack_type_id" uuid NOT NULL,
	"universe_id" uuid NOT NULL,
	"weight" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "pack_type_pool" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "pack_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"name" text NOT NULL,
	"coin_cost" integer NOT NULL,
	"cards_per_pack" integer DEFAULT 3 NOT NULL,
	"icon_url" text,
	"active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
ALTER TABLE "pack_types" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "reward_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rule_key" text NOT NULL,
	"trigger_type" "reward_rule_trigger" NOT NULL,
	"source_field" text NOT NULL,
	"program_filter" text,
	"threshold" integer,
	"xp_amount" integer NOT NULL,
	"coin_amount" integer NOT NULL,
	"active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
ALTER TABLE "reward_rules" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "universes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"name" text NOT NULL,
	"color" text NOT NULL,
	"icon_url" text,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "universes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "daily_claims" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"claim_date" date NOT NULL,
	"cycle_day" integer NOT NULL,
	"xp_awarded" integer NOT NULL,
	"coins_awarded" integer NOT NULL,
	"pack_grant_id" uuid,
	"claimed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "daily_claims" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "pack_grants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"pack_type_id" uuid NOT NULL,
	"source" text NOT NULL,
	"granted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"opened_at" timestamp with time zone,
	"opened_result" jsonb
);
--> statement-breakpoint
ALTER TABLE "pack_grants" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "student_achievements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"achievement_id" uuid NOT NULL,
	"unlocked_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "student_achievements" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "student_avatar_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"avatar_item_id" uuid NOT NULL,
	"acquired_via" text NOT NULL,
	"acquired_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "student_avatar_items" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "student_cards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"character_id" uuid NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"first_acquired_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "student_cards" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "student_event_counters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"event_key" text NOT NULL,
	"count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "student_event_counters" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "webhook_clients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_system" text NOT NULL,
	"secret_hash" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "webhook_clients" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "webhook_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_system" text NOT NULL,
	"external_event_id" text,
	"student_external_id" text NOT NULL,
	"student_id" uuid,
	"program" text,
	"raw_payload" jsonb NOT NULL,
	"status" "webhook_event_status" DEFAULT 'pending' NOT NULL,
	"result" jsonb,
	"error_message" text,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL,
	"processed_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "webhook_events" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "pin_attempts" ADD CONSTRAINT "pin_attempts_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_external_refs" ADD CONSTRAINT "student_external_refs_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_equipped_hair_id_avatar_items_id_fk" FOREIGN KEY ("equipped_hair_id") REFERENCES "public"."avatar_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_equipped_eyes_id_avatar_items_id_fk" FOREIGN KEY ("equipped_eyes_id") REFERENCES "public"."avatar_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_equipped_clothes_id_avatar_items_id_fk" FOREIGN KEY ("equipped_clothes_id") REFERENCES "public"."avatar_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_equipped_hat_id_avatar_items_id_fk" FOREIGN KEY ("equipped_hat_id") REFERENCES "public"."avatar_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_equipped_accessory_id_avatar_items_id_fk" FOREIGN KEY ("equipped_accessory_id") REFERENCES "public"."avatar_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_equipped_background_id_avatar_items_id_fk" FOREIGN KEY ("equipped_background_id") REFERENCES "public"."avatar_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "achievements" ADD CONSTRAINT "achievements_reward_pack_type_id_pack_types_id_fk" FOREIGN KEY ("reward_pack_type_id") REFERENCES "public"."pack_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "achievements" ADD CONSTRAINT "achievements_reward_avatar_item_id_avatar_items_id_fk" FOREIGN KEY ("reward_avatar_item_id") REFERENCES "public"."avatar_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "characters" ADD CONSTRAINT "characters_universe_id_universes_id_fk" FOREIGN KEY ("universe_id") REFERENCES "public"."universes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_reward_curve" ADD CONSTRAINT "daily_reward_curve_pack_type_id_pack_types_id_fk" FOREIGN KEY ("pack_type_id") REFERENCES "public"."pack_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "level_curve" ADD CONSTRAINT "level_curve_bonus_pack_type_id_pack_types_id_fk" FOREIGN KEY ("bonus_pack_type_id") REFERENCES "public"."pack_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pack_type_pool" ADD CONSTRAINT "pack_type_pool_pack_type_id_pack_types_id_fk" FOREIGN KEY ("pack_type_id") REFERENCES "public"."pack_types"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pack_type_pool" ADD CONSTRAINT "pack_type_pool_universe_id_universes_id_fk" FOREIGN KEY ("universe_id") REFERENCES "public"."universes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_claims" ADD CONSTRAINT "daily_claims_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_claims" ADD CONSTRAINT "daily_claims_pack_grant_id_pack_grants_id_fk" FOREIGN KEY ("pack_grant_id") REFERENCES "public"."pack_grants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pack_grants" ADD CONSTRAINT "pack_grants_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pack_grants" ADD CONSTRAINT "pack_grants_pack_type_id_pack_types_id_fk" FOREIGN KEY ("pack_type_id") REFERENCES "public"."pack_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_achievements" ADD CONSTRAINT "student_achievements_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_achievements" ADD CONSTRAINT "student_achievements_achievement_id_achievements_id_fk" FOREIGN KEY ("achievement_id") REFERENCES "public"."achievements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_avatar_items" ADD CONSTRAINT "student_avatar_items_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_avatar_items" ADD CONSTRAINT "student_avatar_items_avatar_item_id_avatar_items_id_fk" FOREIGN KEY ("avatar_item_id") REFERENCES "public"."avatar_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_cards" ADD CONSTRAINT "student_cards_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_cards" ADD CONSTRAINT "student_cards_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_event_counters" ADD CONSTRAINT "student_event_counters_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "webhook_events" ADD CONSTRAINT "webhook_events_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "pin_attempts_student_idx" ON "pin_attempts" USING btree ("student_id","attempted_at");--> statement-breakpoint
CREATE INDEX "pin_attempts_ip_idx" ON "pin_attempts" USING btree ("ip","attempted_at");--> statement-breakpoint
CREATE UNIQUE INDEX "student_external_refs_source_external_idx" ON "student_external_refs" USING btree ("source_system","external_id");--> statement-breakpoint
CREATE INDEX "student_external_refs_student_idx" ON "student_external_refs" USING btree ("student_id");--> statement-breakpoint
CREATE UNIQUE INDEX "students_enrollment_code_idx" ON "students" USING btree ("enrollment_code");--> statement-breakpoint
CREATE UNIQUE INDEX "achievements_key_idx" ON "achievements" USING btree ("key");--> statement-breakpoint
CREATE UNIQUE INDEX "avatar_items_key_idx" ON "avatar_items" USING btree ("key");--> statement-breakpoint
CREATE UNIQUE INDEX "characters_key_idx" ON "characters" USING btree ("key");--> statement-breakpoint
CREATE UNIQUE INDEX "pack_type_pool_pack_universe_idx" ON "pack_type_pool" USING btree ("pack_type_id","universe_id");--> statement-breakpoint
CREATE UNIQUE INDEX "pack_types_key_idx" ON "pack_types" USING btree ("key");--> statement-breakpoint
CREATE UNIQUE INDEX "reward_rules_rule_key_idx" ON "reward_rules" USING btree ("rule_key");--> statement-breakpoint
CREATE UNIQUE INDEX "universes_key_idx" ON "universes" USING btree ("key");--> statement-breakpoint
CREATE UNIQUE INDEX "daily_claims_student_date_idx" ON "daily_claims" USING btree ("student_id","claim_date");--> statement-breakpoint
CREATE INDEX "pack_grants_student_unopened_idx" ON "pack_grants" USING btree ("student_id","opened_at");--> statement-breakpoint
CREATE UNIQUE INDEX "student_achievements_student_achievement_idx" ON "student_achievements" USING btree ("student_id","achievement_id");--> statement-breakpoint
CREATE UNIQUE INDEX "student_avatar_items_student_item_idx" ON "student_avatar_items" USING btree ("student_id","avatar_item_id");--> statement-breakpoint
CREATE UNIQUE INDEX "student_cards_student_character_idx" ON "student_cards" USING btree ("student_id","character_id");--> statement-breakpoint
CREATE UNIQUE INDEX "student_event_counters_student_event_idx" ON "student_event_counters" USING btree ("student_id","event_key");--> statement-breakpoint
CREATE UNIQUE INDEX "webhook_clients_source_system_idx" ON "webhook_clients" USING btree ("source_system");--> statement-breakpoint
CREATE UNIQUE INDEX "webhook_events_source_external_idx" ON "webhook_events" USING btree ("source_system","external_event_id") WHERE "webhook_events"."external_event_id" is not null;--> statement-breakpoint
CREATE INDEX "webhook_events_student_idx" ON "webhook_events" USING btree ("student_id");