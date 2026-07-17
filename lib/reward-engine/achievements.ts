import type { AchievementConfig, AchievementUnlock } from "./types";

export function checkAchievementUnlocks(
  eventKey: string,
  newCount: number,
  achievements: AchievementConfig[],
  alreadyUnlockedIds: Set<string>
): AchievementUnlock[] {
  return achievements
    .filter(
      (a) =>
        a.eventKey === eventKey &&
        newCount >= a.threshold &&
        !alreadyUnlockedIds.has(a.id)
    )
    .map((a) => ({
      achievementId: a.id,
      key: a.key,
      rewardCoins: a.rewardCoins,
      rewardPackTypeId: a.rewardPackTypeId,
      rewardAvatarItemId: a.rewardAvatarItemId,
    }));
}
