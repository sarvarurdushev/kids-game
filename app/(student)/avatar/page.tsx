import { redirect } from "next/navigation";
import { requireStudent } from "@/lib/auth/requireStudent";
import { getAvatarItems } from "@/lib/student/avatar";
import { isDanceUnlocked, DANCE_UNLOCK_COST } from "@/lib/student/dance";
import { AvatarCustomizer } from "@/components/avatar/AvatarCustomizer";
import type { AvatarItem } from "@/components/avatar/AvatarCustomizer";
import { AvatarHeader } from "@/components/avatar/AvatarHeader";

const CHARACTER_SLOTS = new Set<string>(["species"]);

export default async function AvatarPage() {
  const student = await requireStudent();
  if (!student) redirect("/login");

  const items = (await getAvatarItems(student)).filter((item) =>
    CHARACTER_SLOTS.has(item.slot)
  ) as AvatarItem[];
  const danceUnlocked = await isDanceUnlocked(student.id);

  return (
    <div className="flex flex-col gap-5">
      <AvatarHeader />
      <AvatarCustomizer
        items={items}
        coinsBalance={student.coinsBalance}
        danceUnlocked={danceUnlocked}
        danceCost={DANCE_UNLOCK_COST}
      />
    </div>
  );
}
