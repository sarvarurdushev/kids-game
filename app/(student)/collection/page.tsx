import { redirect } from "next/navigation";
import { requireStudent } from "@/lib/auth/requireStudent";
import { getCollection } from "@/lib/student/collection";
import { getAvatarItems } from "@/lib/student/avatar";
import { CollectionTabs } from "@/components/collection/CollectionTabs";

const STYLE_SLOTS = new Set<string>(["hair", "eyes", "clothes", "accessory", "background", "hat"]);

export default async function CollectionPage() {
  const student = await requireStudent();
  if (!student) redirect("/login");

  const collection = await getCollection(student);
  const styleItems = (await getAvatarItems(student))
    .filter((item) => STYLE_SLOTS.has(item.slot))
    .map((item) => ({
      id: item.id,
      slot: item.slot as "hair" | "eyes" | "clothes" | "accessory" | "background" | "hat",
      key: item.key,
      name: item.name,
      rarity: item.rarity,
      coinPrice: item.coinPrice,
      featured: item.featured,
      effectivePrice: item.effectivePrice,
      state: item.state,
      reason: item.reason,
      affordable: item.affordable,
    }));

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-2xl font-bold lg:text-4xl">Collection Book</h1>
        <p className="text-ink/60">Keep collecting to fill every universe!</p>
        <p className="mt-1 flex items-center gap-1 font-semibold text-ink/60">
          <span aria-hidden>✨</span> {student.cardShards} shards
        </p>
        <p className="text-xs text-ink/50">
          Duplicate cards earn shards — spend them to grab a card you&apos;re missing!
        </p>
      </div>

      <CollectionTabs collection={collection} styleItems={styleItems} />
    </div>
  );
}
