export type WordCategory =
  | "animals"
  | "colors"
  | "numbers"
  | "food"
  | "weather"
  | "family"
  | "actions"
  | "school"
  | "space"
  | "culture"
  | "friends"
  | "environment"
  | "travel"
  | "body"
  | "halloween"
  | "emotions"
  | "christmas";

export interface WordEntry {
  word: string;
  emoji: string;
  category: WordCategory;
  difficulty: 1 | 2 | 3;
  // Which week (1-4) of its curriculum month this word is introduced in —
  // only set for the 12 curriculum-topic categories (lib/games/curriculum.ts).
  // Evergreen categories below (colors/numbers/food/actions/school) aren't
  // part of the monthly rotation, so they're left unset.
  week?: 1 | 2 | 3 | 4;
}

export const WORD_BANK: WordEntry[] = [
  // animals (curriculum: month 6)
  { word: "cat", emoji: "🐱", category: "animals", difficulty: 1, week: 1 },
  { word: "dog", emoji: "🐶", category: "animals", difficulty: 1, week: 1 },
  { word: "fish", emoji: "🐟", category: "animals", difficulty: 1, week: 1 },
  { word: "bird", emoji: "🐦", category: "animals", difficulty: 1, week: 1 },
  { word: "duck", emoji: "🦆", category: "animals", difficulty: 1, week: 2 },
  { word: "rabbit", emoji: "🐰", category: "animals", difficulty: 2, week: 2 },
  { word: "bear", emoji: "🐻", category: "animals", difficulty: 2, week: 2 },
  { word: "monkey", emoji: "🐵", category: "animals", difficulty: 2, week: 2 },
  { word: "lion", emoji: "🦁", category: "animals", difficulty: 2, week: 3 },
  { word: "tiger", emoji: "🐯", category: "animals", difficulty: 2, week: 3 },
  { word: "elephant", emoji: "🐘", category: "animals", difficulty: 3, week: 3 },
  { word: "zebra", emoji: "🦓", category: "animals", difficulty: 2, week: 3 },
  { word: "giraffe", emoji: "🦒", category: "animals", difficulty: 3, week: 4 },
  { word: "penguin", emoji: "🐧", category: "animals", difficulty: 3, week: 4 },
  { word: "hippo", emoji: "🦛", category: "animals", difficulty: 2, week: 4 },
  { word: "koala", emoji: "🐨", category: "animals", difficulty: 2, week: 4 },

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

  // weather (curriculum: month 7)
  { word: "sun", emoji: "☀️", category: "weather", difficulty: 1, week: 1 },
  { word: "rain", emoji: "🌧️", category: "weather", difficulty: 1, week: 1 },
  { word: "snow", emoji: "❄️", category: "weather", difficulty: 1, week: 2 },
  { word: "cloud", emoji: "☁️", category: "weather", difficulty: 2, week: 2 },
  { word: "wind", emoji: "💨", category: "weather", difficulty: 2, week: 3 },
  { word: "storm", emoji: "⛈️", category: "weather", difficulty: 3, week: 3 },
  { word: "rainbow", emoji: "🌈", category: "weather", difficulty: 2, week: 3 },
  { word: "hot", emoji: "🥵", category: "weather", difficulty: 1, week: 4 },
  { word: "cold", emoji: "🥶", category: "weather", difficulty: 1, week: 4 },
  { word: "foggy", emoji: "🌫️", category: "weather", difficulty: 2, week: 4 },
  { word: "thunder", emoji: "⚡", category: "weather", difficulty: 3, week: 4 },

  // family (curriculum: month 5)
  { word: "mom", emoji: "👩", category: "family", difficulty: 1, week: 1 },
  { word: "dad", emoji: "👨", category: "family", difficulty: 1, week: 1 },
  { word: "baby", emoji: "👶", category: "family", difficulty: 1, week: 1 },
  { word: "sister", emoji: "👧", category: "family", difficulty: 2, week: 2 },
  { word: "brother", emoji: "👦", category: "family", difficulty: 2, week: 2 },
  { word: "grandma", emoji: "👵", category: "family", difficulty: 3, week: 3 },
  { word: "grandpa", emoji: "👴", category: "family", difficulty: 3, week: 3 },
  { word: "aunt", emoji: "👩", category: "family", difficulty: 2, week: 4 },
  { word: "uncle", emoji: "👨", category: "family", difficulty: 2, week: 4 },
  { word: "cousin", emoji: "🧒", category: "family", difficulty: 3, week: 4 },
  { word: "family", emoji: "👪", category: "family", difficulty: 2, week: 4 },

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

  // space (curriculum: month 1)
  { word: "rocket", emoji: "🚀", category: "space", difficulty: 1, week: 1 },
  { word: "moon", emoji: "🌙", category: "space", difficulty: 1, week: 1 },
  { word: "star", emoji: "⭐", category: "space", difficulty: 1, week: 1 },
  { word: "planet", emoji: "🪐", category: "space", difficulty: 1, week: 1 },
  { word: "astronaut", emoji: "👨‍🚀", category: "space", difficulty: 2, week: 2 },
  { word: "alien", emoji: "👽", category: "space", difficulty: 2, week: 2 },
  { word: "comet", emoji: "☄️", category: "space", difficulty: 2, week: 2 },
  { word: "earth", emoji: "🌍", category: "space", difficulty: 2, week: 2 },
  { word: "satellite", emoji: "🛰️", category: "space", difficulty: 2, week: 3 },
  { word: "spaceship", emoji: "🛸", category: "space", difficulty: 2, week: 3 },
  { word: "galaxy", emoji: "🌌", category: "space", difficulty: 3, week: 3 },
  { word: "telescope", emoji: "🔭", category: "space", difficulty: 3, week: 3 },
  { word: "universe", emoji: "🌠", category: "space", difficulty: 3, week: 4 },
  { word: "meteor", emoji: "💫", category: "space", difficulty: 3, week: 4 },
  { word: "orbit", emoji: "🔄", category: "space", difficulty: 3, week: 4 },
  { word: "cosmos", emoji: "✨", category: "space", difficulty: 3, week: 4 },

  // culture (curriculum: month 2)
  { word: "flag", emoji: "🚩", category: "culture", difficulty: 1, week: 1 },
  { word: "music", emoji: "🎵", category: "culture", difficulty: 1, week: 1 },
  { word: "song", emoji: "🎶", category: "culture", difficulty: 1, week: 1 },
  { word: "drum", emoji: "🥁", category: "culture", difficulty: 1, week: 1 },
  { word: "flute", emoji: "🪈", category: "culture", difficulty: 2, week: 2 },
  { word: "festival", emoji: "🎉", category: "culture", difficulty: 2, week: 2 },
  { word: "parade", emoji: "🎊", category: "culture", difficulty: 2, week: 2 },
  { word: "language", emoji: "🗣️", category: "culture", difficulty: 2, week: 2 },
  { word: "country", emoji: "🌏", category: "culture", difficulty: 2, week: 3 },
  { word: "instrument", emoji: "🪘", category: "culture", difficulty: 3, week: 3 },
  { word: "world", emoji: "🌐", category: "culture", difficulty: 2, week: 3 },
  { word: "holiday", emoji: "🎆", category: "culture", difficulty: 2, week: 3 },
  { word: "celebrate", emoji: "🎇", category: "culture", difficulty: 3, week: 4 },
  { word: "guitar", emoji: "🎸", category: "culture", difficulty: 2, week: 4 },
  { word: "violin", emoji: "🎻", category: "culture", difficulty: 3, week: 4 },
  { word: "piano", emoji: "🎹", category: "culture", difficulty: 2, week: 4 },

  // friends (curriculum: month 3)
  { word: "friend", emoji: "👫", category: "friends", difficulty: 1, week: 1 },
  { word: "smile", emoji: "😊", category: "friends", difficulty: 1, week: 1 },
  { word: "share", emoji: "🤝", category: "friends", difficulty: 1, week: 1 },
  { word: "play", emoji: "⚽", category: "friends", difficulty: 1, week: 1 },
  { word: "kind", emoji: "💛", category: "friends", difficulty: 2, week: 2 },
  { word: "help", emoji: "🙋", category: "friends", difficulty: 1, week: 2 },
  { word: "hug", emoji: "🤗", category: "friends", difficulty: 1, week: 2 },
  { word: "team", emoji: "👥", category: "friends", difficulty: 2, week: 2 },
  { word: "birthday", emoji: "🎈", category: "friends", difficulty: 2, week: 3 },
  { word: "party", emoji: "🥳", category: "friends", difficulty: 2, week: 3 },
  { word: "gift", emoji: "🎁", category: "friends", difficulty: 2, week: 3 },
  { word: "laugh", emoji: "😂", category: "friends", difficulty: 2, week: 3 },
  { word: "trust", emoji: "🤞", category: "friends", difficulty: 3, week: 4 },
  { word: "care", emoji: "💗", category: "friends", difficulty: 2, week: 4 },
  { word: "together", emoji: "👬", category: "friends", difficulty: 3, week: 4 },
  { word: "cheerful", emoji: "😃", category: "friends", difficulty: 3, week: 4 },

  // environment (curriculum: month 4)
  { word: "tree", emoji: "🌳", category: "environment", difficulty: 1, week: 1 },
  { word: "flower", emoji: "🌸", category: "environment", difficulty: 1, week: 1 },
  { word: "grass", emoji: "🌱", category: "environment", difficulty: 1, week: 1 },
  { word: "leaf", emoji: "🍃", category: "environment", difficulty: 1, week: 1 },
  { word: "water", emoji: "💧", category: "environment", difficulty: 1, week: 2 },
  { word: "forest", emoji: "🌲", category: "environment", difficulty: 2, week: 2 },
  { word: "river", emoji: "🏞️", category: "environment", difficulty: 2, week: 2 },
  { word: "mountain", emoji: "⛰️", category: "environment", difficulty: 2, week: 2 },
  { word: "recycle", emoji: "♻️", category: "environment", difficulty: 2, week: 3 },
  { word: "plant", emoji: "🪴", category: "environment", difficulty: 2, week: 3 },
  { word: "seed", emoji: "🌰", category: "environment", difficulty: 2, week: 3 },
  { word: "rock", emoji: "🪨", category: "environment", difficulty: 1, week: 3 },
  { word: "nature", emoji: "🍀", category: "environment", difficulty: 2, week: 4 },
  { word: "ocean", emoji: "🌊", category: "environment", difficulty: 2, week: 4 },
  { word: "clean", emoji: "🧼", category: "environment", difficulty: 2, week: 4 },
  { word: "protect", emoji: "🛡️", category: "environment", difficulty: 3, week: 4 },

  // travel (curriculum: month 8)
  { word: "car", emoji: "🚗", category: "travel", difficulty: 1, week: 1 },
  { word: "bus", emoji: "🚌", category: "travel", difficulty: 1, week: 1 },
  { word: "train", emoji: "🚂", category: "travel", difficulty: 1, week: 1 },
  { word: "boat", emoji: "⛵", category: "travel", difficulty: 1, week: 1 },
  { word: "airplane", emoji: "✈️", category: "travel", difficulty: 2, week: 2 },
  { word: "ticket", emoji: "🎫", category: "travel", difficulty: 2, week: 2 },
  { word: "luggage", emoji: "🧳", category: "travel", difficulty: 2, week: 2 },
  { word: "map", emoji: "🗺️", category: "travel", difficulty: 1, week: 2 },
  { word: "passport", emoji: "🛂", category: "travel", difficulty: 3, week: 3 },
  { word: "hotel", emoji: "🏨", category: "travel", difficulty: 2, week: 3 },
  { word: "beach", emoji: "🏖️", category: "travel", difficulty: 1, week: 3 },
  { word: "island", emoji: "🏝️", category: "travel", difficulty: 2, week: 3 },
  { word: "vacation", emoji: "🌴", category: "travel", difficulty: 2, week: 4 },
  { word: "adventure", emoji: "🧭", category: "travel", difficulty: 3, week: 4 },
  { word: "explore", emoji: "🔍", category: "travel", difficulty: 2, week: 4 },
  { word: "journey", emoji: "🚶", category: "travel", difficulty: 3, week: 4 },

  // body (curriculum: month 9)
  { word: "eye", emoji: "👁️", category: "body", difficulty: 1, week: 1 },
  { word: "ear", emoji: "👂", category: "body", difficulty: 1, week: 1 },
  { word: "nose", emoji: "👃", category: "body", difficulty: 1, week: 1 },
  { word: "mouth", emoji: "👄", category: "body", difficulty: 1, week: 1 },
  { word: "hand", emoji: "✋", category: "body", difficulty: 1, week: 2 },
  { word: "foot", emoji: "🦶", category: "body", difficulty: 1, week: 2 },
  { word: "arm", emoji: "💪", category: "body", difficulty: 1, week: 2 },
  { word: "leg", emoji: "🦵", category: "body", difficulty: 1, week: 2 },
  { word: "head", emoji: "🧑", category: "body", difficulty: 2, week: 3 },
  { word: "hair", emoji: "💇", category: "body", difficulty: 2, week: 3 },
  { word: "tooth", emoji: "🦷", category: "body", difficulty: 2, week: 3 },
  { word: "finger", emoji: "👆", category: "body", difficulty: 2, week: 3 },
  { word: "shoulder", emoji: "🤷", category: "body", difficulty: 3, week: 4 },
  { word: "knee", emoji: "🦵", category: "body", difficulty: 2, week: 4 },
  { word: "elbow", emoji: "💪", category: "body", difficulty: 3, week: 4 },
  { word: "stomach", emoji: "🫃", category: "body", difficulty: 2, week: 4 },

  // halloween (curriculum: month 10)
  { word: "pumpkin", emoji: "🎃", category: "halloween", difficulty: 1, week: 1 },
  { word: "ghost", emoji: "👻", category: "halloween", difficulty: 1, week: 1 },
  { word: "bat", emoji: "🦇", category: "halloween", difficulty: 1, week: 1 },
  { word: "spider", emoji: "🕷️", category: "halloween", difficulty: 1, week: 1 },
  { word: "witch", emoji: "🧙", category: "halloween", difficulty: 2, week: 2 },
  { word: "costume", emoji: "🎭", category: "halloween", difficulty: 2, week: 2 },
  { word: "candy", emoji: "🍬", category: "halloween", difficulty: 1, week: 2 },
  { word: "mask", emoji: "🥸", category: "halloween", difficulty: 2, week: 2 },
  { word: "skeleton", emoji: "💀", category: "halloween", difficulty: 2, week: 3 },
  { word: "monster", emoji: "👹", category: "halloween", difficulty: 2, week: 3 },
  { word: "vampire", emoji: "🧛", category: "halloween", difficulty: 3, week: 3 },
  { word: "broom", emoji: "🧹", category: "halloween", difficulty: 2, week: 3 },
  { word: "haunted", emoji: "🏚️", category: "halloween", difficulty: 3, week: 4 },
  { word: "spooky", emoji: "😱", category: "halloween", difficulty: 2, week: 4 },
  { word: "trick", emoji: "🃏", category: "halloween", difficulty: 2, week: 4 },
  { word: "treat", emoji: "🍭", category: "halloween", difficulty: 2, week: 4 },

  // emotions (curriculum: month 11)
  { word: "happy", emoji: "😄", category: "emotions", difficulty: 1, week: 1 },
  { word: "sad", emoji: "😢", category: "emotions", difficulty: 1, week: 1 },
  { word: "angry", emoji: "😠", category: "emotions", difficulty: 1, week: 1 },
  { word: "scared", emoji: "😱", category: "emotions", difficulty: 1, week: 1 },
  { word: "excited", emoji: "🤩", category: "emotions", difficulty: 2, week: 2 },
  { word: "tired", emoji: "😴", category: "emotions", difficulty: 1, week: 2 },
  { word: "surprised", emoji: "😲", category: "emotions", difficulty: 2, week: 2 },
  { word: "calm", emoji: "😌", category: "emotions", difficulty: 2, week: 2 },
  { word: "proud", emoji: "🥹", category: "emotions", difficulty: 2, week: 3 },
  { word: "nervous", emoji: "😰", category: "emotions", difficulty: 3, week: 3 },
  { word: "brave", emoji: "🦸", category: "emotions", difficulty: 2, week: 3 },
  { word: "shy", emoji: "🙈", category: "emotions", difficulty: 2, week: 3 },
  { word: "grateful", emoji: "🙏", category: "emotions", difficulty: 3, week: 4 },
  { word: "confused", emoji: "😕", category: "emotions", difficulty: 2, week: 4 },
  { word: "silly", emoji: "🤪", category: "emotions", difficulty: 2, week: 4 },
  { word: "curious", emoji: "🤔", category: "emotions", difficulty: 2, week: 4 },

  // christmas (curriculum: month 12)
  { word: "santa", emoji: "🎅", category: "christmas", difficulty: 1, week: 1 },
  { word: "snowman", emoji: "⛄", category: "christmas", difficulty: 1, week: 1 },
  { word: "present", emoji: "🎁", category: "christmas", difficulty: 1, week: 1 },
  { word: "sleigh", emoji: "🛷", category: "christmas", difficulty: 2, week: 1 },
  { word: "reindeer", emoji: "🦌", category: "christmas", difficulty: 2, week: 2 },
  { word: "stocking", emoji: "🧦", category: "christmas", difficulty: 2, week: 2 },
  { word: "bell", emoji: "🔔", category: "christmas", difficulty: 1, week: 2 },
  { word: "wreath", emoji: "🎄", category: "christmas", difficulty: 2, week: 2 },
  { word: "cookie", emoji: "🍪", category: "christmas", difficulty: 1, week: 3 },
  { word: "ornament", emoji: "🔴", category: "christmas", difficulty: 2, week: 3 },
  { word: "peppermint", emoji: "🍬", category: "christmas", difficulty: 3, week: 3 },
  { word: "chimney", emoji: "🏠", category: "christmas", difficulty: 2, week: 3 },
  { word: "snowflake", emoji: "❄️", category: "christmas", difficulty: 2, week: 4 },
  { word: "elf", emoji: "🧝", category: "christmas", difficulty: 1, week: 4 },
  { word: "carol", emoji: "🎵", category: "christmas", difficulty: 2, week: 4 },
  { word: "gingerbread", emoji: "🍪", category: "christmas", difficulty: 3, week: 4 },
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
