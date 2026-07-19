"use client";

import { speak } from "@/lib/speech";

export function SpeakButton({ text, className = "" }: { text: string; className?: string }) {
  return (
    <button
      type="button"
      onClick={() => speak(text)}
      aria-label={`Read aloud: ${text}`}
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/80 text-lg shadow-sm transition-transform active:scale-90 ${className}`}
    >
      🔊
    </button>
  );
}
