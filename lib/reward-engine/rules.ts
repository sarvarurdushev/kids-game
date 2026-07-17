import type {
  ClassroomEventMetrics,
  ClassroomProgram,
  RewardRuleConfig,
  TriggeredRule,
} from "./types";

export function evaluateEvent(
  metrics: ClassroomEventMetrics,
  program: ClassroomProgram | null,
  rules: RewardRuleConfig[]
): TriggeredRule[] {
  const triggered: TriggeredRule[] = [];
  const fields = metrics as Record<string, unknown>;

  for (const rule of rules) {
    if (!rule.active) continue;
    if (rule.programFilter && rule.programFilter !== program) continue;

    const fieldValue = fields[rule.sourceField];
    let fires = false;

    if (rule.triggerType === "boolean_field") {
      fires = fieldValue === true;
    } else if (rule.triggerType === "score_threshold") {
      fires =
        typeof fieldValue === "number" &&
        rule.threshold !== null &&
        fieldValue >= rule.threshold;
    }

    if (fires) {
      triggered.push({
        ruleKey: rule.ruleKey,
        xpAmount: rule.xpAmount,
        coinAmount: rule.coinAmount,
      });
    }
  }

  return triggered;
}
