import { LanguageProvider } from "@/components/i18n/LanguageProvider";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { DEVICE_SCOPE } from "@/lib/i18n/language";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider scopeId={DEVICE_SCOPE}>
      <div className="relative flex min-h-full flex-1 items-center justify-center overflow-hidden bg-gradient-to-b from-gold/20 via-cream to-cream p-6">
        <div className="pointer-events-none absolute -top-16 -left-16 h-56 w-56 rounded-full bg-teal/15 blur-3xl" />
        <div className="pointer-events-none absolute top-40 -right-20 h-64 w-64 rounded-full bg-coral/15 blur-3xl" />
        <LanguageToggle className="fixed top-4 right-4 z-20" />
        <div className="relative z-10 flex w-full flex-col items-center">{children}</div>
      </div>
    </LanguageProvider>
  );
}
