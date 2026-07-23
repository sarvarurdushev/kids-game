import { NextResponse } from "next/server";
import { requireStudent } from "@/lib/auth/requireStudent";
import { getCollection } from "@/lib/student/collection";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ universeKey: string }> }
) {
  const student = await requireStudent();
  if (!student) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { universeKey } = await params;
  const collection = await getCollection(student);
  const entry = collection.find((c) => c.universe.key === universeKey);
  if (!entry) {
    return NextResponse.json({ error: "Universe not found" }, { status: 404 });
  }

  return NextResponse.json(entry);
}
