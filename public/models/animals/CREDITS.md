# Animal model credits

3D species models used by the avatar's `species` slot, loaded via
`useGLTF` in `components/three/AnimalCharacter3D.tsx`. Rigged models play
their `Idle`-equivalent animation clip; static models render a fixed pose
(same as any glTF model with no `animations` array).

## CC0 (no attribution required, listed for provenance)

| File | Species | Author | Source | Rigged/animated? |
| --- | --- | --- | --- | --- |
| `alpaca.glb` | Alpaca | Quaternius | poly.pizza/m/bCVFD48i2l | Yes |
| `bull.glb` | Bull | Quaternius | poly.pizza/m/a8PIIYwF7r | Yes |
| `stag.glb` | Stag | Quaternius | poly.pizza/m/tQdzbZ1Cmw | Yes |
| `husky.glb` | Husky | Quaternius | poly.pizza/m/wcWiuEqwzq | Yes |
| `white_horse.glb` | White Horse | Quaternius | poly.pizza/m/bEdE4rmZy9 | Yes |
| `horse.glb` | Horse | Quaternius | poly.pizza/m/qvTrSG9pZF | Yes |

Alpaca through horse above are all from the same Quaternius
"Ultimate Animated Animal Pack" bundle — guaranteed identical rig/art style.

## CC-BY (attribution required per license)

| File | Species | Author | Source | License |
| --- | --- | --- | --- | --- |
| `duck.glb` | Duck | madtrollstudio | poly.pizza/m/4plJcFXhim | CC-BY 3.0 |
| `chicken.glb` | Chicken | madtrollstudio | poly.pizza/m/oHmIgi4boa | CC-BY 3.0 |
| `koala.glb` | Koala | Poly by Google | poly.pizza search "koala" | CC-BY 3.0 |
| `owl.glb` | Owl | Poly by Google | poly.pizza search "owl" | CC-BY 3.0 |
| `raccoon.glb` | Raccoon | Poly by Google | poly.pizza search "raccoon" | CC-BY 3.0 |
| `squirrel.glb` | Squirrel | Poly by Google | poly.pizza search "squirrel" | CC-BY 3.0 |
| `goat.glb` | Goat | Poly by Google | poly.pizza search "goat" | CC-BY 3.0 |

No CC0 model exists in a matching style for any of the CC-BY entries above
(checked against Quaternius's full catalog, poly.pizza, and OpenGameArt's
CC0 collection — the only CC0 candidates found for several of these,
e.g. tiger/squirrel, are Blender-file-only with no glTF/FBX/OBJ export,
a dead end without Blender). Per CC-BY 3.0/4.0, attribution is:

- "Duck", "Chicken" by madtrollstudio, licensed under
  CC-BY 3.0 (https://creativecommons.org/licenses/by/3.0/), via poly.pizza.
- "Koala", "Owl", "Raccoon", "Squirrel", "Goat" by Poly by Google,
  licensed under CC-BY 3.0 (https://creativecommons.org/licenses/by/3.0/),
  via poly.pizza.

These are all static (unrigged) meshes — `AnimalCharacter3D.tsx` renders
them in a fixed pose and anchors hats from the model's bounding-box top
(no `Head` bone to anchor from, unlike the rigged CC0 models above).

## AI-generated (Tripo3D, commercial license via paid plan)

| File | Species | Source | Notes |
| --- | --- | --- | --- |
| `fox.glb` | Fox | Tripo3D (text→image→3D, v3.1) | Anthropomorphic/upright style — the new target look for the whole roster, replacing the earlier Quaternius quadruped fox |
| `dog.glb` | Dog | Tripo3D (text→image→3D, v3.1) | Replaces the earlier Quaternius quadruped dog |
| `cat.glb` | Cat | Tripo3D (text→image→3D, v3.1) | Replaces the earlier Poly by Google quadruped cat |
| `rabbit.glb` | Rabbit | Tripo3D (text→image→3D, v3.1) | Replaces the earlier Quaternius quadruped rabbit |
| `bear.glb` | Bear | Tripo3D (text→image→3D, v3.1) | Replaces the earlier madtrollstudio (CC-BY) static bear |
| `cow.glb` | Cow | Tripo3D (text→image→3D, v3.1) | Replaces the earlier Quaternius quadruped cow |
| `donkey.glb` | Donkey | Tripo3D (text→image→3D, v3.1) | Replaces the earlier Quaternius quadruped donkey |
| `deer.glb` | Deer | Tripo3D (text→image→3D, v3.1) | Replaces the earlier Quaternius quadruped deer |
| `wolf.glb` | Wolf | Tripo3D (text→image→3D, v3.1) | Replaces the earlier Quaternius quadruped wolf |
| `unicorn.glb` | Unicorn | Tripo3D (text→image→3D, v3.1) | Replaces the earlier Poly by Google static unicorn. Only quadruped exception in the new roster — the AI defaulted to a natural pony pose here instead of upright/anthropomorphic, kept deliberately rather than forced |
| `pig.glb` | Pig | Tripo3D (text→image→3D, v3.1) | Replaces the earlier Quaternius quadruped pig |
| `sheep.glb` | Sheep | Tripo3D (text→image→3D, v3.1) | Replaces the earlier Quaternius quadruped sheep |
| `zebra.glb` | Zebra | Tripo3D (text→image→3D, v3.1) | Replaces the earlier Quaternius quadruped zebra |
| `giraffe.glb` | Giraffe | Tripo3D (text→image→3D, v3.1) | Replaces the earlier madtrollstudio (CC-BY) static giraffe |
| `dragon.glb` | Dragon | Tripo3D (text→image→3D, v3.1) | Replaces the earlier Quaternius quadruped dragon |
| `penguin.glb` | Penguin | Tripo3D (text→image→3D, v3.1) | Replaces the earlier madtrollstudio (CC-BY) static penguin |
| `elephant.glb` | Elephant | Tripo3D (text→image→3D, v3.1) | Replaces the earlier Poly by Google static elephant |
| `lion.glb` | Lion | Tripo3D (text→image→3D, v3.1) | Replaces the earlier Poly by Google static lion |
| `tiger.glb` | Tiger | Tripo3D (text→image→3D, v3.1) | Replaces the earlier Poly by Google static tiger |
| `monkey.glb` | Monkey | Tripo3D (text→image→3D, v3.1) | Replaces the earlier Poly by Google static monkey |
| `panda.glb` | Panda | Tripo3D (text→image→3D, v3.1) | Replaces the earlier Poly by Google static panda |

Generated via account-holder's paid Tripo3D plan (private models, commercial
use license) — not third-party CC-licensed content, so no attribution
required, but also not freely redistributable outside this project the way
the CC0/CC-BY entries are. Raw exports come out around 50k triangles with
2-4K textures; re-exported here after retopology (~3,500 tris) and texture
recompression (4096/2048px source images downscaled to 512-1024px, ~1MB
total) to stay within the same size/performance budget as the rest of the
roster — see `scripts/optimize-glb.py`.
