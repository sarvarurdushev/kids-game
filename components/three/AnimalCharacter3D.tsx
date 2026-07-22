"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import { SkeletonUtils } from "three-stdlib";
import { Group, Vector3 } from "three";
import { HATS } from "./hats3d";
import { computeRestBoundingBox } from "./glbGeometry";
import { playCreatureVoice } from "@/lib/sound";
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

interface AnimalCharacter3DProps {
  species: string;
  equippedKeys: AvatarEquippedKeys;
  mood: AvatarMood;
}

export function AnimalCharacter3D({ species, equippedKeys, mood }: AnimalCharacter3DProps) {
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

    if (bounceEnergyRef.current > 0) {
      bounceEnergyRef.current = Math.max(0, bounceEnergyRef.current - delta * 1.8);
    }
    const energy = bounceEnergyRef.current;
    if (energy <= 0) {
      group.position.y = 0;
    } else if (bounceDirRef.current === 1) {
      // Happy: a couple of quick decaying hops, never dipping below the floor.
      group.position.y = Math.abs(Math.sin(t.current * 12)) * energy * 0.05;
    } else {
      // Sad: a gentle decaying droop, never lifting above the floor.
      group.position.y = -Math.abs(Math.sin(t.current * 4)) * energy * 0.03;
    }
  });

  const hatKey = equippedKeys.hat;
  const renderHat = hatKey ? HATS[hatKey] : null;

  return (
    <group ref={groupRef}>
      <group scale={scale} position={offset}>
        <primitive object={cloned} />
      </group>
      {renderHat && <group position={hatAnchor}>{renderHat()}</group>}
    </group>
  );
}
