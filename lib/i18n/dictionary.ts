// Korean translations for app CHROME only — navigation, buttons, menus,
// instructions, error messages. NEVER put English-learning content in here:
//
//   - Vocabulary words themselves (lib/games/wordBank.ts's WordEntry.word,
//     e.g. "cat", "elephant") are never routed through t() at all — every
//     game reads .word directly from the data, not from this dictionary.
//   - Category-answer labels (CATEGORY_LABELS in CategorySort.tsx /
//     CategoryBlitz.tsx, e.g. "Animals", "Colors") stay English on purpose —
//     a student taps one of these AS the English-comprehension exercise
//     itself, so translating the label would translate the test.
//   - Curriculum topic names (lib/games/curriculum.ts's CurriculumTopic.
//     label, e.g. "Space", "Halloween", also reused as the Collection
//     universe heading) stay English for the same reason — these are the
//     literal English words that month's curriculum is teaching, not a UI
//     label describing them.
//   - Catalog/product names seeded into the DB (avatar item names, pack
//     names, species names, room set names, achievement names — see
//     scripts/seed.ts) are out of scope for this dictionary; they'd need a
//     DB-level translations table, not a code-level one. They stay English
//     for now, same as proper nouns/product names would.
//
// Everything else — every button, heading, instruction, and error message a
// student sees navigating the app — belongs here.
//
// Interpolation: {word}-style placeholders in a value get substituted by
// useTranslation()'s t(key, vars) — see e.g. "gameResult.wasActually" below,
// where the sentence is Korean but {word} is always the literal English
// word, never translated, since substitution happens after language lookup.

export type Language = "en" | "ko";

const en = {
  // --- Bottom nav -----------------------------------------------------
  "nav.home": "Home",
  "nav.games": "Games",
  "nav.quests": "Quests",
  "nav.packs": "Packs",
  "nav.collection": "Collection",
  "nav.avatar": "Avatar",
  "nav.room": "Room",
  "nav.badges": "Badges",
  "nav.back": "Go back",

  // --- Common buttons/labels reused across shop & customizer screens ---
  "common.use": "Use",
  "common.wear": "Wear",
  "common.equipped": "Equipped",
  "common.inUse": "In use",
  "common.place": "Place",
  "common.remove": "Remove",
  "common.roomFull": "Room full",
  "common.owned": "Owned",
  "common.notEnoughCoins": "Not enough coins",
  "common.loading": "Loading...",
  "common.tryAgain": "Try again",
  "common.close": "Close",
  "common.back": "Back",
  "common.cancel": "Cancel",
  "common.confirm": "Confirm",
  "common.claim": "Claim!",
  "common.claimed": "Claimed",
  "common.somethingWrong": "Something went wrong. Try again.",

  // --- Auth: enroll / login / PIN --------------------------------------
  "auth.welcomeTitle": "Welcome to Golden Kids!",
  "auth.enrollHint": "Ask your teacher or parent for your code, then type it in below.",
  "auth.enrollCodePlaceholder": "Your code",
  "auth.enrollButton": "Let's go!",
  "auth.checking": "Checking...",
  "auth.enrollError": "That code didn't work — check with a grown-up.",
  "auth.whosPlaying": "Who's playing?",
  "auth.notMe": "Not me — pick someone else",
  "auth.addKid": "Add a kid",
  "auth.enterPin": "Enter your secret PIN",
  "auth.pinError": "That didn't work — try again.",
  "auth.pinLockedError": "Too many tries. Ask a grown-up for help.",

  // --- Home page ---------------------------------------------------------
  "home.greeting": "Hi, {name}!",
  "home.readyForAdventure": "Ready for today's adventure?",
  "home.level": "Level",
  "home.coins": "coins",
  "home.dayStreak": "day streak",
  "home.shards": "shards",
  "home.maxLevel": "Max level!",
  "home.decorateRoom": "Decorate room →",
  "home.packsToOpen": "You have {count} pack(s) to open!",
  "home.wordsReady": "{count} word(s) are ready to review!",

  // --- Room / Avatar --------------------------------------------------
  "room.title": "Your Room",
  "room.editAvatar": "Edit avatar →",
  "room.wallpaper": "Wallpaper",
  "room.floor": "Floor",
  "room.bigFurniture": "Big Furniture",
  "room.smallFurniture": "Small Furniture",
  "room.wallDecor": "Wall Decor",
  "room.roomSets": "Room sets",
  "room.roomSetsHint": "Buy a whole coordinated wallpaper + floor + furniture set in one tap — cheaper than buying each piece.",
  "room.placedCount": "{count}/{cap} placed",
  "room.roomFullHint": "Room is full ({cap}/{cap}) — remove something first",
  "avatar.title": "Your Avatar",
  "avatar.openCase": "Open a case →",

  // --- Game arcade ------------------------------------------------------
  "games.title": "Game Arcade",
  "games.roundsLeft": "{count} rewarded round(s) left today — play any game!",
  "games.noRoundsLeft": "You've played all your rewarded rounds today — come back tomorrow, or keep playing for fun!",
  "games.wordBook": "Word Book",
  "games.levelLocked": "🔒 Level {level}",
  "games.startGame": "Start Game",
  "games.playAgain": "Play Again",
  "games.backToArcade": "Back to Arcade",
  "games.niceWork": "Nice work!",
  "games.timesUp": "Time's up!",
  "games.greatJob": "Great job!",
  "games.notQuite": "Not quite!",
  "games.tooSlow": "Too slow!",
  "gameResult.wasActually": 'It was "{word}"!',

  // --- Packs / Cases ----------------------------------------------------
  "packs.title": "Packs",
  "packs.readyToOpen": "Ready to open",
  "packs.shopTitle": "Pack shop",
  "packs.tapToOpen": "Tap to open!",
  "packs.gettingReady": "Getting your pack ready...",
  "packs.opening": "Opening...",
  "packs.amazingPull": "Amazing pull!",
  "packs.backToPacks": "Back to packs",
  "cases.title": "Character cases",
  "cases.readyToOpen": "Ready to open",
  "cases.shopTitle": "Case shop",
  "cases.tapToOpen": "Tap to open!",
  "cases.gettingReady": "Getting your case ready...",
  "cases.backToCases": "Back to cases",

  // --- Collection ---------------------------------------------------------
  "collection.title": "Collection Book",
  "collection.hint": "Keep collecting to fill every universe!",
  "collection.shardsHint": "Duplicate cards earn shards — spend them to grab a card you're missing!",
  "collection.collectedCount": "{count}/{total} collected",
  "collection.wearIt": "Wear it",
  "collection.collectThisOne": "Collect this one.",
  "collection.openPacksHint": "Open packs to collect this card!",

  // --- Word Book -----------------------------------------------------
  "wordbook.title": "Word Book",
  "wordbook.wordsLearned": "words learned",
  "wordbook.due": "due",
  "wordbook.mastered": "mastered",
  "wordbook.allCaughtUp": "All caught up!",
  "wordbook.comeBackLater": "Come back later for more words to review.",
  "wordbook.reveal": "Reveal",
  "wordbook.stillLearning": "😕 Still learning",
  "wordbook.iKnewIt": "😊 I knew it!",
  "wordbook.reviewedCount": "Nice! You reviewed {count} word(s).",

  // --- Quests / daily reward -------------------------------------------
  "quests.title": "Quests",
  "quests.today": "Today",
  "quests.thisWeek": "This week",
  "quests.claimableCount": "You have {count} quest(s) ready to claim!",
  "home.claimTodayReward": "Claim today's reward!",

  // --- Achievements ---------------------------------------------------
  "achievements.title": "Achievements",
  "achievements.unlockedCount": "{count}/{total} unlocked",

  // --- Curriculum monthly announcement -------------------------------
  "curriculum.newMonth": "New Month!",
  "curriculum.thisMonthLearning": "This month we're learning about {topic}! New words, new games, and new cards to discover.",
  "curriculum.letsGo": "Let's go!",

  // --- Pet / room poke reactions ---------------------------------------
  "pet.feedError": "Couldn't feed your pet",
} as const;

export type TranslationKey = keyof typeof en;

const ko: Record<TranslationKey, string> = {
  "nav.home": "홈",
  "nav.games": "게임",
  "nav.quests": "퀘스트",
  "nav.packs": "팩",
  "nav.collection": "컬렉션",
  "nav.avatar": "아바타",
  "nav.room": "방",
  "nav.badges": "배지",
  "nav.back": "뒤로 가기",

  "common.use": "사용",
  "common.wear": "착용",
  "common.equipped": "착용 중",
  "common.inUse": "사용 중",
  "common.place": "놓기",
  "common.remove": "빼기",
  "common.roomFull": "방이 꽉 찼어요",
  "common.owned": "보유 중",
  "common.notEnoughCoins": "코인이 부족해요",
  "common.loading": "불러오는 중...",
  "common.tryAgain": "다시 시도",
  "common.close": "닫기",
  "common.back": "뒤로",
  "common.cancel": "취소",
  "common.confirm": "확인",
  "common.claim": "받기!",
  "common.claimed": "받았어요",
  "common.somethingWrong": "문제가 생겼어요. 다시 시도해 주세요.",

  "auth.welcomeTitle": "Golden Kids에 오신 걸 환영해요!",
  "auth.enrollHint": "선생님이나 부모님께 코드를 받아서 아래에 입력하세요.",
  "auth.enrollCodePlaceholder": "코드를 입력하세요",
  "auth.enrollButton": "시작하기!",
  "auth.checking": "확인 중...",
  "auth.enrollError": "코드가 맞지 않아요 — 어른께 확인해 주세요.",
  "auth.whosPlaying": "누가 놀고 있나요?",
  "auth.notMe": "제가 아니에요 — 다른 사람 선택",
  "auth.addKid": "아이 추가하기",
  "auth.enterPin": "비밀 PIN을 입력하세요",
  "auth.pinError": "맞지 않아요 — 다시 시도해 주세요.",
  "auth.pinLockedError": "너무 많이 틀렸어요. 어른께 도움을 요청하세요.",

  "home.greeting": "안녕, {name}!",
  "home.readyForAdventure": "오늘의 모험을 시작할 준비 됐나요?",
  "home.level": "레벨",
  "home.coins": "코인",
  "home.dayStreak": "일 연속",
  "home.shards": "조각",
  "home.maxLevel": "최고 레벨!",
  "home.decorateRoom": "방 꾸미기 →",
  "home.packsToOpen": "열 수 있는 팩이 {count}개 있어요!",
  "home.wordsReady": "복습할 단어가 {count}개 준비됐어요!",

  "room.title": "내 방",
  "room.editAvatar": "아바타 편집 →",
  "room.wallpaper": "벽지",
  "room.floor": "바닥",
  "room.bigFurniture": "큰 가구",
  "room.smallFurniture": "작은 가구",
  "room.wallDecor": "벽 장식",
  "room.roomSets": "방 세트",
  "room.roomSetsHint": "벽지 + 바닥 + 가구 세트를 한 번에 구매하세요 — 따로 사는 것보다 저렴해요.",
  "room.placedCount": "{count}/{cap}개 놓음",
  "room.roomFullHint": "방이 꽉 찼어요 ({cap}/{cap}) — 먼저 무언가를 빼주세요",
  "avatar.title": "내 아바타",
  "avatar.openCase": "케이스 열기 →",

  "games.title": "게임 아케이드",
  "games.roundsLeft": "오늘 보상 라운드가 {count}번 남았어요 — 아무 게임이나 플레이하세요!",
  "games.noRoundsLeft": "오늘 보상 라운드를 모두 플레이했어요 — 내일 다시 오거나 재미로 계속 플레이하세요!",
  "games.wordBook": "단어장",
  "games.levelLocked": "🔒 레벨 {level}",
  "games.startGame": "게임 시작",
  "games.playAgain": "다시 플레이",
  "games.backToArcade": "아케이드로 돌아가기",
  "games.niceWork": "잘했어요!",
  "games.timesUp": "시간 종료!",
  "games.greatJob": "정말 잘했어요!",
  "games.notQuite": "아쉬워요!",
  "games.tooSlow": "너무 느려요!",
  "gameResult.wasActually": '정답은 "{word}"였어요!',

  "packs.title": "팩",
  "packs.readyToOpen": "열 준비 완료",
  "packs.shopTitle": "팩 상점",
  "packs.tapToOpen": "탭해서 열기!",
  "packs.gettingReady": "팩을 준비하는 중...",
  "packs.opening": "여는 중...",
  "packs.amazingPull": "대박이에요!",
  "packs.backToPacks": "팩으로 돌아가기",
  "cases.title": "캐릭터 케이스",
  "cases.readyToOpen": "열 준비 완료",
  "cases.shopTitle": "케이스 상점",
  "cases.tapToOpen": "탭해서 열기!",
  "cases.gettingReady": "케이스를 준비하는 중...",
  "cases.backToCases": "케이스로 돌아가기",

  "collection.title": "컬렉션 북",
  "collection.hint": "모든 세계를 다 모아보세요!",
  "collection.shardsHint": "중복된 카드는 조각이 돼요 — 조각으로 없는 카드를 얻어보세요!",
  "collection.collectedCount": "{count}/{total}개 수집",
  "collection.wearIt": "착용하기",
  "collection.collectThisOne": "이 카드를 모아보세요.",
  "collection.openPacksHint": "팩을 열어서 이 카드를 모아보세요!",

  "wordbook.title": "단어장",
  "wordbook.wordsLearned": "배운 단어",
  "wordbook.due": "복습 필요",
  "wordbook.mastered": "마스터함",
  "wordbook.allCaughtUp": "다 끝냈어요!",
  "wordbook.comeBackLater": "나중에 다시 와서 더 복습해요.",
  "wordbook.reveal": "정답 보기",
  "wordbook.stillLearning": "😕 아직 배우는 중",
  "wordbook.iKnewIt": "😊 알고 있었어요!",
  "wordbook.reviewedCount": "좋아요! 단어 {count}개를 복습했어요.",

  "quests.title": "퀘스트",
  "quests.today": "오늘",
  "quests.thisWeek": "이번 주",
  "quests.claimableCount": "받을 수 있는 퀘스트가 {count}개 있어요!",
  "home.claimTodayReward": "오늘의 보상 받기!",

  "achievements.title": "업적",
  "achievements.unlockedCount": "{count}/{total}개 해금",

  "curriculum.newMonth": "새로운 달!",
  "curriculum.thisMonthLearning": "이번 달엔 {topic}에 대해 배워요! 새로운 단어, 새로운 게임, 새로운 카드가 기다려요.",
  "curriculum.letsGo": "시작하기!",

  "pet.feedError": "펫에게 먹이를 줄 수 없어요",
};

export const translations: Record<Language, Record<TranslationKey, string>> = { en, ko };
