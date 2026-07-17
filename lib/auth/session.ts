import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const FAMILY_COOKIE = "gk_family";
const SESSION_COOKIE = "gk_session";
const FAMILY_MAX_AGE_SECONDS = 60 * 60 * 24 * 365; // ~1 year, one enrollment per device
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 45; // 45 days

export type SessionPayload = { stid: string; tv: number };

function getSecretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set");
  return new TextEncoder().encode(secret);
}

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

/** Student IDs linked to this device via an enrollment code. Not proof of identity by itself — always paired with a PIN. */
export async function getFamily(): Promise<string[]> {
  const store = await cookies();
  const raw = store.get(FAMILY_COOKIE)?.value;
  if (!raw) return [];
  try {
    const { payload } = await jwtVerify(raw, getSecretKey());
    const students = (payload as { students?: unknown }).students;
    return Array.isArray(students) ? students.filter((s) => typeof s === "string") : [];
  } catch {
    return [];
  }
}

export async function addStudentToFamily(studentId: string): Promise<void> {
  const current = await getFamily();
  const next = current.includes(studentId) ? current : [...current, studentId];
  const token = await new SignJWT({ students: next })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${FAMILY_MAX_AGE_SECONDS}s`)
    .sign(getSecretKey());
  const store = await cookies();
  store.set(FAMILY_COOKIE, token, {
    ...cookieOptions,
    maxAge: FAMILY_MAX_AGE_SECONDS,
  });
}

export async function createSession(studentId: string, tokenVersion: number): Promise<void> {
  const token = await new SignJWT({ stid: studentId, tv: tokenVersion })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSecretKey());
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    ...cookieOptions,
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

/** Verifies signature + expiry only; does not confirm the student/token version still exist. Pair with requireStudent() for that. */
export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  try {
    const { payload } = await jwtVerify(raw, getSecretKey());
    const stid = (payload as { stid?: unknown }).stid;
    const tv = (payload as { tv?: unknown }).tv;
    if (typeof stid !== "string" || typeof tv !== "number") return null;
    return { stid, tv };
  } catch {
    return null;
  }
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
