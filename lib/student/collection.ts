import "server-only";
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { characters, studentCards, universes } from "@/lib/db/schema";

export async function getCollection(studentId: string) {
  const allUniverses = await db.select().from(universes).orderBy(asc(universes.sortOrder));
  const allCharacters = await db.select().from(characters).orderBy(asc(characters.sortOrder));
  const owned = await db.select().from(studentCards).where(eq(studentCards.studentId, studentId));
  const ownedMap = new Map(owned.map((o) => [o.characterId, o.quantity]));

  return allUniverses.map((universe) => {
    const universeCharacters = allCharacters
      .filter((c) => c.universeId === universe.id)
      .map((c) => ({
        id: c.id,
        key: c.key,
        name: c.name,
        rarity: c.rarity,
        imageUrl: c.imageUrl,
        flavorText: c.flavorText,
        owned: ownedMap.has(c.id),
        quantity: ownedMap.get(c.id) ?? 0,
      }));

    const ownedCount = universeCharacters.filter((c) => c.owned).length;

    return {
      universe: {
        id: universe.id,
        key: universe.key,
        name: universe.name,
        color: universe.color,
        iconUrl: universe.iconUrl,
      },
      characters: universeCharacters,
      progress: { owned: ownedCount, total: universeCharacters.length },
    };
  });
}
