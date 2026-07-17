import { NextResponse } from "next/server";
import { requireStudent } from "@/lib/auth/requireStudent";
import { getPackShop } from "@/lib/student/packs";

export async function GET() {
  const student = await requireStudent();
  if (!student) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  return NextResponse.json(await getPackShop(student.coinsBalance));
}
