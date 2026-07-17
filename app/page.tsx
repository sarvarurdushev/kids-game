import { redirect } from "next/navigation";
import { requireStudent } from "@/lib/auth/requireStudent";
import { getFamily } from "@/lib/auth/session";

export default async function RootPage() {
  const student = await requireStudent();
  if (student) redirect("/home");

  const family = await getFamily();
  redirect(family.length > 0 ? "/login" : "/welcome");
}
