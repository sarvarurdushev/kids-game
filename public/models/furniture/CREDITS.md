# Room furniture model credits

Room prop models used by the room's `furniture`/`furniture_small`/
`furniture_wall` slots, loaded via `Prop3D` in
`components/three/RoomScene3D.tsx`. All static (no animations) — Prop3D
normalizes each to its own target height from its bounding box (unlike
standing characters, furniture pieces don't share a common height).
`furniture_wall` items use `Prop3D`'s `anchor="wall"` mode (centered on
its wall-mount position instead of resting on the floor).

## AI-generated (Tripo3D, commercial license via paid plan)

| File | Prop | Source |
| --- | --- | --- |
| `plant.glb` | Potted plant | Tripo3D (text→image→3D, v3.1) |
| `lamp.glb` | Floor lamp | Tripo3D (text→image→3D, v3.1) |
| `chest.glb` | Treasure chest | Tripo3D (text→image→3D, v3.1) |
| `bookshelf.glb` | Bookshelf | Tripo3D (text→image→3D, v3.1) |
| `wall_clock.glb` | Wall clock | Tripo3D (text→image→3D, v3.1) |
| `wall_picture.glb` | Sunny picture (sun icon) | Tripo3D (text→image→3D, v3.1) |
| `wall_shelf.glb` | Floating shelf with books (labeled "pastel bookshelf" by the generator, but it's a small wall shelf — flat, wide, low profile) | Tripo3D (text→image→3D, v3.1) |
| `furniture_desk.glb` | Study desk with laptop | Tripo3D (text→image→3D, v3.1) |
| `furniture_bed.glb` | Pastel bed | Tripo3D (text→image→3D, v3.1) |
| `furniture_beanbag.glb` | Donut bean bag chair | Tripo3D (text→image→3D, v3.1) |
| `furniture_teddy.glb` | Teddy bear | Tripo3D (text→image→3D, v3.1) |

Generated via account-holder's paid Tripo3D plan (private models,
commercial use license) — not third-party CC-licensed content, so no
attribution required, but also not freely redistributable outside this
project. Textures resized/recompressed with `scripts/optimize-glb.py`
(same pipeline as `public/models/animals/`) to stay within a similar
size/performance budget as the animal roster.

## "Dream Room Scene" legendary tier — photorealistic scene composites

These 7 came out of the same Tripo3D batch as a distinctly different
generation style from everything else above: detailed, realistic
multi-object scene composites (a whole furnished corner, not a single
clean prop) rather than one isolated flat-shaded item. Rather than force
them into the plain-furniture look, they're a separate premium tier —
same `furniture` (large) slot mechanically, `legendary` rarity, priced
higher as "fancy imported" statement pieces (see `scripts/seed.ts`).
Flagging the style difference here for future-you: if you're tuning
`targetHeight` or expecting the flat-pastel look, these will look more
detailed/realistic than the rest of the room by design.

| File | Prop | Source |
| --- | --- | --- |
| `scene_story_corner.glb` | Dreamy Story Corner (kids' room decor corner) | Tripo3D (text→image→3D, v3.1) |
| `scene_starlit_bed.glb` | Starlit Bed Nook (starry night bedroom) | Tripo3D (text→image→3D, v3.1) |
| `scene_nursery_corner.glb` | Cozy Nursery Corner (nursery crib) | Tripo3D (text→image→3D, v3.1) |
| `scene_playground.glb` | Backyard Playground (colorful playground) | Tripo3D (text→image→3D, v3.1) |
| `scene_toy_corner.glb` | Pastel Toy Corner (stuffed fox plush) | Tripo3D (text→image→3D, v3.1) |
| `scene_blush_rug.glb` | Blush Playtime Rug (pink round rug) | Tripo3D (text→image→3D, v3.1) |
| `scene_woven_nook.glb` | Woven Basket Nook (round woven rug) | Tripo3D (text→image→3D, v3.1) |

Same license terms and optimization pipeline as the section above.
