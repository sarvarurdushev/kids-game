"use client";

import Link from "next/link";
import { useTranslation } from "@/components/i18n/LanguageProvider";

/** Tiny client leaf for the avatar page's title + "Open a case"/"Decorate
 * room" links — split out from app/(student)/avatar/page.tsx (a server
 * component fetching avatar data) since useTranslation() requires a "use
 * client" component. */
export function AvatarHeader() {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-between">
      <h1 className="font-display text-2xl font-bold lg:text-4xl">{t("avatar.title")}</h1>
      <div className="flex flex-col items-end gap-0.5">
        <Link href="/cases" className="text-sm font-semibold text-coral underline-offset-2 hover:underline">
          {t("avatar.openCase")}
        </Link>
        <Link href="/room" className="text-sm font-semibold text-teal underline-offset-2 hover:underline">
          {t("home.decorateRoom")}
        </Link>
      </div>
    </div>
  );
}
