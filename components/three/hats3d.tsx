import type { ReactNode } from "react";

// Positioned relative to "just above the head" (y=0 here) rather than any
// one character's absolute head height — Character3D (the cat) and
// AnimalCharacter3D (dog/rabbit/fox/bear) each wrap these at their own
// per-character head anchor, so one hat model works for every species.
export const HATS: Record<string, () => ReactNode> = {
  hat_cap: () => (
    <group position={[0, 0, 0.02]}>
      <mesh scale={[1, 0.55, 1]}>
        <sphereGeometry args={[0.28, 16, 16]} />
        <meshStandardMaterial color="#2a7d8c" roughness={0.5} />
      </mesh>
      <mesh position={[0, -0.03, 0.28]} rotation={[0.35, 0, 0]}>
        <boxGeometry args={[0.28, 0.04, 0.18]} />
        <meshStandardMaterial color="#2a7d8c" roughness={0.5} />
      </mesh>
    </group>
  ),
  hat_wizard: () => (
    <group position={[0, 0, 0]}>
      <mesh>
        <cylinderGeometry args={[0.36, 0.36, 0.05, 16]} />
        <meshStandardMaterial color="#6a3fb5" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.3, 0]}>
        <coneGeometry args={[0.2, 0.58, 16]} />
        <meshStandardMaterial color="#7c4fc9" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.56, 0]}>
        <octahedronGeometry args={[0.06, 0]} />
        <meshStandardMaterial color="#ffd23f" roughness={0.3} emissive="#ffd23f" emissiveIntensity={0.3} />
      </mesh>
    </group>
  ),
  hat_crown: () => (
    <group position={[0, 0, 0]}>
      <mesh>
        <torusGeometry args={[0.28, 0.05, 8, 16]} />
        <meshStandardMaterial color="#ffd23f" roughness={0.3} />
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => {
        const angle = (i / 5) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.sin(angle) * 0.28, 0.08, Math.cos(angle) * 0.28]}>
            <coneGeometry args={[0.05, 0.14, 8]} />
            <meshStandardMaterial color="#ffd23f" roughness={0.3} />
          </mesh>
        );
      })}
    </group>
  ),
  hat_party: () => (
    <group position={[0, 0, 0]}>
      <mesh position={[0, 0.17, 0]}>
        <coneGeometry args={[0.22, 0.46, 16]} />
        <meshStandardMaterial color="#ff6f91" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.42, 0]}>
        <sphereGeometry args={[0.065, 10, 10]} />
        <meshStandardMaterial color="#fff" roughness={0.4} />
      </mesh>
    </group>
  ),
};
