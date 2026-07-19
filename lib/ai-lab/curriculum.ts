import type { GameKey } from "@/lib/reward-engine/gameSession";

export function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** "Little Sparks" (4-5, pre-reader) vs "AI Explorers" (6+, early reader). See docs/AI_CURRICULUM.md. */
export type AgeTrack = "little_sparks" | "explorers";

export const AGE_TRACKS: { key: AgeTrack; label: string; ageRange: string; blurb: string }[] = [
  {
    key: "little_sparks",
    label: "Little Sparks",
    ageRange: "Ages 4-5",
    blurb: "Big pictures, read-aloud everything, no clock ticking.",
  },
  {
    key: "explorers",
    label: "AI Explorers",
    ageRange: "Ages 6+",
    blurb: "More words, a gentle timer, and the real AI vocabulary.",
  },
];

export type BigIdea = "perception" | "learning" | "reasoning" | "natural_interaction" | "societal_impact";

export const BIG_IDEA_LABELS: Record<BigIdea, string> = {
  perception: "Perception",
  learning: "Learning",
  reasoning: "Representation & Reasoning",
  natural_interaction: "Natural Interaction",
  societal_impact: "Societal Impact",
};

export interface AiLabUnit {
  key: string;
  title: string;
  bigIdeas: BigIdea[];
  tagline: string;
  sparxIntro: string[];
  englishFocus: string;
  talkAboutIt: string;
  gameKey: GameKey | null;
  href: string;
  minTrack?: AgeTrack;
}

export const AI_LAB_UNITS: AiLabUnit[] = [
  {
    key: "teach_sparx_to_sort",
    title: "Teach Sparx to Sort",
    bigIdeas: ["perception", "learning", "societal_impact"],
    tagline: "Sort pictures into groups, then check Sparx's guesses.",
    sparxIntro: [
      "Hi, I'm Sparx! I want to learn how to sort things.",
      "You show me examples, and I'll try to learn the pattern.",
      "Sometimes I'll get it wrong at first — that's how learning works!",
    ],
    englishFocus: "Category words like animal, vehicle, fruit, and vegetable.",
    talkAboutIt:
      "Where else have you seen something try to guess what a picture is — a photo app that finds people, or a game that knows your voice?",
    gameKey: "train_the_robot",
    href: "/ai-lab/train-the-robot",
  },
  {
    key: "give_sparx_the_steps",
    title: "Give Sparx the Steps",
    bigIdeas: ["reasoning"],
    tagline: "Put the steps of a routine in the right order.",
    sparxIntro: [
      "Robots do exactly what you tell them — in exactly the order you tell them!",
      "That list of steps is called an algorithm.",
      "Help me put these steps in order, from first to last.",
    ],
    englishFocus: "Sequencing words: first, next, then, and last.",
    talkAboutIt:
      "What would happen if you told Sparx to \"eat breakfast, then wake up\"? Order matters!",
    gameKey: "sequence_builder",
    href: "/ai-lab/sequence-builder",
  },
  {
    key: "talking_to_ai_safely",
    title: "Talking to AI Safely",
    bigIdeas: ["natural_interaction", "societal_impact"],
    tagline: "Four ground rules for talking with any AI helper.",
    sparxIntro: [
      "AI helpers like me are useful, but we're not people.",
      "Here are the rules every AI Explorer should know.",
    ],
    englishFocus: "Reading four short safety statements aloud.",
    talkAboutIt: "Ask a grown-up: what's one thing you'd never tell an AI without asking me first?",
    gameKey: null,
    href: "/ai-lab#talking-to-ai-safely",
    minTrack: "explorers",
  },
];

export const AI_SAFETY_CARDS: { emoji: string; text: string }[] = [
  { emoji: "🧠", text: "AI only knows what it's been shown or told — it doesn't know you unless you tell it." },
  { emoji: "🔒", text: "Never share your real name, address, or photos with an AI without a grown-up." },
  { emoji: "🙋", text: "If an AI says something confusing or scary, tell a grown-up right away." },
  { emoji: "🤔", text: "AI can make mistakes — just like Sparx did in Teach Sparx to Sort. It's okay to double-check." },
];

export interface SortItem {
  word: string;
  emoji: string;
  bucket: "a" | "b";
}

export interface SortCategoryPair {
  key: string;
  title: string;
  labelA: string;
  labelB: string;
  emojiA: string;
  emojiB: string;
  tracks: AgeTrack[];
  items: SortItem[];
}

export const SORT_CATEGORY_PAIRS: SortCategoryPair[] = [
  {
    key: "animal_vehicle",
    title: "Animal or Vehicle?",
    labelA: "Animal",
    labelB: "Vehicle",
    emojiA: "🐾",
    emojiB: "🚗",
    tracks: ["little_sparks", "explorers"],
    items: [
      { word: "cat", emoji: "🐱", bucket: "a" },
      { word: "dog", emoji: "🐶", bucket: "a" },
      { word: "fish", emoji: "🐟", bucket: "a" },
      { word: "bird", emoji: "🐦", bucket: "a" },
      { word: "rabbit", emoji: "🐰", bucket: "a" },
      { word: "lion", emoji: "🦁", bucket: "a" },
      { word: "car", emoji: "🚗", bucket: "b" },
      { word: "bus", emoji: "🚌", bucket: "b" },
      { word: "train", emoji: "🚂", bucket: "b" },
      { word: "boat", emoji: "⛵", bucket: "b" },
      { word: "plane", emoji: "✈️", bucket: "b" },
      { word: "bike", emoji: "🚲", bucket: "b" },
    ],
  },
  {
    key: "fruit_vegetable",
    title: "Fruit or Vegetable?",
    labelA: "Fruit",
    labelB: "Vegetable",
    emojiA: "🍎",
    emojiB: "🥕",
    tracks: ["little_sparks", "explorers"],
    items: [
      { word: "apple", emoji: "🍎", bucket: "a" },
      { word: "banana", emoji: "🍌", bucket: "a" },
      { word: "grapes", emoji: "🍇", bucket: "a" },
      { word: "strawberry", emoji: "🍓", bucket: "a" },
      { word: "orange", emoji: "🍊", bucket: "a" },
      { word: "watermelon", emoji: "🍉", bucket: "a" },
      { word: "carrot", emoji: "🥕", bucket: "b" },
      { word: "broccoli", emoji: "🥦", bucket: "b" },
      { word: "corn", emoji: "🌽", bucket: "b" },
      { word: "potato", emoji: "🥔", bucket: "b" },
      { word: "tomato", emoji: "🍅", bucket: "b" },
      { word: "pepper", emoji: "🫑", bucket: "b" },
    ],
  },
  {
    key: "land_water",
    title: "Land Animal or Water Animal?",
    labelA: "Land",
    labelB: "Water",
    emojiA: "🌳",
    emojiB: "🌊",
    tracks: ["explorers"],
    items: [
      { word: "lion", emoji: "🦁", bucket: "a" },
      { word: "elephant", emoji: "🐘", bucket: "a" },
      { word: "horse", emoji: "🐴", bucket: "a" },
      { word: "rabbit", emoji: "🐰", bucket: "a" },
      { word: "bear", emoji: "🐻", bucket: "a" },
      { word: "fish", emoji: "🐟", bucket: "b" },
      { word: "whale", emoji: "🐳", bucket: "b" },
      { word: "octopus", emoji: "🐙", bucket: "b" },
      { word: "shark", emoji: "🦈", bucket: "b" },
      { word: "dolphin", emoji: "🐬", bucket: "b" },
      { word: "crab", emoji: "🦀", bucket: "b" },
    ],
  },
  {
    key: "living_not_living",
    title: "Living or Not Living?",
    labelA: "Living",
    labelB: "Not Living",
    emojiA: "🌱",
    emojiB: "🪨",
    tracks: ["explorers"],
    items: [
      { word: "cat", emoji: "🐱", bucket: "a" },
      { word: "tree", emoji: "🌳", bucket: "a" },
      { word: "flower", emoji: "🌸", bucket: "a" },
      { word: "bird", emoji: "🐦", bucket: "a" },
      { word: "fish", emoji: "🐟", bucket: "a" },
      { word: "rock", emoji: "🪨", bucket: "b" },
      { word: "car", emoji: "🚗", bucket: "b" },
      { word: "chair", emoji: "🪑", bucket: "b" },
      { word: "ball", emoji: "⚽", bucket: "b" },
      { word: "book", emoji: "📖", bucket: "b" },
      { word: "cup", emoji: "🥤", bucket: "b" },
    ],
  },
];

export function sortCategoryPairsForTrack(track: AgeTrack): SortCategoryPair[] {
  return SORT_CATEGORY_PAIRS.filter((pair) => pair.tracks.includes(track));
}

export interface SequenceStep {
  text: string;
  emoji: string;
}

export interface SequenceRoutine {
  key: string;
  title: string;
  tracks: AgeTrack[];
  steps: SequenceStep[];
}

export const SEQUENCE_ROUTINES: SequenceRoutine[] = [
  {
    key: "morning_routine",
    title: "Morning Routine",
    tracks: ["little_sparks", "explorers"],
    steps: [
      { text: "Wake up", emoji: "🌞" },
      { text: "Get dressed", emoji: "👕" },
      { text: "Eat breakfast", emoji: "🥣" },
    ],
  },
  {
    key: "bedtime_routine",
    title: "Getting Ready for Bed",
    tracks: ["little_sparks", "explorers"],
    steps: [
      { text: "Put on pajamas", emoji: "🩱" },
      { text: "Brush teeth", emoji: "🪥" },
      { text: "Read a story", emoji: "📖" },
      { text: "Go to sleep", emoji: "😴" },
    ],
  },
  {
    key: "making_a_sandwich",
    title: "Making a Sandwich",
    tracks: ["explorers"],
    steps: [
      { text: "Get bread", emoji: "🍞" },
      { text: "Add cheese", emoji: "🧀" },
      { text: "Add lettuce", emoji: "🥬" },
      { text: "Close the sandwich", emoji: "🥪" },
    ],
  },
  {
    key: "planting_a_seed",
    title: "Planting a Seed",
    tracks: ["explorers"],
    steps: [
      { text: "Dig a hole", emoji: "🕳️" },
      { text: "Drop in the seed", emoji: "🌱" },
      { text: "Cover with soil", emoji: "🟤" },
      { text: "Water it", emoji: "💧" },
    ],
  },
  {
    key: "washing_hands",
    title: "Washing Hands",
    tracks: ["little_sparks"],
    steps: [
      { text: "Turn on water", emoji: "🚰" },
      { text: "Add soap", emoji: "🧼" },
      { text: "Rub and rinse", emoji: "👏" },
    ],
  },
];

export function sequenceRoutinesForTrack(track: AgeTrack): SequenceRoutine[] {
  return SEQUENCE_ROUTINES.filter((routine) => routine.tracks.includes(track));
}

/** Sequencing connector word for a step at `index` out of `total` steps (first/next/then/last). */
export function connectorFor(index: number, total: number): string {
  if (index === 0) return "First";
  if (index === total - 1) return "Last";
  if (index === total - 2) return "Then";
  return "Next";
}

export function isAgeTrack(value: string | undefined): value is AgeTrack {
  return value === "little_sparks" || value === "explorers";
}
