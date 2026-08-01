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
      <div className="flex items-center gap-3 lg:gap-5">
        <Sparx size={64} className="lg:h-24 lg:w-24" />
        <div className="relative flex-1 rounded-2xl rounded-bl-none bg-white/90 px-4 py-3 shadow-sm lg:px-6 lg:py-5">
          <h1 className="font-display text-lg font-bold lg:text-3xl">Hi, {dashboard.displayName}!</h1>
          <p className="text-sm text-ink/60 lg:text-lg">Ready for today&apos;s adventure?</p>
        </div>
      </div>

      <PokeableRoom
        equippedKeys={equippedKeys}
        baseMood={dashboard.petMood}
        happiness={dashboard.petHappiness}
        coinsBalance={dashboard.coinsBalance}
      />

      <Card className="flex items-center gap-4 lg:gap-8 lg:p-8">
        <LevelRing progress={ringProgress} size={104}>
          <span className="font-display text-2xl leading-none font-bold text-gold-dark lg:text-4xl">
            {dashboard.level.level}
          </span>
          <span className="text-[9px] font-bold tracking-wide text-ink/40 uppercase lg:text-xs">Level</span>
        </LevelRing>
        <div className="flex flex-1 flex-col gap-2 lg:gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold lg:text-xl">
            <CoinIcon size={22} className="lg:h-8 lg:w-8" />
            {dashboard.coinsBalance} coins
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold lg:text-xl">
            <FlameIcon size={22} className="lg:h-8 lg:w-8" />
            {dashboard.currentStreak} day streak
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold lg:text-xl">
            <span aria-hidden>✨</span>
            {dashboard.cardShards} shards
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

      {/* Packs takes priority when both are waiting — a freshly-earned pack
          is the more exciting, time-sensitive draw of the two, and showing
          both stacked banners at once pushed the second one down far enough
          that the fixed bottom nav covered it on common phone viewports
          (measured: ~62% of the banner hidden, with no visual cue to
          scroll). At most one banner keeps this from recurring as more
          banners are added later, rather than chasing padding numbers. */}
      {dashboard.wordBookDueCount > 0 && dashboard.unopenedPackCount === 0 && (
        <Link
          href="/word-book"
          className="gk-pop-in flex items-center gap-3 rounded-2xl bg-gradient-to-br from-teal to-[#1f7a7a] px-4 py-3 font-display font-semibold text-white shadow-md"
        >
          <span className="text-3xl" aria-hidden>
            📖
          </span>
          <span className="flex-1">
            {dashboard.wordBookDueCount} word{dashboard.wordBookDueCount > 1 ? "s are" : " is"} ready to review!
          </span>
          <span>→</span>
        </Link>
      )}
    </div>
  );
}
