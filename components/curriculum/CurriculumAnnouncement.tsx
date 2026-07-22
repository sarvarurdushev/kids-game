"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { playFanfare } from "@/lib/sound";
import { getCurrentCurriculum } from "@/lib/games/curriculum";

function storageKey(studentId: string): string {
  return `gk_curriculum_seen_${studentId}`;
}

// No real external event fires when the seen-key changes (only this
// component ever writes it, right when the student dismisses the banner) —
// useSyncExternalStore is used purely for its SSR-safe snapshot behavior
// (server always renders "not shown," client reconciles after hydration
// with no manual effect/setState dance), mirroring SoundToggle's own
// localStorage read.
function subscribe(): () => void {
  return () => {};
}

/** Announces the current month's curriculum topic once per student per
 * month — tracked client-side (like the sound-mute toggle) rather than a DB
 * column, since "have you seen this month's banner" is cosmetic, not data
 * that needs to follow the student across devices. */
export function CurriculumAnnouncement({ studentId }: { studentId: string }) {
  const topic = getCurrentCurriculum();
  const [dismissed, setDismissed] = useState(false);

  const notYetSeen = useSyncExternalStore(
    subscribe,
    () => window.localStorage.getItem(storageKey(studentId)) !== topic.monthKey,
    () => false
  );

  const open = notYetSeen && !dismissed;

  useEffect(() => {
    if (open) playFanfare();
  }, [open]);

  function dismiss() {
    window.localStorage.setItem(storageKey(studentId), topic.monthKey);
    setDismissed(true);
  }

  return (
    <Modal open={open} onClose={dismiss}>
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="text-6xl">{topic.emoji}</div>
        <h2 className="font-display text-2xl font-bold text-gold-dark">New Month!</h2>
        <p className="text-ink/70">
          This month we&apos;re learning about <span className="font-bold text-ink">{topic.label}</span>! New
          words, new games, and new cards to discover.
        </p>
        <Button onClick={dismiss}>Let&apos;s go!</Button>
      </div>
    </Modal>
  );
}
