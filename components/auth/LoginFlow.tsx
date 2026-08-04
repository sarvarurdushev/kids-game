"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AvatarGrid } from "@/components/avatar/AvatarGrid";
import { Avatar3D } from "@/components/three/Avatar3D";
import type { AvatarEquippedKeys } from "@/components/avatar/AvatarCharacter";
import { PinPad } from "@/components/auth/PinPad";
import { Card } from "@/components/ui/Card";
import { useTranslation } from "@/components/i18n/LanguageProvider";

interface FamilyMember {
  id: string;
  displayName: string;
  equippedKeys: AvatarEquippedKeys;
}

export function LoginFlow({ members }: { members: FamilyMember[] }) {
  const router = useRouter();
  const { t } = useTranslation();
  const [selected, setSelected] = useState<FamilyMember | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [lockedMessage, setLockedMessage] = useState<string | null>(null);

  function pickStudent(id: string) {
    const member = members.find((m) => m.id === id) ?? null;
    setSelected(member);
    setError(null);
    setLockedMessage(null);
  }

  async function handlePin(pin: string) {
    if (!selected) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: selected.id, pin }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 423) {
          // Locked: stop taking PIN input entirely rather than letting a
          // locked-out kid keep tapping digits against a dead end.
          setLockedMessage(data.error ?? t("auth.pinLockedError"));
          return;
        }
        setError(data.error ?? t("auth.pinError"));
        return;
      }
      router.push("/home");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  if (!selected) {
    return (
      <div className="w-full max-w-sm">
        <h1 className="font-display mb-6 text-center text-2xl font-bold text-gold-dark">
          {t("auth.whosPlaying")}
        </h1>
        <AvatarGrid
          members={members}
          onSelect={pickStudent}
          onAddAnother={() => router.push("/welcome")}
        />
      </div>
    );
  }

  return (
    <Card className="flex w-full max-w-sm flex-col items-center gap-4">
      <Avatar3D equippedKeys={selected.equippedKeys} size={110} />
      <h1 className="font-display text-xl font-bold">{t("home.greeting", { name: selected.displayName })}</h1>
      {lockedMessage ? (
        <p className="text-center text-sm font-semibold text-coral">{lockedMessage}</p>
      ) : (
        <>
          <p className="text-sm text-ink/60">{t("auth.enterPin")}</p>
          <PinPad onSubmit={handlePin} error={error} disabled={submitting} />
        </>
      )}
      <button
        type="button"
        onClick={() => setSelected(null)}
        className="text-sm font-semibold text-teal underline-offset-2 hover:underline"
      >
        {t("auth.notMe")}
      </button>
    </Card>
  );
}
