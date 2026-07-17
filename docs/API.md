# Classroom event webhook

This is the integration contract for the classroom-AI systems that award XP —
today that's a manual test script; eventually it's `goldenkids`,
`smart-class-vision`, `class-seer-magic`, and `bright-class-lens` calling in.
Treat this as a stable, versioned contract: adding new optional fields is
fine, changing the meaning of an existing field is not.

## `POST /api/webhooks/classroom`

### Auth

Send the shared secret issued to your system in a header:

```
x-webhook-secret: <your secret>
```

Each calling system gets its own secret, stored as a `webhook_clients` row
(`source_system`, hashed secret). An invalid or missing secret returns `401`.
There's no self-service way to rotate/issue secrets yet — ask a Golden Kids
engineer to add a row via the seed script or a one-off insert.

### Linking students first

Before events for a student can be processed, that student needs a
`student_external_refs` row mapping `(source_system, external_id)` to a
Golden Kids student. There's no API for this yet either — it's done via
`scripts/create-student.ts` (`--source` / `--external-id` flags) or a direct
insert. An event for an unlinked student returns `422` with
`status: "unresolved_student"` and is logged, not silently dropped.

### Request body

```jsonc
{
  // Recommended: your own event id. Redelivering the same
  // (source_system, external_event_id) pair is a no-op — the original
  // result is returned unchanged instead of double-awarding XP/coins.
  "external_event_id": "class-2026-07-17-amira-001",

  // Required: the id you use to identify this student in your own system.
  "student_external_id": "amira-042",

  // Optional. One of: "story_craft" | "discovery" | "mission_english" | "creative".
  // Required for activity-completion rules to match (see table below).
  "program": "discovery",

  // All of the below are optional — send whatever your system actually
  // measured for this session. Anything omitted simply won't trigger the
  // rules that depend on it.
  "attendance": true,
  "participation_score": 85,      // 0-100
  "speaking_score": 90,           // 0-100
  "confidence_score": 70,         // 0-100 — logged, not yet tied to XP (see note below)
  "teamwork_score": 75,           // 0-100
  "engagement_score": 80,         // 0-100 — logged, not yet tied to XP
  "behavior_score": 95,           // 0-100 — logged, not yet tied to XP
  "activity_completed": true,

  "occurred_at": "2026-07-17T09:15:00Z" // optional, informational
}
```

> **Note on the three "logged, not yet tied to XP" fields**: the product
> spec's XP rules don't reference `confidence_score`, `engagement_score`, or
> `behavior_score`. They're validated and stored in full on the
> `webhook_events` audit row so they aren't lost, but they don't currently
> generate XP/coins. Wiring them up later is a data change (new
> `reward_rules` rows), not a schema or contract change.

### What triggers a reward

Rules are stored in the `reward_rules` table and can be tuned without a
deploy. As seeded today:

| Rule | Fires when | XP | Coins |
|---|---|---|---|
| `class_attendance` | `attendance === true` | 50 | 20 |
| `active_participation` | `participation_score >= 70` | 25 | 10 |
| `excellent_speaking` | `speaking_score >= 80` | 25 | 10 |
| `teamwork` | `teamwork_score >= 70` | 15 | 6 |
| `discovery_activity_completed` | `activity_completed === true` and `program === "discovery"` | 20 | 8 |
| `story_activity_completed` | `activity_completed === true` and `program === "story_craft"` | 20 | 8 |

A single event can trigger multiple rules (e.g. attendance + participation
together). XP from all triggered rules is summed, checked against the level
curve, and every level crossed (not just the last one) applies its bonus
coins/pack. Achievement unlocks tied to any of the above `event_key`s are
checked in the same request.

### Response

```jsonc
// 200 — new event, rewards applied
{
  "status": "processed",
  "webhookEventId": "...",
  "studentId": "...",
  "xpAwarded": 75,
  "coinsAwarded": 30,
  "triggeredRules": ["class_attendance", "active_participation"],
  "levelsCrossed": [2],
  "achievementsUnlocked": ["first_class"],
  "packsGranted": ["<pack_grant_id>"]
}

// 200 — redelivery of an external_event_id already processed; same shape as
// the original response, status changed to "duplicate", nothing re-applied
{ "status": "duplicate", "webhookEventId": "...", "...": "..." }

// 422 — student_external_id has no student_external_refs row yet
{ "status": "unresolved_student", "webhookEventId": "..." }

// 400 — payload failed validation
{ "error": "Invalid payload", "details": { "...": "zod field errors" } }

// 401 — missing/invalid x-webhook-secret
{ "error": "Invalid or missing webhook secret" }
```

## Local testing without a real integration

`POST /api/dev/simulate-event` is a thin wrapper around the same engine,
gated by a `x-dev-secret` header (`DEV_WEBHOOK_SECRET` in `.env.local`) and
disabled outright when `NODE_ENV=production`. It takes the same body as
above plus a `source_system` field (since there's no real caller to derive
it from). Drive it with:

```bash
npm run simulate-event -- --student demo-amira --attendance true --participation 85 --speaking 90 --teamwork 75
npm run simulate-event -- --student demo-amira --activity-completed true --program discovery --repeat 10
```

`--repeat N` fires the same payload N times with distinct auto-generated
`external_event_id`s — useful for crossing counter-based achievement
thresholds (e.g. Explorer at 10 Discovery completions) without scripting a
loop yourself.
