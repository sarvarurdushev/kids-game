import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  boolean,
  date,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { avatarItems } from "./catalog";

export const students = pgTable("students", {
  id: uuid("id").primaryKey().defaultRandom(),
  displayName: text("display_name").notNull(),
  enrollmentCode: text("enrollment_code").notNull(),

  pinHash: text("pin_hash").notNull(),
  pinLength: integer("pin_length").notNull().default(4),
  pinLockedUntil: timestamp("pin_locked_until", { withTimezone: true }),

  tokenVersion: integer("token_version").notNull().default(1),

  xpTotal: integer("xp_total").notNull().default(0),
  coinsBalance: integer("coins_balance").notNull().default(0),

  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  lastClaimDate: date("last_claim_date"),

  // Talking-Tom-style pet care: happiness decays over time since the last
  // poke/feed (computed lazily in lib/student/pet.ts, not by a cron), and
  // feeds back into both the equipped character's mood and a small game
  // coin bonus — so visiting your pet has a point beyond the poke itself.
  petHappiness: integer("pet_happiness").notNull().default(70),
  petLastInteractionAt: timestamp("pet_last_interaction_at", { withTimezone: true }),

  equippedSpeciesId: uuid("equipped_species_id").references(
    () => avatarItems.id
  ),
  equippedHairId: uuid("equipped_hair_id").references(() => avatarItems.id),
  equippedEyesId: uuid("equipped_eyes_id").references(() => avatarItems.id),
  equippedClothesId: uuid("equipped_clothes_id").references(
    () => avatarItems.id
  ),
  equippedHatId: uuid("equipped_hat_id").references(() => avatarItems.id),
  equippedAccessoryId: uuid("equipped_accessory_id").references(
    () => avatarItems.id
  ),
  equippedBackgroundId: uuid("equipped_background_id").references(
    () => avatarItems.id
  ),
  equippedWallpaperId: uuid("equipped_wallpaper_id").references(
    () => avatarItems.id
  ),
  equippedFloorId: uuid("equipped_floor_id").references(() => avatarItems.id),
  equippedFurnitureId: uuid("equipped_furniture_id").references(
    () => avatarItems.id
  ),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (table) => [
  uniqueIndex("students_enrollment_code_idx").on(table.enrollmentCode),
]).enableRLS();

export const studentExternalRefs = pgTable("student_external_refs", {
  id: uuid("id").primaryKey().defaultRandom(),
  studentId: uuid("student_id")
    .notNull()
    .references(() => students.id, { onDelete: "cascade" }),
  sourceSystem: text("source_system").notNull(),
  externalId: text("external_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (table) => [
  uniqueIndex("student_external_refs_source_external_idx").on(
    table.sourceSystem,
    table.externalId
  ),
  index("student_external_refs_student_idx").on(table.studentId),
]).enableRLS();

export const pinAttempts = pgTable("pin_attempts", {
  id: uuid("id").primaryKey().defaultRandom(),
  studentId: uuid("student_id").references(() => students.id, {
    onDelete: "cascade",
  }),
  ip: text("ip"),
  success: boolean("success").notNull(),
  attemptedAt: timestamp("attempted_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (table) => [
  index("pin_attempts_student_idx").on(table.studentId, table.attemptedAt),
  index("pin_attempts_ip_idx").on(table.ip, table.attemptedAt),
]).enableRLS();
