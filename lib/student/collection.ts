import "server-only";
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { characters, studentCards, universes } from "@/lib/db/schema";
import { getCurrentCurriculum } from "@/lib/games/curriculum";

const MONTH_NAME = new Intl.DateTimeFormat("en-US", { month: "long" });

// Each universe's sortOrder IS its curriculum month (1-12, set in
// scripts/seed.ts from lib/games/curriculum.ts) — a universe is locked until
// its month arrives, then stays unlocked for the rest of the year.
export async function getCollection(studentId: string) {
  const { month: currentMonth } = getCurrentCurriculum();
  const allUniverses = await db.select().from(universes).orderBy(asc(universes.sortOrder));
  const allCharacters = await db.select().from(characters).orderBy(asc(characters.sortOrder));
  const owned = await db.select().from(studentCards).where(eq(studentCards.studentId, studentId));
  const ownedMap = new Map(owned.map((o) => [o.characterId, o.quantity]));

  return allUniverses.map((universe) => {
    const locked = universe.sortOrder > currentMonth;
    const universeCharacters = allCharacters
      .filter((c) => c.universeId === universe.id)
      .map((c) => ({
        id: c.id,
        key: c.key,
        name: c.name,
        rarity: c.rarity,
        imageUrl: c.imageUrl,
        flavorText: c.flavorText,
        owned: !locked && ownedMap.has(c.id),
        quantity: locked ? 0 : (ownedMap.get(c.id) ?? 0),
      }));

    const ownedCount = universeCharacters.filter((c) => c.owned).length;

    return {
      universe: {
        id: universe.id,
        key: universe.key,
        name: universe.name,
        color: universe.color,
        iconUrl: universe.iconUrl,
        locked,
        unlocksInMonthName: locked ? MONTH_NAME.format(new Date(2000, universe.sortOrder - 1, 1)) : null,
      },
      characters: universeCharacters,
      progress: { owned: ownedCount, total: universeCharacters.length },
    };
  });
}
