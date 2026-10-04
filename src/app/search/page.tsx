import type { Metadata } from "next";
import Link from "next/link";
import { tvCall } from "@/lib/providers";
import { tryOr } from "@/lib/util";
import { SeriesCard, Unavailable } from "@/components/ui";
import type { SeriesSummary } from "@/lib/types";

export const metadata: Metadata = { title: "Search", robots: { index: false, follow: true } };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const query = q.trim().slice(0, 100);
  if (!query) {
    return <p className="py-10 text-zinc-400">Type a show name in the search box to get started.</p>;
  }
  const res = await tryOr(() => tvCall((p) => p.searchSeries(query)), [] as SeriesSummary[]);
  if (res.failed) return <Unavailable />;
  return (
    <>
      <h1 className="mb-4 text-xl font-bold">Results for “{query}”</h1>
      {res.data.length ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
          {res.data.map((s) => <SeriesCard key={s.id} s={s} />)}
        </div>
      ) : (
        <div className="py-10 text-zinc-400">
          <p>No TV shows found.</p>
          <p className="mt-2">Try another search, or <Link href="/" className="text-amber-400 underline">see what is airing today</Link>.</p>
        </div>
      )}
    </>
  );
}
