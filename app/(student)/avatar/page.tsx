import { redirect } from "next/navigation";
import { requireStudent } from "@/lib/auth/requireStudent";
import { getAvatarItems } from "@/lib/student/avatar";
import { AvatarCustomizer } from "@/components/avatar/AvatarCustomizer";

export default async function AvatarPage() {
  const student = await requireStudent();
  if (!student) redirect("/login");

  const items = await getAvatarItems(student);

  return (
    <div className="flex flex-col gap-5">
      <h1 className="font-display text-2xl font-bold">Your Avatar</h1>
      <AvatarCustomizer items={items} coinsBalance={student.coinsBalance} />
    </div>
  );
}
