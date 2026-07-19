"use client";

// Read-aloud for pre-readers, via the browser's built-in SpeechSynthesis —
// nothing is sent to a server. See docs/AI_CURRICULUM.md "Safety" section
// for why this app has no server-side voice/AI integration.

export function isSpeechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function speak(text: string): void {
  if (!isSpeechSupported()) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.9;
  utterance.pitch = 1.1;
  window.speechSynthesis.speak(utterance);
}
