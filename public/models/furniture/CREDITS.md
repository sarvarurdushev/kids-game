# Room furniture model credits

Room prop models used by the room's `furniture` slot, loaded via `Prop3D`
in `components/three/RoomScene3D.tsx`. All static (no animations) —
Prop3D normalizes each to its own target height from its bounding box
(unlike standing characters, furniture pieces don't share a common height).

## AI-generated (Tripo3D, commercial license via paid plan)

| File | Prop | Source |
| --- | --- | --- |
| `plant.glb` | Potted plant | Tripo3D (text→image→3D, v3.1) |
| `lamp.glb` | Floor lamp | Tripo3D (text→image→3D, v3.1) |
| `chest.glb` | Treasure chest | Tripo3D (text→image→3D, v3.1) |
| `bookshelf.glb` | Bookshelf | Tripo3D (text→image→3D, v3.1) |

Generated via account-holder's paid Tripo3D plan (private models,
commercial use license) — not third-party CC-licensed content, so no
attribution required, but also not freely redistributable outside this
project. Textures resized/recompressed with `scripts/optimize-glb.py`
(same pipeline as `public/models/animals/`) to stay within a similar
size/performance budget as the animal roster.
