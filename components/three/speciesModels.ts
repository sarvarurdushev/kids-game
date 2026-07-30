// Pure data, deliberately kept dependency-free (no "use client", no
// react-three-fiber/drei imports) so it can be imported both by
// AnimalCharacter3D.tsx (the live renderer) AND scripts/render-thumbnails.ts
// (a plain Node script that pre-renders each species to a static PNG for the
// avatar shop grid) — one source of truth for "what species GLBs exist".

// Real, fetched CC0/CC-BY low-poly animal packs (see
// public/models/animals/CREDITS.md for per-model license/author).
export const SPECIES_MODEL_URL: Record<string, string> = {
  species_cat: "/models/animals/cat.glb",
  species_dog: "/models/animals/dog.glb",
  species_rabbit: "/models/animals/rabbit.glb",
  species_fox: "/models/animals/fox.glb",
  species_bear: "/models/animals/bear.glb",
  species_cow: "/models/animals/cow.glb",
  species_donkey: "/models/animals/donkey.glb",
  species_deer: "/models/animals/deer.glb",
  species_alpaca: "/models/animals/alpaca.glb",
  species_bull: "/models/animals/bull.glb",
  species_stag: "/models/animals/stag.glb",
  species_husky: "/models/animals/husky.glb",
  species_wolf: "/models/animals/wolf.glb",
  species_white_horse: "/models/animals/white_horse.glb",
  species_horse: "/models/animals/horse.glb",
  species_pig: "/models/animals/pig.glb",
  species_sheep: "/models/animals/sheep.glb",
  species_zebra: "/models/animals/zebra.glb",
  species_dragon: "/models/animals/dragon.glb",
  species_giraffe: "/models/animals/giraffe.glb",
  species_duck: "/models/animals/duck.glb",
  species_penguin: "/models/animals/penguin.glb",
  species_chicken: "/models/animals/chicken.glb",
  species_panda: "/models/animals/panda.glb",
  species_koala: "/models/animals/koala.glb",
  species_tiger: "/models/animals/tiger.glb",
  species_lion: "/models/animals/lion.glb",
  species_owl: "/models/animals/owl.glb",
  species_raccoon: "/models/animals/raccoon.glb",
  species_squirrel: "/models/animals/squirrel.glb",
  species_elephant: "/models/animals/elephant.glb",
  species_monkey: "/models/animals/monkey.glb",
  species_goat: "/models/animals/goat.glb",
  species_unicorn: "/models/animals/unicorn.glb",
};
