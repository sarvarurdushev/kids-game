import Link from "next/link";
import { redirect } from "next/navigation";
import { requireStudent } from "@/lib/auth/requireStudent";
import { getDashboard } from "@/lib/student/dashboard";
import { getEquippedAvatarKeys } from "@/lib/student/avatar";
import { Card } from "@/components/ui/Card";
import { LevelRing } from "@/components/ui/LevelRing";
import { DailyClaimButton } from "@/components/home/DailyClaimButton";
import { Sparx } from "@/components/mascot/Sparx";
import { PokeableRoom } from "@/components/room/PokeableRoom";
import { BoosterPackIcon, CoinIcon, FlameIcon } from "@/components/icons";

export default async function HomePage() {
  const student = await requireStudent();
  if (!student) redirect("/login");
  const dashboard = await getDashboard(student);
  const equippedKeys = await getEquippedAvatarKeys(student);

  const ringProgress =
    dashboard.level.xpForNextLevel !== null
      ? dashboard.level.xpIntoLevel / dashboard.level.xpForNextLevel
      : 1;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <Sparx size={64} />
        <div className="relative flex-1 rounded-2xl rounded-bl-none bg-white/90 px-4 py-3 shadow-sm">
          <h1 className="font-display text-lg font-bold">Hi, {dashboard.displayName}!</h1>
          <p className="text-sm text-ink/60">Ready for today&apos;s adventure?</p>
        </div>
      </div>

      <PokeableRoom equippedKeys={equippedKeys} baseMood={dashboard.petMood} happiness={dashboard.petHappiness} />

      <Card className="flex items-center gap-4">
        <LevelRing progress={ringProgress} size={92}>
          <span className="font-display text-2xl leading-none font-bold text-gold-dark">
            {dashboard.level.level}
          </span>
          <span className="text-[9px] font-bold tracking-wide text-ink/40 uppercase">Level</span>
        </LevelRing>
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <CoinIcon size={22} />
            {dashboard.coinsBalance} coins
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold">
            <FlameIcon size={22} />
            {dashboard.currentStreak} day streak
          </div>
          <p className="text-xs text-ink/50">
            {dashboard.level.xpForNextLevel !== null
              ? `${dashboard.level.xpIntoLevel}/${dashboard.level.xpForNextLevel} XP to next level`
              : "Max level!"}
          </p>
        </div>
      </Card>

      <DailyClaimButton
        claimedToday={dashboard.dailyClaim.claimedToday}
        nextReward={dashboard.dailyClaim.nextReward}
      />

      {dashboard.unopenedPackCount > 0 && (
        <Link
          href="/packs"
          className="gk-pop-in flex items-center gap-3 rounded-2xl bg-gradient-to-br from-coral to-[#d4507a] px-4 py-3 font-display font-semibold text-white shadow-md"
        >
          <BoosterPackIcon size={44} />
          <span className="flex-1">
            You have {dashboard.unopenedPackCount} pack
            {dashboard.unopenedPackCount > 1 ? "s" : ""} to open!
          </span>
          <span>→</span>
        </Link>
      )}
    </div>
  );
}
