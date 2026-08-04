"use client";

import { createContext, useContext, useSyncExternalStore, type ReactNode } from "react";
import { getLanguage, setLanguage, onLanguageChange, type Language } from "@/lib/i18n/language";
import { translations, type TranslationKey } from "@/lib/i18n/dictionary";

interface LanguageContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  /** vars values are substituted as literal English/numeric data (a name, a
   * count, the tested word) — never translated themselves, only the
   * surrounding sentence looked up from dictionary.ts is. */
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

/** Wraps app/(student)/layout.tsx with a real student.id (resolved
 * server-side via requireStudent()), and app/(public)/layout.tsx with
 * DEVICE_SCOPE (no student is known yet, pre-login) — either way, every
 * client component underneath can call useTranslation() with no prop
 * drilling. */
export function LanguageProvider({ scopeId, children }: { scopeId: string; children: ReactNode }) {
  const lang = useSyncExternalStore(
    (callback) => onLanguageChange(scopeId, callback),
    () => getLanguage(scopeId),
    () => "en" as const
  );

  function t(key: TranslationKey, vars?: Record<string, string | number>): string {
    let str = translations[lang][key] ?? translations.en[key] ?? key;
    if (vars) {
      for (const [name, value] of Object.entries(vars)) {
        str = str.split(`{${name}}`).join(String(value));
      }
    }
    return str;
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang: (next) => setLanguage(scopeId, next), t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useTranslation must be used within LanguageProvider");
  return ctx;
}
