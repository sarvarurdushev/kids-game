import { redirect } from "next/navigation";
import Link from "next/link";
import { requireStudent } from "@/lib/auth/requireStudent";
import { getAvatarItems } from "@/lib/student/avatar";
import { AvatarCustomizer } from "@/components/avatar/AvatarCustomizer";
import type { AvatarItem } from "@/components/avatar/AvatarCustomizer";

const CHARACTER_SLOTS = new Set<string>(["hair", "eyes", "clothes", "hat", "accessory", "background"]);

export default async function AvatarPage() {
  const student = await requireStudent();
  if (!student) redirect("/login");

  const items = (await getAvatarItems(student)).filter((item) =>
    CHARACTER_SLOTS.has(item.slot)
  ) as AvatarItem[];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Your Cat</h1>
        <Link href="/room" className="text-sm font-semibold text-teal underline-offset-2 hover:underline">
          Decorate room →
        </Link>
      </div>
      <AvatarCustomizer items={items} coinsBalance={student.coinsBalance} />
    </div>
  );
}
