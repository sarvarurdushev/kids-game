import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  date,
  jsonb,
  boolean,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { students } from "./students";
import { characters, packTypes, avatarItems, avatarCaseTypes, achievements } from "./catalog";

export const studentCards = pgTable("student_cards", {
  id: uuid("id").primaryKey().defaultRandom(),
  studentId: uuid("student_id")
    .notNull()
    .references(() => students.id, { onDelete: "cascade" }),
  characterId: uuid("character_id")
    .notNull()
    .references(() => characters.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull().default(1),
  firstAcquiredAt: timestamp("first_acquired_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (table) => [
  uniqueIndex("student_cards_student_character_idx").on(
    table.studentId,
    table.characterId
  ),
]).enableRLS();

export const packGrants = pgTable("pack_grants", {
  id: uuid("id").primaryKey().defaultRandom(),
  studentId: uuid("student_id")
    .notNull()
    .references(() => students.id, { onDelete: "cascade" }),
  packTypeId: uuid("pack_type_id")
    .notNull()
    .references(() => packTypes.id),
  source: text("source").notNull(),
  grantedAt: timestamp("granted_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  openedAt: timestamp("opened_at", { withTimezone: true }),
  openedResult: jsonb("opened_result"),
}, (table) => [
  index("pack_grants_student_unopened_idx").on(
    table.studentId,
    table.openedAt
  ),
]).enableRLS();

export const studentAvatarItems = pgTable("student_avatar_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  studentId: uuid("student_id")
    .notNull()
    .references(() => students.id, { onDelete: "cascade" }),
  avatarItemId: uuid("avatar_item_id")
    .notNull()
    .references(() => avatarItems.id, { onDelete: "cascade" }),
  acquiredVia: text("acquired_via").notNull(),
  acquiredAt: timestamp("acquired_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (table) => [
  uniqueIndex("student_avatar_items_student_item_idx").on(
    table.studentId,
    table.avatarItemId
  ),
]).enableRLS();

export const avatarCaseGrants = pgTable("avatar_case_grants", {
  id: uuid("id").primaryKey().defaultRandom(),
  studentId: uuid("student_id")
    .notNull()
    .references(() => students.id, { onDelete: "cascade" }),
  caseTypeId: uuid("case_type_id")
    .notNull()
    .references(() => avatarCaseTypes.id),
  source: text("source").notNull(),
  grantedAt: timestamp("granted_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  openedAt: timestamp("opened_at", { withTimezone: true }),
  openedResult: jsonb("opened_result"),
}, (table) => [
  index("avatar_case_grants_student_unopened_idx").on(
    table.studentId,
    table.openedAt
  ),
]).enableRLS();

export const studentAchievements = pgTable("student_achievements", {
  id: uuid("id").primaryKey().defaultRandom(),
  studentId: uuid("student_id")
    .notNull()
    .references(() => students.id, { onDelete: "cascade" }),
  achievementId: uuid("achievement_id")
    .notNull()
    .references(() => achievements.id, { onDelete: "cascade" }),
  unlockedAt: timestamp("unlocked_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (table) => [
  uniqueIndex("student_achievements_student_achievement_idx").on(
    table.studentId,
    table.achievementId
  ),
]).enableRLS();

export const studentEventCounters = pgTable("student_event_counters", {
  id: uuid("id").primaryKey().defaultRandom(),
  studentId: uuid("student_id")
    .notNull()
    .references(() => students.id, { onDelete: "cascade" }),
  eventKey: text("event_key").notNull(),
  count: integer("count").notNull().default(0),
}, (table) => [
  uniqueIndex("student_event_counters_student_event_idx").on(
    table.studentId,
    table.eventKey
  ),
]).enableRLS();

export const dailyClaims = pgTable("daily_claims", {
  id: uuid("id").primaryKey().defaultRandom(),
  studentId: uuid("student_id")
    .notNull()
    .references(() => students.id, { onDelete: "cascade" }),
  claimDate: date("claim_date").notNull(),
  cycleDay: integer("cycle_day").notNull(),
  xpAwarded: integer("xp_awarded").notNull(),
  coinsAwarded: integer("coins_awarded").notNull(),
  packGrantId: uuid("pack_grant_id").references(() => packGrants.id),
  claimedAt: timestamp("claimed_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (table) => [
  uniqueIndex("daily_claims_student_date_idx").on(
    table.studentId,
    table.claimDate
  ),
]).enableRLS();

export const gameSessions = pgTable("game_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  studentId: uuid("student_id")
    .notNull()
    .references(() => students.id, { onDelete: "cascade" }),
  gameKey: text("game_key").notNull(),
  score: integer("score").notNull(),
  correctCount: integer("correct_count").notNull(),
  totalCount: integer("total_count").notNull(),
  xpAwarded: integer("xp_awarded").notNull().default(0),
  coinsAwarded: integer("coins_awarded").notNull().default(0),
  rewarded: boolean("rewarded").notNull().default(true),
  playedAt: timestamp("played_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (table) => [
  index("game_sessions_student_game_played_idx").on(
    table.studentId,
    table.gameKey,
    table.playedAt
  ),
]).enableRLS();
