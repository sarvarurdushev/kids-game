import { ProgressBar } from "@/components/ui/ProgressBar";

interface AchievementBadgeProps {
  name: string;
  description: string;
  unlocked: boolean;
  progress: number;
  threshold: number;
  emoji?: string;
}

export function AchievementBadge({
  name,
  description,
  unlocked,
  progress,
  threshold,
  emoji = "🏅",
}: AchievementBadgeProps) {
  return (
    <div
      className={`flex flex-col items-center gap-2 rounded-2xl p-4 text-center ${
        unlocked ? "bg-white shadow-md" : "bg-ink/5"
      }`}
    >
      <div
        className={`flex h-16 w-16 items-center justify-center rounded-full text-3xl ${
          unlocked ? "bg-gold/20" : "bg-ink/10 grayscale"
        }`}
      >
        {unlocked ? emoji : "🔒"}
      </div>
      <p className="font-display text-sm font-semibold">{name}</p>
      <p className="text-xs text-ink/60">{description}</p>
      {!unlocked && (
        <div className="w-full">
          <ProgressBar value={progress} max={threshold} colorClassName="bg-teal" />
          <p className="mt-1 text-[10px] text-ink/50">
            {progress}/{threshold}
          </p>
        </div>
      )}
    </div>
  );
}
