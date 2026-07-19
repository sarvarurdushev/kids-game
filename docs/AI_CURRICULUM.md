# AI Lab: an AI-literacy + English curriculum for ages 4–8

This document specifies the "AI Lab" curriculum added to the Golden Kids
Adventure Universe app: two age-banded tracks that teach foundational AI
literacy concepts *through* English-language practice, instead of as two
separate subjects. It's built the same way `littlelit.ai` and Code.org's
`AI for Oceans` pitch themselves — "learn AI by doing," not by lecture —
but scoped down to what 4–8 year-olds can actually do inside a 5–10 minute
mobile session, and without any live chatbot/LLM in the loop (see
[Safety](#safety-why-theres-no-live-chatbot) below).

## Research summary

**AI literacy framework.** We anchor concepts to MIT/Harvard's
[AI4K12 "Five Big Ideas in AI"](https://ai4k12.org/) — perception,
representation & reasoning, learning, natural interaction, and societal
impact — the framework most K-12 AI curricula (including analyses of
children's AI books) use to sequence what's age-appropriate. [Machine
Learning and the Five Big Ideas in
AI](https://par.nsf.gov/servlets/purl/10415002) (Touretzky et al.) is the
canonical source; [early-childhood adaptations of the
framework](https://link.springer.com/article/10.1007/s44436-026-00030-w)
confirm perception, learning, and simple algorithms are the ideas 4–8
year-olds can actually grasp — reasoning about bias/fairness and natural
interaction stay shallow until later grades.

**Activity design.** [Code.org's AI for
Oceans](https://code.org/oceans) and MIT RAISE's [Day of
AI](https://dayofai.org/) both teach "AI learns from labeled examples, and
can get it wrong" through a sort-and-guess game rather than
explanation — kids train a classifier by hand-labeling items, then watch
it guess and correct it. That mechanic (not a lecture, not a quiz) is what
`Train the Robot` in this curriculum is modeled on. Day of AI's unplugged
activities also use ordered-step ("algorithm") building for younger grades
instead of real code, which is what `Sequence Builder` is modeled on.

**English pedagogy for this age band.** Two things repeatedly showed up:
(1) [phonics/vocabulary instruction works best in short (10–15 min),
frequent, high-repetition
sessions](https://www.learn2read.co/blogs/when-should-phonics-be-taught/),
and (2) [Total Physical Response / comprehensible
input](https://www.colorincolorado.org/teaching-ells/ell-classroom-strategy-library/total-physical-response) —
letting kids demonstrate understanding through action (tapping, sorting,
ordering) before requiring spoken/written production — measurably lowers
anxiety and speeds acquisition versus requiring speech up front. That's
why both AI Lab games are point-and-tap, not type-or-speak, and why every
round is read aloud (below), not just printed as text 4-year-olds can't
yet decode.

**Session/retention design.** EdTech gamification research (Duolingo-style
apps) converges on 5–10 minute sessions with immediate feedback, daily
replay, and difficulty that quietly scales with mastery — [a spaced-repetition
engine disguised as a game](https://dev.to/oceanviewgames/gamifying-language-learning-design-principles-for-edtech-1ban) —
rather than explicit flashcard review, which loses younger kids. AI Lab
reuses the app's existing daily-capped-rewarded-rounds mechanic
(`lib/reward-engine/gameSession.ts`) for exactly this reason: it's
already the "disguised spacing" mechanic the rest of the app uses for
`Word Catch` / `Memory Match` / `Word Scramble`, so a kid revisits AI Lab
content on the same daily cadence as everything else instead of learning
a second app rhythm.

**Screen time.** The [AAP's current guidance](https://www.aap.org/en/patient-care/media-and-children/center-of-excellence-on-social-media-and-youth-mental-health/qa-portal/qa-portal-library/qa-portal-library-questions/screen-time-guidelines/)
has moved away from hard time limits toward quality + co-viewing +
conversation. AI Lab leans into that: every unit ends with a
parent-facing "talk about it" prompt (see unit tables below), sessions
are capped by the existing 3-rewarded-rounds/day mechanic rather than a
clock, and nothing requires a login-less/unsupervised mode.

**Chatbot safety.** COPPA requires verifiable parental consent before any
service targeting under-13s collects data, and [general-purpose chat
products aren't calibrated for
kids](https://www.jetlearn.com/blog/ai-chatbots-for-kids-the-ultimate-parents-guide-to-safe-digital-learning) —
logs get used for training, responses aren't age-filtered, and chat's
validating-by-design tone is a bad model for how real relationships work.
This app has no LLM integration at all today (no API key, no chat
surface), and AI Lab doesn't add one. "Talking to AI" is taught through
static, hand-written illustrated dialogue cards, not a live model — see
[Safety](#safety-why-theres-no-live-chatbot).

## The two tracks

| | **Little Sparks** (ages 4–5) | **AI Explorers** (ages 6+) |
|---|---|---|
| Reading level | Pre-reader — every line has a 🔊 read-aloud button, emoji-first | Early reader — full sentences, read-aloud still available |
| Session | Untimed, 2 categories per round, 3-step sequences | Light timer on sequences, 2–4 categories, 3–5 step sequences |
| New vocabulary/unit | 4–6 words | 6–10 words |
| AI framing | Concrete + personified ("Sparx is learning") | Names the ideas explicitly ("this is called *training data*") |

Track is picked on `/ai-lab` and passed through as a `?track=` param to
both games, which scales round count, timer, and category-pair pool
accordingly (`lib/ai-lab/curriculum.ts`).

## Units

Every unit pairs one **AI4K12 big idea** with one **English learning
objective**, and is delivered by one of the two AI Lab games.

### Unit 1 — "Teach Sparx to Sort" → `Train the Robot`

- **Big ideas:** Perception (recognizing what something is) · Learning
  (AI improves from labeled examples) · Societal impact, lightly (AI
  guesses can be wrong; that's normal, not scary)
- **English objective:** category nouns (*animal / vehicle*, *fruit /
  vegetable*, *land / water*, *living / not living*) and the sentence
  frame "A ___ is a/an ___."
- **Mechanic:** kid sorts a run of items into two labeled buckets
  (teaching rounds), then Sparx starts guessing and the kid has to judge
  whether Sparx got it right (quiz rounds) — same trained-classifier loop
  as AI for Oceans, mediated by tapping instead of code.
- **Talk about it:** "Where else have you seen something try to guess
  what a picture is — a photo app that finds people, a game that
  recognizes your voice?"

### Unit 2 — "Give Sparx the Steps" → `Sequence Builder`

- **Big idea:** Representation & reasoning — an algorithm is just an
  exact, ordered list of steps, and a computer will follow it exactly
  even if the order is wrong.
- **English objective:** sequencing connectives — *first, next, then,
  last* — narrating a routine (morning routine, making a sandwich,
  planting a seed, bedtime) start to finish.
- **Mechanic:** kid taps shuffled step cards into the right order; wrong
  order gets called out and re-tried, right order plays the routine back
  narrated with the connective words.
- **Talk about it:** "What would happen if you told Sparx to 'eat
  breakfast, then wake up'? Robots do exactly what you tell them, in
  order — that's why the order matters!"

### Unit 3 — "Talking to AI Safely" (reading, no game)

- **Big ideas:** Natural interaction + societal impact — how talking to
  an AI is different from talking to a person, and the ground rules for
  it.
- **English objective:** reading four short safety statements aloud
  (with 🔊 support); AI Explorers track only — Little Sparks isn't old
  enough for this content to be actionable yet.
- **Format:** four static illustrated cards on `/ai-lab` (not a chatbot —
  see below): AI only knows what it's shown/told; never share your real
  name, address, or photos with an AI without a grown-up; if an AI says
  something confusing or scary, tell a grown-up; AI can be wrong, same as
  Sparx was in Unit 1, so it's fine to double-check it.

## Safety: why there's no live chatbot

`littlelit.ai` and similar products put an actual LLM in front of kids.
This app doesn't have an LLM integration (no API key in `.env.example`,
no chat surface anywhere in the codebase), and AI Lab deliberately doesn't
add one:

1. **COPPA.** A live chat surface for under-13s is a data-collection
   product requiring verifiable parental consent, logging/retention
   policy, and content moderation — a different compliance surface than
   the rest of this app, which only stores gameplay/progress data already
   covered by the existing student-enrollment consent flow.
2. **Pedagogically unnecessary.** At 4–8, "how AI understands language" is
   better taught as a *concept* (Unit 3's cards) than as a live
   conversation the child has to parse and produce English in — that's a
   harder skill than the curriculum is targeting yet.
3. **It's simulable.** The two mechanics kids actually need — "AI learns
   from examples and can be wrong" and "AI follows exact instructions in
   order" — are fully demonstrable with scripted, deterministic content,
   which is also easier to guarantee is age-appropriate every single time
   it's shown.

If a future version wants real conversational practice, it should be a
separate, explicitly-scoped decision (server-mediated, age-filtered,
logged, parent-visible) — not a default add-on to this curriculum.

## Where this lives in the codebase

- `lib/ai-lab/curriculum.ts` — tracks, units, category pairs, and
  sequence routines (content only, no game logic).
- `lib/speech.ts` — `speak()` wrapper around the browser's
  `SpeechSynthesis` API for the 🔊 read-aloud buttons (client-side only,
  nothing sent to a server).
- `components/games/TrainTheRobot.tsx`, `components/games/SequenceBuilder.tsx`
  — the two games, built the same way as the existing arcade games
  (`WordScramble.tsx`, `MemoryMatch.tsx`): client components that call
  `POST /api/games/[gameKey]/complete` and rely on the existing
  `completeGameSession` reward engine — same daily-capped rewarded-rounds
  mechanic, no new backend concept introduced.
- `app/(student)/ai-lab/*` — the curriculum landing page (track picker +
  unit list + Unit 3 safety cards) and the two game routes.

New `GameKey`s (`train_the_robot`, `sequence_builder`) were added to
`lib/reward-engine/gameSession.ts`'s `GAME_KEYS`; no schema migration was
needed since `game_sessions.game_key` is a free-text column, not an enum,
and — matching the existing arcade games — AI Lab rounds award XP/coins
only, with no dedicated achievements (none of the three existing games
have any either).
