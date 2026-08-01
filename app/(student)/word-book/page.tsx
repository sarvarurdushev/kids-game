import { redirect } from "next/navigation";
import { requireStudent } from "@/lib/auth/requireStudent";
import { getWordBookSummary } from "@/lib/student/wordBook";
import { WordBookReview } from "@/components/wordbook/WordBookReview";

export default async function WordBookPage() {
  const student = await requireStudent();
  if (!student) redirect("/login");

  const summary = await getWordBookSummary(student.id);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-2xl font-bold lg:text-4xl">Word Book</h1>
        <p className="text-ink/60">Review words you&apos;ve learned to keep them in your memory!</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="rounded-full bg-white/70 px-3 py-1.5 text-xs font-bold text-ink/60">
          📖 {summary.totalWords} words learned
        </span>
        <span className="rounded-full bg-coral/15 px-3 py-1.5 text-xs font-bold text-coral">
          ⏰ {summary.dueCount} due
        </span>
        <span className="rounded-full bg-gold/20 px-3 py-1.5 text-xs font-bold text-gold-dark">
          🏆 {summary.masteredCount} mastered
        </span>
      </div>

      <WordBookReview queue={summary.queue} dueCount={summary.dueCount} />
    </div>
  );
}
