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

  // --- Room/Avatar shop (additions) -------------------------------------
  "common.featuredDiscount": "★ 25% OFF",
  "common.errorEquip": "Couldn't equip that",
  "common.errorBuy": "Couldn't buy that",
  "common.errorPlace": "Couldn't place that",
  "common.errorRemove": "Couldn't remove that",
  "room.errorBuySet": "Couldn't buy that room set",
  "avatar.errorUnlockDance": "Couldn't unlock that",
  "avatar.danceButton": "Dance!",
  "avatar.dancingButton": "Dancing! 🎉",
  "avatar.unlockDanceParty": "🎉 Unlock Dance Party —",
  "avatar.collected": "Collected",

  // --- Games: shared chrome reused across multiple mini-games -----------
  "games.savingScore": "Saving your score...",
  "games.exit": "← Exit",
  "games.whatIsThis": "What is this?",
  "games.whichGroup": "Which group is this?",
  "games.scoreOutOf": "You got {correct} of {total} right!",
  "games.notQuiteWasCategory": "Not quite! It's {category}.",
  "games.correctCount": "{count} correct",
  "games.streakBonusApplied": "🔥 {percent}% streak bonus applied!",
  "games.surpriseChest": "Surprise chest: +{coins} coins!",
  "games.openingBonusChest": "Opening your bonus chest...",
  "games.practiceRound": "Practice round — come back tomorrow for more rewarded rounds!",

  // --- Games: catalog names/taglines (lib/games/catalog.ts) + per-game
  // chrome specific to a single mini-game (components/games/*.tsx) --------
  "game.wordCatch.name": "Word Catch",
  "game.wordCatch.tagline": "Catch the right word before it drops!",
  "game.wordCatch.instructions":
    "A word drops in each lane. Tap the one that matches the picture before it lands!",
  "game.wordCatch.result": "You caught {correct} of {total} words correctly!",

  "game.memoryMatch.name": "Memory Match",
  "game.memoryMatch.tagline": "Flip cards and find every matching pair!",
  "game.memoryMatch.instructions": "Flip two cards at a time and find every picture-and-word pair!",
  "game.memoryMatch.gameOverTitle": "All matched!",
  "game.memoryMatch.result": "You found all {pairs} pairs in {moves} moves!",
  "game.memoryMatch.progress": "{matched}/{total} pairs · {moves} moves",
  "game.memoryMatch.matchFound": "Match found!",
  "game.memoryMatch.notAMatch": "Not a match, try again!",

  "game.wordScramble.name": "Word Scramble",
  "game.wordScramble.tagline": "Unscramble the letters before time runs out!",
  "game.wordScramble.instructions": "Tap the letters in order to spell the word before time runs out!",
  "game.wordScramble.gameOverTitle": "All done!",
  "game.wordScramble.result": "You spelled {correct} of {total} words correctly!",
  "game.wordScramble.progress": "Word {current}/{total}",
  "game.wordScramble.tapLettersBelow": "Tap letters below",
  "game.wordScramble.undo": "⌫ Undo",

  "game.emojiQuiz.name": "Emoji Quiz",
  "game.emojiQuiz.tagline": "Pick the word that matches the picture!",
  "game.emojiQuiz.instructions": "A picture shows up — tap the word that matches it!",

  "game.picturePick.name": "Picture Pick",
  "game.picturePick.tagline": "A word shows up — tap the picture that matches!",
  "game.picturePick.instructions": "A word shows up — tap the picture that matches it!",
  "game.picturePick.whichPicture": "Which picture is this?",

  "game.trueOrFalse.name": "True or False",
  "game.trueOrFalse.tagline": "Does the word match the picture? Tap yes or no!",
  "game.trueOrFalse.instructions": "Does the word match the picture? Tap ✅ or ❌!",
  "game.trueOrFalse.yes": "✅ Yes",
  "game.trueOrFalse.no": "❌ No",

  "game.oddOneOut.name": "Odd One Out",
  "game.oddOneOut.tagline": "Three belong together — find the one that doesn't!",
  "game.oddOneOut.instructions": "Three pictures belong together — tap the one that doesn't!",
  "game.oddOneOut.whichOne": "Which one doesn't belong?",
  "game.oddOneOut.notQuiteDidntBelong": "Not quite! The {word} didn't belong.",

  "game.categorySort.name": "Category Sort",
  "game.categorySort.tagline": "Tap the group each picture belongs to!",
  "game.categorySort.instructions": "A picture shows up — tap the group it belongs to!",

  "game.countingQuiz.name": "Counting Quiz",
  "game.countingQuiz.tagline": "Count the pictures and tap the number word!",
  "game.countingQuiz.instructions": "Count the pictures — tap the matching number word!",
  "game.countingQuiz.howMany": "How many are there?",
  "game.countingQuiz.notQuiteWasNumber": "Not quite! It was {word}.",

  "game.missingLetter.name": "Missing Letter",
  "game.missingLetter.tagline": "Tap the letter that completes the word!",
  "game.missingLetter.instructions": "A word is missing a letter — tap the one that fits!",

  "game.sequenceMemory.name": "Sequence Memory",
  "game.sequenceMemory.tagline": "Watch the pattern, then tap it back in order!",
  "game.sequenceMemory.instructions": "Watch the pattern, then tap it back in the same order!",
  "game.sequenceMemory.result": "You remembered {correct} of {total} patterns!",
  "game.sequenceMemory.watchClosely": "Watch closely...",
  "game.sequenceMemory.yourTurn": "Your turn — tap it back!",
  "game.sequenceMemory.greatMemory": "Great memory!",
  "game.sequenceMemory.notQuiteWatchCloser": "Not quite! Watch closely next time.",

  "game.balloonPop.name": "Balloon Pop",
  "game.balloonPop.tagline": "Pop the balloon that matches before time runs out!",
  "game.balloonPop.instructions": "Pop the balloon that matches the word before time runs out!",
  "game.balloonPop.result": "You popped {correct} of {total} correctly!",

  "game.fastPicks.name": "Fast Picks",
  "game.fastPicks.tagline": "Pick the right word fast — the clock keeps speeding up!",
  "game.fastPicks.instructions": "Pick the right word fast — the clock keeps getting quicker!",

  "game.wordRush.name": "Word Rush",
  "game.wordRush.tagline": "Answer as many as you can in 30 seconds!",
  "game.wordRush.instructions": "Answer as many as you can before the 30-second clock runs out!",

  "game.categoryBlitz.name": "Category Blitz",
  "game.categoryBlitz.tagline": "Sort as many as you can in 30 seconds!",
  "game.categoryBlitz.instructions": "Sort as many pictures as you can before the 30-second clock runs out!",
  "pet.tickles": "Hehe, that tickles!",
  "pet.wheee": "Wheee!",
  "pet.foundMe": "You found me!",
  "pet.giggleGiggle": "Giggle giggle!",
  "pet.againAgain": "Again, again!",
  "pet.hiThere": "Hi there!",
  "pet.yumYum": "Yum yum!",
  "pet.delicious": "Delicious!",
  "pet.morePlease": "More please!",
  "pet.tasty": "Tasty!",
  "pet.happyTapToPlay": "{happiness}% happy — tap to play!",
  "pet.feedButton": "Feed ({cost})",

  // --- Additions: Home / Quests / WordBook / Packs / Cases / Collection / Games chrome ---
  "home.xpToNextLevel": "{current}/{total} XP to next level",
  "home.claimError": "Couldn't claim right now — try again!",
  "home.seeYouTomorrow": "See you tomorrow for another reward!",
  "home.rewardLine": "+{xp} XP · +{coins} coins",
  "home.freePackSuffix": " · free pack!",

  "quests.playToFinish": "Play games to finish your quests.",
  "quests.claimError": "Couldn't claim that yet",

  "wordbook.subtitle": "Review words you've learned to keep them in your memory!",
  "wordbook.dueInTotal": "{count} due in total",
  "wordbook.saveError": "Couldn't save that review — it may not count yet.",
  "wordbook.backToWordBook": "Back to Word Book",

  "packs.openError": "That pack couldn't be opened",
  "packs.buyError": "Couldn't buy that pack",
  "packs.cardsCount": "{count} cards",

  "cases.openError": "That case couldn't be opened",
  "cases.buyError": "Couldn't buy that case",
  "cases.comesWith": "Comes with {items}!",

  "common.buy": "Buy",
  "common.closePreview": "Close preview",

  "collection.redeemError": "Couldn't redeem that card",
  "collection.needMoreShards": "Need {count} more shards",
  "collection.redeemForShards": "✨ Redeem for {count} shards",
  "collection.characters": "Characters",
  "collection.styles": "Styles",
  "collection.unlocksIn": "🔒 Unlocks in {month}",
  "collection.buyError": "Couldn't buy that",

  "games.streakBonus": "🔥 {percent}% streak bonus applied!",
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

  // --- Room/Avatar shop (additions) -------------------------------------
  "common.featuredDiscount": "★ 25% 할인",
  "common.errorEquip": "적용할 수 없어요",
  "common.errorBuy": "구매할 수 없어요",
  "common.errorPlace": "놓을 수 없어요",
  "common.errorRemove": "뺄 수 없어요",
  "room.errorBuySet": "방 세트를 구매할 수 없어요",
  "avatar.errorUnlockDance": "잠금을 해제할 수 없어요",
  "avatar.danceButton": "춤춰요!",
  "avatar.dancingButton": "춤추는 중! 🎉",
  "avatar.unlockDanceParty": "🎉 댄스 파티 잠금 해제 —",
  "avatar.collected": "모았어요",

  "games.savingScore": "점수를 저장하는 중...",
  "games.exit": "← 나가기",
  "games.whatIsThis": "이건 뭘까요?",
  "games.whichGroup": "어느 그룹일까요?",
  "games.scoreOutOf": "{total}개 중 {correct}개 맞혔어요!",
  "games.notQuiteWasCategory": "아쉬워요! 정답은 {category}예요.",
  "games.correctCount": "{count}개 정답",
  "games.streakBonusApplied": "🔥 연속 보너스 {percent}%가 적용됐어요!",
  "games.surpriseChest": "깜짝 상자: 코인 +{coins}개!",
  "games.openingBonusChest": "보너스 상자를 여는 중...",
  "games.practiceRound": "연습 라운드예요 — 내일 다시 오면 보상 라운드를 더 플레이할 수 있어요!",

  "game.wordCatch.name": "단어 잡기",
  "game.wordCatch.tagline": "떨어지기 전에 알맞은 단어를 잡아보세요!",
  "game.wordCatch.instructions": "각 레인에 단어가 떨어져요. 그림과 맞는 단어가 바닥에 닿기 전에 탭하세요!",
  "game.wordCatch.result": "{total}개 중 {correct}개 단어를 맞게 잡았어요!",

  "game.memoryMatch.name": "기억력 짝맞추기",
  "game.memoryMatch.tagline": "카드를 뒤집어 짝을 모두 찾아보세요!",
  "game.memoryMatch.instructions": "한 번에 카드 두 장을 뒤집어서 그림과 단어 짝을 모두 찾아보세요!",
  "game.memoryMatch.gameOverTitle": "모두 맞췄어요!",
  "game.memoryMatch.result": "{moves}번 만에 {pairs}쌍을 모두 찾았어요!",
  "game.memoryMatch.progress": "{matched}/{total} 쌍 · {moves}번",
  "game.memoryMatch.matchFound": "짝을 찾았어요!",
  "game.memoryMatch.notAMatch": "짝이 아니에요, 다시 해보세요!",

  "game.wordScramble.name": "단어 조합",
  "game.wordScramble.tagline": "시간이 끝나기 전에 글자를 맞춰보세요!",
  "game.wordScramble.instructions": "시간이 끝나기 전에 글자를 순서대로 탭해서 단어를 완성하세요!",
  "game.wordScramble.gameOverTitle": "다 끝냈어요!",
  "game.wordScramble.result": "{total}개 중 {correct}개 단어를 맞게 완성했어요!",
  "game.wordScramble.progress": "단어 {current}/{total}",
  "game.wordScramble.tapLettersBelow": "아래 글자를 탭하세요",
  "game.wordScramble.undo": "⌫ 지우기",

  "game.emojiQuiz.name": "이모지 퀴즈",
  "game.emojiQuiz.tagline": "그림과 맞는 단어를 골라보세요!",
  "game.emojiQuiz.instructions": "그림이 나타나요 — 그림과 맞는 단어를 탭하세요!",

  "game.picturePick.name": "그림 찾기",
  "game.picturePick.tagline": "단어가 나타나요 — 맞는 그림을 탭하세요!",
  "game.picturePick.instructions": "단어가 나타나요 — 단어와 맞는 그림을 탭하세요!",
  "game.picturePick.whichPicture": "이건 어느 그림일까요?",

  "game.trueOrFalse.name": "참 또는 거짓",
  "game.trueOrFalse.tagline": "단어가 그림과 맞나요? 예 또는 아니오를 탭하세요!",
  "game.trueOrFalse.instructions": "단어가 그림과 맞나요? ✅ 또는 ❌를 탭하세요!",
  "game.trueOrFalse.yes": "✅ 네",
  "game.trueOrFalse.no": "❌ 아니요",

  "game.oddOneOut.name": "다른 하나 찾기",
  "game.oddOneOut.tagline": "셋은 같은 그룹이에요 — 다른 하나를 찾아보세요!",
  "game.oddOneOut.instructions": "그림 셋은 같은 그룹이에요 — 다른 하나를 탭하세요!",
  "game.oddOneOut.whichOne": "어느 것이 다를까요?",
  "game.oddOneOut.notQuiteDidntBelong": "아쉬워요! 정답은 {word}였어요.",

  "game.categorySort.name": "카테고리 분류",
  "game.categorySort.tagline": "그림이 속한 그룹을 탭하세요!",
  "game.categorySort.instructions": "그림이 나타나요 — 그림이 속한 그룹을 탭하세요!",

  "game.countingQuiz.name": "숫자 세기 퀴즈",
  "game.countingQuiz.tagline": "그림 개수를 세고 숫자 단어를 탭하세요!",
  "game.countingQuiz.instructions": "그림 개수를 세어보고 맞는 숫자 단어를 탭하세요!",
  "game.countingQuiz.howMany": "몇 개가 있을까요?",
  "game.countingQuiz.notQuiteWasNumber": "아쉬워요! 정답은 {word}였어요.",

  "game.missingLetter.name": "빠진 글자 찾기",
  "game.missingLetter.tagline": "단어를 완성하는 글자를 탭하세요!",
  "game.missingLetter.instructions": "단어에 글자 하나가 빠졌어요 — 알맞은 글자를 탭하세요!",

  "game.sequenceMemory.name": "순서 기억하기",
  "game.sequenceMemory.tagline": "패턴을 보고 순서대로 따라 탭하세요!",
  "game.sequenceMemory.instructions": "패턴을 잘 보고 같은 순서로 따라 탭하세요!",
  "game.sequenceMemory.result": "{total}개 중 {correct}개 패턴을 기억했어요!",
  "game.sequenceMemory.watchClosely": "잘 보세요...",
  "game.sequenceMemory.yourTurn": "이제 당신 차례예요 — 따라 탭하세요!",
  "game.sequenceMemory.greatMemory": "기억력이 대단해요!",
  "game.sequenceMemory.notQuiteWatchCloser": "아쉬워요! 다음엔 더 잘 보세요.",

  "game.balloonPop.name": "풍선 터뜨리기",
  "game.balloonPop.tagline": "시간이 끝나기 전에 맞는 풍선을 터뜨리세요!",
  "game.balloonPop.instructions": "시간이 끝나기 전에 단어와 맞는 풍선을 터뜨리세요!",
  "game.balloonPop.result": "{total}개 중 {correct}개를 맞게 터뜨렸어요!",

  "game.fastPicks.name": "빠른 선택",
  "game.fastPicks.tagline": "시계가 점점 빨라져요 — 알맞은 단어를 빠르게 고르세요!",
  "game.fastPicks.instructions": "시계가 점점 더 빨라져요 — 알맞은 단어를 빠르게 고르세요!",

  "game.wordRush.name": "단어 러시",
  "game.wordRush.tagline": "30초 안에 최대한 많이 맞혀보세요!",
  "game.wordRush.instructions": "30초 타이머가 끝나기 전에 최대한 많이 맞혀보세요!",

  "game.categoryBlitz.name": "카테고리 블리츠",
  "game.categoryBlitz.tagline": "30초 안에 최대한 많이 분류해보세요!",
  "game.categoryBlitz.instructions": "30초 타이머가 끝나기 전에 그림을 최대한 많이 분류해보세요!",
  "pet.tickles": "히히, 간지러워요!",
  "pet.wheee": "우와아!",
  "pet.foundMe": "저를 찾았네요!",
  "pet.giggleGiggle": "키득키득!",
  "pet.againAgain": "또 해줘요, 또!",
  "pet.hiThere": "안녕하세요!",
  "pet.yumYum": "냠냠!",
  "pet.delicious": "진짜 맛있어요!",
  "pet.morePlease": "더 주세요!",
  "pet.tasty": "꿀맛이에요!",
  "pet.happyTapToPlay": "행복도 {happiness}% — 눌러서 놀아주세요!",
  "pet.feedButton": "먹이 주기 ({cost})",

  "home.xpToNextLevel": "다음 레벨까지 XP {current}/{total}",
  "home.claimError": "지금은 받을 수 없어요 — 다시 시도해 주세요!",
  "home.seeYouTomorrow": "내일 또 다른 보상을 받으러 오세요!",
  "home.rewardLine": "+{xp} XP · +{coins} 코인",
  "home.freePackSuffix": " · 무료 팩도 있어요!",

  "quests.playToFinish": "게임을 플레이해서 퀘스트를 완료해요.",
  "quests.claimError": "아직 받을 수 없어요",

  "wordbook.subtitle": "배운 단어를 복습해서 기억 속에 오래 남겨보세요!",
  "wordbook.dueInTotal": "총 {count}개 복습 필요",
  "wordbook.saveError": "복습 결과를 저장하지 못했어요 — 반영되지 않을 수 있어요.",
  "wordbook.backToWordBook": "단어장으로 돌아가기",

  "packs.openError": "팩을 열 수 없었어요",
  "packs.buyError": "팩을 구매할 수 없었어요",
  "packs.cardsCount": "카드 {count}장",

  "cases.openError": "케이스를 열 수 없었어요",
  "cases.buyError": "케이스를 구매할 수 없었어요",
  "cases.comesWith": "{items}도 함께 와요!",

  "common.buy": "구매",
  "common.closePreview": "미리보기 닫기",

  "collection.redeemError": "카드를 교환할 수 없었어요",
  "collection.needMoreShards": "조각이 {count}개 더 필요해요",
  "collection.redeemForShards": "✨ 조각 {count}개로 교환하기",
  "collection.characters": "캐릭터",
  "collection.styles": "스타일",
  "collection.unlocksIn": "🔒 {month}에 열려요",
  "collection.buyError": "구매할 수 없었어요",

  "games.streakBonus": "🔥 스트릭 보너스 {percent}%가 적용됐어요!",
};

export const translations: Record<Language, Record<TranslationKey, string>> = { en, ko };
