import { NextResponse } from "next/server";
import { requireStudent } from "@/lib/auth/requireStudent";
import { claimDailyReward } from "@/lib/reward-engine/dailyClaim";

export async function POST() {
  const student = await requireStudent();
  if (!student) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  return NextResponse.json(await claimDailyReward(student.id));
}
