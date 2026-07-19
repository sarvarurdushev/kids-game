import { NextResponse } from "next/server";
import { requireStudent } from "@/lib/auth/requireStudent";
import { interactWithPet } from "@/lib/student/pet";

export async function POST() {
  const student = await requireStudent();
  if (!student) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  const result = await interactWithPet(student.id);
  return NextResponse.json(result);
}
