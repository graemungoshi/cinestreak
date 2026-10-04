import type { Metadata } from "next";
import Link from "next/link";
import { movieCall, personCall, tvCall } from "@/lib/providers";
import { tryOr } from "@/lib/util";
import { ResultRow, SeriesCard, Unavailable } from "@/components/ui";
import type { MovieSummary, PersonSummary, SeriesSummary } from "@/lib/types";

export const metadata: Metadata = { title: "Search", robots: { index: false, follow: true } };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const query = q.trim().slice(0, 100);
  if (!query) {
    return <p className="py-10 text-zinc-400">Type a film, show or person in the search box to get started.</p>;
  }
  const [mv, tv, pp] = await Promise.all([
    tryOr(() => movieCall((p) => p.searchMovies(query)), [] as MovieSummary[]),
    tryOr(() => tvCall((p) => p.searchSeries(query)), [] as SeriesSummary[]),
    tryOr(() => personCall((p) => p.searchPeople(query)), [] as PersonSummary[]),
  ]);
  if (mv.failed && tv.failed && pp.failed) return <Unavailable />;
  const empty = !mv.data.length && !tv.data.length && !pp.data.length;
  const partial = mv.failed || tv.failed || pp.failed;

  return (
    <>
      <h1 className="mb-4 text-xl font-bold">Results for “{query}”</h1>
      {partial && <p className="mb-4 text-sm text-zinc-400">Some information may be temporarily unavailable, so results may be incomplete.</p>}
      {empty && (
        <div className="py-10 text-zinc-400">
          <p>No results found.</p>
          <p className="mt-2">Try another search, or <Link href="/" className="text-accent underline">see what is airing today</Link>.</p>
        </div>
      )}
      {mv.data.length > 0 && (
        <section>
          <h2 className="mb-2 mt-6 text-lg font-bold">Films</h2>
          <ul>{mv.data.slice(0, 10).map((m) => <ResultRow key={m.id} href={`/movie/${m.slug}`} title={`${m.title}${m.year ? ` (${m.year})` : ""}`} sub={m.description} />)}</ul>
        </section>
      )}
      {tv.data.length > 0 && (
        <section>
          <h2 className="mb-3 mt-8 text-lg font-bold">TV shows</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
            {tv.data.slice(0, 12).map((s) => <SeriesCard key={s.id} s={s} />)}
          </div>
        </section>
      )}
      {pp.data.length > 0 && (
        <section>
          <h2 className="mb-2 mt-8 text-lg font-bold">People</h2>
          <ul>{pp.data.slice(0, 10).map((p) => <ResultRow key={p.id} href={`/person/${p.slug}`} title={p.name} sub={p.description} />)}</ul>
        </section>
      )}
    </>
  );
}
