# Tripo3D Asset Generation Guide — Golden Kids

Everything the app can actually use right now, with copy-paste prompts.
Generate in whatever order you like; each section is independent.

## Global style rules (append to EVERY prompt)

Tripo3D drifts toward realistic/detailed output unless you pin the style. Add
this suffix to every prompt below so new assets match the existing roster:

> `, low-poly stylized 3D game asset, smooth rounded shapes, soft matte pastel
> colors, flat shading, clean silhouette, no text, no logos, single centered
> object on a plain background, children's toy aesthetic`

## Export settings

- Format: **GLB** (not FBX/OBJ — the app loads GLB via three.js)
- Include textures: **yes** (embedded)
- Target size: **under ~2 MB per asset** if Tripo offers a decimate/optimize
  option. Larger is workable (I can optimize on my side) but slower to load.
- Do **not** rig / do not request animation. Every model in the app is
  unrigged and animated procedurally — consistency matters more than rigging.

## File naming

Name each file exactly as the `key` given in its row below, plus `.glb`.
Example: `wall_clock.glb`. Wrong names are fine — just tell me which file is
which — but correct names let me integrate without asking.

---

## SECTION 1 — Wall decor (highest priority — replaces placeholders)

The room already has three wall-decor items, but they're **hand-drawn flat
shapes I built directly in code**, not real 3D assets — a stopgap until real
ones exist. These three are the highest-value thing you can generate: they
directly replace something visibly lower-quality than the rest of the room.

These should read as **flat-ish and front-facing** — they mount on a wall.

| key | replaces | prompt |
|---|---|---|
| `wall_shelf` | placeholder floating shelf | a small floating wooden wall shelf holding three tiny colorful books, flat back, front facing |
| `wall_clock` | placeholder clock | a round wall clock with a cream face and simple black hands, flat back, front facing |
| `wall_picture` | placeholder sun picture | a framed picture of a smiling yellow sun in a wooden frame, flat back, front facing |

Optional extras for the same slot, if you want more variety than a 1-for-1 swap:

| key | prompt |
|---|---|
| `wall_pennant` | a triangular felt pennant flag banner in bright colors, front facing, flat back |
| `wall_window` | a square window frame with a blue sky and one fluffy cloud visible, flat back |
| `wall_star` | a hanging decorative gold star ornament, front facing |

---

## SECTION 2 — More furniture variety (secondary)

The room's other two furniture slots each only have **2 pieces** right now
(large: a treasure chest and a bookshelf; small: a potted plant and a reading
lamp — all real Tripo3D assets already). More options make the shop feel
richer. New "room sets" (bundled purchases) can be built entirely from new
furniture like this — no new wallpaper/floor art needed, since room sets
already bundle whatever combination of pieces makes sense.

### 2a. Big furniture (back wall, large footprint) — `slot: furniture_large`

| key | prompt |
|---|---|
| `furniture_bed` | a cozy children's bed with a soft blue blanket and one pillow |
| `furniture_desk` | a small wooden study desk with a closed laptop and a cup of pencils |
| `furniture_wardrobe` | a tall rounded wooden wardrobe with two doors and round knobs |
| `furniture_sofa` | a small round two-seat sofa in warm cream fabric |

### 2b. Small furniture (floor, foreground) — `slot: furniture_small`

| key | prompt |
|---|---|
| `furniture_beanbag` | a squishy round beanbag chair in soft coral pink |
| `furniture_teddy` | a small sitting teddy bear plush toy, arms out |
| `furniture_globe` | a small desk globe on a wooden stand |
| `furniture_stool` | a small round wooden stool with three legs |

---

## SECTION 3 — More species (optional, lowest priority)

Only if you want to grow the animal roster past the current 21. Same style
suffix; these should be **standing upright on two legs, front facing, full
body** to match the existing characters.

Suggested additions that pair well with curriculum topics:
`species_dolphin`, `species_turtle`, `species_octopus` (ocean/environment),
`species_parrot`, `species_flamingo` (animals), `species_hedgehog`,
`species_otter`, `species_llama` (general cute roster).

Prompt pattern:

> `a cute chubby cartoon [ANIMAL] character standing upright on two legs, front
> facing, full body, big friendly eyes` + global style suffix

---

## What's NOT on this list (and why)

**Wallpaper and floor** — these are procedural (drawn in code, not loaded
from files) and there's no rendering pipeline for GLB versions of them yet.
Building one would be real new engineering for a visual upgrade kids are
unlikely to notice next to everything else, so it's not worth your generation
time right now. If that changes later I'll say so.

## What to send back

Just the `.glb` files, however is easiest (zip is fine). Tell me which section
each batch belongs to. I'll handle normalization, scaling, floor/wall
placement, pricing, and wiring them into the shop.

If a model comes out badly proportioned or facing the wrong way, send it
anyway and flag it — the loader auto-normalizes height and centering, so a lot
of "wrong looking" exports still land fine in-app.
