import { describe, expect, it } from "vitest";
import { evaluateEvent } from "@/lib/reward-engine/rules";
import type { RewardRuleConfig } from "@/lib/reward-engine/types";

const rules: RewardRuleConfig[] = [
  {
    ruleKey: "class_attendance",
    triggerType: "boolean_field",
    sourceField: "attendance",
    programFilter: null,
    threshold: null,
    xpAmount: 50,
    coinAmount: 20,
    active: true,
  },
  {
    ruleKey: "active_participation",
    triggerType: "score_threshold",
    sourceField: "participationScore",
    programFilter: null,
    threshold: 70,
    xpAmount: 25,
    coinAmount: 10,
    active: true,
  },
  {
    ruleKey: "discovery_activity_completed",
    triggerType: "boolean_field",
    sourceField: "activityCompleted",
    programFilter: "discovery",
    threshold: null,
    xpAmount: 20,
    coinAmount: 8,
    active: true,
  },
  {
    ruleKey: "story_activity_completed",
    triggerType: "boolean_field",
    sourceField: "activityCompleted",
    programFilter: "story_craft",
    threshold: null,
    xpAmount: 20,
    coinAmount: 8,
    active: true,
  },
  {
    ruleKey: "retired_rule",
    triggerType: "boolean_field",
    sourceField: "attendance",
    programFilter: null,
    threshold: null,
    xpAmount: 999,
    coinAmount: 999,
    active: false,
  },
];

describe("evaluateEvent", () => {
  it("fires a boolean rule when the field is true", () => {
    const triggered = evaluateEvent({ attendance: true }, null, rules);
    expect(triggered).toEqual([
      { ruleKey: "class_attendance", xpAmount: 50, coinAmount: 20 },
    ]);
  });

  it("does not fire a boolean rule when the field is false or absent", () => {
    expect(evaluateEvent({ attendance: false }, null, rules)).toEqual([]);
    expect(evaluateEvent({}, null, rules)).toEqual([]);
  });

  it("respects the score threshold boundary", () => {
    expect(evaluateEvent({ participationScore: 69 }, null, rules)).toEqual([]);
    expect(evaluateEvent({ participationScore: 70 }, null, rules)).toEqual([
      { ruleKey: "active_participation", xpAmount: 25, coinAmount: 10 },
    ]);
  });

  it("filters activity-completion rules by program", () => {
    const discoveryEvent = evaluateEvent(
      { activityCompleted: true },
      "discovery",
      rules
    );
    expect(discoveryEvent).toEqual([
      {
        ruleKey: "discovery_activity_completed",
        xpAmount: 20,
        coinAmount: 8,
      },
    ]);

    const storyEvent = evaluateEvent(
      { activityCompleted: true },
      "story_craft",
      rules
    );
    expect(storyEvent).toEqual([
      { ruleKey: "story_activity_completed", xpAmount: 20, coinAmount: 8 },
    ]);

    expect(
      evaluateEvent({ activityCompleted: true }, "mission_english", rules)
    ).toEqual([]);
  });

  it("fires multiple rules from a single payload", () => {
    const triggered = evaluateEvent(
      { attendance: true, participationScore: 85 },
      null,
      rules
    );
    expect(triggered.map((t) => t.ruleKey).sort()).toEqual(
      ["active_participation", "class_attendance"].sort()
    );
  });

  it("skips inactive rules", () => {
    const triggered = evaluateEvent({ attendance: true }, null, rules);
    expect(triggered.some((t) => t.ruleKey === "retired_rule")).toBe(false);
  });
});
