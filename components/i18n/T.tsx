"use client";

import { useTranslation } from "@/components/i18n/LanguageProvider";
import type { TranslationKey } from "@/lib/i18n/dictionary";

/** Inline translated text for dropping into Server Component pages.
 *
 * The language toggle is entirely client-side (per-student localStorage —
 * see lib/i18n/language.ts), so a Server Component page can't know the
 * current language at render time and can't call useTranslation() itself
 * (it's a hook). Server Components CAN render Client Components though, so
 * <T k="games.title" /> lets a data-fetching page (app/(student)/*\/page.tsx)
 * stay server-rendered while just this text node resolves on the client —
 * no need to extract every translated heading into its own dedicated
 * client wrapper component. */
export function T({ k, vars }: { k: TranslationKey; vars?: Record<string, string | number> }) {
  const { t } = useTranslation();
  return <>{t(k, vars)}</>;
}
