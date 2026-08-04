"use client";

import Link from "next/link";
import { useTranslation } from "@/components/i18n/LanguageProvider";

/** Tiny client leaf for the room page's title + "Edit avatar" link — split out
 * from app/(student)/room/page.tsx (a server component fetching room data)
 * since useTranslation() requires a "use client" component. */
export function RoomHeader() {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-between">
      <h1 className="font-display text-2xl font-bold lg:text-4xl">{t("room.title")}</h1>
      <Link href="/avatar" className="text-sm font-semibold text-teal underline-offset-2 hover:underline">
        {t("room.editAvatar")}
      </Link>
    </div>
  );
}
