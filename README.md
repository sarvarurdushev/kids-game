# Golden Kids Adventure Universe

The student-facing app for Golden Kids' child engagement ecosystem: a
2-5-minute/day collectible-card-and-progression loop (XP, levels, card packs,
a collection book, an avatar customizer, achievements) that keeps kids ages
4-10 excited about Golden Kids outside class hours. Not a game with battles
or PvP, not homework — just collecting, unlocking, and showing off progress.

This is Phase 1: the student app's core loop. Parent portal, teacher/admin
tooling, and multi-location support are intentionally out of scope for now.

## Stack

Next.js (App Router) + TypeScript + Tailwind, Postgres via Drizzle ORM +
`postgres.js` (not the supabase-js client — the reward engine needs real
transactions with row locks), `jose` for session cookies, `@node-rs/argon2`
for PIN hashing, `zod` for validation, `motion` for pack-opening/level-up
animation, `vitest` for tests.

## Setup

```bash
cp .env.example .env.local   # fill in DATABASE_URL, SESSION_SECRET, etc.
npm install
npm run db:migrate           # applies lib/db/migrations/ to your database
npm run seed                 # universes, characters, packs, achievements,
                              # levels, avatar items, webhook clients, and
                              # two demo students — prints their enrollment
                              # codes/PINs to the console
npm run dev
```

Open `http://localhost:3000`, enter a demo student's enrollment code, then
their PIN (both printed by `npm run seed`).

## Exercising the reward engine locally

There's no real classroom-AI integration wired up yet. Drive the same code
path a real integration will use with:

```bash
npm run simulate-event -- --student demo-amira --attendance true --participation 85 --speaking 90 --teamwork 75
npm run simulate-event -- --student demo-amira --activity-completed true --program discovery --repeat 10
```

See `docs/API.md` for the full webhook contract (payload shape, auth,
idempotency, response format) — this is what `smart-class-vision`,
`class-seer-magic`, `bright-class-lens`, and `goldenkids` will eventually
call.

## Other scripts

```bash
npm run create-student -- --name "Layla" [--pin 1234] [--source goldenkids] [--external-id ext-123]
npm run reset-pin -- --code GOLD-AMIRA [--pin 5678]
npm test                     # reward-engine unit + integration tests
npm run db:studio            # Drizzle Studio, browse the schema/data
```

There's no admin UI or self-service PIN reset yet (no parent portal in
Phase 1) — these CLI scripts are the only way to manage students for now.
