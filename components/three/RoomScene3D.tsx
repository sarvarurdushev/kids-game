"use client";

import type { ReactNode } from "react";
import { Scene3D } from "./Scene3D";
import { Character3D } from "./Character3D";
import { Prop3D } from "./Prop3D";
import { FURNITURE_LARGE_MODEL, FURNITURE_SMALL_MODEL, WALL_DECOR_MODEL } from "./furnitureModels";
import type { AvatarEquippedKeys, AvatarMood } from "@/components/avatar/AvatarCharacter";

const FLOOR_Y = -0.85;
const WALL_Z = -1.3;
const WALL_HEIGHT = 2.6;
// Widened from 5 to fit a 4th big-furniture slot without crowding — see
// FURNITURE_LARGE_POSITIONS below for the full story. Floor depth (3)
// unchanged; only width grew.
const ROOM_WIDTH = 7.6;

const WALLPAPERS: Record<string, () => ReactNode> = {
  wallpaper_plain: () => (
    <mesh position={[0, FLOOR_Y + WALL_HEIGHT / 2, WALL_Z]}>
      <planeGeometry args={[ROOM_WIDTH, WALL_HEIGHT]} />
      <meshStandardMaterial color="#fdeecb" flatShading />
    </mesh>
  ),
  wallpaper_stripes: () => (
    <group>
      <mesh position={[0, FLOOR_Y + WALL_HEIGHT / 2, WALL_Z]}>
        <planeGeometry args={[ROOM_WIDTH, WALL_HEIGHT]} />
        <meshStandardMaterial color="#fdeecb" flatShading />
      </mesh>
      {[-2.8, -2, -1.2, -0.4, 0.4, 1.2, 2] .map((x, i) => (
        <mesh key={i} position={[x, FLOOR_Y + WALL_HEIGHT / 2, WALL_Z + 0.01]}>
          <planeGeometry args={[0.4, WALL_HEIGHT]} />
          <meshStandardMaterial color="#ffd9e6" flatShading />
        </mesh>
      ))}
    </group>
  ),
  wallpaper_stars: () => (
    <group>
      <mesh position={[0, FLOOR_Y + WALL_HEIGHT / 2, WALL_Z]}>
        <planeGeometry args={[ROOM_WIDTH, WALL_HEIGHT]} />
        <meshStandardMaterial color="#26315f" flatShading />
      </mesh>
      <mesh position={[2.6, FLOOR_Y + WALL_HEIGHT - 0.5, WALL_Z + 0.02]}>
        <sphereGeometry args={[0.22, 8, 8]} />
        <meshStandardMaterial color="#ffe8a3" flatShading emissive="#ffe8a3" emissiveIntensity={0.4} />
      </mesh>
      {[
        [-2.6, 0.6], [-1.8, 1.3], [-1, 0.4], [0, 1.1], [0.9, 0.3], [-2.2, -0.2], [1.8, 0.7], [1.2, -0.3],
      ].map(([x, y], i) => (
        <mesh key={i} position={[x, FLOOR_Y + WALL_HEIGHT / 2 + y, WALL_Z + 0.02]}>
          <octahedronGeometry args={[0.04, 0]} />
          <meshStandardMaterial color="#fff" flatShading emissive="#fff" emissiveIntensity={0.5} />
        </mesh>
      ))}
    </group>
  ),
  wallpaper_dots: () => (
    <group>
      <mesh position={[0, FLOOR_Y + WALL_HEIGHT / 2, WALL_Z]}>
        <planeGeometry args={[ROOM_WIDTH, WALL_HEIGHT]} />
        <meshStandardMaterial color="#fff3e0" flatShading />
      </mesh>
      {Array.from({ length: 4 }).flatMap((_, row) =>
        Array.from({ length: 9 }).map((_, col) => (
          <mesh key={`${row}-${col}`} position={[-3.2 + col * 0.8, FLOOR_Y + 0.4 + row * 0.6, WALL_Z + 0.02]}>
            <circleGeometry args={[0.08, 8]} />
            <meshStandardMaterial color="#2a7d8c" flatShading />
          </mesh>
        ))
      )}
    </group>
  ),
};

const FLOORS: Record<string, () => ReactNode> = {
  floor_wood: () => (
    <group>
      <mesh position={[0, FLOOR_Y, 0.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[ROOM_WIDTH, 3]} />
        <meshStandardMaterial color="#c8925c" flatShading />
      </mesh>
      {[-1, -0.4, 0.2, 0.8, 1.4].map((z, i) => (
        <mesh key={i} position={[0, FLOOR_Y + 0.002, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[ROOM_WIDTH, 0.03]} />
          <meshStandardMaterial color="#a9743f" flatShading />
        </mesh>
      ))}
    </group>
  ),
  floor_rug: () => (
    <group>
      <mesh position={[0, FLOOR_Y, 0.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[ROOM_WIDTH, 3]} />
        <meshStandardMaterial color="#c8925c" flatShading />
      </mesh>
      <mesh position={[0, FLOOR_Y + 0.01, 0.7]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.9, 16]} />
        <meshStandardMaterial color="#e8607f" flatShading />
      </mesh>
    </group>
  ),
  floor_tile: () => (
    <group>
      {Array.from({ length: 5 }).flatMap((_, row) =>
        Array.from({ length: 8 }).map((_, col) => (
          <mesh
            key={`${row}-${col}`}
            position={[-3.5 + col, FLOOR_Y, -0.5 + row]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[1, 1]} />
            <meshStandardMaterial color={(row + col) % 2 === 0 ? "#eee3d3" : "#d8c8ac"} flatShading />
          </mesh>
        ))
      )}
    </group>
  ),
  floor_grass: () => (
    <mesh position={[0, FLOOR_Y, 0.5]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[ROOM_WIDTH, 3]} />
      <meshStandardMaterial color="#8bc76a" flatShading />
    </mesh>
  ),
};

// x/z placement only — Prop3D's own floorY math already rests the model's
// bottom at the right height, so these must NOT also carry FLOOR_Y as their y
// (that would apply the floor offset twice and sink the prop through the floor).
//
// Up to 3 simultaneous big-furniture pieces spread along the left/back wall,
// and 3 small-furniture pieces along the right/foreground. Index 0 renders at
// position 0's coordinates, etc. (lib/student/roomPlacements.ts orders
// placements by position, so array index lines up directly.)
//
// Tuned via real Playwright screenshots against the running dev server
// (enroll GOLD-ADMIN, buy/place 3 large + 3 small at once, screenshot,
// adjust — same technique the single-item height comments below document).
// A first multi-item pass spaced these at ~0.6 unit gaps, which looked fine
// for pairs of narrow items but badly overlapped once a wide item (the desk,
// scaled width ~0.98) landed next to a neighbor — its footprint alone nearly
// spanned the gap to the next slot, swallowing it almost entirely. Re-measured
// every large item's actual scaled width via a headless GLTFLoader pass
// (not just eyeballing screenshots) and widened the gaps to ~0.9 units,
// enough clearance for the two widest items (desk ~0.76 after also shrinking
// its target height, bookshelf/scenes ~0.6-0.8) to sit side by side without
// touching. Position 0 (the tightest spot, since it's furthest from center)
// was re-verified with a "Dream Room Scene" legendary composite (the
// widest/most clip-prone tier) swapped in alongside the other two pieces.
// Slots 0-2 are the original, already-verified 3-slot arrangement, left
// untouched. Slot 3 (a 4th cap, added later — see ROOM_PLACEMENT_CAP.furniture
// in lib/student/roomPlacements.ts) is appended further left rather than
// inserted, so existing rooms with 3 items placed don't visually shuffle —
// only a newly-placed 4th item lands in the new spot. Fitting a 4th slot
// without crowding required widening the room itself (ROOM_WIDTH, and the
// camera framing below) rather than squeezing the existing three tighter.
const FURNITURE_LARGE_POSITIONS: [number, number, number][] = [
  [-1.95, 0, -0.45],
  [-1.05, 0, -0.35],
  [-0.15, 0, -0.15],
  [-3.05, 0, -0.3],
];
// Small: spread along the right side, foreground, clear of the large pieces
// and the character. Re-measuring the character's own GLB bounding box
// (not just furniture) found it's much wider than it looks at a glance —
// ~0.9-1.0 units for a standing animal, sometimes more with wings/tails
// spread — so position 2 (previously the innermost slot, closest to the
// character) was landing inside the character's own footprint no matter
// which item occupied it, confirmed by a real screenshot showing whatever
// was there (a lamp, a potted plant) visibly poking into the character's
// leg. Pulled the whole cluster further out from the character accordingly.
const FURNITURE_SMALL_POSITIONS: [number, number, number][] = [
  [2.45, 0, 0.35],
  [1.85, 0, 0.3],
  [1.25, 0, 0.45],
];

// FURNITURE_LARGE_MODEL/FURNITURE_SMALL_MODEL/WALL_DECOR_MODEL (the actual
// key -> GLB url + target height data) now live in ./furnitureModels — a
// plain data module with no react-three-fiber/drei deps, so
// scripts/render-thumbnails.ts can import the exact same source of truth
// Node-side without dragging in client-only rendering libraries.
const FURNITURE_LARGE: Record<string, (position: [number, number, number]) => ReactNode> = Object.fromEntries(
  Object.entries(FURNITURE_LARGE_MODEL).map(([key, { url, height }]) => [
    key,
    (position: [number, number, number]) => (
      <Prop3D url={url} targetHeight={height} floorY={FLOOR_Y} position={position} />
    ),
  ])
);

const FURNITURE_SMALL: Record<string, (position: [number, number, number]) => ReactNode> = Object.fromEntries(
  Object.entries(FURNITURE_SMALL_MODEL).map(([key, { url, height }]) => [
    key,
    (position: [number, number, number]) => (
      <Prop3D url={url} targetHeight={height} floorY={FLOOR_Y} position={position} />
    ),
  ])
);

// Wall-mount anchor for the wall-decor items — left-of-center, clear of the
// character (which stands around x = 0.35), and just proud of the wallpaper
// plane (WALL_Z + 0.03) to avoid z-fighting.
const WALL_DECOR_X = -0.6;
const WALL_DECOR_Y = FLOOR_Y + WALL_HEIGHT * 0.68;
const WALL_DECOR_Z = WALL_Z + 0.03;

const WALL_DECOR: Record<string, () => ReactNode> = Object.fromEntries(
  Object.entries(WALL_DECOR_MODEL).map(([key, { url, height }]) => [
    key,
    () => <Prop3D url={url} targetHeight={height} anchor="wall" position={[WALL_DECOR_X, WALL_DECOR_Y, WALL_DECOR_Z]} />,
  ])
);

const DEFAULTS = {
  wallpaper: "wallpaper_plain",
  floor: "floor_wood",
  furnitureWall: "wall_shelf", // new starter wall item
};

interface RoomScene3DProps {
  equippedKeys: AvatarEquippedKeys;
  mood?: AvatarMood;
  className?: string;
  onTapAvatar?: () => void;
}

export function RoomScene3D({ equippedKeys, mood = "neutral", className = "", onTapAvatar }: RoomScene3DProps) {
  const wallpaperKey = equippedKeys.wallpaper ?? DEFAULTS.wallpaper;
  const floorKey = equippedKeys.floor ?? DEFAULTS.floor;
  // Deliberately NO default for either furniture category — both are real
  // multi-select now (lib/student/roomPlacements.ts), so an empty room is a
  // legitimate, reachable state (a student who removes everything should see
  // an empty room, not a forced-back default piece), same as how the
  // avatar's hat/accessory slots have no forced fallback.
  const furnitureLargeKeys = equippedKeys.furniture ?? [];
  const furnitureSmallKeys = equippedKeys.furniture_small ?? [];
  const wallDecorKey = equippedKeys.furniture_wall ?? DEFAULTS.furnitureWall;

  const renderWallpaper = WALLPAPERS[wallpaperKey] ?? WALLPAPERS[DEFAULTS.wallpaper];
  const renderFloor = FLOORS[floorKey] ?? FLOORS[DEFAULTS.floor];
  const renderWallDecor = WALL_DECOR[wallDecorKey] ?? WALL_DECOR[DEFAULTS.furnitureWall];

  return (
    <div className={`relative aspect-[3/2] w-full overflow-hidden rounded-3xl ${className}`}>
      <Scene3D camera={{ position: [0, -0.05, 4.6], fov: 53 }}>
        {renderWallpaper()}
        {renderFloor()}
        {furnitureLargeKeys.slice(0, FURNITURE_LARGE_POSITIONS.length).map((key, i) => {
          const render = FURNITURE_LARGE[key];
          if (!render) return null;
          return <group key={`furniture-${key}-${i}`}>{render(FURNITURE_LARGE_POSITIONS[i])}</group>;
        })}
        {furnitureSmallKeys.slice(0, FURNITURE_SMALL_POSITIONS.length).map((key, i) => {
          const render = FURNITURE_SMALL[key];
          if (!render) return null;
          return <group key={`furniture-small-${key}-${i}`}>{render(FURNITURE_SMALL_POSITIONS[i])}</group>;
        })}
        {renderWallDecor()}
        <group position={[0.35, -0.15, 0.3]}>
          <Character3D equippedKeys={equippedKeys} mood={mood} />
        </group>
      </Scene3D>
      {onTapAvatar && (
        <button
          type="button"
          onClick={onTapAvatar}
          aria-label="Poke your avatar"
          className="absolute inset-0 h-full w-full cursor-pointer bg-transparent"
        />
      )}
    </div>
  );
}
