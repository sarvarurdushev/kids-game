import "server-only";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { students } from "@/lib/db/schema";
import { getSession } from "./session";

export type AuthedStudent = typeof students.$inferSelect;

/**
 * Verifies the session cookie and loads the student row in one step. The
 * token_version equality check is what makes students.tokenVersion a working
 * force-revocation hook: bumping it invalidates every outstanding cookie the
 * next time this function runs, with no extra DB round trip beyond the load
 * every route already needs.
 */
export async function requireStudent(): Promise<AuthedStudent | null> {
  const session = await getSession();
  if (!session) return null;
  const [student] = await db
    .select()
    .from(students)
    .where(and(eq(students.id, session.stid), eq(students.tokenVersion, session.tv)))
    .limit(1);
  return student ?? null;
}
