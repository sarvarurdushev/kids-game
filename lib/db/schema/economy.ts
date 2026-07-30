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
import { characters, packTypes, avatarItems, avatarCaseTypes, achievements, avatarSlotEnum } from "./catalog";

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

// Multiple simultaneous furniture placements per student, replacing the old
// single equippedFurnitureId/equippedFurnitureSmallId columns (dropped
// below) — a student can now display several pieces per category instead
// of swapping one for another. position is 0..2 (3 display spots per
// category, matching RoomScene3D's fixed layout positions for each).
export const roomPlacements = pgTable("room_placements", {
  id: uuid("id").primaryKey().defaultRandom(),
  studentId: uuid("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
  avatarItemId: uuid("avatar_item_id").notNull().references(() => avatarItems.id, { onDelete: "cascade" }),
  slot: avatarSlotEnum("slot").notNull(), // only "furniture" or "furniture_small" ever used
  position: integer("position").notNull(),
}, (table) => [
  uniqueIndex("room_placements_student_slot_position_idx").on(table.studentId, table.slot, table.position),
  uniqueIndex("room_placements_student_item_idx").on(table.studentId, table.avatarItemId),
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

// Games are a static, code-defined catalog (lib/games/catalog.ts), not a
// DB-driven one like avatarItems — a new game ships with code anyway, so
// there's no separate admin-editable catalog table for it. This just tracks
// which locked (coinCost > 0) games a given student has bought their way
// into; free games need no row here at all.
export const studentGameUnlocks = pgTable("student_game_unlocks", {
  id: uuid("id").primaryKey().defaultRandom(),
  studentId: uuid("student_id")
    .notNull()
    .references(() => students.id, { onDelete: "cascade" }),
  gameKey: text("game_key").notNull(),
  unlockedAt: timestamp("unlocked_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (table) => [
  uniqueIndex("student_game_unlocks_student_game_idx").on(
    table.studentId,
    table.gameKey
  ),
]).enableRLS();

// Only *claims* are stored. Quest progress itself is derived at read time by
// querying game_sessions/pack_grants for the period (lib/reward-engine/
// quests.ts) rather than kept in incrementing counters — there's nothing to
// hook into every game/pack/pet code path, nothing to backfill when a new
// quest type is added, and progress can never drift out of sync with the
// sessions it's supposed to describe.
export const questClaims = pgTable("quest_claims", {
  id: uuid("id").primaryKey().defaultRandom(),
  studentId: uuid("student_id")
    .notNull()
    .references(() => students.id, { onDelete: "cascade" }),
  questKey: text("quest_key").notNull(),
  // Day (daily quests) or Monday of the ISO week (weekly quests) the claim
  // belongs to — this is what makes a quest re-claimable next period.
  periodStart: date("period_start").notNull(),
  coinsAwarded: integer("coins_awarded").notNull().default(0),
  goldStarsAwarded: integer("gold_stars_awarded").notNull().default(0),
  claimedAt: timestamp("claimed_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex("quest_claims_student_quest_period_idx").on(
    table.studentId,
    table.questKey,
    table.periodStart
  ),
]).enableRLS();

// Per-student spaced-repetition state for one WORD_BANK word (lib/games/
// wordBank.ts — a static code catalog, not a DB table, so `word` is the
// natural key here, not a foreign key). Leitner 5-box system: box 1-5,
// dueAt is when it next becomes reviewable. A word with no row here yet has
// never been reviewed — treat it as box 1, immediately due (see
// lib/student/wordBook.ts).
export const wordProgress = pgTable("word_progress", {
  id: uuid("id").primaryKey().defaultRandom(),
  studentId: uuid("student_id")
    .notNull()
    .references(() => students.id, { onDelete: "cascade" }),
  word: text("word").notNull(),
  box: integer("box").notNull().default(1),
  dueAt: timestamp("due_at", { withTimezone: true }).notNull().defaultNow(),
  lastReviewedAt: timestamp("last_reviewed_at", { withTimezone: true }),
  reviewCount: integer("review_count").notNull().default(0),
}, (table) => [
  uniqueIndex("word_progress_student_word_idx").on(table.studentId, table.word),
]).enableRLS();

// Append-only review log, mirroring gameSessions — quests aggregate over
// this (count(*) where reviewed_at >= since) rather than trusting
// word_progress.lastReviewedAt alone, which gets overwritten on every
// review and would undercount a word reviewed more than once in the same
// quest period (e.g. a box-1 word that's still-learning twice in one week).
export const wordReviews = pgTable("word_reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  studentId: uuid("student_id")
    .notNull()
    .references(() => students.id, { onDelete: "cascade" }),
  word: text("word").notNull(),
  knewIt: boolean("knew_it").notNull(),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("word_reviews_student_reviewed_idx").on(table.studentId, table.reviewedAt),
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
