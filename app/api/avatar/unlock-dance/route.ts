import { NextResponse } from "next/server";
import { requireStudent } from "@/lib/auth/requireStudent";
import { unlockDance } from "@/lib/student/dance";
import { ServiceError } from "@/lib/student/errors";

export async function POST() {
  const student = await requireStudent();
  if (!student) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  try {
    const result = await unlockDance(student.id);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ServiceError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }
}
