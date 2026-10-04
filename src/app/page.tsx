import Link from "next/link";
import { tvCall } from "@/lib/providers";
import { getNews, timeAgo } from "@/lib/news";
import { tryOr } from "@/lib/util";
import { GENRES } from "@/lib/genres";
import { GenreChips, Poster, Rail, RailItem, SeriesCard } from "@/components/ui";
import type { SeriesSummary } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [pool, news] = await Promise.all([
    tryOr(() => tvCall((p) => p.getAiringRecent("GB", 3)), [] as SeriesSummary[]),
    tryOr(() => getNews(4), []),
  ]);
  const shows = pool.data;
  const hero = shows.find((s) => s.overview && s.posterUrl);
  const byGenre = (g: string) => shows.filter((s) => s.genres.includes(g)).slice(0, 14);

  return (
    <>
      {hero && (
        <section
          className="grid items-center gap-6 rounded-2xl p-6 sm:grid-cols-[170px_1fr] sm:p-8"
          style={{ background: "linear-gradient(120deg,#1e1b4b,#3b2a6b 55%,#4c3a8a)" }}
        >
          <div className="w-[130px] sm:w-full"><Poster url={hero.posterUrl} title={hero.title} /></div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-accent">On air this week</p>
            <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-5xl">{hero.title}</h1>
            <p className="mt-1 text-sm text-zinc-300">{[hero.year, hero.network, hero.genres.slice(0, 2).join(", ")].filter(Boolean).join(" · ")}</p>
            <p className="mt-3 max-w-xl text-zinc-200">{(hero.overview ?? "").slice(0, 220)}{(hero.overview ?? "").length > 220 ? "…" : ""}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href={`/tv/${hero.slug}`} className="rounded-full bg-accent px-5 py-2 font-semibold text-zinc-950 shadow-[0_0_18px_rgba(123,140,255,.4)]">Seasons and episodes</Link>
              <Link href="/search" className="rounded-full border border-white/40 px-5 py-2 font-semibold">Search</Link>
            </div>
          </div>
        </section>
      )}
      {!hero && (
        <section className="rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-800 p-6 sm:p-10">
          <h1 className="text-3xl font-black tracking-tight sm:text-5xl">What should you watch tonight?</h1>
          <p className="mt-3 max-w-xl text-zinc-300">Search any film, TV show or person.</p>
          {pool.failed && <p className="mt-3 text-sm text-zinc-400">Some information may be temporarily unavailable.</p>}
        </section>
      )}

      {shows.length > 0 && (
        <>
          <Rail title="On air this week" href="/tv">
            {shows.slice(0, 14).map((s) => <RailItem key={s.id}><SeriesCard s={s} /></RailItem>)}
          </Rail>
          {["Drama", "Comedy"].map((g) => byGenre(g).length > 3 && (
            <Rail key={g} title={g === "Drama" ? "Dramas" : "Comedies"} href={`/tv?genre=${g}`}>
              {byGenre(g).map((s) => <RailItem key={s.id}><SeriesCard s={s} /></RailItem>)}
            </Rail>
          ))}
        </>
      )}

      <section className="mt-10">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-xl font-bold">Browse films by genre</h2>
          <Link href="/movies" className="text-sm font-semibold text-accent hover:underline">See all</Link>
        </div>
        <GenreChips base="/movies" items={GENRES.map((g) => ({ label: g.label, value: g.slug }))} />
      </section>

      {news.data.length > 0 && (
        <section className="mt-10">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-xl font-bold">Latest film and TV news</h2>
            <Link href="/news" className="text-sm font-semibold text-accent hover:underline">All news</Link>
          </div>
          <ul className="divide-y divide-white/10">
            {news.data.map((n) => (
              <li key={n.url}>
                <a href={n.url} target="_blank" rel="noopener nofollow" className="block py-3 hover:text-accent">
                  <span className="mr-2 rounded-full bg-white/10 px-2 py-0.5 text-xs">{n.source}</span>
                  <span className="font-semibold">{n.title}</span>
                  <span className="ml-2 text-xs text-zinc-500">{timeAgo(n.date)}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
