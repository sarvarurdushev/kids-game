"use client";

import type { ReactNode } from "react";
import { Canvas } from "@react-three/fiber";

interface Scene3DProps {
  children: ReactNode;
  camera?: { position: [number, number, number]; fov?: number };
  className?: string;
  background?: string | null;
}

// One shared Canvas setup (capped device-pixel-ratio, simple 3-point-ish
// lighting) reused everywhere a 3D scene is rendered, so every surface gets
// the same performance ceiling instead of five slightly different ones.
// dpr is capped at 2 — an uncapped ratio on a high-density phone screen
// renders far more pixels than the eye can tell apart from 2x, for real
// frame-rate cost, which matters more here than on a desktop demo since
// this runs on whatever tablet a kid happens to have.
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
      <ambientLight intensity={0.65} />
      <directionalLight position={[3, 4, 4]} intensity={1.1} />
      <directionalLight position={[-3, 1.5, -2]} intensity={0.35} color="#bcd9ff" />
      {children}
    </Canvas>
  );
}
