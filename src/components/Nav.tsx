"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "./icons";

const ITEMS: { href: string; label: string; icon: IconName; match: (p: string) => boolean }[] = [
  { href: "/", label: "Home", icon: "home", match: (p) => p === "/" },
  { href: "/movies", label: "Movies", icon: "movies", match: (p) => p.startsWith("/movies") || p.startsWith("/movie/") || p.startsWith("/person") },
  { href: "/tv", label: "TV shows", icon: "tv", match: (p) => p.startsWith("/tv") },
  { href: "/news", label: "News", icon: "news", match: (p) => p.startsWith("/news") },
  { href: "/search", label: "Search", icon: "search", match: (p) => p.startsWith("/search") },
];

export function Nav() {
  const path = usePathname();
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-30 flex border-t border-white/10 bg-zinc-950 pb-[env(safe-area-inset-bottom)] sm:static sm:mx-auto sm:max-w-6xl sm:justify-start sm:gap-1 sm:border-0 sm:bg-transparent sm:px-3 sm:pb-0"
    >
      {ITEMS.map((it) => {
        const on = it.match(path);
        return (
          <Link
            key={it.href}
            href={it.href}
            aria-current={on ? "page" : undefined}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:flex-none sm:flex-row sm:gap-2 sm:border-b-2 sm:px-4 sm:py-3 sm:text-sm sm:font-semibold ${
              on ? "glow-icon font-bold text-accent sm:border-accent" : "text-zinc-400 hover:text-zinc-200 sm:border-transparent"
            }`}
          >
            <Icon name={it.icon} />
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
