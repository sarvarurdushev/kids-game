import type { ReactNode } from "react";

// Same species-agnostic "float a simple prop near an anchor point" pattern as
// hats3d.tsx. Each is positioned relative to its own anchor (y=0 here) rather
// than any one character's proportions — AnimalCharacter3D picks the anchor
// height per accessory (glasses near the face, bowtie/scarf at the neck,
// medal hanging on the chest) via ACCESSORY_ANCHOR_RATIO.
export const ACCESSORIES: Record<string, () => ReactNode> = {
  accessory_glasses: () => (
    <group position={[0, 0, 0.24]}>
      <mesh position={[-0.13, 0, 0]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.09, 0.018, 8, 16]} />
        <meshStandardMaterial color="#2d2d2d" roughness={0.4} />
      </mesh>
      <mesh position={[-0.13, 0, 0.005]}>
        <circleGeometry args={[0.075, 16]} />
        <meshStandardMaterial color="#bfe8ff" transparent opacity={0.45} roughness={0.2} />
      </mesh>
      <mesh position={[0.13, 0, 0]}>
        <torusGeometry args={[0.09, 0.018, 8, 16]} />
        <meshStandardMaterial color="#2d2d2d" roughness={0.4} />
      </mesh>
      <mesh position={[0.13, 0, 0.005]}>
        <circleGeometry args={[0.075, 16]} />
        <meshStandardMaterial color="#bfe8ff" transparent opacity={0.45} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.08, 0.016, 0.016]} />
        <meshStandardMaterial color="#2d2d2d" roughness={0.4} />
      </mesh>
    </group>
  ),
  accessory_bowtie: () => (
    <group position={[0, 0, 0.2]}>
      <mesh position={[-0.09, 0, 0]} rotation={[0, 0, 0.5]}>
        <coneGeometry args={[0.08, 0.16, 4]} />
        <meshStandardMaterial color="#e63946" roughness={0.5} />
      </mesh>
      <mesh position={[0.09, 0, 0]} rotation={[0, 0, -0.5]}>
        <coneGeometry args={[0.08, 0.16, 4]} />
        <meshStandardMaterial color="#e63946" roughness={0.5} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.045, 10, 10]} />
        <meshStandardMaterial color="#c1121f" roughness={0.5} />
      </mesh>
    </group>
  ),
  accessory_scarf: () => (
    <group position={[0, -0.02, 0.02]}>
      <mesh>
        <torusGeometry args={[0.22, 0.06, 8, 16]} />
        <meshStandardMaterial color="#e63946" roughness={0.6} />
      </mesh>
      <mesh position={[0.12, -0.16, 0.1]} rotation={[0.3, 0, 0.2]}>
        <boxGeometry args={[0.09, 0.22, 0.03]} />
        <meshStandardMaterial color="#e63946" roughness={0.6} />
      </mesh>
    </group>
  ),
  accessory_medal: () => (
    <group position={[0, -0.05, 0.2]}>
      <mesh position={[-0.05, 0.14, 0]} rotation={[0, 0, 0.3]}>
        <boxGeometry args={[0.03, 0.18, 0.01]} />
        <meshStandardMaterial color="#2b5fb0" roughness={0.6} />
      </mesh>
      <mesh position={[0.05, 0.14, 0]} rotation={[0, 0, -0.3]}>
        <boxGeometry args={[0.03, 0.18, 0.01]} />
        <meshStandardMaterial color="#2b5fb0" roughness={0.6} />
      </mesh>
      <mesh>
        <cylinderGeometry args={[0.09, 0.09, 0.02, 20]} />
        <meshStandardMaterial color="#ffd23f" roughness={0.3} metalness={0.4} />
      </mesh>
      <mesh position={[0, 0, 0.011]}>
        <cylinderGeometry args={[0.06, 0.06, 0.005, 20]} />
        <meshStandardMaterial color="#e0a800" roughness={0.4} />
      </mesh>
    </group>
  ),
};

// How far up the feet→head span (0 = feet, 1 = head-bone height) each
// accessory sits, since glasses/bowtie/scarf/medal land at very different
// body heights but all need to work across every quadruped/biped species.
export const ACCESSORY_ANCHOR_RATIO: Record<string, number> = {
  accessory_glasses: 0.94,
  accessory_bowtie: 0.66,
  accessory_scarf: 0.64,
  accessory_medal: 0.48,
};
