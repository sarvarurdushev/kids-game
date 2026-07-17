import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { students } from "@/lib/db/schema";
import { getFamily, createSession } from "@/lib/auth/session";
import { verifyPin } from "@/lib/auth/pin";
import {
  isIpRateLimited,
  recordPinAttempt,
  registerFailureAndMaybeLock,
} from "@/lib/auth/rateLimit";
import { loginSchema } from "@/lib/validation/auth";
import { getClientIp } from "@/lib/api/http";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const { studentId, pin } = parsed.data;

  const ip = getClientIp(request);
  if (await isIpRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many attempts from this device. Try again later." },
      { status: 429 }
    );
  }

  const family = await getFamily();
  if (!family.includes(studentId)) {
    return NextResponse.json({ error: "That kid isn't set up on this device" }, { status: 403 });
  }

  const [student] = await db.select().from(students).where(eq(students.id, studentId)).limit(1);
  if (!student) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  if (student.pinLockedUntil && student.pinLockedUntil > new Date()) {
    return NextResponse.json(
      { error: "Too many tries. Ask a grown-up for help." },
      { status: 423 }
    );
  }

  const ok = await verifyPin(pin, student.pinHash);
  await recordPinAttempt(studentId, ip, ok);

  if (!ok) {
    const lockedUntil = await registerFailureAndMaybeLock(studentId);
    if (lockedUntil) {
      return NextResponse.json(
        { error: "Too many tries. Ask a grown-up for help." },
        { status: 423 }
      );
    }
    return NextResponse.json({ error: "Wrong PIN" }, { status: 401 });
  }

  await createSession(studentId, student.tokenVersion);

  return NextResponse.json({ id: student.id, displayName: student.displayName });
}
