"use client";

// Local-only persistence for the chosen AI Lab age track, mirroring the
// sound-mute-preference pattern in lib/sound.ts (useSyncExternalStore +
// custom event, so a change re-renders every subscriber instead of just
// the component that made it).

import { isAgeTrack, type AgeTrack } from "./curriculum";

const TRACK_KEY = "gk_ai_lab_track";
const TRACK_EVENT = "gk-ai-lab-track-change";

export function getStoredTrack(): AgeTrack {
  if (typeof window === "undefined") return "little_sparks";
  const stored = window.localStorage.getItem(TRACK_KEY) ?? undefined;
  return isAgeTrack(stored) ? stored : "little_sparks";
}

export function setStoredTrack(track: AgeTrack): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TRACK_KEY, track);
  window.dispatchEvent(new CustomEvent(TRACK_EVENT, { detail: track }));
}

export function onTrackChange(listener: (track: AgeTrack) => void): () => void {
  if (typeof window === "undefined") return () => undefined;
  const handler = (e: Event) => listener((e as CustomEvent<AgeTrack>).detail);
  window.addEventListener(TRACK_EVENT, handler);
  return () => window.removeEventListener(TRACK_EVENT, handler);
}
