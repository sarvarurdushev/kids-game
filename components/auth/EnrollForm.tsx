"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Sparx } from "@/components/mascot/Sparx";
import { useTranslation } from "@/components/i18n/LanguageProvider";

export function EnrollForm() {
  const router = useRouter();
  const { t } = useTranslation();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });
      if (!res.ok) {
        // The server's own error message stays English (it's admin/teacher-
        // facing copy for a wrong-code scenario, not part of the kid-facing
        // chrome this toggle covers) — only the client-side fallback below
        // is translated.
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? t("auth.enrollError"));
        return;
      }
      router.push("/login");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <div className="mb-2 flex justify-center">
        <Sparx expression={error ? "sleepy" : "idle"} size={100} />
      </div>
      <h1 className="font-display mb-1 text-center text-2xl font-bold text-gold-dark">
        {t("auth.welcomeTitle")}
      </h1>
      <p className="mb-6 text-center text-sm text-ink/60">{t("auth.enrollHint")}</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={t("auth.enrollCodePlaceholder")}
          autoCapitalize="none"
          autoCorrect="off"
          className="rounded-2xl border-2 border-ink/10 bg-white px-4 py-3 text-center text-lg font-semibold tracking-widest focus:border-gold focus:outline-none"
        />
        {error && <p className="text-center text-sm font-semibold text-coral">{error}</p>}
        <Button type="submit" disabled={submitting || code.trim().length === 0}>
          {submitting ? t("auth.checking") : t("auth.enrollButton")}
        </Button>
      </form>
    </Card>
  );
}
