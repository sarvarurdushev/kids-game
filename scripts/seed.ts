import "./_env";
import { createHash } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import {
  achievements,
  avatarItems,
  characters,
  dailyRewardCurve,
  levelCurve,
  packTypePool,
  packTypes,
  rewardRules,
  studentAvatarItems,
  studentExternalRefs,
  students,
  universes,
  webhookClients,
} from "@/lib/db/schema";
import { hashPin } from "@/lib/auth/pin";

function round50(n: number): number {
  return Math.round(n / 50) * 50;
}

async function main() {
  console.log("Seeding Golden Kids Adventure Universe...\n");

  // --- Universes ---------------------------------------------------------
  const universeRows = await db
    .insert(universes)
    .values([
      { key: "ocean", name: "Ocean Universe", color: "var(--color-universe-ocean)", sortOrder: 1 },
      { key: "dinosaur", name: "Dinosaur Universe", color: "var(--color-universe-dinosaur)", sortOrder: 2 },
      { key: "space", name: "Space Universe", color: "var(--color-universe-space)", sortOrder: 3 },
      { key: "story", name: "Story Universe", color: "var(--color-universe-story)", sortOrder: 4 },
      { key: "discovery", name: "Discovery Universe", color: "var(--color-universe-discovery)", sortOrder: 5 },
    ])
    .onConflictDoNothing()
    .returning();
  const universeByKey = new Map(universeRows.map((u) => [u.key, u]));
  console.log(`  universes: ${universeRows.length}`);

  // --- Characters ----------------------------------------------------------
  const characterSeed: Array<{
    universe: string;
    key: string;
    name: string;
    rarity: "common" | "rare" | "epic" | "legendary";
  }> = [
    { universe: "ocean", key: "dolphin", name: "Dolphin", rarity: "common" },
    { universe: "ocean", key: "turtle", name: "Turtle", rarity: "common" },
    { universe: "ocean", key: "octopus", name: "Octopus", rarity: "rare" },
    { universe: "ocean", key: "shark", name: "Shark", rarity: "epic" },
    { universe: "ocean", key: "whale", name: "Whale", rarity: "legendary" },

    { universe: "dinosaur", key: "triceratops", name: "Triceratops", rarity: "common" },
    { universe: "dinosaur", key: "stegosaurus", name: "Stegosaurus", rarity: "rare" },
    { universe: "dinosaur", key: "pterodactyl", name: "Pterodactyl", rarity: "epic" },
    { universe: "dinosaur", key: "t_rex", name: "T-Rex", rarity: "legendary" },

    { universe: "space", key: "space_cat", name: "Space Cat", rarity: "common" },
    { universe: "space", key: "astronaut", name: "Astronaut", rarity: "rare" },
    { universe: "space", key: "alien", name: "Alien", rarity: "epic" },
    { universe: "space", key: "rocket_robot", name: "Rocket Robot", rarity: "legendary" },

    { universe: "story", key: "fairy", name: "Fairy", rarity: "common" },
    { universe: "story", key: "knight", name: "Knight", rarity: "rare" },
    { universe: "story", key: "wizard", name: "Wizard", rarity: "epic" },
    { universe: "story", key: "dragon", name: "Dragon", rarity: "legendary" },

    { universe: "discovery", key: "explorer", name: "Explorer", rarity: "common" },
    { universe: "discovery", key: "scientist", name: "Scientist", rarity: "rare" },
    { universe: "discovery", key: "inventor", name: "Inventor", rarity: "epic" },
    { universe: "discovery", key: "archaeologist", name: "Archaeologist", rarity: "legendary" },
  ];

  const characterRows = await db
    .insert(characters)
    .values(
      characterSeed.map((c, i) => ({
        universeId: universeByKey.get(c.universe)!.id,
        key: c.key,
        name: c.name,
        rarity: c.rarity,
        sortOrder: i,
      }))
    )
    .onConflictDoNothing()
    .returning();
  console.log(`  characters: ${characterRows.length}`);

  // --- Pack types + pools --------------------------------------------------
  const packTypeRows = await db
    .insert(packTypes)
    .values([
      { key: "attendance_pack", name: "Attendance Pack", coinCost: 50, cardsPerPack: 3 },
      { key: "participation_pack", name: "Participation Pack", coinCost: 50, cardsPerPack: 3 },
      { key: "discovery_pack", name: "Discovery Pack", coinCost: 60, cardsPerPack: 3 },
      { key: "story_pack", name: "Story Pack", coinCost: 60, cardsPerPack: 3 },
      { key: "achievement_pack", name: "Achievement Pack", coinCost: 100, cardsPerPack: 3 },
    ])
    .onConflictDoNothing()
    .returning();
  const packTypeByKey = new Map(packTypeRows.map((p) => [p.key, p]));
  console.log(`  pack types: ${packTypeRows.length}`);

  const allUniverseIds = universeRows.map((u) => u.id);
  const poolRows: Array<{ packTypeId: string; universeId: string; weight: number }> = [];
  for (const key of ["attendance_pack", "participation_pack", "achievement_pack"]) {
    for (const universeId of allUniverseIds) {
      poolRows.push({ packTypeId: packTypeByKey.get(key)!.id, universeId, weight: 1 });
    }
  }
  poolRows.push({
    packTypeId: packTypeByKey.get("discovery_pack")!.id,
    universeId: universeByKey.get("discovery")!.id,
    weight: 1,
  });
  poolRows.push({
    packTypeId: packTypeByKey.get("story_pack")!.id,
    universeId: universeByKey.get("story")!.id,
    weight: 1,
  });
  const poolInserted = await db.insert(packTypePool).values(poolRows).onConflictDoNothing().returning();
  console.log(`  pack pools: ${poolInserted.length}`);

  // --- Avatar items ----------------------------------------------------------
  const avatarItemSeed = [
    { slot: "hair", key: "hair_brown", name: "Brown Hair", acquisitionMethod: "starter" as const },
    { slot: "hair", key: "hair_curly", name: "Curly Hair", acquisitionMethod: "level_unlock" as const, unlockLevel: 3 },
    { slot: "hair", key: "hair_spiky", name: "Spiky Hair", acquisitionMethod: "coin_purchase" as const, coinPrice: 40 },

    { slot: "eyes", key: "eyes_round", name: "Round Eyes", acquisitionMethod: "starter" as const },
    { slot: "eyes", key: "eyes_star", name: "Star Eyes", acquisitionMethod: "level_unlock" as const, unlockLevel: 4 },
    { slot: "eyes", key: "eyes_sparkle", name: "Sparkle Eyes", acquisitionMethod: "coin_purchase" as const, coinPrice: 30 },

    { slot: "clothes", key: "clothes_tshirt", name: "T-Shirt", acquisitionMethod: "starter" as const },
    { slot: "clothes", key: "clothes_hoodie", name: "Hoodie", acquisitionMethod: "level_unlock" as const, unlockLevel: 2 },
    { slot: "clothes", key: "clothes_dress", name: "Party Dress", acquisitionMethod: "coin_purchase" as const, coinPrice: 50 },
    { slot: "clothes", key: "clothes_superhero", name: "Superhero Suit", acquisitionMethod: "level_unlock" as const, unlockLevel: 6 },

    { slot: "hat", key: "hat_cap", name: "Baseball Cap", acquisitionMethod: "coin_purchase" as const, coinPrice: 25 },
    { slot: "hat", key: "hat_wizard", name: "Wizard Hat", acquisitionMethod: "achievement_unlock" as const },
    { slot: "hat", key: "hat_crown", name: "Golden Crown", acquisitionMethod: "level_unlock" as const, unlockLevel: 8 },
    { slot: "hat", key: "hat_party", name: "Party Hat", acquisitionMethod: "coin_purchase" as const, coinPrice: 35 },

    { slot: "accessory", key: "accessory_glasses", name: "Cool Glasses", acquisitionMethod: "coin_purchase" as const, coinPrice: 20 },
    { slot: "accessory", key: "accessory_bowtie", name: "Bow Tie", acquisitionMethod: "level_unlock" as const, unlockLevel: 3 },
    { slot: "accessory", key: "accessory_scarf", name: "Cozy Scarf", acquisitionMethod: "coin_purchase" as const, coinPrice: 25 },
    { slot: "accessory", key: "accessory_medal", name: "Champion Medal", acquisitionMethod: "achievement_unlock" as const },

    { slot: "background", key: "background_sunny", name: "Sunny Sky", acquisitionMethod: "starter" as const },
    { slot: "background", key: "background_stars", name: "Starry Night", acquisitionMethod: "level_unlock" as const, unlockLevel: 5 },
    { slot: "background", key: "background_rainbow", name: "Rainbow", acquisitionMethod: "coin_purchase" as const, coinPrice: 40 },
    { slot: "background", key: "background_forest", name: "Forest", acquisitionMethod: "level_unlock" as const, unlockLevel: 7 },
  ];

  const avatarItemRows = await db
    .insert(avatarItems)
    .values(
      avatarItemSeed.map((item) => ({
        slot: item.slot as "hair" | "eyes" | "clothes" | "hat" | "accessory" | "background",
        key: item.key,
        name: item.name,
        acquisitionMethod: item.acquisitionMethod,
        unlockLevel: "unlockLevel" in item ? item.unlockLevel : null,
        coinPrice: "coinPrice" in item ? item.coinPrice : null,
      }))
    )
    .onConflictDoNothing()
    .returning();
  const avatarItemByKey = new Map(avatarItemRows.map((a) => [a.key, a]));
  console.log(`  avatar items: ${avatarItemRows.length}`);

  // --- Reward rules ----------------------------------------------------------
  const rewardRuleRows = await db
    .insert(rewardRules)
    .values([
      {
        ruleKey: "class_attendance",
        triggerType: "boolean_field",
        sourceField: "attendance",
        xpAmount: 50,
        coinAmount: 20,
      },
      {
        ruleKey: "active_participation",
        triggerType: "score_threshold",
        sourceField: "participationScore",
        threshold: 70,
        xpAmount: 25,
        coinAmount: 10,
      },
      {
        ruleKey: "excellent_speaking",
        triggerType: "score_threshold",
        sourceField: "speakingScore",
        threshold: 80,
        xpAmount: 25,
        coinAmount: 10,
      },
      {
        ruleKey: "teamwork",
        triggerType: "score_threshold",
        sourceField: "teamworkScore",
        threshold: 70,
        xpAmount: 15,
        coinAmount: 6,
      },
      {
        ruleKey: "discovery_activity_completed",
        triggerType: "boolean_field",
        sourceField: "activityCompleted",
        programFilter: "discovery",
        xpAmount: 20,
        coinAmount: 8,
      },
      {
        ruleKey: "story_activity_completed",
        triggerType: "boolean_field",
        sourceField: "activityCompleted",
        programFilter: "story_craft",
        xpAmount: 20,
        coinAmount: 8,
      },
    ])
    .onConflictDoNothing()
    .returning();
  console.log(`  reward rules: ${rewardRuleRows.length}`);

  // --- Achievements ----------------------------------------------------------
  const achievementRows = await db
    .insert(achievements)
    .values([
      {
        key: "first_class",
        name: "First Class",
        description: "Attend your first class",
        eventKey: "class_attendance",
        threshold: 1,
        rewardCoins: 50,
        rewardPackTypeId: packTypeByKey.get("achievement_pack")!.id,
      },
      {
        key: "explorer",
        name: "Explorer",
        description: "Complete 10 Discovery classes",
        eventKey: "discovery_activity_completed",
        threshold: 10,
        rewardCoins: 100,
        rewardAvatarItemId: avatarItemByKey.get("hat_wizard")!.id,
      },
      {
        key: "story_master",
        name: "Story Master",
        description: "Complete 10 Story classes",
        eventKey: "story_activity_completed",
        threshold: 10,
        rewardCoins: 100,
      },
      {
        key: "team_player",
        name: "Team Player",
        description: "Receive a teamwork score 10 times",
        eventKey: "teamwork",
        threshold: 10,
        rewardCoins: 75,
      },
      {
        key: "speaker",
        name: "Speaker",
        description: "Speak English consistently",
        eventKey: "excellent_speaking",
        threshold: 15,
        rewardCoins: 125,
      },
      {
        key: "attendance_champion",
        name: "Attendance Champion",
        description: "Attend 30 classes",
        eventKey: "class_attendance",
        threshold: 30,
        rewardCoins: 200,
        rewardAvatarItemId: avatarItemByKey.get("accessory_medal")!.id,
      },
    ])
    .onConflictDoNothing()
    .returning();
  console.log(`  achievements: ${achievementRows.length}`);

  // --- Level curve (1-50) ------------------------------------------------
  const fixedLevels = [
    { level: 1, minXp: 0 },
    { level: 2, minXp: 100 },
    { level: 3, minXp: 250 },
    { level: 4, minXp: 500 },
    { level: 5, minXp: 1000 },
  ];
  let lastMinXp = fixedLevels[fixedLevels.length - 1].minXp;
  let lastDelta = 500; // delta(4 -> 5)
  const generatedLevels = [...fixedLevels];
  for (let level = 6; level <= 50; level++) {
    lastDelta = round50(lastDelta * 1.2);
    lastMinXp += lastDelta;
    generatedLevels.push({ level, minXp: lastMinXp });
  }

  const achievementPackId = packTypeByKey.get("achievement_pack")!.id;
  const levelCurveRows = await db
    .insert(levelCurve)
    .values(
      generatedLevels.map(({ level, minXp }) => ({
        level,
        minXp,
        bonusCoins: level === 1 ? 0 : level * 5,
        bonusPackTypeId: level > 1 && level % 5 === 0 ? achievementPackId : null,
      }))
    )
    .onConflictDoNothing()
    .returning();
  console.log(`  level curve rows: ${levelCurveRows.length}`);

  // --- Daily reward curve (7-day cycle) -----------------------------------
  const dailyRewardRows = await db
    .insert(dailyRewardCurve)
    .values([
      { cycleDay: 1, xpReward: 10, coinReward: 5 },
      { cycleDay: 2, xpReward: 10, coinReward: 5 },
      { cycleDay: 3, xpReward: 15, coinReward: 8 },
      { cycleDay: 4, xpReward: 15, coinReward: 8 },
      { cycleDay: 5, xpReward: 20, coinReward: 10 },
      { cycleDay: 6, xpReward: 20, coinReward: 10 },
      { cycleDay: 7, xpReward: 30, coinReward: 15, packTypeId: packTypeByKey.get("attendance_pack")!.id },
    ])
    .onConflictDoNothing()
    .returning();
  console.log(`  daily reward curve rows: ${dailyRewardRows.length}`);

  // --- Webhook clients (one per external classroom-AI repo) --------------
  const devSecrets: Record<string, string> = {
    goldenkids: "dev-secret-goldenkids",
    smart_class_vision: "dev-secret-smart-class-vision",
    class_seer_magic: "dev-secret-class-seer-magic",
    bright_class_lens: "dev-secret-bright-class-lens",
  };
  const webhookClientRows = await db
    .insert(webhookClients)
    .values(
      Object.entries(devSecrets).map(([sourceSystem, secret]) => ({
        sourceSystem,
        secretHash: createHash("sha256").update(secret).digest("hex"),
      }))
    )
    .onConflictDoNothing()
    .returning();
  console.log(`  webhook clients: ${webhookClientRows.length}`);
  if (webhookClientRows.length > 0) {
    console.log("  (dev secrets — local only, never use in production):");
    for (const [sourceSystem, secret] of Object.entries(devSecrets)) {
      console.log(`    ${sourceSystem}: ${secret}`);
    }
  }

  // --- Demo students -------------------------------------------------------
  const starterItemKeys = ["hair_brown", "eyes_round", "clothes_tshirt", "background_sunny"];
  const demoStudents = [
    { displayName: "Amira", enrollmentCode: "GOLD-AMIRA", pin: "1234", externalId: "demo-amira" },
    { displayName: "Jamal", enrollmentCode: "GOLD-JAMAL", pin: "4321", externalId: "demo-jamal" },
  ];

  for (const demo of demoStudents) {
    const existing = await db.query.students.findFirst({
      where: (s, { eq }) => eq(s.enrollmentCode, demo.enrollmentCode),
    });
    if (existing) {
      console.log(`  demo student already exists: ${demo.displayName} (code ${demo.enrollmentCode})`);
      continue;
    }

    const pinHash = await hashPin(demo.pin);
    const [student] = await db
      .insert(students)
      .values({
        displayName: demo.displayName,
        enrollmentCode: demo.enrollmentCode,
        pinHash,
      })
      .returning();

    const starterAssignments: Partial<Record<"hair" | "eyes" | "clothes" | "background", string>> = {};
    for (const key of starterItemKeys) {
      const item = avatarItemByKey.get(key)!;
      await db.insert(studentAvatarItems).values({
        studentId: student.id,
        avatarItemId: item.id,
        acquiredVia: "starter",
      });
      starterAssignments[item.slot as "hair" | "eyes" | "clothes" | "background"] = item.id;
    }
    await db
      .update(students)
      .set({
        equippedHairId: starterAssignments.hair,
        equippedEyesId: starterAssignments.eyes,
        equippedClothesId: starterAssignments.clothes,
        equippedBackgroundId: starterAssignments.background,
      })
      .where(eq(students.id, student.id));

    await db.insert(studentExternalRefs).values({
      studentId: student.id,
      sourceSystem: "goldenkids",
      externalId: demo.externalId,
    });

    console.log(
      `  demo student created: ${demo.displayName} — enrollment code "${demo.enrollmentCode}", PIN "${demo.pin}", external id "${demo.externalId}"`
    );
  }

  console.log("\nSeed complete.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$client.end();
  });
