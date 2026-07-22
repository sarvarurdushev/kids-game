"use client";

import { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { SkeletonUtils } from "three-stdlib";
import { Group, Vector3 } from "three";
import { computeRestBoundingBox } from "./glbGeometry";

interface Prop3DProps {
  url: string;
  // Furniture pieces don't share a common height the way standing characters
  // do (a bookshelf and a treasure chest are wildly different proportions),
  // so each prop is normalized to its own target height rather than one
  // shared constant.
  targetHeight: number;
  floorY: number;
  position?: [number, number, number];
}

export function Prop3D({ url, targetHeight, floorY, position = [0, 0, 0] }: Prop3DProps) {
  const { scene } = useGLTF(url);
  // Every mount gets its own clone — useGLTF caches (and shares) the parsed
  // source, so two rooms rendering the same prop would otherwise share state.
  const cloned = useMemo(() => SkeletonUtils.clone(scene) as Group, [scene]);

  const { scale, offset } = useMemo(() => {
    const box = computeRestBoundingBox(cloned);
    const size = new Vector3();
    box.getSize(size);
    const center = new Vector3();
    box.getCenter(center);
    const s = size.y > 0 ? targetHeight / size.y : 1;
    const offsetVec = new Vector3(-center.x * s, floorY - box.min.y * s, -center.z * s);
    return { scale: s, offset: offsetVec };
  }, [cloned, targetHeight, floorY]);

  return (
    <group position={position}>
      <group scale={scale} position={offset}>
        <primitive object={cloned} />
      </group>
    </group>
  );
}
