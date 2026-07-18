export type WordCategory =
  | "animals"
  | "colors"
  | "numbers"
  | "food"
  | "weather"
  | "family"
  | "actions"
  | "school";

export interface WordEntry {
  word: string;
  emoji: string;
  category: WordCategory;
  difficulty: 1 | 2 | 3;
}

export const WORD_BANK: WordEntry[] = [
  // animals
  { word: "cat", emoji: "🐱", category: "animals", difficulty: 1 },
  { word: "dog", emoji: "🐶", category: "animals", difficulty: 1 },
  { word: "fish", emoji: "🐟", category: "animals", difficulty: 1 },
  { word: "bird", emoji: "🐦", category: "animals", difficulty: 1 },
  { word: "lion", emoji: "🦁", category: "animals", difficulty: 2 },
  { word: "tiger", emoji: "🐯", category: "animals", difficulty: 2 },
  { word: "rabbit", emoji: "🐰", category: "animals", difficulty: 2 },
  { word: "monkey", emoji: "🐵", category: "animals", difficulty: 2 },
  { word: "bear", emoji: "🐻", category: "animals", difficulty: 2 },
  { word: "duck", emoji: "🦆", category: "animals", difficulty: 1 },
  { word: "elephant", emoji: "🐘", category: "animals", difficulty: 3 },
  { word: "giraffe", emoji: "🦒", category: "animals", difficulty: 3 },
  { word: "penguin", emoji: "🐧", category: "animals", difficulty: 3 },

  // colors
  { word: "red", emoji: "🔴", category: "colors", difficulty: 1 },
  { word: "blue", emoji: "🔵", category: "colors", difficulty: 1 },
  { word: "green", emoji: "🟢", category: "colors", difficulty: 1 },
  { word: "yellow", emoji: "🟡", category: "colors", difficulty: 2 },
  { word: "purple", emoji: "🟣", category: "colors", difficulty: 2 },
  { word: "orange", emoji: "🟠", category: "colors", difficulty: 2 },
  { word: "brown", emoji: "🟤", category: "colors", difficulty: 2 },

  // numbers
  { word: "one", emoji: "1️⃣", category: "numbers", difficulty: 1 },
  { word: "two", emoji: "2️⃣", category: "numbers", difficulty: 1 },
  { word: "three", emoji: "3️⃣", category: "numbers", difficulty: 1 },
  { word: "four", emoji: "4️⃣", category: "numbers", difficulty: 1 },
  { word: "five", emoji: "5️⃣", category: "numbers", difficulty: 1 },
  { word: "six", emoji: "6️⃣", category: "numbers", difficulty: 1 },
  { word: "seven", emoji: "7️⃣", category: "numbers", difficulty: 2 },
  { word: "eight", emoji: "8️⃣", category: "numbers", difficulty: 2 },
  { word: "nine", emoji: "9️⃣", category: "numbers", difficulty: 2 },
  { word: "ten", emoji: "🔟", category: "numbers", difficulty: 1 },

  // food
  { word: "egg", emoji: "🥚", category: "food", difficulty: 1 },
  { word: "milk", emoji: "🥛", category: "food", difficulty: 1 },
  { word: "cake", emoji: "🎂", category: "food", difficulty: 1 },
  { word: "apple", emoji: "🍎", category: "food", difficulty: 1 },
  { word: "bread", emoji: "🍞", category: "food", difficulty: 2 },
  { word: "pizza", emoji: "🍕", category: "food", difficulty: 2 },
  { word: "banana", emoji: "🍌", category: "food", difficulty: 2 },
  { word: "cheese", emoji: "🧀", category: "food", difficulty: 2 },
  { word: "sandwich", emoji: "🥪", category: "food", difficulty: 3 },
  { word: "chocolate", emoji: "🍫", category: "food", difficulty: 3 },

  // weather
  { word: "sun", emoji: "☀️", category: "weather", difficulty: 1 },
  { word: "rain", emoji: "🌧️", category: "weather", difficulty: 1 },
  { word: "snow", emoji: "❄️", category: "weather", difficulty: 1 },
  { word: "cloud", emoji: "☁️", category: "weather", difficulty: 2 },
  { word: "wind", emoji: "💨", category: "weather", difficulty: 2 },
  { word: "storm", emoji: "⛈️", category: "weather", difficulty: 3 },

  // family
  { word: "mom", emoji: "👩", category: "family", difficulty: 1 },
  { word: "dad", emoji: "👨", category: "family", difficulty: 1 },
  { word: "baby", emoji: "👶", category: "family", difficulty: 1 },
  { word: "sister", emoji: "👧", category: "family", difficulty: 2 },
  { word: "brother", emoji: "👦", category: "family", difficulty: 2 },
  { word: "grandma", emoji: "👵", category: "family", difficulty: 3 },
  { word: "grandpa", emoji: "👴", category: "family", difficulty: 3 },

  // actions
  { word: "run", emoji: "🏃", category: "actions", difficulty: 1 },
  { word: "jump", emoji: "🤸", category: "actions", difficulty: 2 },
  { word: "read", emoji: "📖", category: "actions", difficulty: 1 },
  { word: "swim", emoji: "🏊", category: "actions", difficulty: 2 },
  { word: "sleep", emoji: "😴", category: "actions", difficulty: 2 },
  { word: "dance", emoji: "💃", category: "actions", difficulty: 2 },
  { word: "sing", emoji: "🎤", category: "actions", difficulty: 1 },

  // school
  { word: "book", emoji: "📕", category: "school", difficulty: 1 },
  { word: "pen", emoji: "🖊️", category: "school", difficulty: 1 },
  { word: "bag", emoji: "🎒", category: "school", difficulty: 1 },
  { word: "pencil", emoji: "✏️", category: "school", difficulty: 2 },
  { word: "chair", emoji: "🪑", category: "school", difficulty: 2 },
  { word: "clock", emoji: "🕐", category: "school", difficulty: 2 },
];

export function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Words at or below a difficulty ceiling, useful for ramping games up over time. */
export function wordsUpToDifficulty(maxDifficulty: 1 | 2 | 3): WordEntry[] {
  return WORD_BANK.filter((w) => w.difficulty <= maxDifficulty);
}

/** `count` distinct random words, optionally excluding one (e.g. the target word, when picking distractors). */
export function randomWords(count: number, pool: WordEntry[], exclude?: WordEntry): WordEntry[] {
  const candidates = exclude ? pool.filter((w) => w.word !== exclude.word) : pool;
  return shuffle(candidates).slice(0, count);
}
