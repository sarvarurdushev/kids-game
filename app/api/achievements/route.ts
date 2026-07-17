import { NextResponse } from "next/server";
import { requireStudent } from "@/lib/auth/requireStudent";
import { getAchievements } from "@/lib/student/achievements";

export async function GET() {
  const student = await requireStudent();
  if (!student) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  return NextResponse.json(await getAchievements(student.id));
}
