# Tripo3D Asset Generation Guide — Golden Kids

Everything the app needs you to generate, with copy-paste prompts. Generate in
whatever order you like; each section is independent and can be integrated as
it arrives.

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
- Do **not** rig / do not request animation. The app animates procedurally, and
  every current model is unrigged — consistency matters more than rigging.

## File naming

Name each file exactly as the `key` given in its row below, plus `.glb`.
Example: `furniture_bed.glb`. Wrong names are fine — just tell me which file
is which — but correct names let me integrate without asking.

---

## SECTION 1 — Furniture (highest priority)

The room currently has **one** furniture slot with 4 pieces. The plan expands
it to **three simultaneous slots** so a room feels decorated rather than empty.
That needs a real spread of pieces per slot.

### 1a. Big furniture (back wall, large footprint) — `slot: furniture_large`

| key | prompt |
|---|---|
| `furniture_bed` | a cozy children's bed with a soft blue blanket and one pillow |
| `furniture_sofa` | a small round two-seat sofa in warm cream fabric |
| `furniture_desk` | a small wooden study desk with a closed laptop and a cup of pencils |
| `furniture_wardrobe` | a tall rounded wooden wardrobe with two doors and round knobs |
| `furniture_toybox` | an open wooden toy box overflowing with soft toy blocks and a ball |
| `furniture_piano` | a small upright toy piano in cream and gold |

### 1b. Small furniture (floor, foreground) — `slot: furniture_small`

| key | prompt |
|---|---|
| `furniture_beanbag` | a squishy round beanbag chair in soft coral pink |
| `furniture_teddy` | a small sitting teddy bear plush toy, arms out |
| `furniture_ball` | a colorful striped beach ball resting on the floor |
| `furniture_blocks` | a small stack of four wooden alphabet blocks |
| `furniture_stool` | a small round wooden stool with three legs |
| `furniture_globe` | a small desk globe on a wooden stand |

### 1c. Wall decor (hangs on the back wall) — `slot: furniture_wall`

These should read as **flat-ish and front-facing** — they mount on a wall.

| key | prompt |
|---|---|
| `furniture_clock` | a round wall clock with a cream face and simple hands, front facing |
| `furniture_picture` | a framed picture of a smiling yellow sun, front facing, flat back |
| `furniture_shelf` | a small floating wall shelf holding three tiny books, flat back |
| `furniture_pennant` | a triangular felt pennant flag banner, front facing, flat back |
| `furniture_window` | a square window frame with a blue sky and one cloud visible, flat back |
| `furniture_star` | a hanging decorative gold star ornament, front facing |

---

## SECTION 2 — Complete Room Sets

Each set = **1 wallpaper panel + 1 floor tile + 1 hero furniture piece**, sold
as one bundle. Generate all three parts per set you want.

For wallpaper: add `, flat rectangular wall panel, front facing, seamless
pattern` to the prompt.
For floor: add `, flat square floor tile viewed from above, seamless tiling
pattern` to the prompt.

| set | wallpaper | floor | hero piece |
|---|---|---|---|
| **Space Explorer** (`room_space`) | deep navy wall with small golden stars and a crescent moon | dark grey metal launchpad panel with warning stripes | a telescope on a wooden tripod |
| **Jungle Adventure** (`room_jungle`) | lush green wall of layered tropical leaves | a dirt path with scattered small stones and grass | a small wooden treehouse with a rope ladder |
| **Under the Sea** (`room_ocean`) | aqua blue wall with rising bubbles and seaweed | golden sandy seabed with small seashells | an open treasure chest with gold coins and pearls |
| **Dino Discovery** (`room_dino`) | prehistoric wall of tall green ferns and palm fronds | cracked dry earth with small volcanic rocks | a nest of speckled dinosaur eggs |
| **Princess Castle** (`room_castle`) | soft pink wall with a gold damask pattern | polished white and gold marble tiles | a small ornate jewelry box shaped like a castle turret |
| **Superhero HQ** (`room_hero`) | bold comic-book wall with halftone dots and a starburst | a city rooftop with concrete tiles and a skylight | a trophy on a pedestal beside a red cape stand |
| **Cozy Campfire** (`room_campfire`) | a night forest wall of dark pine tree silhouettes under stars | a grassy clearing with small wildflowers | a campfire of stacked logs with warm orange flames |

---

## SECTION 3 — More Species (optional, lower priority)

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

## What to send back

Just the `.glb` files, however is easiest (zip is fine). Tell me which section
each batch belongs to. I'll handle normalization, scaling, floor placement,
pricing, and wiring them into the shop.

If a model comes out badly proportioned or facing the wrong way, send it
anyway and flag it — the loader auto-normalizes height and centering, so a lot
of "wrong looking" exports still land fine in-app.
