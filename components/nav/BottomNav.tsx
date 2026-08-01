"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GameControllerIcon } from "@/components/icons";

const TABS = [
  { href: "/home", label: "Home", emoji: "🏠" },
  { href: "/games", label: "Games", icon: GameControllerIcon },
  { href: "/quests", label: "Quests", emoji: "📋" },
  { href: "/packs", label: "Packs", emoji: "🎁" },
  { href: "/collection", label: "Collection", emoji: "📚" },
  { href: "/avatar", label: "Avatar", emoji: "🐾" },
  { href: "/room", label: "Room", emoji: "🛋️" },
  { href: "/achievements", label: "Badges", emoji: "🏅" },
] as const;

/** `questBadge` is the count of finished-but-unclaimed quests — the standard
 * "there's something waiting for you" dot that makes a daily loop worth
 * opening. Passed down from the layout so it stays a server-side lookup. */
export function BottomNav({ questBadge = 0 }: { questBadge?: number }) {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-white/95 backdrop-blur">
      <ul className="mx-auto flex max-w-md items-stretch justify-between px-1 py-1 sm:max-w-2xl lg:max-w-4xl lg:py-2 xl:max-w-5xl">
        {TABS.map((tab) => {
          const active = pathname?.startsWith(tab.href);
          const badge = tab.href === "/quests" ? questBadge : 0;
          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={tab.href}
                className={`relative flex flex-col items-center gap-0.5 rounded-xl py-2 text-[11px] font-semibold transition-colors lg:gap-1 lg:text-sm ${
                  active ? "text-gold-dark" : "text-ink/50"
                }`}
              >
                {"icon" in tab ? (
                  <tab.icon size={22} className={`lg:hidden ${active ? "" : "opacity-70"}`} />
                ) : (
                  <span className="text-2xl lg:text-3xl">{tab.emoji}</span>
                )}
                {"icon" in tab && (
                  <tab.icon size={30} className={`hidden lg:block ${active ? "" : "opacity-70"}`} />
                )}
                {tab.label}
                {badge > 0 && (
                  <span className="absolute top-0.5 right-1/2 translate-x-4 rounded-full bg-coral px-1.5 py-0.5 text-[10px] leading-none font-bold text-white shadow">
                    {badge}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
