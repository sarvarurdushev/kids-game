"use client";

import type { ReactNode } from "react";
import { Scene3D } from "./Scene3D";
import { Character3D } from "./Character3D";
import { Prop3D } from "./Prop3D";
import type { AvatarEquippedKeys, AvatarMood } from "@/components/avatar/AvatarCharacter";

const FLOOR_Y = -0.85;
const WALL_Z = -1.3;
const WALL_HEIGHT = 2.6;

const WALLPAPERS: Record<string, () => ReactNode> = {
  wallpaper_plain: () => (
    <mesh position={[0, FLOOR_Y + WALL_HEIGHT / 2, WALL_Z]}>
      <planeGeometry args={[5, WALL_HEIGHT]} />
      <meshStandardMaterial color="#fdeecb" flatShading />
    </mesh>
  ),
  wallpaper_stripes: () => (
    <group>
      <mesh position={[0, FLOOR_Y + WALL_HEIGHT / 2, WALL_Z]}>
        <planeGeometry args={[5, WALL_HEIGHT]} />
        <meshStandardMaterial color="#fdeecb" flatShading />
      </mesh>
      {[-1.8, -1, -0.2, 0.6, 1.4].map((x, i) => (
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
        <planeGeometry args={[5, WALL_HEIGHT]} />
        <meshStandardMaterial color="#26315f" flatShading />
      </mesh>
      <mesh position={[1.7, FLOOR_Y + WALL_HEIGHT - 0.5, WALL_Z + 0.02]}>
        <sphereGeometry args={[0.22, 8, 8]} />
        <meshStandardMaterial color="#ffe8a3" flatShading emissive="#ffe8a3" emissiveIntensity={0.4} />
      </mesh>
      {[
        [-1.6, 0.6], [-0.8, 1.3], [0, 0.4], [0.9, 1.1], [1.3, 0.3], [-1.2, -0.2],
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
        <planeGeometry args={[5, WALL_HEIGHT]} />
        <meshStandardMaterial color="#fff3e0" flatShading />
      </mesh>
      {Array.from({ length: 4 }).flatMap((_, row) =>
        Array.from({ length: 6 }).map((_, col) => (
          <mesh key={`${row}-${col}`} position={[-2 + col * 0.8, FLOOR_Y + 0.4 + row * 0.6, WALL_Z + 0.02]}>
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
        <planeGeometry args={[5, 3]} />
        <meshStandardMaterial color="#c8925c" flatShading />
      </mesh>
      {[-1, -0.4, 0.2, 0.8, 1.4].map((z, i) => (
        <mesh key={i} position={[0, FLOOR_Y + 0.002, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[5, 0.03]} />
          <meshStandardMaterial color="#a9743f" flatShading />
        </mesh>
      ))}
    </group>
  ),
  floor_rug: () => (
    <group>
      <mesh position={[0, FLOOR_Y, 0.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[5, 3]} />
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
        Array.from({ length: 5 }).map((_, col) => (
          <mesh
            key={`${row}-${col}`}
            position={[-2 + col, FLOOR_Y, -0.5 + row]}
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
      <planeGeometry args={[5, 3]} />
      <meshStandardMaterial color="#8bc76a" flatShading />
    </mesh>
  ),
};

// x/z placement only — Prop3D's own floorY math already rests the model's
// bottom at the right height, so this must NOT also carry FLOOR_Y as its y
// (that would apply the floor offset twice and sink the prop through the floor).
const FURNITURE_LARGE_POSITION: [number, number, number] = [-1.5, 0, -0.2];
// Right side of the room, foreground, clear of both the large piece and the
// character (which stands around x = 0.35).
const FURNITURE_SMALL_POSITION: [number, number, number] = [1.6, 0, 0.5];

// Real Tripo3D-generated props (see public/models/furniture/CREDITS.md).
// Each is normalized from its own bounding box to a per-item target height —
// unlike standing characters, furniture pieces don't share a common height
// (a bookshelf and a treasure chest are wildly different proportions), so
// Prop3D takes that height as a prop rather than assuming one constant.
const FURNITURE_LARGE_MODEL: Record<string, { url: string; height: number }> = {
  furniture_chest: { url: "/models/furniture/chest.glb", height: 0.4 },
  furniture_bookshelf: { url: "/models/furniture/bookshelf.glb", height: 0.95 },
};

const FURNITURE_LARGE: Record<string, () => ReactNode> = Object.fromEntries(
  Object.entries(FURNITURE_LARGE_MODEL).map(([key, { url, height }]) => [
    key,
    () => <Prop3D url={url} targetHeight={height} floorY={FLOOR_Y} position={FURNITURE_LARGE_POSITION} />,
  ])
);

const FURNITURE_SMALL_MODEL: Record<string, { url: string; height: number }> = {
  furniture_plant: { url: "/models/furniture/plant.glb", height: 0.55 },
  furniture_lamp: { url: "/models/furniture/lamp.glb", height: 0.9 },
};

const FURNITURE_SMALL: Record<string, () => ReactNode> = Object.fromEntries(
  Object.entries(FURNITURE_SMALL_MODEL).map(([key, { url, height }]) => [
    key,
    () => <Prop3D url={url} targetHeight={height} floorY={FLOOR_Y} position={FURNITURE_SMALL_POSITION} />,
  ])
);

// Wall-mount anchor for the procedural (no GLB asset yet) wall-decor items —
// left-of-center, clear of the character (which stands around x = 0.35), and
// just proud of the wallpaper plane (WALL_Z + 0.03) to avoid z-fighting.
const WALL_DECOR_X = -0.6;
const WALL_DECOR_Y = FLOOR_Y + WALL_HEIGHT * 0.68;
const WALL_DECOR_Z = WALL_Z + 0.03;

// Hand-drawn/procedural wall decor, matching the flat-shaded primitive style
// used by WALLPAPERS/FLOORS above — no Tripo3D asset exists for these yet.
const WALL_DECOR: Record<string, () => ReactNode> = {
  wall_shelf: () => (
    <group position={[WALL_DECOR_X, WALL_DECOR_Y, WALL_DECOR_Z]}>
      <mesh>
        <boxGeometry args={[0.7, 0.05, 0.16]} />
        <meshStandardMaterial color="#8a6a45" flatShading />
      </mesh>
      {[
        { x: -0.22, color: "#e63946", w: 0.07, h: 0.16 },
        { x: -0.1, color: "#4fb3d9", w: 0.06, h: 0.19 },
        { x: 0.02, color: "#ffd23f", w: 0.08, h: 0.14 },
      ].map((book, i) => (
        <mesh key={i} position={[book.x, 0.025 + book.h / 2, 0]}>
          <boxGeometry args={[book.w, book.h, 0.12]} />
          <meshStandardMaterial color={book.color} flatShading />
        </mesh>
      ))}
    </group>
  ),
  wall_clock: () => (
    <group position={[WALL_DECOR_X, WALL_DECOR_Y, WALL_DECOR_Z]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.03, 20]} />
        <meshStandardMaterial color="#fdeecb" flatShading />
      </mesh>
      <mesh>
        <torusGeometry args={[0.22, 0.025, 8, 20]} />
        <meshStandardMaterial color="#8a6a45" flatShading />
      </mesh>
      <mesh position={[0, 0.06, 0.02]} rotation={[0, 0, Math.PI / 8]}>
        <boxGeometry args={[0.025, 0.14, 0.02]} />
        <meshStandardMaterial color="#2d2a26" flatShading />
      </mesh>
      <mesh position={[0.05, 0, 0.02]} rotation={[0, 0, -Math.PI / 2.4]}>
        <boxGeometry args={[0.02, 0.1, 0.02]} />
        <meshStandardMaterial color="#2d2a26" flatShading />
      </mesh>
    </group>
  ),
  wall_picture: () => (
    <group position={[WALL_DECOR_X, WALL_DECOR_Y, WALL_DECOR_Z]}>
      <mesh>
        <boxGeometry args={[0.46, 0.38, 0.03]} />
        <meshStandardMaterial color="#8a6a45" flatShading />
      </mesh>
      <mesh position={[0, 0, 0.02]}>
        <planeGeometry args={[0.38, 0.3]} />
        <meshStandardMaterial color="#ffe8a3" flatShading />
      </mesh>
      <mesh position={[0, 0, 0.025]}>
        <circleGeometry args={[0.1, 16]} />
        <meshStandardMaterial color="#ffd23f" flatShading />
      </mesh>
      {[0, 45, 90, 135].map((deg) => (
        <mesh key={deg} position={[0, 0, 0.023]} rotation={[0, 0, (deg * Math.PI) / 180]}>
          <planeGeometry args={[0.03, 0.24]} />
          <meshStandardMaterial color="#ffd23f" flatShading />
        </mesh>
      ))}
      <mesh position={[-0.03, 0.02, 0.028]}>
        <circleGeometry args={[0.012, 8]} />
        <meshStandardMaterial color="#2d2a26" flatShading />
      </mesh>
      <mesh position={[0.03, 0.02, 0.028]}>
        <circleGeometry args={[0.012, 8]} />
        <meshStandardMaterial color="#2d2a26" flatShading />
      </mesh>
    </group>
  ),
};

const DEFAULTS = {
  wallpaper: "wallpaper_plain",
  floor: "floor_wood",
  furnitureSmall: "furniture_plant", // plant stays the starter item, just renamed slot
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
  // Deliberately NO default for large furniture — that slot starts empty
  // (nothing rendered) until a student owns something in it, same as how the
  // avatar's hat/accessory slots have no forced fallback.
  const furnitureLargeKey = equippedKeys.furniture;
  const furnitureSmallKey = equippedKeys.furniture_small ?? DEFAULTS.furnitureSmall;
  const wallDecorKey = equippedKeys.furniture_wall ?? DEFAULTS.furnitureWall;

  const renderWallpaper = WALLPAPERS[wallpaperKey] ?? WALLPAPERS[DEFAULTS.wallpaper];
  const renderFloor = FLOORS[floorKey] ?? FLOORS[DEFAULTS.floor];
  const renderFurnitureLarge = furnitureLargeKey ? FURNITURE_LARGE[furnitureLargeKey] : null;
  const renderFurnitureSmall = FURNITURE_SMALL[furnitureSmallKey] ?? FURNITURE_SMALL[DEFAULTS.furnitureSmall];
  const renderWallDecor = WALL_DECOR[wallDecorKey] ?? WALL_DECOR[DEFAULTS.furnitureWall];

  return (
    <div className={`relative aspect-[3/2] w-full overflow-hidden rounded-3xl ${className}`}>
      <Scene3D camera={{ position: [0, -0.05, 3.6], fov: 42 }}>
        {renderWallpaper()}
        {renderFloor()}
        {renderFurnitureLarge && renderFurnitureLarge()}
        {renderFurnitureSmall()}
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
