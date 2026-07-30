/**
 * Pre-renders each room-furniture and avatar-species GLB to a static PNG,
 * used as shop-grid thumbnails instead of a live <Canvas> per tile (browsers
 * cap simultaneous WebGL contexts well below how many items a single grid
 * shows — 11 large-furniture items alone, 30+ species).
 *
 * Technique: spin up a tiny local static file server (serving three.module.js
 * + GLTFLoader from node_modules/three, and the actual .glb files from
 * public/), drive it with Playwright/Chromium (real WebGL via SwiftShader,
 * same headless-three.js-via-Playwright approach used elsewhere in this
 * project's history for offline GLB inspection), load each model in an
 * isolated scene, frame it, and read back a PNG via canvas.toDataURL().
 *
 * Usage: npm run render-thumbnails
 *   (equivalent to: tsx --conditions=react-server scripts/render-thumbnails.ts)
 *
 * Output:
 *   public/thumbnails/furniture/<key>.png  — every key in FURNITURE_LARGE_MODEL,
 *                                             FURNITURE_SMALL_MODEL, WALL_DECOR_MODEL
 *   public/thumbnails/species/<key>.png    — every active avatarItems row with
 *                                             slot = 'species'
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

const FURNITURE_SIZE: [number, number] = [450, 300]; // 3:2, matches the room grid tile's aspect-[3/2]
const SPECIES_SIZE: [number, number] = [320, 320]; // square, matches the avatar grid's square tile

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
renderer.setClearColor(0x000000, 0);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(35, 1, 0.01, 100);

// Same lighting recipe as components/three/Scene3D.tsx (minus the HDR
// environment map, which isn't needed for a one-off isolated-model render).
scene.add(new THREE.AmbientLight(0xffffff, 1.3));
const dir1 = new THREE.DirectionalLight(0xffffff, 2.3);
dir1.position.set(3, 4, 4);
scene.add(dir1);
const dir2 = new THREE.DirectionalLight(0xbcd9ff, 1.0);
dir2.position.set(-3, 1.5, -2);
scene.add(dir2);
const dir3 = new THREE.DirectionalLight(0xffffff, 0.7);
dir3.position.set(-1, 2, -4);
scene.add(dir3);

const loader = new GLTFLoader();
let current = null;

window.__renderModel = function (url, width, height) {
  return new Promise((resolve, reject) => {
    canvas.width = width;
    canvas.height = height;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;

    loader.load(
      url,
      (gltf) => {
        if (current) scene.remove(current);
        current = gltf.scene;
        scene.add(current);

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
