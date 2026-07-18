"use client";

import { useMemo } from "react";
import { CanvasTexture } from "three";

interface TextSpriteProps {
  text: string;
  color?: string;
  width?: number;
  height?: number;
  position?: [number, number, number];
  /** Font height as a fraction of canvas height before shrink-to-fit kicks in. */
  fontSizeRatio?: number;
}

const PX_PER_UNIT = 340;

// Renders text onto an offscreen 2D canvas and maps it onto a plane, instead
// of using @react-three/drei's <Text> (troika-three-text) — that component
// fetches its glyph font over the network on first use, which both fails in
// this sandboxed environment and would be a needless external dependency in
// production for something this simple. A canvas texture uses the browser's
// built-in font rendering, so it works offline and matches system fonts.
//
// The canvas bitmap's aspect ratio always matches the target plane's aspect
// ratio (both derived from width/height), so the texture is never stretched
// non-uniformly onto the plane — a mismatch there is what makes text look
// squashed or tiny regardless of how large the font is drawn.
export function TextSprite({
  text,
  color = "#2d2a26",
  width = 0.75,
  height = 0.375,
  position = [0, 0, 0],
  fontSizeRatio = 0.7,
}: TextSpriteProps) {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(32, Math.round(width * PX_PER_UNIT));
    canvas.height = Math.max(32, Math.round(height * PX_PER_UNIT));
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = color;

      let fontPx = canvas.height * fontSizeRatio;
      const family = 'system-ui, -apple-system, "Noto Color Emoji", sans-serif';
      ctx.font = `bold ${fontPx}px ${family}`;
      const maxWidth = canvas.width * 0.9;
      while (ctx.measureText(text).width > maxWidth && fontPx > 8) {
        fontPx -= 2;
        ctx.font = `bold ${fontPx}px ${family}`;
      }

      ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    }
    const tex = new CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, [text, color, width, height, fontSizeRatio]);

  return (
    <mesh position={position}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={texture} transparent />
    </mesh>
  );
}
