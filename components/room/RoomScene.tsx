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

// Large furniture keeps its original left-side spot.
const FURNITURE_LARGE: Record<string, () => ReactNode> = {
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

// Small furniture moves to the right side of the room, mirroring the large
// piece's spot (translated, not redrawn — same shapes as before the split).
const FURNITURE_SMALL: Record<string, () => ReactNode> = {
  furniture_plant: () => (
    <g transform="translate(180, 0)">
      <path d="M 24 200 L 30 168 L 56 168 L 62 200 Z" fill="#c8925c" />
      <ellipse cx={43} cy={140} rx={22} ry={18} fill="#5f9e46" />
      <ellipse cx={30} cy={150} rx={14} ry={12} fill="#6fae54" />
      <ellipse cx={58} cy={150} rx={14} ry={12} fill="#4c8a39" />
    </g>
  ),
  furniture_lamp: () => (
    <g transform="translate(180, 0)">
      <ellipse cx={44} cy={198} rx={20} ry={5} fill="#8a6a45" opacity={0.5} />
      <rect x={41} y={130} width={6} height={68} fill="#8a6a45" />
      <path d="M 20 108 L 68 108 L 58 134 L 30 134 Z" fill="#ffd76a" stroke="#e0a800" strokeWidth={1.5} />
    </g>
  ),
};

// Wall-mounted decor — flat SVG props, matching the hand-drawn style of the
// wallpaper/floor/furniture pieces above. Sits high on the wall, clear of the
// avatar (anchored bottom-center) and the large/small furniture (both low).
const WALL_DECOR: Record<string, () => ReactNode> = {
  wall_shelf: () => (
    <g transform="translate(96, 30)">
      <rect x={0} y={0} width={70} height={8} rx={2} fill="#8a6a45" />
      <rect x={6} y={-18} width={10} height={18} fill="#e63946" />
      <rect x={20} y={-22} width={9} height={22} fill="#4fb3d9" />
      <rect x={33} y={-16} width={12} height={16} fill="#ffd23f" />
    </g>
  ),
  wall_clock: () => (
    <g transform="translate(150, 46)">
      <circle cx={0} cy={0} r={22} fill="#fdeecb" stroke="#8a6a45" strokeWidth={4} />
      <line x1={0} y1={0} x2={0} y2={-13} stroke="#2d2a26" strokeWidth={2.5} strokeLinecap="round" />
      <line x1={0} y1={0} x2={9} y2={6} stroke="#2d2a26" strokeWidth={2.5} strokeLinecap="round" />
      <circle cx={0} cy={0} r={2} fill="#2d2a26" />
    </g>
  ),
  wall_picture: () => (
    <g transform="translate(150, 44)">
      <rect x={-25} y={-20} width={50} height={40} rx={3} fill="#8a6a45" />
      <rect x={-20} y={-15} width={40} height={30} fill="#ffe8a3" />
      <circle cx={0} cy={0} r={10} fill="#ffd23f" />
      {[0, 45, 90, 135].map((deg) => (
        <rect key={deg} x={-1.5} y={-18} width={3} height={16} fill="#ffd23f" transform={`rotate(${deg})`} />
      ))}
      <circle cx={-3.5} cy={-2} r={1.4} fill="#2d2a26" />
      <circle cx={3.5} cy={-2} r={1.4} fill="#2d2a26" />
    </g>
  ),
};

const DEFAULTS = {
  wallpaper: "wallpaper_plain",
  floor: "floor_wood",
  furnitureSmall: "furniture_plant",
  furnitureWall: "wall_shelf",
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
  // No default for large furniture — that slot starts empty, same as RoomScene3D.
  const furnitureLargeKey = equippedKeys.furniture;
  const furnitureSmallKey = equippedKeys.furniture_small ?? DEFAULTS.furnitureSmall;
  const wallDecorKey = equippedKeys.furniture_wall ?? DEFAULTS.furnitureWall;

  const renderWallpaper = WALLPAPERS[wallpaperKey] ?? WALLPAPERS[DEFAULTS.wallpaper];
  const renderFloor = FLOORS[floorKey] ?? FLOORS[DEFAULTS.floor];
  const renderFurnitureLarge = furnitureLargeKey ? FURNITURE_LARGE[furnitureLargeKey] : null;
  const renderFurnitureSmall = FURNITURE_SMALL[furnitureSmallKey] ?? FURNITURE_SMALL[DEFAULTS.furnitureSmall];
  const renderWallDecor = WALL_DECOR[wallDecorKey] ?? WALL_DECOR[DEFAULTS.furnitureWall];

  return (
    <div className={`relative overflow-hidden rounded-3xl ${className}`}>
      <svg viewBox="0 0 300 200" className="block w-full" preserveAspectRatio="xMidYMax slice">
        {renderWallpaper(dotsId)}
        {renderFloor()}
        {renderWallDecor()}
        {renderFurnitureLarge && renderFurnitureLarge()}
        {renderFurnitureSmall()}
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
