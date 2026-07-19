"use client";

import { Suspense } from "react";
import type { AvatarEquippedKeys, AvatarMood } from "@/components/avatar/AvatarCharacter";
import { AnimalCharacter3D } from "./AnimalCharacter3D";

interface Character3DProps {
  equippedKeys: AvatarEquippedKeys;
  mood?: AvatarMood;
}

// Every species (including the cat) now renders from a real fetched glTF
// model via AnimalCharacter3D — see public/models/animals/CREDITS.md for
// what each model is and its license. This wrapper just supplies the
// Suspense boundary and the species_cat default for an unequipped avatar.
export function Character3D({ equippedKeys, mood = "neutral" }: Character3DProps) {
  const species = equippedKeys.species ?? "species_cat";
  return (
    <Suspense fallback={null}>
      <AnimalCharacter3D species={species} equippedKeys={equippedKeys} mood={mood} />
    </Suspense>
  );
}
