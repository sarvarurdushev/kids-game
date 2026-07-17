import Link from "next/link";
import { redirect } from "next/navigation";
import { requireStudent } from "@/lib/auth/requireStudent";
import { getCollection } from "@/lib/student/collection";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { emojiForUniverse } from "@/lib/visuals";

export default async function CollectionPage() {
  const student = await requireStudent();
  if (!student) redirect("/login");

  const collection = await getCollection(student.id);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-2xl font-bold">Collection Book</h1>
        <p className="text-ink/60">Keep collecting to fill every universe!</p>
      </div>

      <div className="flex flex-col gap-3">
        {collection.map(({ universe, progress }) => (
          <Link key={universe.id} href={`/collection/${universe.key}`}>
            <Card className="flex items-center gap-4 transition-transform active:scale-[0.98]">
              <span className="text-4xl">{emojiForUniverse(universe.key)}</span>
              <div className="flex-1">
                <p className="font-display font-semibold">{universe.name}</p>
                <ProgressBar value={progress.owned} max={progress.total} />
              </div>
              <span className="text-sm font-bold text-ink/60">
                {progress.owned}/{progress.total}
              </span>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
