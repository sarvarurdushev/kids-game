import { sql } from "drizzle-orm";
import {
  pgTable,
  pgEnum,
  uuid,
  text,
  timestamp,
  jsonb,
  boolean,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { students } from "./students";

export const webhookEventStatusEnum = pgEnum("webhook_event_status", [
  "pending",
  "processed",
  "failed",
]);

export const webhookClients = pgTable("webhook_clients", {
  id: uuid("id").primaryKey().defaultRandom(),
  sourceSystem: text("source_system").notNull(),
  secretHash: text("secret_hash").notNull(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (table) => [
  uniqueIndex("webhook_clients_source_system_idx").on(table.sourceSystem),
]).enableRLS();

export const webhookEvents = pgTable("webhook_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  sourceSystem: text("source_system").notNull(),
  externalEventId: text("external_event_id"),
  studentExternalId: text("student_external_id").notNull(),
  studentId: uuid("student_id").references(() => students.id),
  program: text("program"),
  rawPayload: jsonb("raw_payload").notNull(),
  status: webhookEventStatusEnum("status").notNull().default("pending"),
  result: jsonb("result"),
  errorMessage: text("error_message"),
  receivedAt: timestamp("received_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  processedAt: timestamp("processed_at", { withTimezone: true }),
}, (table) => [
  uniqueIndex("webhook_events_source_external_idx")
    .on(table.sourceSystem, table.externalEventId)
    .where(sql`${table.externalEventId} is not null`),
  index("webhook_events_student_idx").on(table.studentId),
]).enableRLS();
