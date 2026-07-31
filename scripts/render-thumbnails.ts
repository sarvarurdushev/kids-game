/**
 * Pre-renders each room-furniture GLB, avatar-species GLB, and procedural
 * wallpaper/floor pattern to a static PNG, used as shop-grid thumbnails
 * instead of a live <Canvas> per tile (browsers cap simultaneous WebGL
 * contexts well below how many items a single grid shows — 11
 * large-furniture items alone, 30+ species).
 *
 * Technique: spin up a tiny local static file server (serving three.module.js
 * + GLTFLoader from node_modules/three, and the actual .glb files from
 * public/), drive it with Playwright/Chromium (real WebGL via SwiftShader,
 * same headless-three.js-via-Playwright approach used elsewhere in this
 * project's history for offline GLB inspection), load each model in an
 * isolated scene, frame it, and read back a PNG via canvas.toDataURL().
 *
 * Wallpaper/floor items have no GLB — they're procedural flat-color plane
 * geometry defined inline in components/three/RoomScene3D.tsx's WALLPAPERS/
 * FLOORS maps. Since those maps are JSX-returning functions (not plain data
 * like furnitureModels.ts), they can't be imported into this Node script;
 * instead RENDER_HTML below carries a hand-translated vanilla-three.js copy
 * of the same geometry/color recipes (see the "mirrors RoomScene3D.tsx"
 * comment there) and renders those to PNGs the same way.
 *
 * Usage: npm run render-thumbnails
 *   (equivalent to: tsx --conditions=react-server scripts/render-thumbnails.ts)
 *
 * Output:
 *   public/thumbnails/furniture/<key>.png  — every key in FURNITURE_LARGE_MODEL,
 *                                             FURNITURE_SMALL_MODEL, WALL_DECOR_MODEL
 *   public/thumbnails/species/<key>.png    — every active avatarItems row with
 *                                             slot = 'species'
 *   public/thumbnails/wallpaper/<key>.png  — every active avatarItems row with
 *                                             slot = 'wallpaper'
 *   public/thumbnails/floor/<key>.png      — every active avatarItems row with
 *                                             slot = 'floor'
 */
import "./_env";
import http from "node:http";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { avatarItems } from "@/lib/db/schema";
import { FURNITURE_LARGE_MODEL, FURNITURE_SMALL_MODEL, WALL_DECOR_MODEL } from "@/components/three/furnitureModels";
import { SPECIES_MODEL_URL } from "@/components/three/speciesModels";

const ROOT = path.resolve(__dirname, "..");
const PUBLIC_DIR = path.join(ROOT, "public");
// Served as a directory (not a single file) — three.module.js itself
// imports a sibling three.core.js at runtime, so both need to be reachable.
const THREE_BUILD_DIR = path.join(ROOT, "node_modules/three/build");
const THREE_MODULE_ENTRY = path.join(THREE_BUILD_DIR, "three.module.js");
const THREE_JSM = path.join(ROOT, "node_modules/three/examples/jsm");
const OUT_FURNITURE = path.join(PUBLIC_DIR, "thumbnails/furniture");
const OUT_SPECIES = path.join(PUBLIC_DIR, "thumbnails/species");
const OUT_WALLPAPER = path.join(PUBLIC_DIR, "thumbnails/wallpaper");
const OUT_FLOOR = path.join(PUBLIC_DIR, "thumbnails/floor");

const FURNITURE_SIZE: [number, number] = [450, 300]; // 3:2, matches the room grid tile's aspect-[3/2]
const SPECIES_SIZE: [number, number] = [320, 320]; // square, matches the avatar grid's square tile
const PATTERN_SIZE: [number, number] = [450, 300]; // 3:2, same grid tile as furniture (RoomCustomizer's THUMBNAIL_SLOTS)

const MIME: Record<string, string> = {
  ".js": "text/javascript",
  ".glb": "model/gltf-binary",
  ".html": "text/html",
};

// --- Tiny static file server, three roots mounted under distinct prefixes.
function startServer(): Promise<{ url: string; close: () => Promise<void> }> {
  const roots: [string, string][] = [
    ["/vendor/three/", THREE_BUILD_DIR],
    ["/vendor/jsm/", THREE_JSM],
    ["/models/", path.join(PUBLIC_DIR, "models")],
  ];

  const server = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url ?? "/", "http://localhost");
      if (url.pathname === "/render.html") {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(RENDER_HTML);
        return;
      }
      for (const [prefix, root] of roots) {
        if (!url.pathname.startsWith(prefix)) continue;
        const filePath = path.join(root, url.pathname.slice(prefix.length));
        if (!filePath.startsWith(root)) {
          res.writeHead(403);
          res.end();
          return;
        }
        const data = await fsp.readFile(filePath);
        const ext = path.extname(filePath);
        res.writeHead(200, { "Content-Type": MIME[ext] ?? "application/octet-stream" });
        res.end(data);
        return;
      }
      res.writeHead(404);
      res.end("not found: " + url.pathname);
    } catch (err) {
      res.writeHead(500);
      res.end(String(err));
    }
  });

  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : 0;
      resolve({
        url: `http://127.0.0.1:${port}`,
        close: () => new Promise((r) => server.close(() => r())),
      });
    });
  });
}

// --- The render page itself: loads three.js + GLTFLoader via an import map,
// exposes window.__renderModel(url, width, height) -> Promise<dataURL>.
const RENDER_HTML = `<!doctype html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0;background:transparent;">
<canvas id="c"></canvas>
<script type="importmap">
{ "imports": { "three": "/vendor/three/three.module.js" } }
</script>
<script type="module">
import * as THREE from "three";
import { GLTFLoader } from "/vendor/jsm/loaders/GLTFLoader.js";

const canvas = document.getElementById("c");
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.outputColorSpace = THREE.SRGBColorSpace;
// r3f's <Canvas> (used by Scene3D.tsx) tone-maps with ACESFilmic by default;
// this raw three.js renderer doesn't unless told to, so without this line
// the exact same light intensities clip to blown-out white here but not in
// the live 3D views. Setting it keeps the two renders looking consistent.
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.setClearColor(0x000000, 0);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(35, 1, 0.01, 100);

// NOT numerically matched to Scene3D.tsx's light intensities — deliberately
// higher. Scene3D.tsx's live views get significant extra ambient/specular
// fill from its HDR studio environment map (<Environment files="/env/
// studio.hdr" />), which this standalone renderer has no equivalent of ("a
// one-off isolated-model render" comment below refers to skipping the HDR
// setup for simplicity, not claiming the light is equivalent without it).
// Copying Scene3D.tsx's post-dimming numbers 1:1 here was tried and produced
// visibly darker/grayer thumbnails than the live room actually shows —
// caught by comparing a rendered wallpaper_plain.png (#fdeecb, a pale cream)
// against a live-room screenshot of the same wallpaper: the live wall reads
// as pale off-white, the thumbnail read as gray-khaki. These values are
// tuned independently, empirically, against real screenshots (same
// technique as everywhere else in this file) to visually match the live
// room's actual appearance, not to track Scene3D.tsx's numbers.
scene.add(new THREE.AmbientLight(0xffffff, 1.0));
const dir1 = new THREE.DirectionalLight(0xffffff, 1.7);
dir1.position.set(3, 4, 4);
scene.add(dir1);
const dir2 = new THREE.DirectionalLight(0xbcd9ff, 0.7);
dir2.position.set(-3, 1.5, -2);
scene.add(dir2);

const loader = new GLTFLoader();
// Single shared "whatever was last added for a render" slot — every render
// path (GLB model, wallpaper pattern, floor pattern) must clear this before
// adding its own content, or the previous call's leftovers (e.g. the last
// species GLB) silently linger in the scene and show up behind the next
// thumbnail. setSceneContent() below is the one place that's enforced.
let currentContent = null;
function setSceneContent(object) {
  if (currentContent) scene.remove(currentContent);
  currentContent = object;
  scene.add(object);
}

window.__renderModel = function (url, width, height) {
  return new Promise((resolve, reject) => {
    canvas.width = width;
    canvas.height = height;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;

    loader.load(
      url,
      (gltf) => {
        const current = gltf.scene;
        setSceneContent(current);

        // Center the model at the origin (x/z) with its bottom resting on
        // y=0, same convention Prop3D/AnimalCharacter3D use in the live app.
        const box = new THREE.Box3().setFromObject(current);
        const size = new THREE.Vector3();
        box.getSize(size);
        const center = new THREE.Vector3();
        box.getCenter(center);
        current.position.x -= center.x;
        current.position.y -= box.min.y;
        current.position.z -= center.z;

        // Frame the whole model regardless of its aspect ratio: fit a sphere
        // around it (any camera angle covers the object, not just a
        // straight-on shot) at a fixed pleasant 3/4 angle.
        const radius = 0.5 * Math.sqrt(size.x * size.x + size.y * size.y + size.z * size.z) || 0.5;
        const vFov = (camera.fov * Math.PI) / 180;
        const hFov = 2 * Math.atan(Math.tan(vFov / 2) * camera.aspect);
        const distance = 1.2 * Math.max(radius / Math.sin(vFov / 2), radius / Math.sin(hFov / 2));

        const target = new THREE.Vector3(0, size.y / 2, 0);
        const dir = new THREE.Vector3(0.55, 0.42, 0.85).normalize();
        camera.position.copy(dir).multiplyScalar(distance).add(target);
        camera.lookAt(target);
        camera.updateProjectionMatrix();

        renderer.render(scene, camera);
        resolve(canvas.toDataURL("image/png"));
      },
      undefined,
      (err) => reject(err instanceof Error ? err.message : String(err))
    );
  });
};

// --- Wallpaper/floor pattern rendering -------------------------------------
// Hand-translated copy of components/three/RoomScene3D.tsx's WALLPAPERS/
// FLOORS maps, JSX -> vanilla THREE calls. Kept numerically identical on
// purpose (same FLOOR_Y/WALL_Z/WALL_HEIGHT constants, same literal
// geometry args and color hex values for every key) so the thumbnail
// actually matches what a student sees in their live room. There is no
// shared-module source of truth here (unlike furnitureModels.ts) because
// WALLPAPERS/FLOORS there are JSX-returning functions, not plain data —
// if RoomScene3D.tsx's patterns ever change, mirror the change here too.
const FLOOR_Y = -0.85;
const WALL_Z = -1.3;
const WALL_HEIGHT = 2.6;

function patternMesh(geometry, color, position, extra) {
  const material = new THREE.MeshStandardMaterial(Object.assign({ color, flatShading: true }, extra || {}));
  const m = new THREE.Mesh(geometry, material);
  m.position.set(position[0], position[1], position[2]);
  return m;
}

// Floor meshes all share RoomScene3D.tsx's rotation={[-Math.PI / 2, 0, 0]}.
function floorMesh(geometry, color, position) {
  const m = patternMesh(geometry, color, position);
  m.rotation.set(-Math.PI / 2, 0, 0);
  return m;
}

const WALLPAPER_RECIPES = {
  wallpaper_plain: () => {
    const g = new THREE.Group();
    g.add(patternMesh(new THREE.PlaneGeometry(5, WALL_HEIGHT), "#fdeecb", [0, FLOOR_Y + WALL_HEIGHT / 2, WALL_Z]));
    return g;
  },
  wallpaper_stripes: () => {
    const g = new THREE.Group();
    g.add(patternMesh(new THREE.PlaneGeometry(5, WALL_HEIGHT), "#fdeecb", [0, FLOOR_Y + WALL_HEIGHT / 2, WALL_Z]));
    for (const x of [-1.8, -1, -0.2, 0.6, 1.4]) {
      g.add(
        patternMesh(new THREE.PlaneGeometry(0.4, WALL_HEIGHT), "#ffd9e6", [x, FLOOR_Y + WALL_HEIGHT / 2, WALL_Z + 0.01])
      );
    }
    return g;
  },
  wallpaper_stars: () => {
    const g = new THREE.Group();
    g.add(patternMesh(new THREE.PlaneGeometry(5, WALL_HEIGHT), "#26315f", [0, FLOOR_Y + WALL_HEIGHT / 2, WALL_Z]));
    g.add(
      patternMesh(new THREE.SphereGeometry(0.22, 8, 8), "#ffe8a3", [1.7, FLOOR_Y + WALL_HEIGHT - 0.5, WALL_Z + 0.02], {
        emissive: "#ffe8a3",
        emissiveIntensity: 0.4,
      })
    );
    const stars = [
      [-1.6, 0.6],
      [-0.8, 1.3],
      [0, 0.4],
      [0.9, 1.1],
      [1.3, 0.3],
      [-1.2, -0.2],
    ];
    for (const [x, y] of stars) {
      g.add(
        patternMesh(
          new THREE.OctahedronGeometry(0.04, 0),
          "#ffffff",
          [x, FLOOR_Y + WALL_HEIGHT / 2 + y, WALL_Z + 0.02],
          { emissive: "#ffffff", emissiveIntensity: 0.5 }
        )
      );
    }
    return g;
  },
  wallpaper_dots: () => {
    const g = new THREE.Group();
    g.add(patternMesh(new THREE.PlaneGeometry(5, WALL_HEIGHT), "#fff3e0", [0, FLOOR_Y + WALL_HEIGHT / 2, WALL_Z]));
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 6; col++) {
        g.add(
          patternMesh(new THREE.CircleGeometry(0.08, 8), "#2a7d8c", [
            -2 + col * 0.8,
            FLOOR_Y + 0.4 + row * 0.6,
            WALL_Z + 0.02,
          ])
        );
      }
    }
    return g;
  },
};

const FLOOR_RECIPES = {
  floor_wood: () => {
    const g = new THREE.Group();
    g.add(floorMesh(new THREE.PlaneGeometry(5, 3), "#c8925c", [0, FLOOR_Y, 0.5]));
    for (const z of [-1, -0.4, 0.2, 0.8, 1.4]) {
      g.add(floorMesh(new THREE.PlaneGeometry(5, 0.03), "#a9743f", [0, FLOOR_Y + 0.002, z]));
    }
    return g;
  },
  floor_rug: () => {
    const g = new THREE.Group();
    g.add(floorMesh(new THREE.PlaneGeometry(5, 3), "#c8925c", [0, FLOOR_Y, 0.5]));
    g.add(floorMesh(new THREE.CircleGeometry(0.9, 16), "#e8607f", [0, FLOOR_Y + 0.01, 0.7]));
    return g;
  },
  floor_tile: () => {
    const g = new THREE.Group();
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        const color = (row + col) % 2 === 0 ? "#eee3d3" : "#d8c8ac";
        g.add(floorMesh(new THREE.PlaneGeometry(1, 1), color, [-2 + col, FLOOR_Y, -0.5 + row]));
      }
    }
    return g;
  },
  floor_grass: () => {
    const g = new THREE.Group();
    g.add(floorMesh(new THREE.PlaneGeometry(5, 3), "#8bc76a", [0, FLOOR_Y, 0.5]));
    return g;
  },
};

// A thin neutral backdrop strip behind the floor's far edge, purely a
// thumbnail-composition aid (NOT part of RoomScene3D.tsx's live room) so a
// floor swatch reads as "floor meeting a wall" instead of an abstract color
// rectangle floating in space, per the task brief's suggestion.
function makeFloorBackdrop(floorBox) {
  const width = Math.max(floorBox.max.x - floorBox.min.x, 0.1) + 1;
  const backdropHeight = 0.55;
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(width, backdropHeight),
    new THREE.MeshStandardMaterial({ color: "#e9e2d3", flatShading: true })
  );
  m.position.set(
    (floorBox.min.x + floorBox.max.x) / 2,
    FLOOR_Y + backdropHeight / 2,
    floorBox.min.z + 0.01
  );
  return m;
}

// Dead-on orthographic camera framing the wall plane floor-to-ceiling — a
// flat pattern swatch reads cleanest with no perspective skew, same idea as
// looking straight at a paint chip.
const wallpaperCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
const wallpaperTarget = new THREE.Vector3(0, FLOOR_Y + WALL_HEIGHT / 2, WALL_Z);
wallpaperCamera.position.set(wallpaperTarget.x, wallpaperTarget.y, wallpaperTarget.z + 3);
wallpaperCamera.lookAt(wallpaperTarget);

window.__renderWallpaper = function (key, width, height) {
  return new Promise((resolve, reject) => {
    const build = WALLPAPER_RECIPES[key];
    if (!build) {
      reject(new Error(\`no wallpaper recipe for "\${key}" — add one in scripts/render-thumbnails.ts\`));
      return;
    }
    canvas.width = width;
    canvas.height = height;
    renderer.setSize(width, height, false);

    setSceneContent(build());

    const viewHeight = WALL_HEIGHT;
    const viewWidth = viewHeight * (width / height);
    wallpaperCamera.left = -viewWidth / 2;
    wallpaperCamera.right = viewWidth / 2;
    wallpaperCamera.top = viewHeight / 2;
    wallpaperCamera.bottom = -viewHeight / 2;
    wallpaperCamera.updateProjectionMatrix();

    renderer.render(scene, wallpaperCamera);
    resolve(canvas.toDataURL("image/png"));
  });
};

// Elevated three-quarter perspective camera for the floor — angled down
// enough to read the pattern clearly (not edge-on), but not fully top-down
// (which would look like an abstract color swatch, not "flooring").
const floorCamera = new THREE.PerspectiveCamera(35, 1, 0.01, 100);

window.__renderFloor = function (key, width, height) {
  return new Promise((resolve, reject) => {
    const build = FLOOR_RECIPES[key];
    if (!build) {
      reject(new Error(\`no floor recipe for "\${key}" — add one in scripts/render-thumbnails.ts\`));
      return;
    }
    canvas.width = width;
    canvas.height = height;
    renderer.setSize(width, height, false);
    floorCamera.aspect = width / height;

    const group = build();
    const floorBox = new THREE.Box3().setFromObject(group);
    group.add(makeFloorBackdrop(floorBox));
    setSceneContent(group);

    const size = new THREE.Vector3();
    floorBox.getSize(size);
    const center = new THREE.Vector3();
    floorBox.getCenter(center);

    const radius = 0.5 * Math.sqrt(size.x * size.x + size.z * size.z) || 0.5;
    const vFov = (floorCamera.fov * Math.PI) / 180;
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * floorCamera.aspect);
    const distance = 1.15 * Math.max(radius / Math.sin(vFov / 2), radius / Math.sin(hFov / 2));

    const target = new THREE.Vector3(center.x, FLOOR_Y, center.z - size.z * 0.1);
    const dir = new THREE.Vector3(0, 1, 0.75).normalize();
    floorCamera.position.copy(dir).multiplyScalar(distance).add(target);
    floorCamera.lookAt(target);
    floorCamera.updateProjectionMatrix();

    renderer.render(scene, floorCamera);
    resolve(canvas.toDataURL("image/png"));
  });
};

window.__ready = true;
</script>
</body>
</html>`;

async function writePng(dataUrl: string, outPath: string) {
  const base64 = dataUrl.replace(/^data:image\/png;base64,/, "");
  const buffer = Buffer.from(base64, "base64");
  await fsp.mkdir(path.dirname(outPath), { recursive: true });

  // Basic compression pass (sharp is already an installed transitive dep of
  // next, so this is free) — a rendered-then-recompressed PNG comes out
  // meaningfully smaller than the raw canvas.toDataURL() output.
  try {
    const sharp = (await import("sharp")).default;
    const compressed = await sharp(buffer).png({ compressionLevel: 9, palette: true }).toBuffer();
    await fsp.writeFile(outPath, compressed);
  } catch {
    await fsp.writeFile(outPath, buffer);
  }
}

async function main() {
  if (!fs.existsSync(THREE_MODULE_ENTRY)) {
    throw new Error(`three.module.js not found at ${THREE_MODULE_ENTRY} — is three installed?`);
  }

  const { url: baseUrl, close } = await startServer();
  const browser = await chromium.launch({
    executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
    args: ["--enable-unsafe-swiftshader"],
  });
  const page = await browser.newPage();
  page.on("pageerror", (err: Error) => console.error("[page error]", err));
  page.on("requestfailed", (req) => console.error("[request failed]", req.url(), req.failure()?.errorText));
  await page.goto(`${baseUrl}/render.html`);
  await page.waitForFunction(() => (window as unknown as { __ready?: boolean }).__ready === true, undefined, {
    timeout: 15000,
  });

  let ok = 0;
  let failed = 0;

  async function render(key: string, glbUrl: string, outPath: string, size: [number, number]) {
    const fullUrl = `${baseUrl}${glbUrl}`;
    try {
      const dataUrl = (await page.evaluate(
        ([u, w, h]: [string, number, number]) =>
          (window as unknown as { __renderModel: (u: string, w: number, h: number) => Promise<string> }).__renderModel(
            u,
            w,
            h
          ),
        [fullUrl, size[0], size[1]] as [string, number, number]
      )) as string;
      await writePng(dataUrl, outPath);
      console.log(`  ok: ${key} -> ${path.relative(ROOT, outPath)}`);
      ok++;
    } catch (err) {
      console.error(`  FAILED: ${key} (${glbUrl}):`, err);
      failed++;
    }
  }

  console.log("Rendering room furniture thumbnails...");
  const furnitureModels: Record<string, { url: string }> = {
    ...FURNITURE_LARGE_MODEL,
    ...FURNITURE_SMALL_MODEL,
    ...WALL_DECOR_MODEL,
  };
  for (const [key, { url }] of Object.entries(furnitureModels)) {
    await render(key, url, path.join(OUT_FURNITURE, `${key}.png`), FURNITURE_SIZE);
  }

  console.log("Rendering avatar species thumbnails...");
  const speciesRows = await db
    .select({ key: avatarItems.key })
    .from(avatarItems)
    .where(and(eq(avatarItems.slot, "species"), eq(avatarItems.active, true)));
  const activeSpeciesKeys = speciesRows.map((r) => r.key);
  for (const key of activeSpeciesKeys) {
    const url = SPECIES_MODEL_URL[key];
    if (!url) {
      console.warn(`  SKIP: no GLB mapped for species "${key}" in components/three/speciesModels.ts`);
      failed++;
      continue;
    }
    await render(key, url, path.join(OUT_SPECIES, `${key}.png`), SPECIES_SIZE);
  }

  // Wallpaper/floor: no GLB, so these call window.__renderWallpaper /
  // __renderFloor (vanilla-three recipes baked into RENDER_HTML, mirroring
  // RoomScene3D.tsx's WALLPAPERS/FLOORS) instead of __renderModel. Keys come
  // from the DB (same pattern as species above), not a hardcoded list, so a
  // newly-added active wallpaper/floor item with no matching recipe fails
  // loudly here instead of silently falling back to a broken-image tile in
  // the shop.
  async function renderPattern(kind: "wallpaper" | "floor", key: string, outPath: string, size: [number, number]) {
    try {
      const dataUrl = (await page.evaluate(
        ([k, key, w, h]: ["wallpaper" | "floor", string, number, number]) => {
          const win = window as unknown as {
            __renderWallpaper: (key: string, w: number, h: number) => Promise<string>;
            __renderFloor: (key: string, w: number, h: number) => Promise<string>;
          };
          return k === "wallpaper" ? win.__renderWallpaper(key, w, h) : win.__renderFloor(key, w, h);
        },
        [kind, key, size[0], size[1]] as ["wallpaper" | "floor", string, number, number]
      )) as string;
      await writePng(dataUrl, outPath);
      console.log(`  ok: ${key} -> ${path.relative(ROOT, outPath)}`);
      ok++;
    } catch (err) {
      console.error(`  FAILED: ${key} (${kind}):`, err);
      failed++;
    }
  }

  console.log("Rendering wallpaper thumbnails...");
  const wallpaperRows = await db
    .select({ key: avatarItems.key })
    .from(avatarItems)
    .where(and(eq(avatarItems.slot, "wallpaper"), eq(avatarItems.active, true)));
  for (const { key } of wallpaperRows) {
    await renderPattern("wallpaper", key, path.join(OUT_WALLPAPER, `${key}.png`), PATTERN_SIZE);
  }

  console.log("Rendering floor thumbnails...");
  const floorRows = await db
    .select({ key: avatarItems.key })
    .from(avatarItems)
    .where(and(eq(avatarItems.slot, "floor"), eq(avatarItems.active, true)));
  for (const { key } of floorRows) {
    await renderPattern("floor", key, path.join(OUT_FLOOR, `${key}.png`), PATTERN_SIZE);
  }

  await browser.close();
  await close();

  console.log(`\nDone: ${ok} rendered, ${failed} failed.`);
  if (failed > 0) process.exitCode = 1;
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$client.end();
  });
