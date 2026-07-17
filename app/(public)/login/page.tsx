import { redirect } from "next/navigation";
import { inArray } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { students } from "@/lib/db/schema";
import { getFamily } from "@/lib/auth/session";
import { LoginFlow } from "@/components/auth/LoginFlow";

export default async function LoginPage() {
  const familyIds = await getFamily();
  if (familyIds.length === 0) redirect("/welcome");

  const members = await db
    .select({ id: students.id, displayName: students.displayName })
    .from(students)
    .where(inArray(students.id, familyIds));

  return <LoginFlow members={members} />;
}
