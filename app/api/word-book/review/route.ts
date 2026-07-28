import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { requireStudent } from "@/lib/auth/requireStudent";
import { reviewWord } from "@/lib/student/wordBook";
import { reviewWordSchema } from "@/lib/validation/actions";
import { ServiceError } from "@/lib/student/errors";

export async function POST(request: NextRequest) {
  const student = await requireStudent();
  if (!student) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = reviewWordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    const result = await reviewWord(student.id, parsed.data.word, parsed.data.knewIt);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ServiceError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }
}
