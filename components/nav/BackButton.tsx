"use client";

import { usePathname, useRouter } from "next/navigation";

// The bottom-nav tabs are the "home base" screens — no back button there.
// Every other route (collection/[universeKey], games/[slug], word-book, etc.)
// gets a consistent way back instead of relying on the browser's own back
// gesture/button, which isn't always visible or obvious on a touch device.
// Must stay in sync with BottomNav's TABS — "/badges" was listed here but the
// Badges tab actually routes to /achievements, so that tab was wrongly showing
// a back button.
const TOP_LEVEL_PATHS = new Set([
  "/home",
  "/games",
  "/quests",
  "/packs",
  "/collection",
  "/avatar",
  "/room",
  "/achievements",
]);

export function BackButton() {
  const pathname = usePathname();
  const router = useRouter();

  if (TOP_LEVEL_PATHS.has(pathname)) return null;

  return (
    <button
      type="button"
      onClick={() => router.back()}
      aria-label="Go back"
      className="fixed top-4 left-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-xl font-bold text-ink shadow-sm transition-transform active:scale-90"
    >
      ←
    </button>
  );
}
