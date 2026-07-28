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
  floorY?: number;
  position?: [number, number, number];
  // "floor" (default) rests the model's bottom at floorY, i.e. position is
  // "where its feet touch the floor" — every furniture piece today uses this.
  // "wall" instead vertically centers the model on position's y, i.e.
  // position is "where the middle of the picture/clock hangs" — for
  // wall-mounted decor. Not wired to any content yet (forward-prep for real
  // GLB wall-decor assets), but safe to use once they exist.
  anchor?: "floor" | "wall";
}

export function Prop3D({ url, targetHeight, floorY, position = [0, 0, 0], anchor = "floor" }: Prop3DProps) {
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
    let offsetVec: Vector3;
    if (anchor === "wall") {
      offsetVec = new Vector3(-center.x * s, -center.y * s, -center.z * s);
    } else {
      if (floorY === undefined) {
        throw new Error("Prop3D: floorY is required when anchor is \"floor\"");
      }
      offsetVec = new Vector3(-center.x * s, floorY - box.min.y * s, -center.z * s);
    }
    return { scale: s, offset: offsetVec };
  }, [cloned, targetHeight, floorY, anchor]);

  return (
    <group position={position}>
      <group scale={scale} position={offset}>
        <primitive object={cloned} />
      </group>
    </group>
  );
}
