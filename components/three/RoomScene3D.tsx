"use client";

import type { ReactNode } from "react";
import { Scene3D } from "./Scene3D";
import { Character3D } from "./Character3D";
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

const FURNITURE: Record<string, () => ReactNode> = {
  furniture_plant: () => (
    <group position={[-1.5, FLOOR_Y, -0.2]}>
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.16, 0.13, 0.3, 8]} />
        <meshStandardMaterial color="#c8925c" flatShading />
      </mesh>
      <mesh position={[0, 0.45, 0]}>
        <icosahedronGeometry args={[0.24, 0]} />
        <meshStandardMaterial color="#5f9e46" flatShading />
      </mesh>
      <mesh position={[-0.15, 0.35, 0.1]}>
        <icosahedronGeometry args={[0.15, 0]} />
        <meshStandardMaterial color="#6fae54" flatShading />
      </mesh>
    </group>
  ),
  furniture_lamp: () => (
    <group position={[-1.5, FLOOR_Y, -0.2]}>
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.16, 0.16, 0.04, 10]} />
        <meshStandardMaterial color="#8a6a45" flatShading />
      </mesh>
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.75, 6]} />
        <meshStandardMaterial color="#8a6a45" flatShading />
      </mesh>
      <mesh position={[0, 0.82, 0]}>
        <coneGeometry args={[0.22, 0.28, 8, 1, true]} />
        <meshStandardMaterial color="#ffd76a" flatShading side={2} emissive="#ffd76a" emissiveIntensity={0.25} />
      </mesh>
    </group>
  ),
  furniture_chest: () => (
    <group position={[-1.5, FLOOR_Y, -0.2]}>
      <mesh position={[0, 0.16, 0]}>
        <boxGeometry args={[0.5, 0.32, 0.34]} />
        <meshStandardMaterial color="#c8925c" flatShading />
      </mesh>
      <mesh position={[0, 0.36, 0]} rotation={[-0.25, 0, 0]}>
        <boxGeometry args={[0.52, 0.08, 0.36]} />
        <meshStandardMaterial color="#d9a672" flatShading />
      </mesh>
      <mesh position={[0, 0.2, 0.18]}>
        <sphereGeometry args={[0.03, 6, 6]} />
        <meshStandardMaterial color="#e0a800" flatShading />
      </mesh>
    </group>
  ),
  furniture_bookshelf: () => (
    <group position={[-1.5, FLOOR_Y, -0.2]}>
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[0.5, 1, 0.28]} />
        <meshStandardMaterial color="#8a6a45" flatShading />
      </mesh>
      {["#e63946", "#4fb3d9", "#ffd23f", "#e8607f", "#2a7d8c"].map((color, i) => (
        <mesh key={i} position={[-0.17 + i * 0.09, 0.3, 0.1]}>
          <boxGeometry args={[0.07, 0.4, 0.18]} />
          <meshStandardMaterial color={color} flatShading />
        </mesh>
      ))}
    </group>
  ),
};

const DEFAULTS = {
  wallpaper: "wallpaper_plain",
  floor: "floor_wood",
  furniture: "furniture_plant",
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
  const furnitureKey = equippedKeys.furniture ?? DEFAULTS.furniture;

  const renderWallpaper = WALLPAPERS[wallpaperKey] ?? WALLPAPERS[DEFAULTS.wallpaper];
  const renderFloor = FLOORS[floorKey] ?? FLOORS[DEFAULTS.floor];
  const renderFurniture = FURNITURE[furnitureKey] ?? FURNITURE[DEFAULTS.furniture];

  return (
    <div className={`relative aspect-[3/2] w-full overflow-hidden rounded-3xl ${className}`}>
      <Scene3D camera={{ position: [0, -0.05, 3.6], fov: 42 }}>
        {renderWallpaper()}
        {renderFloor()}
        {renderFurniture()}
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
