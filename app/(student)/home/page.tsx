import Link from "next/link";
import { redirect } from "next/navigation";
import { requireStudent } from "@/lib/auth/requireStudent";
import { getDashboard } from "@/lib/student/dashboard";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { DailyClaimButton } from "@/components/home/DailyClaimButton";

export default async function HomePage() {
  const student = await requireStudent();
  if (!student) redirect("/login");
  const dashboard = await getDashboard(student);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-2xl font-bold">Hi, {dashboard.displayName}!</h1>
        <p className="text-ink/60">Let&apos;s see what&apos;s new today.</p>
      </div>

      <Card className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="font-display text-lg font-bold text-gold-dark">
            Level {dashboard.level.level}
          </span>
          <span className="text-sm text-ink/60">
            {dashboard.level.xpForNextLevel !== null
              ? `${dashboard.level.xpIntoLevel}/${dashboard.level.xpForNextLevel} XP`
              : "Max level!"}
          </span>
        </div>
        <ProgressBar
          value={dashboard.level.xpIntoLevel}
          max={dashboard.level.xpForNextLevel ?? 1}
        />
        <div className="flex items-center justify-between text-sm font-semibold">
          <span>🪙 {dashboard.coinsBalance} coins</span>
          <span>🔥 {dashboard.currentStreak} day streak</span>
        </div>
      </Card>

      <DailyClaimButton
        claimedToday={dashboard.dailyClaim.claimedToday}
        nextReward={dashboard.dailyClaim.nextReward}
      />

      {dashboard.unopenedPackCount > 0 && (
        <Link
          href="/packs"
          className="gk-pop-in flex items-center justify-between rounded-2xl bg-coral px-5 py-4 font-display font-semibold text-white shadow-md"
        >
          <span>
            🎁 You have {dashboard.unopenedPackCount} pack
            {dashboard.unopenedPackCount > 1 ? "s" : ""} to open!
          </span>
          <span>→</span>
        </Link>
      )}
    </div>
  );
}
