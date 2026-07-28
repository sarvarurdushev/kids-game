import { notFound, redirect } from "next/navigation";
import { requireStudent } from "@/lib/auth/requireStudent";
import { getCollection } from "@/lib/student/collection";
import { CollectionGrid } from "@/components/cards/CollectionGrid";
import { ProgressBar } from "@/components/ui/ProgressBar";

export default async function UniverseCollectionPage({
  params,
}: {
  params: Promise<{ universeKey: string }>;
}) {
  const student = await requireStudent();
  if (!student) redirect("/login");

  const { universeKey } = await params;
  const collection = await getCollection(student);
  const entry = collection.find((c) => c.universe.key === universeKey);
  if (!entry) notFound();
  if (entry.universe.locked) redirect("/collection");

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-2xl font-bold">{entry.universe.name}</h1>
        <p className="mb-2 text-ink/60">
          {entry.progress.owned}/{entry.progress.total} collected
        </p>
        <ProgressBar value={entry.progress.owned} max={entry.progress.total} />
      </div>

      <CollectionGrid characters={entry.characters} cardShards={student.cardShards} />
    </div>
  );
}
