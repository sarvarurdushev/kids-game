// Shared species "personality" grouping — reused by both the non-verbal
// voice synth (lib/sound.ts) and the 3D dance animation
// (components/three/AnimalCharacter3D.tsx) so a species' pitch and its
// dance style come from the same underlying size/energy family instead of
// two independently-tuned lists drifting apart.
export type SpeciesArchetype = "tiny" | "small" | "medium" | "large" | "fantasy";

export const SPECIES_ARCHETYPE: Record<string, SpeciesArchetype> = {
  species_rabbit: "tiny",
  species_fox: "tiny",
  species_monkey: "tiny",
  species_penguin: "tiny",
  species_cat: "small",
  species_dog: "small",
  species_sheep: "small",
  species_pig: "small",
  species_deer: "medium",
  species_donkey: "medium",
  species_cow: "medium",
  species_zebra: "medium",
  species_wolf: "medium",
  species_giraffe: "medium",
  species_bear: "large",
  species_lion: "large",
  species_tiger: "large",
  species_elephant: "large",
  species_panda: "large",
  species_dragon: "fantasy",
  species_unicorn: "fantasy",
};

export function getSpeciesArchetype(species: string): SpeciesArchetype {
  return SPECIES_ARCHETYPE[species] ?? "small";
}
