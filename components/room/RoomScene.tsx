"use client";

import type { ReactNode } from "react";
import { useSvgId } from "@/components/creatures/primitives";
import { AvatarCharacter, type AvatarEquippedKeys, type AvatarMood } from "@/components/avatar/AvatarCharacter";

const WALLPAPERS: Record<string, (id: string) => ReactNode> = {
  wallpaper_plain: () => <rect x={0} y={0} width={300} height={142} fill="#fdeecb" />,
  wallpaper_stripes: () => (
    <>
      <rect x={0} y={0} width={300} height={142} fill="#fdeecb" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect key={i} x={i * 50} y={0} width={25} height={142} fill="#ffd9e6" opacity={0.55} />
      ))}
    </>
  ),
  wallpaper_stars: () => (
    <>
      <rect x={0} y={0} width={300} height={142} fill="#26315f" />
      <circle cx={248} cy={38} r={18} fill="#ffe8a3" opacity={0.9} />
      <circle cx={240} cy={33} r={18} fill="#26315f" />
      {[
        [30, 26], [60, 55], [95, 20], [140, 45], [180, 24], [210, 60], [270, 40], [20, 80], [120, 85],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={i % 2 === 0 ? 2.2 : 1.5} fill="#fff" opacity={0.9} />
      ))}
    </>
  ),
  wallpaper_dots: (id) => (
    <>
      <rect x={0} y={0} width={300} height={142} fill="#fff3e0" />
      <pattern id={id} width={30} height={30} patternUnits="userSpaceOnUse">
        <circle cx={15} cy={15} r={5} fill="var(--color-teal)" opacity={0.35} />
      </pattern>
      <rect x={0} y={0} width={300} height={142} fill={`url(#${id})`} />
    </>
  ),
};

const FLOORS: Record<string, () => ReactNode> = {
  floor_wood: () => (
    <>
      <rect x={0} y={142} width={300} height={58} fill="#c8925c" />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={0} y={142 + i * 15} width={300} height={2} fill="#a9743f" opacity={0.6} />
      ))}
    </>
  ),
  floor_rug: () => (
    <>
      <rect x={0} y={142} width={300} height={58} fill="#c8925c" />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={0} y={142 + i * 15} width={300} height={2} fill="#a9743f" opacity={0.6} />
      ))}
      <ellipse cx={165} cy={182} rx={90} ry={16} fill="var(--color-gk-coral)" opacity={0.85} />
      <ellipse cx={165} cy={182} rx={68} ry={11} fill="#fff" opacity={0.4} />
    </>
  ),
  floor_tile: () => (
    <>
      {Array.from({ length: 6 }).map((_, row) =>
        Array.from({ length: 10 }).map((_, col) => (
          <rect
            key={`${row}-${col}`}
            x={col * 30}
            y={142 + row * 10}
            width={30}
            height={10}
            fill={(row + col) % 2 === 0 ? "#eee3d3" : "#d8c8ac"}
          />
        ))
      )}
    </>
  ),
  floor_grass: () => (
    <>
      <rect x={0} y={142} width={300} height={58} fill="#8bc76a" />
      {Array.from({ length: 22 }).map((_, i) => (
        <path
          key={i}
          d={`M ${i * 14 + 6} 158 Q ${i * 14 + 9} 148 ${i * 14 + 12} 158`}
          stroke="#5f9e46"
          strokeWidth={2}
          fill="none"
          strokeLinecap="round"
        />
      ))}
    </>
  ),
};

const FURNITURE: Record<string, () => ReactNode> = {
  furniture_plant: () => (
    <>
      <path d="M 24 200 L 30 168 L 56 168 L 62 200 Z" fill="#c8925c" />
      <ellipse cx={43} cy={140} rx={22} ry={18} fill="#5f9e46" />
      <ellipse cx={30} cy={150} rx={14} ry={12} fill="#6fae54" />
      <ellipse cx={58} cy={150} rx={14} ry={12} fill="#4c8a39" />
    </>
  ),
  furniture_lamp: () => (
    <>
      <ellipse cx={44} cy={198} rx={20} ry={5} fill="#8a6a45" opacity={0.5} />
      <rect x={41} y={130} width={6} height={68} fill="#8a6a45" />
      <path d="M 20 108 L 68 108 L 58 134 L 30 134 Z" fill="#ffd76a" stroke="#e0a800" strokeWidth={1.5} />
    </>
  ),
  furniture_chest: () => (
    <>
      <rect x={16} y={160} width={58} height={38} rx={5} fill="#c8925c" stroke="#8a6a45" strokeWidth={2} />
      <path d="M 16 160 Q 45 140 74 160 Z" fill="#d9a672" stroke="#8a6a45" strokeWidth={2} strokeLinejoin="round" />
      <circle cx={45} cy={168} r={4} fill="#e0a800" />
    </>
  ),
  furniture_bookshelf: () => (
    <>
      <rect x={14} y={110} width={62} height={88} rx={4} fill="#8a6a45" />
      <rect x={19} y={116} width={52} height={36} fill="#fdeecb" />
      <rect x={19} y={158} width={52} height={34} fill="#fdeecb" />
      {[22, 34, 46, 58].map((x, i) => (
        <rect key={i} x={x} y={120} width={9} height={28} fill={["#e63946", "#4fb3d9", "#ffd23f", "var(--color-gk-coral)"][i]} />
      ))}
      {[22, 38, 54].map((x, i) => (
        <rect key={i} x={x} y={162} width={13} height={26} fill={["var(--color-teal)", "#7c4fc9", "#5f9e46"][i]} />
      ))}
    </>
  ),
};

const DEFAULTS = {
  wallpaper: "wallpaper_plain",
  floor: "floor_wood",
  furniture: "furniture_plant",
};

interface RoomSceneProps {
  equippedKeys: AvatarEquippedKeys;
  mood?: AvatarMood;
  avatarSize?: number;
  className?: string;
  onTapAvatar?: () => void;
  animated?: boolean;
}

export function RoomScene({
  equippedKeys,
  mood = "neutral",
  avatarSize = 130,
  className = "",
  onTapAvatar,
  animated = false,
}: RoomSceneProps) {
  const dotsId = useSvgId("wallpaper-dots");

  const wallpaperKey = equippedKeys.wallpaper ?? DEFAULTS.wallpaper;
  const floorKey = equippedKeys.floor ?? DEFAULTS.floor;
  const furnitureKey = equippedKeys.furniture ?? DEFAULTS.furniture;

  const renderWallpaper = WALLPAPERS[wallpaperKey] ?? WALLPAPERS[DEFAULTS.wallpaper];
  const renderFloor = FLOORS[floorKey] ?? FLOORS[DEFAULTS.floor];
  const renderFurniture = FURNITURE[furnitureKey] ?? FURNITURE[DEFAULTS.furniture];

  return (
    <div className={`relative overflow-hidden rounded-3xl ${className}`}>
      <svg viewBox="0 0 300 200" className="block w-full" preserveAspectRatio="xMidYMax slice">
        {renderWallpaper(dotsId)}
        {renderFloor()}
        {renderFurniture()}
      </svg>
      {onTapAvatar ? (
        <button
          type="button"
          onClick={onTapAvatar}
          aria-label="Poke your avatar"
          className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2"
          style={{ width: avatarSize, height: avatarSize }}
        >
          <AvatarCharacter equippedKeys={equippedKeys} size={avatarSize} mood={mood} animated={animated} />
        </button>
      ) : (
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2"
          style={{ width: avatarSize, height: avatarSize }}
        >
          <AvatarCharacter equippedKeys={equippedKeys} size={avatarSize} mood={mood} animated={animated} />
        </div>
      )}
    </div>
  );
}
