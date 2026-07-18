"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import type { ReactNode } from "react";
import type { AvatarEquippedKeys, AvatarMood } from "@/components/avatar/AvatarCharacter";

const INK = "#2d2a26";

// Shared reference points so head/body/ears/eyes/tail all stay in sync —
// changing one of these re-aligns everything that's positioned relative to
// it, instead of hunting down scattered magic numbers.
const HEAD_Y = 0.5;
const HEAD_R = 0.42;
const BODY_Y = -0.18;

// "Fur" (the old human-hair slot, reused as-is so no schema/economy change was
// needed) — base coat color applied to head/ears/tail/body, plus a small
// decorative accent distinguishing each variant (stripes, poofs, a tuxedo
// patch), matching real cat coloring patterns instead of hairstyles.
const FUR: Record<string, { color: string; accent?: () => ReactNode }> = {
  hair_brown: {
    color: "#e8935a",
    // Positioned on the crown/nape, well above the eye line, so these read
    // as tabby markings on top of the head rather than furrowed eyebrows.
    accent: () => (
      <>
        {[
          [-0.1, HEAD_Y + 0.36, 0.05],
          [0.12, HEAD_Y + 0.4, -0.05],
          [0, HEAD_Y + 0.3, -0.18],
        ].map(([x, y, z], i) => (
          <mesh key={i} position={[x, y, z]} rotation={[0, 0, i * 0.4]}>
            <boxGeometry args={[0.13, 0.03, 0.02]} />
            <meshStandardMaterial color="#c46a34" flatShading />
          </mesh>
        ))}
      </>
    ),
  },
  hair_curly: {
    color: "#cdc6d8",
    accent: () => (
      <>
        {[
          [-0.36, HEAD_Y + 0.1, 0.08, 0.13],
          [0.36, HEAD_Y + 0.1, 0.08, 0.13],
          [0, HEAD_Y + 0.36, 0.1, 0.12],
          [-0.24, HEAD_Y + 0.3, -0.22, 0.1],
          [0.24, HEAD_Y + 0.3, -0.22, 0.1],
        ].map(([x, y, z, r], i) => (
          <mesh key={i} position={[x, y, z]}>
            <icosahedronGeometry args={[r, 0]} />
            <meshStandardMaterial color="#cdc6d8" flatShading />
          </mesh>
        ))}
      </>
    ),
  },
  hair_spiky: {
    color: "#33302e",
    accent: () => (
      <mesh position={[0, HEAD_Y - 0.16, HEAD_R * 0.82]} scale={[0.6, 0.5, 0.42]}>
        <sphereGeometry args={[0.32, 8, 8]} />
        <meshStandardMaterial color="#f5efe4" flatShading />
      </mesh>
    ),
  },
};

const CLOTHES: Record<string, { color: string; accent?: () => ReactNode }> = {
  clothes_tshirt: { color: "#4fb3d9" },
  clothes_hoodie: {
    color: "#33475b",
    accent: () => (
      <mesh position={[0, BODY_Y + 0.24, 0]}>
        <torusGeometry args={[0.22, 0.05, 6, 10]} />
        <meshStandardMaterial color="#25333f" flatShading />
      </mesh>
    ),
  },
  clothes_dress: {
    color: "#d46fb8",
    accent: () => (
      <mesh position={[0, BODY_Y - 0.14, 0]}>
        <coneGeometry args={[0.34, 0.28, 8]} />
        <meshStandardMaterial color="#b6549a" flatShading />
      </mesh>
    ),
  },
  clothes_superhero: {
    color: "#e74c3c",
    accent: () => (
      <>
        <mesh position={[0, BODY_Y + 0.12, -0.26]} rotation={[0.15, 0, 0]}>
          <planeGeometry args={[0.4, 0.5]} />
          <meshStandardMaterial color="#2b5fb0" side={2} flatShading />
        </mesh>
        <mesh position={[0, BODY_Y + 0.24, 0.27]}>
          <octahedronGeometry args={[0.06, 0]} />
          <meshStandardMaterial color="#ffd23f" flatShading />
        </mesh>
      </>
    ),
  },
};

const HAT_Y = HEAD_Y + HEAD_R + 0.06;

const HATS: Record<string, () => ReactNode> = {
  hat_cap: () => (
    <group position={[0, HAT_Y, 0.02]}>
      <mesh scale={[1, 0.55, 1]}>
        <icosahedronGeometry args={[0.28, 1]} />
        <meshStandardMaterial color="#2a7d8c" flatShading />
      </mesh>
      <mesh position={[0, -0.03, 0.28]} rotation={[0.35, 0, 0]}>
        <boxGeometry args={[0.28, 0.04, 0.18]} />
        <meshStandardMaterial color="#2a7d8c" flatShading />
      </mesh>
    </group>
  ),
  hat_wizard: () => (
    <group position={[0, HAT_Y, 0]}>
      <mesh>
        <cylinderGeometry args={[0.36, 0.36, 0.05, 10]} />
        <meshStandardMaterial color="#6a3fb5" flatShading />
      </mesh>
      <mesh position={[0, 0.3, 0]}>
        <coneGeometry args={[0.2, 0.58, 8]} />
        <meshStandardMaterial color="#7c4fc9" flatShading />
      </mesh>
      <mesh position={[0, 0.56, 0]}>
        <octahedronGeometry args={[0.06, 0]} />
        <meshStandardMaterial color="#ffd23f" flatShading emissive="#ffd23f" emissiveIntensity={0.3} />
      </mesh>
    </group>
  ),
  hat_crown: () => (
    <group position={[0, HAT_Y, 0]}>
      <mesh>
        <torusGeometry args={[0.28, 0.05, 6, 12]} />
        <meshStandardMaterial color="#ffd23f" flatShading />
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => {
        const angle = (i / 5) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.sin(angle) * 0.28, 0.08, Math.cos(angle) * 0.28]}>
            <coneGeometry args={[0.05, 0.14, 4]} />
            <meshStandardMaterial color="#ffd23f" flatShading />
          </mesh>
        );
      })}
    </group>
  ),
  hat_party: () => (
    <group position={[0, HAT_Y, 0]}>
      <mesh position={[0, 0.17, 0]}>
        <coneGeometry args={[0.22, 0.46, 8]} />
        <meshStandardMaterial color="#ff6f91" flatShading />
      </mesh>
      <mesh position={[0, 0.42, 0]}>
        <icosahedronGeometry args={[0.065, 0]} />
        <meshStandardMaterial color="#fff" flatShading />
      </mesh>
    </group>
  ),
};

const ACCESSORIES: Record<string, () => ReactNode> = {
  accessory_glasses: () => (
    <group position={[0, HEAD_Y + 0.08, HEAD_R * 0.94]}>
      <mesh position={[-0.16, 0, 0]}>
        <torusGeometry args={[0.1, 0.02, 6, 10]} />
        <meshStandardMaterial color={INK} flatShading />
      </mesh>
      <mesh position={[0.16, 0, 0]}>
        <torusGeometry args={[0.1, 0.02, 6, 10]} />
        <meshStandardMaterial color={INK} flatShading />
      </mesh>
      <mesh>
        <boxGeometry args={[0.12, 0.02, 0.02]} />
        <meshStandardMaterial color={INK} flatShading />
      </mesh>
    </group>
  ),
  accessory_bowtie: () => (
    <group position={[0, (HEAD_Y - HEAD_R + BODY_Y + 0.3) / 2, 0.3]}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.09, 0.12, 4]} />
        <meshStandardMaterial color="#e63946" flatShading />
      </mesh>
      <mesh rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.09, 0.12, 4]} />
        <meshStandardMaterial color="#e63946" flatShading />
      </mesh>
      <mesh>
        <icosahedronGeometry args={[0.04, 0]} />
        <meshStandardMaterial color="#c1121f" flatShading />
      </mesh>
    </group>
  ),
  accessory_scarf: () => (
    <mesh position={[0, (HEAD_Y - HEAD_R + BODY_Y + 0.3) / 2, 0]}>
      <torusGeometry args={[0.22, 0.06, 6, 12]} />
      <meshStandardMaterial color="#e63946" flatShading />
    </mesh>
  ),
  accessory_medal: () => (
    <group position={[0, BODY_Y - 0.05, 0.22]}>
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[0.04, 0.3, 0.02]} />
        <meshStandardMaterial color="#2b5fb0" flatShading />
      </mesh>
      <mesh>
        <cylinderGeometry args={[0.08, 0.08, 0.03, 10]} />
        <meshStandardMaterial color="#ffd23f" flatShading />
      </mesh>
    </group>
  ),
};

const EYE_STYLE: Record<string, { size: number; color: string }> = {
  eyes_round: { size: 0.08, color: "#4a7a3f" },
  eyes_sparkle: { size: 0.095, color: "#2f6fa8" },
  eyes_star: { size: 0.09, color: "#ffb703" },
};

function Eyes({ eyesKey }: { eyesKey: string }) {
  const style = EYE_STYLE[eyesKey] ?? EYE_STYLE.eyes_round;
  const isStar = eyesKey === "eyes_star";
  const y = HEAD_Y + 0.06;
  const z = HEAD_R * 0.92;
  return (
    <>
      {[-0.17, 0.17].map((x) => (
        <group key={x} position={[x, y, z]}>
          <mesh>
            <sphereGeometry args={[style.size, 10, 10]} />
            <meshStandardMaterial color="#fff" flatShading />
          </mesh>
          <mesh position={[0, 0, style.size * 0.62]}>
            {isStar ? (
              <octahedronGeometry args={[style.size * 0.62, 0]} />
            ) : (
              <sphereGeometry args={[style.size * 0.62, 8, 8]} />
            )}
            <meshStandardMaterial color={style.color} flatShading />
          </mesh>
          <mesh position={[-style.size * 0.25, style.size * 0.3, style.size * 0.95]}>
            <sphereGeometry args={[style.size * 0.22, 6, 6]} />
            <meshStandardMaterial color="#fff" flatShading />
          </mesh>
        </group>
      ))}
    </>
  );
}

function Ears({ furColor, mood }: { furColor: string; mood: AvatarMood }) {
  const tilt = mood === "sad" ? 1.3 : mood === "happy" ? -0.1 : 0.15;
  // Ear origin sits ON the head's surface (40° up from the head's equator) so
  // the cone's base half embeds into the head and only the pointed tip pokes
  // out — that's what avoids the "floating antenna" look.
  const angle = (40 * Math.PI) / 180;
  const ex = Math.sin(angle) * HEAD_R * 0.85;
  const ey = HEAD_Y + Math.cos(angle) * HEAD_R * 0.85;
  const ez = -HEAD_R * 0.25;
  return (
    <>
      {[-1, 1].map((side) => (
        <group key={side} position={[side * ex, ey, ez]} rotation={[tilt, 0, side * -0.4]}>
          <mesh>
            <coneGeometry args={[0.16, 0.3, 4]} />
            <meshStandardMaterial color={furColor} flatShading />
          </mesh>
          <mesh position={[0, 0.02, side * 0.02]} scale={[0.55, 0.62, 0.55]}>
            <coneGeometry args={[0.16, 0.3, 4]} />
            <meshStandardMaterial color="#f4b8c4" flatShading />
          </mesh>
        </group>
      ))}
    </>
  );
}

function Tail({ furColor, mood }: { furColor: string; mood: AvatarMood }) {
  const groupRef = useRef<Group>(null);
  const t = useRef(0);
  useFrame((_, delta) => {
    t.current += delta;
    if (!groupRef.current) return;
    const speed = mood === "happy" ? 8 : mood === "sad" ? 1.2 : 2.5;
    const amount = mood === "sad" ? 0.06 : 0.22;
    groupRef.current.rotation.z = Math.sin(t.current * speed) * amount;
  });
  return (
    <group position={[0, BODY_Y - 0.08, -0.24]} rotation={[mood === "sad" ? -0.9 : -0.3, 0, 0]} ref={groupRef}>
      <mesh position={[0, -0.12, 0]}>
        <capsuleGeometry args={[0.065, 0.22, 4, 6]} />
        <meshStandardMaterial color={furColor} flatShading />
      </mesh>
      <mesh position={[0, -0.34, mood === "sad" ? 0 : 0.08]} rotation={[mood === "sad" ? 0 : -0.6, 0, 0]}>
        <capsuleGeometry args={[0.05, 0.18, 4, 6]} />
        <meshStandardMaterial color={furColor} flatShading />
      </mesh>
    </group>
  );
}

const DEFAULTS = {
  hair: "hair_brown",
  eyes: "eyes_round",
  clothes: "clothes_tshirt",
};

interface Character3DProps {
  equippedKeys: AvatarEquippedKeys;
  mood?: AvatarMood;
}

export function Character3D({ equippedKeys, mood = "neutral" }: Character3DProps) {
  const groupRef = useRef<Group>(null);
  const t = useRef(0);

  useFrame((_, delta) => {
    t.current += delta;
    const group = groupRef.current;
    if (!group) return;
    if (mood === "happy") {
      group.position.y = Math.sin(t.current * 7) * 0.06;
      group.rotation.z = Math.sin(t.current * 6) * 0.05;
    } else if (mood === "sad") {
      group.position.y = -0.03 + Math.sin(t.current * 2) * 0.015;
      group.rotation.z = Math.sin(t.current * 1.5) * 0.02;
    } else {
      group.position.y = Math.sin(t.current * 1.6) * 0.025;
      group.rotation.z = Math.sin(t.current * 1.2) * 0.015;
    }
  });

  const clothesKey = equippedKeys.clothes ?? DEFAULTS.clothes;
  const furKey = equippedKeys.hair ?? DEFAULTS.hair;
  const eyesKey = equippedKeys.eyes ?? DEFAULTS.eyes;
  const hatKey = equippedKeys.hat;
  const accessoryKey = equippedKeys.accessory;

  const clothes = CLOTHES[clothesKey] ?? CLOTHES[DEFAULTS.clothes];
  const fur = FUR[furKey] ?? FUR[DEFAULTS.hair];
  const renderHat = hatKey ? HATS[hatKey] : null;
  const renderAccessory = accessoryKey ? ACCESSORIES[accessoryKey] : null;

  const noseColor = "#f4869a";
  const mouthOpen = mood === "happy";
  const faceY = HEAD_Y - 0.06;
  const faceZ = HEAD_R * 0.95;

  return (
    <group ref={groupRef}>
      <mesh position={[0, BODY_Y, 0]}>
        <capsuleGeometry args={[0.3, 0.16, 4, 8]} />
        <meshStandardMaterial color={clothes.color} flatShading />
      </mesh>
      {clothes.accent?.()}

      {[-1, 1].map((side) => (
        <group key={side} position={[side * 0.3, BODY_Y + 0.03, 0.06]}>
          <mesh>
            <sphereGeometry args={[0.085, 8, 8]} />
            <meshStandardMaterial color={clothes.color} flatShading />
          </mesh>
          <mesh position={[0, -0.06, 0.03]} scale={[0.75, 0.6, 0.75]}>
            <sphereGeometry args={[0.075, 8, 8]} />
            <meshStandardMaterial color={fur.color} flatShading />
          </mesh>
        </group>
      ))}

      <Tail furColor={fur.color} mood={mood} />

      <mesh position={[0, HEAD_Y, 0]}>
        <icosahedronGeometry args={[HEAD_R, 1]} />
        <meshStandardMaterial color={fur.color} flatShading />
      </mesh>
      {fur.accent?.()}

      <Ears furColor={fur.color} mood={mood} />

      <Eyes eyesKey={eyesKey} />

      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[side * HEAD_R * 0.72, faceY - 0.02, HEAD_R * 0.75]}
          scale={[1, 0.6, 0.3]}
        >
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color="#f9a8b8" flatShading transparent opacity={0.55} />
        </mesh>
      ))}

      <mesh position={[0, faceY, faceZ]} rotation={[Math.PI, 0, Math.PI / 2]}>
        <coneGeometry args={[0.045, 0.06, 3]} />
        <meshStandardMaterial color={noseColor} flatShading />
      </mesh>

      {mouthOpen ? (
        <mesh position={[0, faceY - 0.08, faceZ - 0.02]}>
          <sphereGeometry args={[0.05, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#8a3b3b" flatShading side={2} />
        </mesh>
      ) : (
        <>
          {/* Corners tilt up toward center (u-shape smile) for neutral; flipped
              to an arch (frown) only when sad. */}
          <mesh position={[-0.03, faceY - 0.06, faceZ]} rotation={[0, 0, mood === "sad" ? 0.6 : -0.6]}>
            <boxGeometry args={[0.07, 0.018, 0.015]} />
            <meshStandardMaterial color={INK} flatShading />
          </mesh>
          <mesh position={[0.03, faceY - 0.06, faceZ]} rotation={[0, 0, mood === "sad" ? -0.6 : 0.6]}>
            <boxGeometry args={[0.07, 0.018, 0.015]} />
            <meshStandardMaterial color={INK} flatShading />
          </mesh>
        </>
      )}

      {[-1, 1].map((side) =>
        [0, 1].map((i) => (
          <mesh
            key={`${side}-${i}`}
            position={[side * 0.28, faceY - i * 0.03, faceZ - 0.06]}
            rotation={[0, 0, side * (0.15 + i * 0.15)]}
          >
            <boxGeometry args={[0.18, 0.006, 0.006]} />
            <meshStandardMaterial color="#fff" flatShading />
          </mesh>
        ))
      )}

      {renderAccessory?.()}
      {renderHat?.()}
    </group>
  );
}
