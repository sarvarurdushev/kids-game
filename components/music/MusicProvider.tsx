"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { setActiveMusicArea, startMusicEngine } from "@/lib/music";

/**
 * Owns the background-music lifecycle for the whole app. Rendered once, high
 * in the tree (app/layout.tsx, outside every route group), so it never
 * remounts on client-side navigation — the underlying engine (lib/music.ts)
 * is a module-level singleton anyway, but keeping this component itself
 * stable means its "first gesture" listener is only ever attached once too.
 *
 * Browsers block audio-with-sound until a user gesture, so music can't
 * literally start the instant the page loads. Instead, the very first
 * pointerdown/keydown anywhere in the app (picking an avatar on the login
 * screen, pressing a PIN digit, tapping a nav icon, ...) starts the loop —
 * whatever that first interaction naturally is. From then on it just keeps
 * playing; only the active *theme* changes as the student navigates.
 */
export function MusicProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    setActiveMusicArea(pathname);
  }, [pathname]);

  useEffect(() => {
    function onFirstGesture() {
      startMusicEngine();
    }
    // Both listeners are needed (mouse/touch taps vs. keyboard navigation),
    // and { once: true } means whichever fires first cleans itself up —
    // startMusicEngine() itself is also idempotent as a second safety net
    // (e.g. against React StrictMode's double effect invocation in dev).
    window.addEventListener("pointerdown", onFirstGesture, { once: true });
    window.addEventListener("keydown", onFirstGesture, { once: true });
    return () => {
      window.removeEventListener("pointerdown", onFirstGesture);
      window.removeEventListener("keydown", onFirstGesture);
    };
  }, []);

  return <>{children}</>;
}
