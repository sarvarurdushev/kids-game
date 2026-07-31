"use client";

import { useSyncExternalStore } from "react";
import { isMusicMuted, onMusicMuteChange, setMusicMuted } from "@/lib/music";

function subscribe(callback: () => void): () => void {
  return onMusicMuteChange(() => callback());
}

// Same rationale as SoundToggle: the server can't know localStorage state,
// so the server snapshot has to match the real default. Music's default is
// the opposite of sound effects' — ON — so unlike SoundToggle's
// getServerSnapshot, this one returns false (not muted).
function getServerSnapshot(): boolean {
  return false;
}

/** Independent mute control for background music, styled and positioned to
 * match SoundToggle (the existing SFX mute button) rather than inventing a
 * new settings surface — the two are meant to sit side by side. Kept as a
 * separate toggle (not merged into one button) because they default
 * oppositely: sound effects start muted, music starts on. */
export function MusicToggle({ className = "" }: { className?: string }) {
  const muted = useSyncExternalStore(subscribe, isMusicMuted, getServerSnapshot);

  return (
    <button
      type="button"
      onClick={() => setMusicMuted(!muted)}
      aria-label={muted ? "Turn music on" : "Turn music off"}
      className={`flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-lg shadow-sm transition-transform active:scale-90 ${className}`}
    >
      {muted ? "🔕" : "🎶"}
    </button>
  );
}
