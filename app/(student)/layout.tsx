import { redirect } from "next/navigation";
import { requireStudent } from "@/lib/auth/requireStudent";
import { BottomNav } from "@/components/nav/BottomNav";
import { BackButton } from "@/components/nav/BackButton";
import { SoundToggle } from "@/components/ui/SoundToggle";
import { MusicToggle } from "@/components/ui/MusicToggle";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { LanguageProvider } from "@/components/i18n/LanguageProvider";
import { CurriculumAnnouncement } from "@/components/curriculum/CurriculumAnnouncement";
import { getClaimableQuestCount } from "@/lib/reward-engine/quests";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const student = await requireStudent();
  if (!student) redirect("/login");
  const questBadge = await getClaimableQuestCount(student.id);

  return (
    <LanguageProvider scopeId={student.id}>
      <div className="relative flex min-h-full flex-1 flex-col overflow-hidden bg-gradient-to-b from-gold/20 via-cream to-cream">
        <div className="pointer-events-none absolute -top-16 -left-16 h-56 w-56 rounded-full bg-teal/15 blur-3xl" />
        <div className="pointer-events-none absolute top-40 -right-20 h-64 w-64 rounded-full bg-coral/15 blur-3xl" />
        <div className="fixed top-4 right-4 z-20 flex gap-2">
          <LanguageToggle />
          <MusicToggle />
          <SoundToggle />
        </div>
        <BackButton />
        <CurriculumAnnouncement studentId={student.id} />
        <main className="relative z-10 mx-auto w-full max-w-md flex-1 px-4 pt-14 pb-24 sm:max-w-2xl sm:px-6 lg:max-w-6xl lg:px-10 xl:max-w-7xl">
          {children}
        </main>
        <BottomNav questBadge={questBadge} />
      </div>
    </LanguageProvider>
  );
}
