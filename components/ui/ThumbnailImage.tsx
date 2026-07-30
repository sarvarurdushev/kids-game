"use client";

import { useState } from "react";

interface ThumbnailImageProps {
  src: string;
  alt: string;
  className?: string;
}

// Pre-rendered static PNG snapshot of a 3D model (scripts/render-thumbnails.ts)
// used for shop-grid tiles instead of a live <Canvas> per tile — browsers cap
// simultaneous WebGL contexts well below how many items a single grid shows.
// A missing file (item added without re-running the render script, or a typo
// in `key`) falls back to a plain placeholder tile instead of a broken-image
// icon, so a shop grid never looks visibly broken.
export function ThumbnailImage({ src, alt, className = "" }: ThumbnailImageProps) {
  const [errored, setErrored] = useState(false);

  if (errored) {
    return (
      <div className={`flex items-center justify-center bg-ink/5 text-3xl ${className}`} aria-hidden>
        🖼️
      </div>
    );
  }

  return (
    <img src={src} alt={alt} className={`object-contain ${className}`} onError={() => setErrored(true)} />
  );
}
