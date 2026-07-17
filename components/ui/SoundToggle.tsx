"use client";

import { useSyncExternalStore } from "react";
import { isSoundMuted, onSoundMuteChange, setSoundMuted } from "@/lib/sound";

function subscribe(callback: () => void): () => void {
  return onSoundMuteChange(() => callback());
}

// Server-rendered markup can't know localStorage state, so the server
// snapshot matches the real default (muted) — useSyncExternalStore then
// reconciles to the real client value after hydration with no manual
// effect/setState dance (and no hydration-mismatch flash).
function getServerSnapshot(): boolean {
  return true;
}

export function SoundToggle({ className = "" }: { className?: string }) {
  const muted = useSyncExternalStore(subscribe, isSoundMuted, getServerSnapshot);

  return (
    <button
      type="button"
      onClick={() => setSoundMuted(!muted)}
      aria-label={muted ? "Turn sound on" : "Turn sound off"}
      className={`flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-lg shadow-sm transition-transform active:scale-90 ${className}`}
    >
      {muted ? "🔇" : "🔊"}
    </button>
  );
}
