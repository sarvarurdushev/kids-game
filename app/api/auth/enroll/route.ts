import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { students } from "@/lib/db/schema";
import { addStudentToFamily } from "@/lib/auth/session";
import { enrollSchema } from "@/lib/validation/auth";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = enrollSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const [student] = await db
    .select({ id: students.id, displayName: students.displayName })
    .from(students)
    .where(eq(students.enrollmentCode, parsed.data.code))
    .limit(1);

  if (!student) {
    return NextResponse.json({ error: "That code doesn't match anyone yet" }, { status: 404 });
  }

  await addStudentToFamily(student.id);

  return NextResponse.json({ id: student.id, displayName: student.displayName });
}
