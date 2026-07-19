"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { Avatar3D } from "@/components/three/Avatar3D";
import type { AvatarEquippedKeys } from "@/components/avatar/AvatarCharacter";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SpeakButton } from "@/components/ui/SpeakButton";
import { AGE_TRACKS, AI_LAB_UNITS, AI_SAFETY_CARDS, BIG_IDEA_LABELS, type AgeTrack } from "@/lib/ai-lab/curriculum";
import { getStoredTrack, onTrackChange, setStoredTrack } from "@/lib/ai-lab/trackPreference";
import type { GameKey } from "@/lib/reward-engine/gameSession";

function subscribe(callback: () => void): () => void {
  return onTrackChange(() => callback());
}

function getServerSnapshot(): AgeTrack {
  return "little_sparks";
}

export function AiLabHome({
  equippedKeys,
  playsRemaining,
}: {
  equippedKeys: AvatarEquippedKeys;
  playsRemaining: Partial<Record<GameKey, number>>;
}) {
  const track = useSyncExternalStore(subscribe, getStoredTrack, getServerSnapshot);

  function chooseTrack(next: AgeTrack) {
    setStoredTrack(next);
  }

  const units = AI_LAB_UNITS.filter((unit) => !unit.minTrack || unit.minTrack === track);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <Avatar3D equippedKeys={equippedKeys} size={64} mood="happy" />
        <div className="relative flex-1 rounded-2xl rounded-bl-none bg-white/90 px-4 py-3 shadow-sm">
          <h1 className="font-display text-lg font-bold">AI Lab</h1>
          <p className="text-sm text-ink/60">Learn how AI thinks — in English, with Sparx!</p>
        </div>
      </div>

      <Card className="flex flex-col gap-3">
        <p className="text-xs font-bold tracking-wide text-ink/50 uppercase">Choose your track</p>
        <div className="grid grid-cols-2 gap-3">
          {AGE_TRACKS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => chooseTrack(t.key)}
              className={`flex flex-col items-start gap-0.5 rounded-2xl border-2 px-3 py-3 text-left transition-colors ${
                track === t.key ? "border-gold bg-gold/10" : "border-ink/10 bg-white"
              }`}
            >
              <span className="font-display font-bold text-ink">{t.label}</span>
              <span className="text-xs font-semibold text-ink/50">{t.ageRange}</span>
              <span className="text-xs text-ink/60">{t.blurb}</span>
            </button>
          ))}
        </div>
      </Card>

      <div className="flex flex-col gap-4">
        {units.map((unit) => (
          <Card key={unit.key} className="flex flex-col gap-2" id={unit.gameKey ? undefined : "talking-to-ai-safely"}>
            <div className="flex flex-wrap gap-1.5">
              {unit.bigIdeas.map((idea) => (
                <span
                  key={idea}
                  className="rounded-full bg-teal/10 px-2 py-0.5 text-[10px] font-bold text-teal uppercase tracking-wide"
                >
                  {BIG_IDEA_LABELS[idea]}
                </span>
              ))}
            </div>
            <h2 className="font-display text-lg font-bold text-ink">{unit.title}</h2>
            <p className="text-sm text-ink/60">{unit.tagline}</p>
            <p className="text-xs font-semibold text-ink/40">English focus: {unit.englishFocus}</p>

            {unit.gameKey ? (
              <div className="mt-1 flex items-center justify-between gap-3">
                <p className="text-xs font-bold text-gold-dark">
                  {(playsRemaining[unit.gameKey] ?? 0) > 0
                    ? `${playsRemaining[unit.gameKey]} rewarded round${playsRemaining[unit.gameKey] === 1 ? "" : "s"} left today`
                    : "Practice mode — play for fun!"}
                </p>
                <Link href={`${unit.href}?track=${track}`}>
                  <Button variant="secondary" className="!px-4 !py-2 !text-base">
                    Play
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="mt-1 flex flex-col gap-2">
                {AI_SAFETY_CARDS.map((tip) => (
                  <div key={tip.text} className="flex items-center gap-2 rounded-2xl bg-cream px-3 py-2">
                    <span className="text-2xl">{tip.emoji}</span>
                    <p className="flex-1 text-sm font-semibold text-ink">{tip.text}</p>
                    <SpeakButton text={tip.text} className="h-7 w-7 text-sm" />
                  </div>
                ))}
              </div>
            )}

            <p className="mt-1 text-xs text-ink/40 italic">Talk about it: {unit.talkAboutIt}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
