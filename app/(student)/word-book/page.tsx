import { redirect } from "next/navigation";
import { requireStudent } from "@/lib/auth/requireStudent";
import { getWordBookSummary } from "@/lib/student/wordBook";
import { WordBookReview } from "@/components/wordbook/WordBookReview";
import { T } from "@/components/i18n/T";

export default async function WordBookPage() {
  const student = await requireStudent();
  if (!student) redirect("/login");

  const summary = await getWordBookSummary(student.id);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-2xl font-bold lg:text-4xl">
          <T k="wordbook.title" />
        </h1>
        <p className="text-ink/60">
          <T k="wordbook.subtitle" />
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="rounded-full bg-white/70 px-3 py-1.5 text-xs font-bold text-ink/60">
          📖 {summary.totalWords} <T k="wordbook.wordsLearned" />
        </span>
        <span className="rounded-full bg-coral/15 px-3 py-1.5 text-xs font-bold text-coral">
          ⏰ {summary.dueCount} <T k="wordbook.due" />
        </span>
        <span className="rounded-full bg-gold/20 px-3 py-1.5 text-xs font-bold text-gold-dark">
          🏆 {summary.masteredCount} <T k="wordbook.mastered" />
        </span>
      </div>

      <WordBookReview queue={summary.queue} dueCount={summary.dueCount} />
    </div>
  );
}
