import { NextResponse } from "next/server";
import { inArray } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { students } from "@/lib/db/schema";
import { requireStudent } from "@/lib/auth/requireStudent";
import { getFamily } from "@/lib/auth/session";

export async function GET() {
  const student = await requireStudent();
  if (!student) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const familyIds = await getFamily();
  const siblingIds = familyIds.filter((id) => id !== student.id);
  const siblings = siblingIds.length
    ? await db
        .select({ id: students.id, displayName: students.displayName })
        .from(students)
        .where(inArray(students.id, siblingIds))
    : [];

  return NextResponse.json({
    id: student.id,
    displayName: student.displayName,
    xpTotal: student.xpTotal,
    coinsBalance: student.coinsBalance,
    siblings,
  });
}
