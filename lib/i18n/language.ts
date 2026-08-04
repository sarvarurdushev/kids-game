"use client";

// UI-chrome language preference — Korean-speaking kids can switch nav/menus/
// buttons to Korean while every English-learning surface (game vocabulary,
// category-answer labels, curriculum topic names) stays English always; see
// dictionary.ts's file header for the exact chrome-vs-content line.
//
// Scoped per student, not per device (unlike lib/sound.ts / lib/music.ts's
// device-wide mute flags): this is a PIN-login, multi-kid-per-tablet app
// (see components/auth/LoginFlow.tsx), so two siblings sharing a device
// could each want a different language. Same localStorage + CustomEvent
// pattern as sound.ts/music.ts otherwise — see components/curriculum/
// CurriculumAnnouncement.tsx for the existing precedent of a per-student
// localStorage key in this codebase. Pre-login pages use DEVICE_SCOPE
// instead of a real student id — see its own comment below.

export type Language = "en" | "ko";

const LANG_EVENT = "gk-ui-lang-change";

// scopeId is normally a real student.id (per-student preference), but the
// pre-login enroll/PIN screens (app/(public)/*) run before any student is
// resolved — DEVICE_SCOPE is what those pages pass instead, so "which kid
// picked Korean" degrades gracefully to "this device" before login and
// switches to per-student once a student picks their profile. A student's
// first post-login toggle just needs one extra tap; not worth the
// complexity of migrating the device-scoped choice onto their profile.
export const DEVICE_SCOPE = "__device__";

function storageKey(scopeId: string): string {
  return `gk_ui_lang_${scopeId}`;
}

export function getLanguage(scopeId: string): Language {
  if (typeof window === "undefined") return "en";
  return window.localStorage.getItem(storageKey(scopeId)) === "ko" ? "ko" : "en";
}

export function setLanguage(scopeId: string, lang: Language): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(storageKey(scopeId), lang);
  window.dispatchEvent(new CustomEvent(LANG_EVENT, { detail: { scopeId, lang } }));
}

/** Only fires the listener for the given scopeId — a language change for one
 * sibling's session shouldn't affect another tab logged in as a different
 * kid on the same device. */
export function onLanguageChange(scopeId: string, listener: (lang: Language) => void): () => void {
  if (typeof window === "undefined") return () => undefined;
  const handler = (e: Event) => {
    const detail = (e as CustomEvent<{ scopeId: string; lang: Language }>).detail;
    if (detail.scopeId === scopeId) listener(detail.lang);
  };
  window.addEventListener(LANG_EVENT, handler);
  return () => window.removeEventListener(LANG_EVENT, handler);
}
