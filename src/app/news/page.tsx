import type { Metadata } from "next";
import Link from "next/link";
import { NEWS_FEEDS, getNews, timeAgo } from "@/lib/news";
import { tryOr } from "@/lib/util";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Film and TV news",
  description: "Headlines from recognised film and TV news outlets, with links to the original stories.",
  alternates: { canonical: "/news" },
};

export default async function NewsPage({ searchParams }: { searchParams: Promise<{ source?: string }> }) {
  const { source } = await searchParams;
  const res = await tryOr(() => getNews(60), []);
  const sources = NEWS_FEEDS.map((f) => f.name);
  const active = sources.find((s) => s === source);
  const list = active ? res.data.filter((n) => n.source === active) : res.data;
  const chip = (on: boolean) =>
    `whitespace-nowrap rounded-full border px-4 py-1.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${on ? "border-accent bg-accent text-zinc-950" : "border-white/15 hover:border-white/40"}`;

  return (
    <>
      <h1 className="mb-1 text-3xl font-black tracking-tight">News</h1>
      <p className="mb-4 text-sm text-zinc-400">Headlines from film and TV outlets. Each story opens on the original site.</p>
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Link href="/news" className={chip(!active)}>All</Link>
        {sources.map((s) => (
          <Link key={s} href={`/news?source=${encodeURIComponent(s)}`} className={chip(active === s)}>{s}</Link>
        ))}
      </div>
      {list.length > 0 ? (
        <ul className="mt-4 divide-y divide-white/10">
          {list.map((n) => (
            <li key={n.url}>
              <a href={n.url} target="_blank" rel="noopener nofollow" className="block py-4 hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent">
                <span className="mr-2 rounded-full bg-white/10 px-2 py-0.5 text-xs">{n.source}</span>
                <span className="text-xs text-zinc-500">{timeAgo(n.date)}</span>
                <div className="mt-1 text-lg font-semibold leading-snug">{n.title}</div>
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-6 text-zinc-400">
          {res.failed ? "Some information may be temporarily unavailable. Please try again in a moment." : "No stories found."}
        </p>
      )}
    </>
  );
}
