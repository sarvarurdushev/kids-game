import "server-only";
import { and, eq, gte, sql, type SQL } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { pinAttempts, students } from "@/lib/db/schema";

const FAILURE_WINDOW_MINUTES = 15;
const MAX_FAILURES_PER_STUDENT = 5;
const LOCKOUT_MINUTES = 15;
const IP_WINDOW_MINUTES = 60;
const MAX_FAILURES_PER_IP = 20;

async function countFailedAttempts(where: SQL, minutes: number) {
  const since = new Date(Date.now() - minutes * 60_000);
  const rows = await db
    .select({ count: sql<number>`count(*)` })
    .from(pinAttempts)
    .where(and(where, eq(pinAttempts.success, false), gte(pinAttempts.attemptedAt, since)));
  return Number(rows[0]?.count ?? 0);
}

export async function recordPinAttempt(
  studentId: string,
  ip: string | null,
  success: boolean
) {
  await db.insert(pinAttempts).values({ studentId, ip, success });
}

export async function isIpRateLimited(ip: string | null): Promise<boolean> {
  if (!ip) return false;
  const count = await countFailedAttempts(eq(pinAttempts.ip, ip), IP_WINDOW_MINUTES);
  return count >= MAX_FAILURES_PER_IP;
}

/** Call after a failed PIN attempt has already been recorded via recordPinAttempt().
 * Locks the student out for LOCKOUT_MINUTES once MAX_FAILURES_PER_STUDENT failures
 * land inside the rolling window, and returns the lock expiry so the caller can
 * surface it, or null if not (yet) locked. */
export async function registerFailureAndMaybeLock(
  studentId: string
): Promise<Date | null> {
  // The triggering failure is already in the table by the time this runs, so
  // `failures` itself (not failures + 1) is the count to compare against.
  const failures = await countFailedAttempts(
    eq(pinAttempts.studentId, studentId),
    FAILURE_WINDOW_MINUTES
  );
  if (failures >= MAX_FAILURES_PER_STUDENT) {
    const lockedUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60_000);
    await db
      .update(students)
      .set({ pinLockedUntil: lockedUntil })
      .where(eq(students.id, studentId));
    return lockedUntil;
  }
  return null;
}
