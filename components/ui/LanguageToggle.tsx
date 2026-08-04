"use client";

import { useTranslation } from "@/components/i18n/LanguageProvider";

/** Sits alongside SoundToggle/MusicToggle in the top-right corner group.
 * Unlike those two, this isn't a mute switch — it's a two-way pick, so it
 * shows the language you'd switch TO (tapping "한" while in English shows
 * Korean text going forward, tapping "EN" while in Korean switches back). */
export function LanguageToggle({ className = "" }: { className?: string }) {
  const { lang, setLang } = useTranslation();
  const next = lang === "en" ? "ko" : "en";

  return (
    <button
      type="button"
      onClick={() => setLang(next)}
      aria-label={lang === "en" ? "Switch to Korean" : "Switch to English"}
      className={`flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-sm font-bold shadow-sm transition-transform active:scale-90 ${className}`}
    >
      {next === "ko" ? "한" : "EN"}
    </button>
  );
}
