export type ClassroomProgram =
  | "story_craft"
  | "discovery"
  | "mission_english"
  | "creative";

export interface ClassroomEventMetrics {
  attendance?: boolean;
  participationScore?: number;
  speakingScore?: number;
  confidenceScore?: number;
  teamworkScore?: number;
  engagementScore?: number;
  behaviorScore?: number;
  activityCompleted?: boolean;
}

export interface RewardRuleConfig {
  ruleKey: string;
  triggerType: "boolean_field" | "score_threshold";
  sourceField: string;
  programFilter: string | null;
  threshold: number | null;
  xpAmount: number;
  coinAmount: number;
  active: boolean;
}

export interface TriggeredRule {
  ruleKey: string;
  xpAmount: number;
  coinAmount: number;
}

export interface LevelCurveEntry {
  level: number;
  minXp: number;
  bonusCoins: number;
  bonusPackTypeId: string | null;
}

export interface LevelUpEvent {
  level: number;
  bonusCoins: number;
  bonusPackTypeId: string | null;
}

export interface AchievementConfig {
  id: string;
  key: string;
  eventKey: string;
  threshold: number;
  rewardCoins: number;
  rewardPackTypeId: string | null;
  rewardAvatarItemId: string | null;
}

export interface AchievementUnlock {
  achievementId: string;
  key: string;
  rewardCoins: number;
  rewardPackTypeId: string | null;
  rewardAvatarItemId: string | null;
}

export type Rarity = "common" | "rare" | "epic" | "legendary";

export interface CharacterConfig {
  id: string;
  universeId: string;
  rarity: Rarity;
}

export type RarityWeights = Record<Rarity, number>;
