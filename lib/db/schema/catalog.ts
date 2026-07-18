import {
  pgTable,
  pgEnum,
  uuid,
  text,
  integer,
  boolean,
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
]);

export const avatarAcquisitionMethodEnum = pgEnum("avatar_acquisition_method", [
  "starter",
  "level_unlock",
  "achievement_unlock",
  "coin_purchase",
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
}, (table) => [uniqueIndex("avatar_items_key_idx").on(table.key)]).enableRLS();

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
