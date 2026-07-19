"use client";

import { Suspense, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";

interface Scene3DProps {
  children: ReactNode;
  camera?: { position: [number, number, number]; fov?: number };
  className?: string;
  background?: string | null;
}

// One shared Canvas setup (capped device-pixel-ratio, image-based lighting
// + 3-point-ish direct lighting) reused everywhere a 3D scene is rendered,
// so every character/room surface gets the same look and the same
// performance ceiling instead of five slightly different ones.
// dpr is capped at 2 — an uncapped ratio on a high-density phone screen
// renders far more pixels than the eye can tell apart from 2x, for real
// frame-rate cost, which matters more here than on a desktop demo since
// this runs on whatever tablet a kid happens to have.
//
// The environment map drives soft ambient light + the specular reflections
// that make the glossy toy-render materials (Character3D, AnimalCharacter3D)
// read as polished rather than flat-shaded — self-hosted (not drei's default
// CDN preset) so a third-party host going down doesn't take character
// rendering with it. CC0, via Poly Haven: public/env/studio.hdr.
export function Scene3D({
  children,
  camera = { position: [0, 0.3, 4.2], fov: 32 },
  className = "",
  background = null,
}: Scene3DProps) {
  return (
    <Canvas
      className={className}
      dpr={[1, 2]}
      camera={{ position: camera.position, fov: camera.fov ?? 32 }}
      gl={{ antialias: true, alpha: background === null }}
      onCreated={({ gl }) => {
        if (background) gl.setClearColor(background);
      }}
    >
      <Suspense fallback={null}>
        <Environment files="/env/studio.hdr" />
      </Suspense>
      <ambientLight intensity={0.4} />
      <directionalLight position={[3, 4, 4]} intensity={1.15} />
      <directionalLight position={[-3, 1.5, -2]} intensity={0.4} color="#bcd9ff" />
      {children}
    </Canvas>
  );
}
