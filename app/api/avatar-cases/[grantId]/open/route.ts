import { NextResponse } from "next/server";
import { requireStudent } from "@/lib/auth/requireStudent";
import { openCase } from "@/lib/student/avatarCases";
import { ServiceError } from "@/lib/student/errors";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ grantId: string }> }
) {
  const student = await requireStudent();
  if (!student) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { grantId } = await params;

  try {
    const revealed = await openCase(student.id, grantId);
    return NextResponse.json({ item: revealed });
  } catch (error) {
    if (error instanceof ServiceError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }
}
