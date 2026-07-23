import { redirect } from "next/navigation";
import { requireStudent } from "@/lib/auth/requireStudent";
import { getCollection } from "@/lib/student/collection";
import { getAvatarItems } from "@/lib/student/avatar";
import { CollectionTabs } from "@/components/collection/CollectionTabs";

const STYLE_SLOTS = new Set<string>(["hair", "eyes", "clothes"]);

export default async function CollectionPage() {
  const student = await requireStudent();
  if (!student) redirect("/login");

  const collection = await getCollection(student);
  const styleItems = (await getAvatarItems(student))
    .filter((item) => STYLE_SLOTS.has(item.slot))
    .map((item) => ({
      id: item.id,
      slot: item.slot as "hair" | "eyes" | "clothes",
      key: item.key,
      name: item.name,
      rarity: item.rarity,
      coinPrice: item.coinPrice,
      state: item.state,
      reason: item.reason,
      affordable: item.affordable,
    }));

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-2xl font-bold">Collection Book</h1>
        <p className="text-ink/60">Keep collecting to fill every universe!</p>
      </div>

      <CollectionTabs collection={collection} styleItems={styleItems} />
    </div>
  );
}
