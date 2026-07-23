import "./_env";
import { createHash } from "node:crypto";
import { eq, inArray } from "drizzle-orm";
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
  roomSets,
  studentAvatarItems,
  studentExternalRefs,
  students,
  universes,
  webhookClients,
} from "@/lib/db/schema";
import { hashPin } from "@/lib/auth/pin";
import { CURRICULUM } from "@/lib/games/curriculum";

// Collection universes are the 12 curriculum months themselves (see
// lib/games/curriculum.ts) — one CSS color per topic, matching app/globals.css.
const UNIVERSE_COLOR: Record<string, string> = {
  space: "var(--color-universe-space)",
  culture: "var(--color-universe-culture)",
  friends: "var(--color-universe-friends)",
  environment: "var(--color-universe-environment)",
  family: "var(--color-universe-family)",
  animals: "var(--color-universe-animals)",
  weather: "var(--color-universe-weather)",
  travel: "var(--color-universe-travel)",
  body: "var(--color-universe-body)",
  halloween: "var(--color-universe-halloween)",
  emotions: "var(--color-universe-emotions)",
  christmas: "var(--color-universe-christmas)",
};

function round50(n: number): number {
  return Math.round(n / 50) * 50;
}

async function main() {
  console.log("Seeding Golden Kids Adventure Universe...\n");

  // --- Universes -----------------------------------------------------------
  // The collection is *only* the 12 curriculum months (task: "collections
  // should be only related to the curriculums") — replaces the old 5
  // unrelated fantasy universes (ocean/dinosaur/space/story/discovery)
  // entirely. Old universes are deleted first (cascades to their characters
  // and any owned student_cards) so a re-run of this script cleanly migrates
  // existing data rather than leaving orphaned rows alongside the new set.
  await db.delete(universes).where(
    inArray(universes.key, ["ocean", "dinosaur", "space", "story", "discovery"])
  );

  const universeInserted = await db
    .insert(universes)
    .values(
      CURRICULUM.map((topic) => ({
        key: topic.key,
        name: topic.label,
        color: UNIVERSE_COLOR[topic.key],
        sortOrder: topic.month,
      }))
    )
    .onConflictDoNothing()
    .returning();
  // Re-fetch the full set (not just newly-inserted rows) so lookups below
  // work whether this is a fresh seed or a safe re-run against existing data.
  const universeRows = await db.select().from(universes);
  const universeByKey = new Map(universeRows.map((u) => [u.key, u]));
  console.log(`  universes: ${universeInserted.length} new (${universeRows.length} total)`);

  // --- Characters ------------------------------------------------------------
  // 10 cards per month (common x3/rare x3/epic x2/legendary x2), each reusing
  // a word+emoji already authored for that month's vocabulary
  // (lib/games/wordBank.ts) — imageUrl holds the emoji directly (the
  // placeholder visual system documented in lib/visuals.ts), since these are
  // new topics with no hand-illustrated art the way the old 21 fantasy
  // creatures had.
  const characterSeed: Array<{
    universe: string;
    key: string;
    name: string;
    emoji: string;
    rarity: "common" | "rare" | "epic" | "legendary";
  }> = [
    { universe: "space", key: "rocket", name: "Rocket", emoji: "🚀", rarity: "common" },
    { universe: "space", key: "moon", name: "Moon", emoji: "🌙", rarity: "common" },
    { universe: "space", key: "astronaut", name: "Astronaut", emoji: "👨‍🚀", rarity: "rare" },
    { universe: "space", key: "galaxy", name: "Galaxy", emoji: "🌌", rarity: "epic" },
    { universe: "space", key: "cosmos", name: "Cosmos", emoji: "✨", rarity: "legendary" },
    { universe: "space", key: "star", name: "Star", emoji: "⭐", rarity: "common" },
    { universe: "space", key: "planet", name: "Planet", emoji: "🪐", rarity: "rare" },
    { universe: "space", key: "alien", name: "Alien", emoji: "👽", rarity: "rare" },
    { universe: "space", key: "telescope", name: "Telescope", emoji: "🔭", rarity: "epic" },
    { universe: "space", key: "universe", name: "Universe", emoji: "🌠", rarity: "legendary" },

    { universe: "culture", key: "flag", name: "Flag", emoji: "🚩", rarity: "common" },
    { universe: "culture", key: "song", name: "Song", emoji: "🎶", rarity: "common" },
    { universe: "culture", key: "festival", name: "Festival", emoji: "🎉", rarity: "rare" },
    { universe: "culture", key: "instrument", name: "Instrument", emoji: "🪘", rarity: "epic" },
    { universe: "culture", key: "celebrate", name: "Celebrate", emoji: "🎇", rarity: "legendary" },
    { universe: "culture", key: "music", name: "Music", emoji: "🎵", rarity: "common" },
    { universe: "culture", key: "drum", name: "Drum", emoji: "🥁", rarity: "rare" },
    { universe: "culture", key: "parade", name: "Parade", emoji: "🎊", rarity: "rare" },
    { universe: "culture", key: "guitar", name: "Guitar", emoji: "🎸", rarity: "epic" },
    { universe: "culture", key: "violin", name: "Violin", emoji: "🎻", rarity: "legendary" },

    { universe: "friends", key: "friend", name: "Friend", emoji: "👫", rarity: "common" },
    { universe: "friends", key: "smile", name: "Smile", emoji: "😊", rarity: "common" },
    { universe: "friends", key: "birthday", name: "Birthday", emoji: "🎈", rarity: "rare" },
    { universe: "friends", key: "trust", name: "Trust", emoji: "🤞", rarity: "epic" },
    { universe: "friends", key: "cheerful", name: "Cheerful", emoji: "😃", rarity: "legendary" },
    { universe: "friends", key: "share", name: "Share", emoji: "🤝", rarity: "common" },
    { universe: "friends", key: "hug", name: "Hug", emoji: "🤗", rarity: "rare" },
    { universe: "friends", key: "party", name: "Party", emoji: "🥳", rarity: "rare" },
    { universe: "friends", key: "laugh", name: "Laugh", emoji: "😂", rarity: "epic" },
    { universe: "friends", key: "together", name: "Together", emoji: "👬", rarity: "legendary" },

    { universe: "environment", key: "tree", name: "Tree", emoji: "🌳", rarity: "common" },
    { universe: "environment", key: "flower", name: "Flower", emoji: "🌸", rarity: "common" },
    { universe: "environment", key: "forest", name: "Forest", emoji: "🌲", rarity: "rare" },
    { universe: "environment", key: "ocean", name: "Ocean", emoji: "🌊", rarity: "epic" },
    { universe: "environment", key: "protect", name: "Protect", emoji: "🛡️", rarity: "legendary" },
    { universe: "environment", key: "leaf", name: "Leaf", emoji: "🍃", rarity: "common" },
    { universe: "environment", key: "river", name: "River", emoji: "🏞️", rarity: "rare" },
    { universe: "environment", key: "mountain", name: "Mountain", emoji: "⛰️", rarity: "rare" },
    { universe: "environment", key: "recycle", name: "Recycle", emoji: "♻️", rarity: "epic" },
    { universe: "environment", key: "nature", name: "Nature", emoji: "🍀", rarity: "legendary" },

    { universe: "family", key: "family_mom", name: "Mom", emoji: "👩", rarity: "common" },
    { universe: "family", key: "family_dad", name: "Dad", emoji: "👨", rarity: "common" },
    { universe: "family", key: "family_grandma", name: "Grandma", emoji: "👵", rarity: "rare" },
    { universe: "family", key: "family_cousin", name: "Cousin", emoji: "🧒", rarity: "epic" },
    { universe: "family", key: "family_together", name: "Family", emoji: "👪", rarity: "legendary" },
    { universe: "family", key: "family_baby", name: "Baby", emoji: "👶", rarity: "common" },
    { universe: "family", key: "family_sister", name: "Sister", emoji: "👧", rarity: "rare" },
    { universe: "family", key: "family_brother", name: "Brother", emoji: "👦", rarity: "rare" },
    { universe: "family", key: "family_aunt", name: "Aunt", emoji: "👩", rarity: "epic" },
    { universe: "family", key: "family_uncle", name: "Uncle", emoji: "👨", rarity: "legendary" },

    { universe: "animals", key: "card_cat", name: "Cat", emoji: "🐱", rarity: "common" },
    { universe: "animals", key: "card_dog", name: "Dog", emoji: "🐶", rarity: "common" },
    { universe: "animals", key: "card_lion", name: "Lion", emoji: "🦁", rarity: "rare" },
    { universe: "animals", key: "card_elephant", name: "Elephant", emoji: "🐘", rarity: "epic" },
    { universe: "animals", key: "card_giraffe", name: "Giraffe", emoji: "🦒", rarity: "legendary" },
    { universe: "animals", key: "card_fish", name: "Fish", emoji: "🐟", rarity: "common" },
    { universe: "animals", key: "card_rabbit", name: "Rabbit", emoji: "🐰", rarity: "rare" },
    { universe: "animals", key: "card_tiger", name: "Tiger", emoji: "🐯", rarity: "rare" },
    { universe: "animals", key: "card_zebra", name: "Zebra", emoji: "🦓", rarity: "epic" },
    { universe: "animals", key: "card_penguin", name: "Penguin", emoji: "🐧", rarity: "legendary" },

    { universe: "weather", key: "card_sun", name: "Sun", emoji: "☀️", rarity: "common" },
    { universe: "weather", key: "card_rain", name: "Rain", emoji: "🌧️", rarity: "common" },
    { universe: "weather", key: "card_storm", name: "Storm", emoji: "⛈️", rarity: "rare" },
    { universe: "weather", key: "card_rainbow", name: "Rainbow", emoji: "🌈", rarity: "epic" },
    { universe: "weather", key: "card_thunder", name: "Thunder", emoji: "⚡", rarity: "legendary" },
    { universe: "weather", key: "card_snow", name: "Snow", emoji: "❄️", rarity: "common" },
    { universe: "weather", key: "card_cloud", name: "Cloud", emoji: "☁️", rarity: "rare" },
    { universe: "weather", key: "card_wind", name: "Wind", emoji: "💨", rarity: "rare" },
    { universe: "weather", key: "card_foggy", name: "Foggy", emoji: "🌫️", rarity: "epic" },
    { universe: "weather", key: "card_cold", name: "Cold", emoji: "🥶", rarity: "legendary" },

    { universe: "travel", key: "card_car", name: "Car", emoji: "🚗", rarity: "common" },
    { universe: "travel", key: "card_boat", name: "Boat", emoji: "⛵", rarity: "common" },
    { universe: "travel", key: "card_airplane", name: "Airplane", emoji: "✈️", rarity: "rare" },
    { universe: "travel", key: "card_passport", name: "Passport", emoji: "🛂", rarity: "epic" },
    { universe: "travel", key: "card_adventure", name: "Adventure", emoji: "🧭", rarity: "legendary" },
    { universe: "travel", key: "card_bus", name: "Bus", emoji: "🚌", rarity: "common" },
    { universe: "travel", key: "card_train", name: "Train", emoji: "🚂", rarity: "rare" },
    { universe: "travel", key: "card_map", name: "Map", emoji: "🗺️", rarity: "rare" },
    { universe: "travel", key: "card_island", name: "Island", emoji: "🏝️", rarity: "epic" },
    { universe: "travel", key: "card_journey", name: "Journey", emoji: "🚶", rarity: "legendary" },

    { universe: "body", key: "card_eye", name: "Eye", emoji: "👁️", rarity: "common" },
    { universe: "body", key: "card_hand", name: "Hand", emoji: "✋", rarity: "common" },
    { universe: "body", key: "card_head", name: "Head", emoji: "🧑", rarity: "rare" },
    { universe: "body", key: "card_finger", name: "Finger", emoji: "👆", rarity: "epic" },
    { universe: "body", key: "card_shoulder", name: "Shoulder", emoji: "🤷", rarity: "legendary" },
    { universe: "body", key: "card_ear", name: "Ear", emoji: "👂", rarity: "common" },
    { universe: "body", key: "card_nose", name: "Nose", emoji: "👃", rarity: "rare" },
    { universe: "body", key: "card_mouth", name: "Mouth", emoji: "👄", rarity: "rare" },
    { universe: "body", key: "card_tooth", name: "Tooth", emoji: "🦷", rarity: "epic" },
    { universe: "body", key: "card_knee", name: "Knee", emoji: "🦵", rarity: "legendary" },

    { universe: "halloween", key: "card_pumpkin", name: "Pumpkin", emoji: "🎃", rarity: "common" },
    { universe: "halloween", key: "card_ghost", name: "Ghost", emoji: "👻", rarity: "common" },
    { universe: "halloween", key: "card_witch", name: "Witch", emoji: "🧙", rarity: "rare" },
    { universe: "halloween", key: "card_vampire", name: "Vampire", emoji: "🧛", rarity: "epic" },
    { universe: "halloween", key: "card_haunted", name: "Haunted House", emoji: "🏚️", rarity: "legendary" },
    { universe: "halloween", key: "card_bat", name: "Bat", emoji: "🦇", rarity: "common" },
    { universe: "halloween", key: "card_spider", name: "Spider", emoji: "🕷️", rarity: "rare" },
    { universe: "halloween", key: "card_skeleton", name: "Skeleton", emoji: "💀", rarity: "rare" },
    { universe: "halloween", key: "card_monster", name: "Monster", emoji: "👹", rarity: "epic" },
    { universe: "halloween", key: "card_spooky", name: "Spooky", emoji: "😱", rarity: "legendary" },

    { universe: "emotions", key: "card_happy", name: "Happy", emoji: "😄", rarity: "common" },
    { universe: "emotions", key: "card_sad", name: "Sad", emoji: "😢", rarity: "common" },
    { universe: "emotions", key: "card_excited", name: "Excited", emoji: "🤩", rarity: "rare" },
    { universe: "emotions", key: "card_brave", name: "Brave", emoji: "🦸", rarity: "epic" },
    { universe: "emotions", key: "card_grateful", name: "Grateful", emoji: "🙏", rarity: "legendary" },
    { universe: "emotions", key: "card_angry", name: "Angry", emoji: "😠", rarity: "common" },
    { universe: "emotions", key: "card_scared", name: "Scared", emoji: "😱", rarity: "rare" },
    { universe: "emotions", key: "card_surprised", name: "Surprised", emoji: "😲", rarity: "rare" },
    { universe: "emotions", key: "card_proud", name: "Proud", emoji: "🥹", rarity: "epic" },
    { universe: "emotions", key: "card_curious", name: "Curious", emoji: "🤔", rarity: "legendary" },

    { universe: "christmas", key: "card_santa", name: "Santa", emoji: "🎅", rarity: "common" },
    { universe: "christmas", key: "card_snowman", name: "Snowman", emoji: "⛄", rarity: "common" },
    { universe: "christmas", key: "card_reindeer", name: "Reindeer", emoji: "🦌", rarity: "rare" },
    { universe: "christmas", key: "card_elf", name: "Elf", emoji: "🧝", rarity: "epic" },
    { universe: "christmas", key: "card_gingerbread", name: "Gingerbread", emoji: "🍪", rarity: "legendary" },
    { universe: "christmas", key: "card_present", name: "Present", emoji: "🎁", rarity: "common" },
    { universe: "christmas", key: "card_sleigh", name: "Sleigh", emoji: "🛷", rarity: "rare" },
    { universe: "christmas", key: "card_stocking", name: "Stocking", emoji: "🧦", rarity: "rare" },
    { universe: "christmas", key: "card_wreath", name: "Wreath", emoji: "🎄", rarity: "epic" },
    { universe: "christmas", key: "card_snowflake", name: "Snowflake", emoji: "❄️", rarity: "legendary" },
  ];

  const characterInserted = await db
    .insert(characters)
    .values(
      characterSeed.map((c, i) => ({
        universeId: universeByKey.get(c.universe)!.id,
        key: c.key,
        name: c.name,
        rarity: c.rarity,
        imageUrl: c.emoji,
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

  // Every pack type draws from every curriculum-month universe — the old
  // "discovery_pack"/"story_pack" restriction to one specific universe no
  // longer makes sense now that universes ARE the 12 months, not unrelated
  // themes. Which of those months a student can actually *receive* a card
  // from is enforced at open time (lib/student/packs.ts), not here — this
  // pool is just "everything that could ever exist," unlocked-or-not.
  const allUniverseIds = universeRows.map((u) => u.id);
  const poolRows: Array<{ packTypeId: string; universeId: string; weight: number }> = [];
  for (const key of ["attendance_pack", "participation_pack", "discovery_pack", "story_pack", "achievement_pack"]) {
    for (const universeId of allUniverseIds) {
      poolRows.push({ packTypeId: packTypeByKey.get(key)!.id, universeId, weight: 1 });
    }
  }
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

  // --- Room sets (buy a whole coordinated room in one purchase) -------------
  // Only bundles wallpaper/floor/furniture that are individually
  // coin_purchase (never a level_unlock piece — bundling one of those would
  // let coins buy past a level gate). Priced below the sum of the three
  // pieces bought separately, so the bundle is a genuine discount, not just
  // a repackaging.
  const roomSetSeed = [
    {
      key: "room_set_candy_cozy",
      name: "Candy Cozy Room",
      wallpaper: "wallpaper_stripes",
      floor: "floor_rug",
      furniture: "furniture_lamp",
      coinPrice: 60, // vs. 30 + 25 + 20 = 75 bought separately
    },
    {
      key: "room_set_garden_nook",
      name: "Garden Reading Nook",
      wallpaper: "wallpaper_dots",
      floor: "floor_grass",
      furniture: "furniture_bookshelf",
      coinPrice: 80, // vs. 35 + 30 + 35 = 100 bought separately
    },
  ];
  const roomSetInserted = await db
    .insert(roomSets)
    .values(
      roomSetSeed.map((set) => ({
        key: set.key,
        name: set.name,
        coinPrice: set.coinPrice,
        wallpaperItemId: avatarItemByKey.get(set.wallpaper)!.id,
        floorItemId: avatarItemByKey.get(set.floor)!.id,
        furnitureItemId: avatarItemByKey.get(set.furniture)!.id,
      }))
    )
    .onConflictDoNothing()
    .returning();
  console.log(`  room sets: ${roomSetInserted.length} new`);

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

  // --- Admin login (isAdmin bypasses the economy - see lib/student/avatar.ts,
  // lib/student/collection.ts, lib/reward-engine/gameUnlocks.ts) -----------
  // A dedicated login, deliberately separate from the Amira/Jamal demo
  // students so those stay normal, rules-following test accounts.
  const adminEnrollmentCode = "GOLD-ADMIN";
  const existingAdmin = await db.query.students.findFirst({
    where: (s, { eq }) => eq(s.enrollmentCode, adminEnrollmentCode),
  });
  if (existingAdmin) {
    console.log(`  admin student already exists: Admin (code ${adminEnrollmentCode})`);
  } else {
    const adminPinHash = await hashPin("0000");
    const [adminStudent] = await db
      .insert(students)
      .values({
        displayName: "Admin",
        enrollmentCode: adminEnrollmentCode,
        pinHash: adminPinHash,
        isAdmin: true,
        coinsBalance: 999999,
      })
      .returning();

    const adminStarterAssignments: Partial<
      Record<"species" | "hair" | "eyes" | "clothes" | "background" | "wallpaper" | "floor" | "furniture", string>
    > = {};
    for (const key of starterItemKeys) {
      const item = avatarItemByKey.get(key)!;
      await db.insert(studentAvatarItems).values({
        studentId: adminStudent.id,
        avatarItemId: item.id,
        acquiredVia: "starter",
      });
      adminStarterAssignments[
        item.slot as "species" | "hair" | "eyes" | "clothes" | "background" | "wallpaper" | "floor" | "furniture"
      ] = item.id;
    }
    await db
      .update(students)
      .set({
        equippedSpeciesId: adminStarterAssignments.species,
        equippedHairId: adminStarterAssignments.hair,
        equippedEyesId: adminStarterAssignments.eyes,
        equippedClothesId: adminStarterAssignments.clothes,
        equippedBackgroundId: adminStarterAssignments.background,
        equippedWallpaperId: adminStarterAssignments.wallpaper,
        equippedFloorId: adminStarterAssignments.floor,
        equippedFurnitureId: adminStarterAssignments.furniture,
      })
      .where(eq(students.id, adminStudent.id));

    console.log(`  admin student created: Admin — enrollment code "${adminEnrollmentCode}", PIN "0000"`);
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
