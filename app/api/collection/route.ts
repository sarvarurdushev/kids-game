import { NextResponse } from "next/server";
import { requireStudent } from "@/lib/auth/requireStudent";
import { getCollection } from "@/lib/student/collection";

export async function GET() {
  const student = await requireStudent();
  if (!student) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  return NextResponse.json(await getCollection(student.id));
}
