import { notFound } from "next/navigation";
import { Sparx } from "@/components/mascot/Sparx";
import { CreatureArt } from "@/components/creatures/CreatureArt";
import { BoosterPackIcon, ChestIcon, CoinIcon, FlameIcon, StarIcon } from "@/components/icons";
import type { Rarity } from "@/lib/reward-engine/types";

// Internal design-review page, not linked from anywhere in the product.
// Same non-production gate as /api/dev/simulate-event.

const UNIVERSES: Array<{ name: string; characters: Array<{ key: string; name: string; rarity: Rarity }> }> = [
  {
    name: "Ocean",
    characters: [
      { key: "dolphin", name: "Dolphin", rarity: "common" },
      { key: "turtle", name: "Turtle", rarity: "common" },
      { key: "octopus", name: "Octopus", rarity: "rare" },
      { key: "shark", name: "Shark", rarity: "epic" },
      { key: "whale", name: "Whale", rarity: "legendary" },
    ],
  },
  {
    name: "Dinosaur",
    characters: [
      { key: "triceratops", name: "Triceratops", rarity: "common" },
      { key: "stegosaurus", name: "Stegosaurus", rarity: "rare" },
      { key: "pterodactyl", name: "Pterodactyl", rarity: "epic" },
      { key: "t_rex", name: "T-Rex", rarity: "legendary" },
    ],
  },
  {
    name: "Space",
    characters: [
      { key: "space_cat", name: "Space Cat", rarity: "common" },
      { key: "astronaut", name: "Astronaut", rarity: "rare" },
      { key: "alien", name: "Alien", rarity: "epic" },
      { key: "rocket_robot", name: "Rocket Robot", rarity: "legendary" },
    ],
  },
  {
    name: "Story",
    characters: [
      { key: "fairy", name: "Fairy", rarity: "common" },
      { key: "knight", name: "Knight", rarity: "rare" },
      { key: "wizard", name: "Wizard", rarity: "epic" },
      { key: "dragon", name: "Dragon", rarity: "legendary" },
    ],
  },
  {
    name: "Discovery",
    characters: [
      { key: "explorer", name: "Explorer", rarity: "common" },
      { key: "scientist", name: "Scientist", rarity: "rare" },
      { key: "inventor", name: "Inventor", rarity: "epic" },
      { key: "archaeologist", name: "Archaeologist", rarity: "legendary" },
    ],
  },
];

export default function ShowcasePage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <div className="min-h-full bg-cream p-8">
      <h1 className="font-display mb-6 text-2xl font-bold">Design Showcase</h1>

      <section className="mb-10">
        <h2 className="font-display mb-3 text-lg font-semibold">Icons</h2>
        <div className="flex flex-wrap gap-6">
          <div className="flex flex-col items-center gap-2 rounded-2xl bg-white p-4">
            <CoinIcon size={56} />
            <span className="text-sm font-semibold">Coin</span>
          </div>
          <div className="flex flex-col items-center gap-2 rounded-2xl bg-white p-4">
            <FlameIcon size={56} />
            <span className="text-sm font-semibold">Flame</span>
          </div>
          <div className="flex flex-col items-center gap-2 rounded-2xl bg-white p-4">
            <StarIcon size={56} />
            <span className="text-sm font-semibold">Star</span>
          </div>
          <div className="flex flex-col items-center gap-2 rounded-2xl bg-white p-4">
            <ChestIcon size={90} />
            <span className="text-sm font-semibold">Chest (closed)</span>
          </div>
          <div className="flex flex-col items-center gap-2 rounded-2xl bg-white p-4">
            <ChestIcon size={90} open />
            <span className="text-sm font-semibold">Chest (open)</span>
          </div>
          <div className="flex flex-col items-center gap-2 rounded-2xl bg-white p-4">
            <BoosterPackIcon size={90} />
            <span className="text-sm font-semibold">Booster Pack</span>
          </div>
          <div className="flex flex-col items-center gap-2 rounded-2xl bg-white p-4">
            <BoosterPackIcon size={90} color="var(--color-rarity-legendary)" />
            <span className="text-sm font-semibold">Pack (legendary)</span>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="font-display mb-3 text-lg font-semibold">Sparx expressions</h2>
        <div className="flex flex-wrap gap-6">
          {(["idle", "cheer", "wink", "sleepy"] as const).map((expr) => (
            <div key={expr} className="flex flex-col items-center gap-2 rounded-2xl bg-white p-4">
              <Sparx expression={expr} size={140} />
              <span className="text-sm font-semibold">{expr}</span>
            </div>
          ))}
        </div>
      </section>

      {UNIVERSES.map((universe) => (
        <section key={universe.name} className="mb-10">
          <h2 className="font-display mb-3 text-lg font-semibold">{universe.name}</h2>
          <div className="flex flex-wrap gap-6">
            {universe.characters.map((c) => (
              <div key={c.key} className="flex flex-col items-center gap-2 rounded-2xl bg-white p-4">
                <CreatureArt characterKey={c.key} rarity={c.rarity} size={140} />
                <span className="text-sm font-semibold">{c.name}</span>
                <span className="text-xs text-ink/50">{c.rarity}</span>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
