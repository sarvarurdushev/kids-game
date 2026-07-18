"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GameControllerIcon } from "@/components/icons";

const TABS = [
  { href: "/home", label: "Home", emoji: "🏠" },
  { href: "/games", label: "Games", icon: GameControllerIcon },
  { href: "/packs", label: "Packs", emoji: "🎁" },
  { href: "/collection", label: "Collection", emoji: "📚" },
  { href: "/avatar", label: "Cat", emoji: "🐱" },
  { href: "/achievements", label: "Badges", emoji: "🏅" },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-white/95 backdrop-blur">
      <ul className="mx-auto flex max-w-md items-stretch justify-between px-1 py-1">
        {TABS.map((tab) => {
          const active = pathname?.startsWith(tab.href);
          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={tab.href}
                className={`flex flex-col items-center gap-0.5 rounded-xl py-2 text-[11px] font-semibold transition-colors ${
                  active ? "text-gold-dark" : "text-ink/50"
                }`}
              >
                {"icon" in tab ? (
                  <tab.icon size={22} className={active ? "" : "opacity-70"} />
                ) : (
                  <span className="text-2xl">{tab.emoji}</span>
                )}
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
