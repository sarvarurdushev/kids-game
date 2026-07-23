import { redirect } from "next/navigation";
import Link from "next/link";
import { requireStudent } from "@/lib/auth/requireStudent";
import { getAvatarItems } from "@/lib/student/avatar";
import { isDanceUnlocked, DANCE_UNLOCK_COST } from "@/lib/student/dance";
import { AvatarCustomizer } from "@/components/avatar/AvatarCustomizer";
import type { AvatarItem } from "@/components/avatar/AvatarCustomizer";

const CHARACTER_SLOTS = new Set<string>(["species", "hat"]);

export default async function AvatarPage() {
  const student = await requireStudent();
  if (!student) redirect("/login");

  const items = (await getAvatarItems(student)).filter((item) =>
    CHARACTER_SLOTS.has(item.slot)
  ) as AvatarItem[];
  const danceUnlocked = await isDanceUnlocked(student.id);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Your Avatar</h1>
        <div className="flex flex-col items-end gap-0.5">
          <Link href="/cases" className="text-sm font-semibold text-coral underline-offset-2 hover:underline">
            Open a case →
          </Link>
          <Link href="/room" className="text-sm font-semibold text-teal underline-offset-2 hover:underline">
            Decorate room →
          </Link>
        </div>
      </div>
      <AvatarCustomizer
        items={items}
        coinsBalance={student.coinsBalance}
        danceUnlocked={danceUnlocked}
        danceCost={DANCE_UNLOCK_COST}
      />
    </div>
  );
}
