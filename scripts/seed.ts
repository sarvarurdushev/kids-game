import "./_env";
import { createHash } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import {
  achievements,
  avatarCaseRarityOdds,
  avatarCaseTypes,
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
  const universeInserted = await db
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
  // Re-fetch the full set (not just newly-inserted rows) so lookups below
  // work whether this is a fresh seed or a safe re-run against existing data.
  const universeRows = await db.select().from(universes);
  const universeByKey = new Map(universeRows.map((u) => [u.key, u]));
  console.log(`  universes: ${universeInserted.length} new (${universeRows.length} total)`);

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

  const characterInserted = await db
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
  console.log(`  characters: ${characterInserted.length} new`);

  // --- Pack types + pools --------------------------------------------------
  await db
    .insert(packTypes)
    .values([
      { key: "attendance_pack", name: "Attendance Pack", coinCost: 50, cardsPerPack: 3 },
      { key: "participation_pack", name: "Participation Pack", coinCost: 50, cardsPerPack: 3 },
      { key: "discovery_pack", name: "Discovery Pack", coinCost: 60, cardsPerPack: 3 },
      { key: "story_pack", name: "Story Pack", coinCost: 60, cardsPerPack: 3 },
      { key: "achievement_pack", name: "Achievement Pack", coinCost: 100, cardsPerPack: 3 },
    ])
    .onConflictDoNothing();
  const packTypeRows = await db.select().from(packTypes);
  const packTypeByKey = new Map(packTypeRows.map((p) => [p.key, p]));
  console.log(`  pack types: ${packTypeRows.length} total`);

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
  console.log(`  pack pools: ${poolInserted.length} new`);

  // --- Avatar items ----------------------------------------------------------
  const avatarItemSeed = [
    // Species is the animal itself (cat/dog/rabbit/fox/bear/...), drawn by
    // components/three/Character3D.tsx (dispatches cat vs.
    // components/three/AnimalCharacter3D.tsx for the rest) and
    // components/avatar/AvatarCharacter.tsx in 2D. Every species past the
    // cat starter is case_unlock — Subway-Surfers-style mystery cases
    // (scripts/seed.ts's avatarCaseTypeSeed below), not a level gate — so
    // growing the roster is just adding rows here, no new unlock tier.
    { slot: "species", key: "species_cat", name: "Cat", acquisitionMethod: "starter" as const },
    { slot: "species", key: "species_dog", name: "Dog", acquisitionMethod: "case_unlock" as const, rarity: "common" as const },
    { slot: "species", key: "species_rabbit", name: "Rabbit", acquisitionMethod: "case_unlock" as const, rarity: "common" as const },
    { slot: "species", key: "species_fox", name: "Fox", acquisitionMethod: "case_unlock" as const, rarity: "rare" as const },
    {
      slot: "species",
      key: "species_bear",
      name: "Sir Bearington",
      acquisitionMethod: "case_unlock" as const,
      rarity: "epic" as const,
      // A character that comes with its outfit already on — equipping the
      // species auto-equips these too (lib/student/avatar.ts).
      bundledItemKeys: ["hat_crown"],
    },
    // The rest of the roster — real fetched glTF models (some CC0
    // Quaternius, some CC-BY; see public/models/animals/CREDITS.md),
    // normalized by components/three/AnimalCharacter3D.tsx from each
    // model's own bounding box, so adding a species is just a URL + a rarity
    // here, no per-model tuning.
    { slot: "species", key: "species_cow", name: "Cow", acquisitionMethod: "case_unlock" as const, rarity: "common" as const },
    { slot: "species", key: "species_donkey", name: "Donkey", acquisitionMethod: "case_unlock" as const, rarity: "common" as const },
    { slot: "species", key: "species_bull", name: "Bull", acquisitionMethod: "case_unlock" as const, rarity: "common" as const, active: false },
    { slot: "species", key: "species_husky", name: "Husky", acquisitionMethod: "case_unlock" as const, rarity: "common" as const, active: false },
    { slot: "species", key: "species_horse", name: "Horse", acquisitionMethod: "case_unlock" as const, rarity: "common" as const, active: false },
    { slot: "species", key: "species_pig", name: "Pig", acquisitionMethod: "case_unlock" as const, rarity: "common" as const },
    { slot: "species", key: "species_sheep", name: "Sheep", acquisitionMethod: "case_unlock" as const, rarity: "common" as const },
    { slot: "species", key: "species_duck", name: "Duck", acquisitionMethod: "case_unlock" as const, rarity: "common" as const, active: false },
    { slot: "species", key: "species_chicken", name: "Chicken", acquisitionMethod: "case_unlock" as const, rarity: "common" as const, active: false },
    { slot: "species", key: "species_goat", name: "Goat", acquisitionMethod: "case_unlock" as const, rarity: "common" as const, active: false },

    { slot: "species", key: "species_deer", name: "Deer", acquisitionMethod: "case_unlock" as const, rarity: "rare" as const },
    { slot: "species", key: "species_alpaca", name: "Alpaca", acquisitionMethod: "case_unlock" as const, rarity: "rare" as const, active: false },
    { slot: "species", key: "species_wolf", name: "Wolf", acquisitionMethod: "case_unlock" as const, rarity: "rare" as const },
    { slot: "species", key: "species_owl", name: "Owl", acquisitionMethod: "case_unlock" as const, rarity: "rare" as const, active: false },
    { slot: "species", key: "species_raccoon", name: "Raccoon", acquisitionMethod: "case_unlock" as const, rarity: "rare" as const, active: false },
    { slot: "species", key: "species_squirrel", name: "Squirrel", acquisitionMethod: "case_unlock" as const, rarity: "rare" as const, active: false },

    { slot: "species", key: "species_stag", name: "Stag", acquisitionMethod: "case_unlock" as const, rarity: "epic" as const, active: false },
    { slot: "species", key: "species_white_horse", name: "White Horse", acquisitionMethod: "case_unlock" as const, rarity: "epic" as const, active: false },
    { slot: "species", key: "species_zebra", name: "Zebra", acquisitionMethod: "case_unlock" as const, rarity: "epic" as const },
    { slot: "species", key: "species_giraffe", name: "Giraffe", acquisitionMethod: "case_unlock" as const, rarity: "epic" as const },
    { slot: "species", key: "species_penguin", name: "Penguin", acquisitionMethod: "case_unlock" as const, rarity: "epic" as const },
    { slot: "species", key: "species_panda", name: "Panda", acquisitionMethod: "case_unlock" as const, rarity: "epic" as const },
    { slot: "species", key: "species_koala", name: "Koala", acquisitionMethod: "case_unlock" as const, rarity: "epic" as const, active: false },
    { slot: "species", key: "species_tiger", name: "Tiger", acquisitionMethod: "case_unlock" as const, rarity: "epic" as const },
    { slot: "species", key: "species_elephant", name: "Elephant", acquisitionMethod: "case_unlock" as const, rarity: "epic" as const },
    { slot: "species", key: "species_monkey", name: "Monkey", acquisitionMethod: "case_unlock" as const, rarity: "epic" as const },
    {
      slot: "species",
      key: "species_lion",
      name: "King Leo",
      acquisitionMethod: "case_unlock" as const,
      rarity: "epic" as const,
      bundledItemKeys: ["hat_crown"],
    },

    {
      slot: "species",
      key: "species_dragon",
      name: "Archmage Dragon",
      acquisitionMethod: "case_unlock" as const,
      rarity: "legendary" as const,
      bundledItemKeys: ["hat_wizard"],
    },
    { slot: "species", key: "species_unicorn", name: "Unicorn", acquisitionMethod: "case_unlock" as const, rarity: "legendary" as const },

    { slot: "hair", key: "hair_brown", name: "Ginger Fur", acquisitionMethod: "starter" as const },
    { slot: "hair", key: "hair_curly", name: "Fluffy Fur", acquisitionMethod: "level_unlock" as const, unlockLevel: 3 },
    { slot: "hair", key: "hair_spiky", name: "Tuxedo Fur", acquisitionMethod: "coin_purchase" as const, coinPrice: 40 },

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

    { slot: "wallpaper", key: "wallpaper_plain", name: "Cozy Cream", acquisitionMethod: "starter" as const },
    { slot: "wallpaper", key: "wallpaper_stripes", name: "Candy Stripes", acquisitionMethod: "coin_purchase" as const, coinPrice: 30 },
    { slot: "wallpaper", key: "wallpaper_stars", name: "Night Sky", acquisitionMethod: "level_unlock" as const, unlockLevel: 3 },
    { slot: "wallpaper", key: "wallpaper_dots", name: "Polka Dots", acquisitionMethod: "coin_purchase" as const, coinPrice: 35 },

    { slot: "floor", key: "floor_wood", name: "Wood Floor", acquisitionMethod: "starter" as const },
    { slot: "floor", key: "floor_rug", name: "Cozy Rug", acquisitionMethod: "coin_purchase" as const, coinPrice: 25 },
    { slot: "floor", key: "floor_tile", name: "Checker Tile", acquisitionMethod: "level_unlock" as const, unlockLevel: 4 },
    { slot: "floor", key: "floor_grass", name: "Grass", acquisitionMethod: "coin_purchase" as const, coinPrice: 30 },

    { slot: "furniture", key: "furniture_plant", name: "Potted Plant", acquisitionMethod: "starter" as const },
    { slot: "furniture", key: "furniture_lamp", name: "Reading Lamp", acquisitionMethod: "coin_purchase" as const, coinPrice: 20 },
    { slot: "furniture", key: "furniture_chest", name: "Toy Chest", acquisitionMethod: "level_unlock" as const, unlockLevel: 6 },
    { slot: "furniture", key: "furniture_bookshelf", name: "Bookshelf", acquisitionMethod: "coin_purchase" as const, coinPrice: 35 },
  ];

  await db
    .insert(avatarItems)
    .values(
      avatarItemSeed.map((item) => ({
        slot: item.slot as
          | "species"
          | "hair"
          | "eyes"
          | "clothes"
          | "hat"
          | "accessory"
          | "background"
          | "wallpaper"
          | "floor"
          | "furniture",
        key: item.key,
        name: item.name,
        acquisitionMethod: item.acquisitionMethod,
        unlockLevel: "unlockLevel" in item ? item.unlockLevel : null,
        coinPrice: "coinPrice" in item ? item.coinPrice : null,
        rarity: "rarity" in item ? item.rarity : ("common" as const),
        bundledItemKeys: "bundledItemKeys" in item ? item.bundledItemKeys : null,
        active: "active" in item ? item.active : true,
      }))
    )
    .onConflictDoNothing();
  const avatarItemRows = await db.select().from(avatarItems);
  const avatarItemByKey = new Map(avatarItemRows.map((a) => [a.key, a]));
  console.log(`  avatar items: ${avatarItemRows.length} total`);

  // --- Avatar cases (Subway-Surfers-style mystery unlocks) ------------------
  const avatarCaseTypeSeed = [
    { key: "case_species", name: "Character Case", slot: "species" as const, coinCost: 100 },
  ];
  await db.insert(avatarCaseTypes).values(avatarCaseTypeSeed).onConflictDoNothing();
  const avatarCaseTypeRows = await db.select().from(avatarCaseTypes);
  console.log(`  avatar case types: ${avatarCaseTypeRows.length} total`);

  const caseRarityOddsSeed = avatarCaseTypeRows.flatMap((caseType) => [
    { caseTypeId: caseType.id, rarity: "common" as const, weight: 60 },
    { caseTypeId: caseType.id, rarity: "rare" as const, weight: 25 },
    { caseTypeId: caseType.id, rarity: "epic" as const, weight: 10 },
    { caseTypeId: caseType.id, rarity: "legendary" as const, weight: 5 },
  ]);
  await db.insert(avatarCaseRarityOdds).values(caseRarityOddsSeed).onConflictDoNothing();

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
  const starterItemKeys = [
    "species_cat",
    "hair_brown",
    "eyes_round",
    "clothes_tshirt",
    "background_sunny",
    "wallpaper_plain",
    "floor_wood",
    "furniture_plant",
  ];
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

    const starterAssignments: Partial<
      Record<"species" | "hair" | "eyes" | "clothes" | "background" | "wallpaper" | "floor" | "furniture", string>
    > = {};
    for (const key of starterItemKeys) {
      const item = avatarItemByKey.get(key)!;
      await db.insert(studentAvatarItems).values({
        studentId: student.id,
        avatarItemId: item.id,
        acquiredVia: "starter",
      });
      starterAssignments[
        item.slot as "species" | "hair" | "eyes" | "clothes" | "background" | "wallpaper" | "floor" | "furniture"
      ] = item.id;
    }
    await db
      .update(students)
      .set({
        equippedSpeciesId: starterAssignments.species,
        equippedHairId: starterAssignments.hair,
        equippedEyesId: starterAssignments.eyes,
        equippedClothesId: starterAssignments.clothes,
        equippedBackgroundId: starterAssignments.background,
        equippedWallpaperId: starterAssignments.wallpaper,
        equippedFloorId: starterAssignments.floor,
        equippedFurnitureId: starterAssignments.furniture,
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
