import { Box3, Mesh, Vector3, type Object3D } from "three";

const CORNER_SIGNS: Array<[number, number, number]> = [
  [-1, -1, -1], [1, -1, -1], [-1, 1, -1], [1, 1, -1],
  [-1, -1, 1], [1, -1, 1], [-1, 1, 1], [1, 1, 1],
];

// Box3().setFromObject() is unusable here: three's SkinnedMesh overrides
// computeBoundingBox() to bake in *live* bone-skinning deformation, and
// that's read before the skeleton has ever been posed by the renderer —
// bone matrices are still zeroed, so it comes back with a garbage,
// wildly-oversized box (observed ~400 units tall for a model that's really
// ~3 units tall). What we actually want is the rest/bind-pose extent, which
// is exactly the *unskinned* local geometry transformed by each mesh's own
// (unposed) matrixWorld — so this walks meshes directly and reads
// `geometry.boundingBox`, never the mesh-level skinned override.
export function computeRestBoundingBox(root: Object3D): Box3 {
  root.updateWorldMatrix(true, true);
  const result = new Box3();
  const point = new Vector3();
  root.traverse((obj) => {
    if (!(obj instanceof Mesh)) return;
    const geometry = obj.geometry;
    if (!geometry.boundingBox) geometry.computeBoundingBox();
    const bb = geometry.boundingBox!;
    for (const [sx, sy, sz] of CORNER_SIGNS) {
      point
        .set(sx > 0 ? bb.max.x : bb.min.x, sy > 0 ? bb.max.y : bb.min.y, sz > 0 ? bb.max.z : bb.min.z)
        .applyMatrix4(obj.matrixWorld);
      result.expandByPoint(point);
    }
  });
  return result;
}
