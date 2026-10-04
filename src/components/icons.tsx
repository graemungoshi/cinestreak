import type { ReactNode } from "react";

export type IconName = "home" | "movies" | "tv" | "news" | "search";

const PATHS: Record<IconName, ReactNode> = {
  home: <path d="M3 11l9-8 9 8M5 10v10h14V10" />,
  movies: (<><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M7 5v14M17 5v14M3 10h4M3 14h4M17 10h4M17 14h4" /></>),
  tv: (<><rect x="3" y="6" width="18" height="12" rx="2" /><path d="M8 21h8M12 18v3" /></>),
  news: <path d="M4 5h13v14H6a2 2 0 01-2-2zM17 9h3v8a2 2 0 01-2 2M8 9h5M8 13h5" />,
  search: (<><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></>),
};

export function Icon({ name, className = "h-5 w-5" }: { name: IconName; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      {PATHS[name]}
    </svg>
  );
}
