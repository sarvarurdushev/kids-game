"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import { SkeletonUtils } from "three-stdlib";
import { Group, Vector3 } from "three";
import { HATS } from "./hats3d";
import { ACCESSORIES, ACCESSORY_ANCHOR_RATIO } from "./accessories3d";
import { computeRestBoundingBox } from "./glbGeometry";
import { playCreatureVoice } from "@/lib/sound";
import { getSpeciesArchetype, type SpeciesArchetype } from "@/lib/games/speciesArchetype";
import type { AvatarEquippedKeys, AvatarMood } from "@/components/avatar/AvatarCharacter";

// Real, fetched CC0/CC-BY low-poly animal packs (see
// public/models/animals/CREDITS.md for per-model license/author), loaded
// with drei's useGLTF. Deliberately NOT preloaded — with 30+ species now in
// the roster, eagerly fetching all of them the moment any avatar renders
// would waste bandwidth on animals a given student may never own; useGLTF's
// Suspense integration fetches one on demand exactly when it's equipped.
const MODEL_URL: Record<string, string> = {
  species_cat: "/models/animals/cat.glb",
  species_dog: "/models/animals/dog.glb",
  species_rabbit: "/models/animals/rabbit.glb",
  species_fox: "/models/animals/fox.glb",
  species_bear: "/models/animals/bear.glb",
  species_cow: "/models/animals/cow.glb",
  species_donkey: "/models/animals/donkey.glb",
  species_deer: "/models/animals/deer.glb",
  species_alpaca: "/models/animals/alpaca.glb",
  species_bull: "/models/animals/bull.glb",
  species_stag: "/models/animals/stag.glb",
  species_husky: "/models/animals/husky.glb",
  species_wolf: "/models/animals/wolf.glb",
  species_white_horse: "/models/animals/white_horse.glb",
  species_horse: "/models/animals/horse.glb",
  species_pig: "/models/animals/pig.glb",
  species_sheep: "/models/animals/sheep.glb",
  species_zebra: "/models/animals/zebra.glb",
  species_dragon: "/models/animals/dragon.glb",
  species_giraffe: "/models/animals/giraffe.glb",
  species_duck: "/models/animals/duck.glb",
  species_penguin: "/models/animals/penguin.glb",
  species_chicken: "/models/animals/chicken.glb",
  species_panda: "/models/animals/panda.glb",
  species_koala: "/models/animals/koala.glb",
  species_tiger: "/models/animals/tiger.glb",
  species_lion: "/models/animals/lion.glb",
  species_owl: "/models/animals/owl.glb",
  species_raccoon: "/models/animals/raccoon.glb",
  species_squirrel: "/models/animals/squirrel.glb",
  species_elephant: "/models/animals/elephant.glb",
  species_monkey: "/models/animals/monkey.glb",
  species_goat: "/models/animals/goat.glb",
  species_unicorn: "/models/animals/unicorn.glb",
};

// Each model comes from a different author at a different original scale
// and pivot, so instead of hand-tuning per-model constants every species is
// normalized at load time — from its own bounding box — to the same
// standing height/foot-line the procedural cat occupies (Character3D's
// HEAD_Y/BODY_Y), so switching species doesn't jump the character around
// the scene or clash with the shared camera framing.
const TARGET_HEIGHT = 1.22;
const FOOT_Y = -0.62;
const HAT_CLEARANCE = 0.03;

function pickIdleClip(names: string[]): string | null {
  if (names.includes("Idle")) return "Idle";
  const suffixed = names.find((n) => n.endsWith("|Idle"));
  if (suffixed) return suffixed;
  const anyIdle = names.find((n) => /idle/i.test(n) && !/hitreact/i.test(n));
  return anyIdle ?? names[0] ?? null;
}

// Coin-unlockable dance (lib/student/dance.ts) — a distinct, sustained
// performance per species archetype, reusing the same tiny/small/medium/
// large/fantasy grouping as the voice synth so a species' size/energy
// "personality" shows up consistently in both its sound and its moves.
// No GLB in the roster ships a dedicated dance clip (just Idle), so this is
// procedural: a bounce + sway, with a spin for the archetypes that suit it.
interface DanceStyle {
  bounceAmp: number;
  bounceFreq: number;
  swayAmp: number;
  swayFreq: number;
  spinSpeed: number; // 0 = no spin, just a gentle head-turn wag instead
}

const DANCE_STYLES: Record<SpeciesArchetype, DanceStyle> = {
  tiny: { bounceAmp: 0.09, bounceFreq: 6, swayAmp: 0.12, swayFreq: 5, spinSpeed: 4 },
  small: { bounceAmp: 0.07, bounceFreq: 4, swayAmp: 0.18, swayFreq: 3, spinSpeed: 0 },
  medium: { bounceAmp: 0.05, bounceFreq: 2.5, swayAmp: 0.14, swayFreq: 2, spinSpeed: 0 },
  large: { bounceAmp: 0.04, bounceFreq: 1.6, swayAmp: 0.2, swayFreq: 1.3, spinSpeed: 0 },
  fantasy: { bounceAmp: 0.08, bounceFreq: 3, swayAmp: 0.05, swayFreq: 3, spinSpeed: 3 },
};

interface AnimalCharacter3DProps {
  species: string;
  equippedKeys: AvatarEquippedKeys;
  mood: AvatarMood;
  dancing?: boolean;
}

export function AnimalCharacter3D({ species, equippedKeys, mood, dancing = false }: AnimalCharacter3DProps) {
  const groupRef = useRef<Group>(null);
  const t = useRef(0);

  const { scene, animations } = useGLTF(MODEL_URL[species]);
  // Every mount gets its own skeleton — useGLTF caches (and shares) the
  // parsed source, so without cloning, two students equipping the same
  // species would fight over one shared skinned mesh/armature.
  const cloned = useMemo(() => SkeletonUtils.clone(scene) as Group, [scene]);

  const { scale, offset, hatAnchor } = useMemo(() => {
    const box = computeRestBoundingBox(cloned);
    const size = new Vector3();
    box.getSize(size);
    const center = new Vector3();
    box.getCenter(center);
    const s = size.y > 0 ? TARGET_HEIGHT / size.y : 1;
    const offsetVec = new Vector3(-center.x * s, FOOT_Y - box.min.y * s, -center.z * s);

    // A named "Head" bone (present on the rigged dog/rabbit/fox) gives a far
    // more reliable *height* than "top of bounding box" — a raised tail or
    // ears can be the tallest point in the bind pose. The bear has no
    // armature, so it falls back to the bounding-box top. Only the height
    // (world Y) is used, not the bone's full 3D position: a quadruped's
    // head bone sits forward of the body's centerline (along its neck), and
    // placing a hat that far toward the camera reads as floating in front
    // of the face rather than sitting on top of the head.
    const headBone = cloned.getObjectByName("Head");
    const anchorY = headBone ? headBone.getWorldPosition(new Vector3()).y : box.max.y;

    const hatAnchor = new Vector3(0, anchorY * s + offsetVec.y + HAT_CLEARANCE, offsetVec.z);
    return { scale: s, offset: offsetVec, hatAnchor };
  }, [cloned]);

  // Accessories (glasses/bowtie/scarf/medal) each sit at a different fraction
  // of the feet→head span rather than the hat's fixed head anchor, since a
  // bowtie belongs at the neck and a medal hangs on the chest, not the head.
  function accessoryAnchor(ratio: number): Vector3 {
    return new Vector3(0, offset.y + (hatAnchor.y - offset.y) * ratio, hatAnchor.z);
  }

  const { actions, names } = useAnimations(animations, cloned);
  useEffect(() => {
    const idle = pickIdleClip(names);
    const action = idle ? actions[idle] : null;
    action?.reset().fadeIn(0.3).play();
    return () => {
      action?.fadeOut(0.3);
    };
  }, [actions, names]);

  // Reaction to a mood transition (never on mount, never on the reverse trip
  // back to neutral): a non-verbal voice chirp plus a brief, decaying
  // hop-or-droop impulse. This replaced a continuous per-frame sine bob that
  // rode the *entire* rigid body up/down and tilted it every frame forever —
  // with no legs bending and no floor contact, it read as the character
  // floating/flying rather than standing, especially layered on top of
  // whatever idle motion the GLTF's own Idle clip already provides. Now the
  // character is perfectly still (grounded, trusting the model's own Idle
  // clip) except for a short celebratory hop or droop right when a round
  // resolves, which settles back to rest within a second.
  const prevMoodRef = useRef(mood);
  const bounceEnergyRef = useRef(0);
  const bounceDirRef = useRef<1 | -1>(1);
  // Loose timer for an occasional idle "perk up" hop (on top of the constant
  // head-turn/weight-shift below), so the character does something new every
  // few seconds instead of just breathing in place forever. The random jitter
  // is applied post-mount (not in the useRef initializer) since calling
  // Math.random during render is impure.
  const perkTimerRef = useRef(3);
  const perkEnergyRef = useRef(0);
  useEffect(() => {
    perkTimerRef.current = 3 + Math.random() * 3;
  }, []);
  useEffect(() => {
    if (mood !== prevMoodRef.current) {
      if (mood === "happy") {
        playCreatureVoice(species, "happy");
        bounceEnergyRef.current = 1;
        bounceDirRef.current = 1;
      } else if (mood === "sad") {
        playCreatureVoice(species, "sad");
        bounceEnergyRef.current = 1;
        bounceDirRef.current = -1;
      }
    }
    prevMoodRef.current = mood;
  }, [mood, species]);

  useFrame((_, delta) => {
    t.current += delta;
    const group = groupRef.current;
    if (!group) return;

    if (dancing) {
      const style = DANCE_STYLES[getSpeciesArchetype(species)];
      group.position.y = Math.abs(Math.sin(t.current * style.bounceFreq)) * style.bounceAmp;
      group.rotation.z = Math.sin(t.current * style.swayFreq) * style.swayAmp;
      group.rotation.y =
        style.spinSpeed > 0 ? t.current * style.spinSpeed : Math.sin(t.current * style.swayFreq * 0.5) * 0.15;
      return;
    }

    // Idle "alive" motion: a slow head-turn look-around and a gentle weight
    // shift run constantly at rest, so the character is never a frozen
    // statue between rounds. Kept deliberately subtle (a few degrees, not
    // the old full-body sine bob) so it reads as breathing/fidgeting rather
    // than floating.
    group.rotation.y = Math.sin(t.current * 0.35) * 0.12;
    group.rotation.z = Math.sin(t.current * 0.55) * 0.02;

    perkTimerRef.current -= delta;
    if (perkTimerRef.current <= 0) {
      perkEnergyRef.current = 1;
      perkTimerRef.current = 5 + Math.random() * 4;
    }
    if (perkEnergyRef.current > 0) {
      perkEnergyRef.current = Math.max(0, perkEnergyRef.current - delta * 2.2);
    }

    if (bounceEnergyRef.current > 0) {
      bounceEnergyRef.current = Math.max(0, bounceEnergyRef.current - delta * 1.8);
    }
    const energy = bounceEnergyRef.current;
    if (energy > 0) {
      // Happy/sad mood reaction takes priority over the idle perk hop.
      group.position.y =
        bounceDirRef.current === 1
          ? Math.abs(Math.sin(t.current * 12)) * energy * 0.05 // happy: quick decaying hops
          : -Math.abs(Math.sin(t.current * 4)) * energy * 0.03; // sad: gentle decaying droop
    } else if (perkEnergyRef.current > 0) {
      group.position.y = Math.abs(Math.sin(t.current * 8)) * perkEnergyRef.current * 0.025;
    } else {
      group.position.y = 0;
    }
  });

  const hatKey = equippedKeys.hat;
  const renderHat = hatKey ? HATS[hatKey] : null;

  const accessoryKey = equippedKeys.accessory;
  const renderAccessory = accessoryKey ? ACCESSORIES[accessoryKey] : null;
  const accessoryRatio = accessoryKey ? (ACCESSORY_ANCHOR_RATIO[accessoryKey] ?? 0.6) : 0.6;

  return (
    <group ref={groupRef}>
      <group scale={scale} position={offset}>
        <primitive object={cloned} />
      </group>
      {renderHat && <group position={hatAnchor}>{renderHat()}</group>}
      {renderAccessory && <group position={accessoryAnchor(accessoryRatio)}>{renderAccessory()}</group>}
    </group>
  );
}
