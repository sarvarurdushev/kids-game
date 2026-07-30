// Pure data, deliberately kept dependency-free (no "use client", no
// react-three-fiber/drei imports) so it can be imported both by
// RoomScene3D.tsx (the live renderer) AND scripts/render-thumbnails.ts (a
// plain Node script that pre-renders each model to a static PNG for shop
// grid tiles) — one source of truth for "what furniture GLBs exist", not two
// lists that can drift apart.

export interface FurnitureModelSpec {
  url: string;
  height: number;
}

// Real Tripo3D-generated props (see public/models/furniture/CREDITS.md).
// Each is normalized from its own bounding box to a per-item target height —
// unlike standing characters, furniture pieces don't share a common height
// (a bookshelf and a treasure chest are wildly different proportions), so
// Prop3D takes that height as a prop rather than assuming one constant.
export const FURNITURE_LARGE_MODEL: Record<string, FurnitureModelSpec> = {
  furniture_chest: { url: "/models/furniture/chest.glb", height: 0.4 },
  furniture_bookshelf: { url: "/models/furniture/bookshelf.glb", height: 0.95 },
  furniture_desk: { url: "/models/furniture/furniture_desk.glb", height: 0.8 },
  // Lower than the 0.75 first guess — at 0.75 (width ~1.2) the bed's
  // headboard post visibly poked past the back wall's left edge into the
  // page background behind the canvas. 0.45 (width ~0.73, matching
  // bookshelf's clean 0.73) confirmed clipping-free on screen.
  furniture_bed: { url: "/models/furniture/furniture_bed.glb", height: 0.45 },
  // Legendary "Dream Room Scene" tier — detailed photorealistic multi-object
  // composites (a whole furnished corner), a distinctly more-detailed style
  // than the rest of the room. Mechanically just more furniture_large items;
  // see public/models/furniture/CREDITS.md for the style note.
  //
  // Heights below were tuned down from the original starting-point guesses
  // after screenshots showed several of them poking past the back wall's
  // left edge (visible as the item spilling onto the page background behind
  // the canvas, at the single-item era's FURNITURE_LARGE_POSITION x=-1.5) —
  // these wide multi-object scenes clip at notably narrower widths than a
  // single dense prop like the bookshelf, because their content is spread
  // more evenly across the full bounding box instead of tapering off near
  // the edges. nurserycorner was the one exception that looked clean at its
  // original guess and was left alone.
  furniture_scene_storycorner: { url: "/models/furniture/scene_story_corner.glb", height: 0.6 },
  furniture_scene_starlitbed: { url: "/models/furniture/scene_starlit_bed.glb", height: 0.4 },
  furniture_scene_nurserycorner: { url: "/models/furniture/scene_nursery_corner.glb", height: 0.85 },
  furniture_scene_playground: { url: "/models/furniture/scene_playground.glb", height: 0.35 },
  furniture_scene_toycorner: { url: "/models/furniture/scene_toy_corner.glb", height: 0.4 },
  furniture_scene_blushrug: { url: "/models/furniture/scene_blush_rug.glb", height: 0.35 },
  furniture_scene_wovennook: { url: "/models/furniture/scene_woven_nook.glb", height: 0.15 },
};

export const FURNITURE_SMALL_MODEL: Record<string, FurnitureModelSpec> = {
  furniture_plant: { url: "/models/furniture/plant.glb", height: 0.55 },
  furniture_lamp: { url: "/models/furniture/lamp.glb", height: 0.9 },
  // Lower than the 0.45 first guess — at 0.45 (width ~0.7) the beanbag
  // visibly clipped off the right edge of the frame at the single-item
  // era's FURNITURE_SMALL_POSITION x=1.6. 0.3 (width ~0.47, matching the
  // potted plant's clean ~0.47) fixed it.
  furniture_beanbag: { url: "/models/furniture/furniture_beanbag.glb", height: 0.3 },
  furniture_teddy: { url: "/models/furniture/furniture_teddy.glb", height: 0.4 },
};

// Real Tripo3D-generated wall decor (see public/models/furniture/CREDITS.md),
// same GLB-model pattern as FURNITURE_LARGE_MODEL/FURNITURE_SMALL_MODEL above.
export const WALL_DECOR_MODEL: Record<string, FurnitureModelSpec> = {
  wall_shelf: { url: "/models/furniture/wall_shelf.glb", height: 0.22 },
  wall_clock: { url: "/models/furniture/wall_clock.glb", height: 0.45 },
  wall_picture: { url: "/models/furniture/wall_picture.glb", height: 0.4 },
};
