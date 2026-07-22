# Animal model credits

3D species models used by the avatar's `species` slot, loaded via
`useGLTF` in `components/three/AnimalCharacter3D.tsx`. Rigged models play
their `Idle`-equivalent animation clip; static models render a fixed pose
(same as any glTF model with no `animations` array).

## CC0 (no attribution required, listed for provenance)

| File | Species | Author | Source | Rigged/animated? |
| --- | --- | --- | --- | --- |
| `cow.glb` | Cow | Quaternius | poly.pizza/m/26zM1outCr | Yes |
| `donkey.glb` | Donkey | Quaternius | poly.pizza/m/qmX6nhnvp7 | Yes |
| `deer.glb` | Deer | Quaternius | poly.pizza/m/T6Cs7tmMHJ | Yes |
| `alpaca.glb` | Alpaca | Quaternius | poly.pizza/m/bCVFD48i2l | Yes |
| `bull.glb` | Bull | Quaternius | poly.pizza/m/a8PIIYwF7r | Yes |
| `stag.glb` | Stag | Quaternius | poly.pizza/m/tQdzbZ1Cmw | Yes |
| `husky.glb` | Husky | Quaternius | poly.pizza/m/wcWiuEqwzq | Yes |
| `wolf.glb` | Wolf | Quaternius | poly.pizza/m/P1gU3Qkr9r | Yes |
| `white_horse.glb` | White Horse | Quaternius | poly.pizza/m/bEdE4rmZy9 | Yes |
| `horse.glb` | Horse | Quaternius | poly.pizza/m/qvTrSG9pZF | Yes |
| `pig.glb` | Pig | Quaternius (Farm Animal Pack) | poly.pizza/m/TNvG3QUFlp | Yes |
| `sheep.glb` | Sheep | Quaternius (Farm Animal Pack) | poly.pizza/m/C39AUXUUes | Yes |
| `zebra.glb` | Zebra | Quaternius (Farm Animal Pack) | poly.pizza/m/iclPBR6SBZ | Yes |
| `dragon.glb` | Dragon (Archmage Dragon) | Quaternius (Ultimate Monsters Bundle) | poly.pizza/m/LlwD0QNUPj | Yes |

Cow through horse above are all from the same Quaternius
"Ultimate Animated Animal Pack" bundle — guaranteed identical rig/art style.
Pig/sheep/zebra are Quaternius CC0 too, from a different pack (Farm Animal
Pack), with a slightly more angular look. Dragon is from Quaternius's
fantasy line (Ultimate Monsters Bundle).

## CC-BY (attribution required per license)

| File | Species | Author | Source | License |
| --- | --- | --- | --- | --- |
| `bear.glb` | Bear (Sir Bearington) | madtrollstudio | poly.pizza/m/kLLBpmcw0w | CC-BY 3.0 |
| `giraffe.glb` | Giraffe | madtrollstudio | poly.pizza/m/jUaMl6njBh | CC-BY 3.0 |
| `duck.glb` | Duck | madtrollstudio | poly.pizza/m/4plJcFXhim | CC-BY 3.0 |
| `penguin.glb` | Penguin | madtrollstudio | poly.pizza/m/kvZRSJBz70 | CC-BY 3.0 |
| `chicken.glb` | Chicken | madtrollstudio | poly.pizza/m/oHmIgi4boa | CC-BY 3.0 |
| `panda.glb` | Panda | Poly by Google | poly.pizza/m/q1uJ28Hs8T-alt (see note) | CC-BY 3.0 |
| `koala.glb` | Koala | Poly by Google | poly.pizza search "koala" | CC-BY 3.0 |
| `tiger.glb` | Tiger | Poly by Google | poly.pizza search "tiger" | CC-BY 3.0 |
| `lion.glb` | Lion (King Leo) | Poly by Google | poly.pizza search "lion" | CC-BY 3.0 |
| `owl.glb` | Owl | Poly by Google | poly.pizza search "owl" | CC-BY 3.0 |
| `raccoon.glb` | Raccoon | Poly by Google | poly.pizza search "raccoon" | CC-BY 3.0 |
| `squirrel.glb` | Squirrel | Poly by Google | poly.pizza search "squirrel" | CC-BY 3.0 |
| `elephant.glb` | Elephant | Poly by Google | poly.pizza search "elephant" | CC-BY 3.0 |
| `monkey.glb` | Monkey | Poly by Google | poly.pizza search "monkey" | CC-BY 3.0 |
| `goat.glb` | Goat | Poly by Google | poly.pizza search "goat" | CC-BY 3.0 |
| `unicorn.glb` | Unicorn | Poly by Google | poly.pizza search "unicorn" | CC-BY 3.0 |

No CC0 model exists in a matching style for any of the CC-BY entries above
(checked against Quaternius's full catalog, poly.pizza, and OpenGameArt's
CC0 collection — the only CC0 candidates found for several of these,
e.g. tiger/squirrel, are Blender-file-only with no glTF/FBX/OBJ export,
a dead end without Blender). Per CC-BY 3.0/4.0, attribution is:

- "Bear", "Giraffe", "Duck", "Penguin", "Chicken" by madtrollstudio, licensed under
  CC-BY 3.0 (https://creativecommons.org/licenses/by/3.0/), via poly.pizza.
- "Panda", "Koala", "Tiger", "Lion", "Owl", "Raccoon", "Squirrel", "Elephant",
  "Monkey", "Goat", "Unicorn" by Poly by Google, licensed under CC-BY 3.0
  (https://creativecommons.org/licenses/by/3.0/), via poly.pizza.

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

Generated via account-holder's paid Tripo3D plan (private models, commercial
use license) — not third-party CC-licensed content, so no attribution
required, but also not freely redistributable outside this project the way
the CC0/CC-BY entries are. Raw exports come out around 50k triangles with
2-4K textures; re-exported here after retopology (~3,500 tris) and texture
recompression (4096/2048px source images downscaled to 512-1024px, ~1MB
total) to stay within the same size/performance budget as the rest of the
roster — see `scripts/optimize-glb.py`.
