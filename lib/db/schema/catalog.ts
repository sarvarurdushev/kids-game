import {
  pgTable,
  pgEnum,
  uuid,
  text,
  integer,
  boolean,
  jsonb,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const rarityEnum = pgEnum("rarity", [
  "common",
  "rare",
  "epic",
  "legendary",
]);

export const avatarSlotEnum = pgEnum("avatar_slot", [
  "species",
  "hair",
  "eyes",
  "clothes",
  "hat",
  "accessory",
  "background",
  "wallpaper",
  "floor",
  "furniture",
  "furniture_small",
  "furniture_wall",
]);

export const avatarAcquisitionMethodEnum = pgEnum("avatar_acquisition_method", [
  "starter",
  "level_unlock",
  "achievement_unlock",
  "coin_purchase",
  "case_unlock",
]);

export const universes = pgTable("universes", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: text("key").notNull(),
  name: text("name").notNull(),
  color: text("color").notNull(),
  iconUrl: text("icon_url"),
  sortOrder: integer("sort_order").notNull().default(0),
}, (table) => [uniqueIndex("universes_key_idx").on(table.key)]).enableRLS();

export const characters = pgTable("characters", {
  id: uuid("id").primaryKey().defaultRandom(),
  universeId: uuid("universe_id")
    .notNull()
    .references(() => universes.id, { onDelete: "cascade" }),
  key: text("key").notNull(),
  name: text("name").notNull(),
  rarity: rarityEnum("rarity").notNull(),
  imageUrl: text("image_url"),
  flavorText: text("flavor_text"),
  sortOrder: integer("sort_order").notNull().default(0),
}, (table) => [uniqueIndex("characters_key_idx").on(table.key)]).enableRLS();

export const packTypes = pgTable("pack_types", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: text("key").notNull(),
  name: text("name").notNull(),
  coinCost: integer("coin_cost").notNull(),
  cardsPerPack: integer("cards_per_pack").notNull().default(3),
  iconUrl: text("icon_url"),
  active: boolean("active").notNull().default(true),
}, (table) => [uniqueIndex("pack_types_key_idx").on(table.key)]).enableRLS();

export const packTypePool = pgTable("pack_type_pool", {
  id: uuid("id").primaryKey().defaultRandom(),
  packTypeId: uuid("pack_type_id")
    .notNull()
    .references(() => packTypes.id, { onDelete: "cascade" }),
  universeId: uuid("universe_id")
    .notNull()
    .references(() => universes.id, { onDelete: "cascade" }),
  weight: integer("weight").notNull().default(1),
}, (table) => [
  uniqueIndex("pack_type_pool_pack_universe_idx").on(
    table.packTypeId,
    table.universeId
  ),
]).enableRLS();

export const achievements = pgTable("achievements", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: text("key").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  badgeImageUrl: text("badge_image_url"),
  eventKey: text("event_key").notNull(),
  threshold: integer("threshold").notNull(),
  rewardCoins: integer("reward_coins").notNull().default(0),
  rewardPackTypeId: uuid("reward_pack_type_id").references(
    () => packTypes.id
  ),
  rewardAvatarItemId: uuid("reward_avatar_item_id").references(
    () => avatarItems.id
  ),
}, (table) => [uniqueIndex("achievements_key_idx").on(table.key)]).enableRLS();

export const avatarItems = pgTable("avatar_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  slot: avatarSlotEnum("slot").notNull(),
  key: text("key").notNull(),
  name: text("name").notNull(),
  imageUrl: text("image_url"),
  rarity: rarityEnum("rarity").notNull().default("common"),
  acquisitionMethod: avatarAcquisitionMethodEnum(
    "acquisition_method"
  ).notNull(),
  unlockLevel: integer("unlock_level"),
  coinPrice: integer("coin_price"),
  active: boolean("active").notNull().default(true),
  // Other avatar_items.key values to grant + auto-equip alongside this one —
  // a "character" that comes with its own outfit (e.g. species_fox bundling
  // hat_wizard) rather than a bare, uncostumed unlock. Only meaningful on
  // slot="species" rows today.
  bundledItemKeys: jsonb("bundled_item_keys").$type<string[]>(),
}, (table) => [uniqueIndex("avatar_items_key_idx").on(table.key)]).enableRLS();

// A curated wallpaper+floor+furniture combo sold as a single coin purchase
// (lib/student/roomSets.ts) — "sell the whole room at once instead of one
// piece at a time" — priced below the sum of buying the three pieces
// separately. Only bundles coin_purchase-tier avatarItems (never a
// level_unlock piece), so buying a set can't be used to skip a level gate.
export const roomSets = pgTable("room_sets", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: text("key").notNull(),
  name: text("name").notNull(),
  coinPrice: integer("coin_price").notNull(),
  wallpaperItemId: uuid("wallpaper_item_id")
    .notNull()
    .references(() => avatarItems.id),
  floorItemId: uuid("floor_item_id")
    .notNull()
    .references(() => avatarItems.id),
  // All three furniture pieces are optional — a set only requires a
  // coordinated wallpaper + floor, and can then include whichever of
  // large/small/wall furniture actually fits its theme (an affordable
  // starter set might skip the pricier large piece entirely).
  furnitureItemId: uuid("furniture_item_id").references(() => avatarItems.id),
  furnitureSmallItemId: uuid("furniture_small_item_id").references(() => avatarItems.id),
  furnitureWallItemId: uuid("furniture_wall_item_id").references(() => avatarItems.id),
  active: boolean("active").notNull().default(true),
}, (table) => [uniqueIndex("room_sets_key_idx").on(table.key)]).enableRLS();

export const avatarCaseTypes = pgTable("avatar_case_types", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: text("key").notNull(),
  name: text("name").notNull(),
  slot: avatarSlotEnum("slot").notNull().default("species"),
  coinCost: integer("coin_cost").notNull(),
  iconUrl: text("icon_url"),
  active: boolean("active").notNull().default(true),
}, (table) => [uniqueIndex("avatar_case_types_key_idx").on(table.key)]).enableRLS();

export const avatarCaseRarityOdds = pgTable("avatar_case_rarity_odds", {
  id: uuid("id").primaryKey().defaultRandom(),
  caseTypeId: uuid("case_type_id")
    .notNull()
    .references(() => avatarCaseTypes.id, { onDelete: "cascade" }),
  rarity: rarityEnum("rarity").notNull(),
  weight: integer("weight").notNull().default(1),
}, (table) => [
  uniqueIndex("avatar_case_rarity_odds_case_rarity_idx").on(
    table.caseTypeId,
    table.rarity
  ),
]).enableRLS();

export const rewardRuleTriggerEnum = pgEnum("reward_rule_trigger", [
  "boolean_field",
  "score_threshold",
]);

export const rewardRules = pgTable("reward_rules", {
  id: uuid("id").primaryKey().defaultRandom(),
  ruleKey: text("rule_key").notNull(),
  triggerType: rewardRuleTriggerEnum("trigger_type").notNull(),
  sourceField: text("source_field").notNull(),
  programFilter: text("program_filter"),
  threshold: integer("threshold"),
  xpAmount: integer("xp_amount").notNull(),
  coinAmount: integer("coin_amount").notNull(),
  active: boolean("active").notNull().default(true),
}, (table) => [uniqueIndex("reward_rules_rule_key_idx").on(table.ruleKey)]).enableRLS();

export const levelCurve = pgTable("level_curve", {
  level: integer("level").primaryKey(),
  minXp: integer("min_xp").notNull(),
  bonusCoins: integer("bonus_coins").notNull().default(0),
  bonusPackTypeId: uuid("bonus_pack_type_id").references(() => packTypes.id),
}).enableRLS();

export const dailyRewardCurve = pgTable("daily_reward_curve", {
  cycleDay: integer("cycle_day").primaryKey(),
  xpReward: integer("xp_reward").notNull(),
  coinReward: integer("coin_reward").notNull(),
  packTypeId: uuid("pack_type_id").references(() => packTypes.id),
}).enableRLS();
