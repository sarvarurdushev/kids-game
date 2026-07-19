import type { AvatarMood } from "@/components/avatar/AvatarCharacter";

export const HAPPINESS_DECAY_PER_DAY = 4;
export const INTERACTION_BOOST = 15;
const MAX_HAPPINESS = 100;
const MIN_HAPPINESS = 0;

/** Happiness isn't decremented by a cron — it's computed lazily from
 * whenever the student last poked/fed their pet (or account creation, for a
 * pet that's never been interacted with), the same "compute from a
 * timestamp at read time" style as the daily streak. */
export function getEffectivePetHappiness(
  storedHappiness: number,
  lastInteractionAt: Date | null,
  createdAt: Date,
  now: Date = new Date()
): number {
  const since = lastInteractionAt ?? createdAt;
  const daysSince = (now.getTime() - since.getTime()) / (1000 * 60 * 60 * 24);
  const decayed = storedHappiness - daysSince * HAPPINESS_DECAY_PER_DAY;
  return Math.max(MIN_HAPPINESS, Math.min(MAX_HAPPINESS, Math.round(decayed)));
}

export function petMoodFromHappiness(happiness: number): AvatarMood {
  if (happiness >= 65) return "happy";
  if (happiness < 30) return "sad";
  return "neutral";
}

// A friendly, non-punitive game-reward nudge: a well-cared-for pet helps a
// little, but a neglected one never actively docks coins — this is meant to
// encourage checking in, not to punish a kid who forgot for a few days.
export function petHappinessCoinMultiplier(happiness: number): number {
  if (happiness >= 80) return 1.1;
  if (happiness >= 50) return 1.05;
  return 1;
}

export function boostHappiness(currentEffective: number): number {
  return Math.min(MAX_HAPPINESS, currentEffective + INTERACTION_BOOST);
}
