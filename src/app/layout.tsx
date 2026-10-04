import "./globals.css";
import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: "CineStreak — discover what to watch", template: "%s | CineStreak" },
  description: "Find TV shows and episodes, see what is airing today, and decide what to watch next.",
  manifest: "/manifest.webmanifest",
  openGraph: { siteName: "CineStreak", type: "website" },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB">
      <body className="min-h-screen font-sans antialiased">
        <header className="sticky top-0 z-20 border-b border-white/10 bg-zinc-950/90 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
            <Link href="/" className="text-xl font-black tracking-tight">
              CINE<span className="text-accent glow-text">STREAK</span>
            </Link>
            <form action="/search" role="search" className="ml-auto w-full max-w-md">
              <input
                name="q"
                type="search"
                maxLength={100}
                placeholder="Search films, TV, people"
                aria-label="Search films, TV and people"
                className="w-full rounded-full bg-white/10 px-4 py-2 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </form>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
        <footer className="mx-auto max-w-6xl px-4 py-10 text-xs text-zinc-500">
          TV data from{" "}
          <a href="https://www.tvmaze.com" className="underline" rel="noopener">TVMaze</a>{" "}
          (CC BY-SA 4.0). Film and people data from{" "}
          <a href="https://www.wikidata.org" className="underline" rel="noopener">Wikidata</a>{" "}
          (CC0); summaries from{" "}
          <a href="https://www.wikipedia.org" className="underline" rel="noopener">Wikipedia</a>{" "}
          (CC BY-SA); images from Wikimedia Commons. CineStreak is not affiliated with any studio, network or streaming service.
        </footer>
      </body>
    </html>
  );
}
