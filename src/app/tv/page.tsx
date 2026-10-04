import type { Metadata } from "next";
import { tvCall } from "@/lib/providers";
import { tryOr } from "@/lib/util";
import { GenreChips, SeriesCard } from "@/components/ui";
import type { SeriesSummary } from "@/lib/types";

export const metadata: Metadata = {
  title: "TV shows on air",
  description: "TV shows airing or streaming this week in the UK, with seasons and episode guides.",
  alternates: { canonical: "/tv" },
};

export default async function TVIndex({ searchParams }: { searchParams: Promise<{ genre?: string }> }) {
  const { genre = "" } = await searchParams;
  const res = await tryOr(() => tvCall((p) => p.getAiringRecent("GB", 3)), [] as SeriesSummary[]);
  const counts = new Map<string, number>();
  for (const s of res.data) for (const g of s.genres) counts.set(g, (counts.get(g) ?? 0) + 1);
  const genres = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 14);
  const active = genres.find(([g]) => g.toLowerCase() === genre.toLowerCase())?.[0];
  const list = active ? res.data.filter((s) => s.genres.includes(active)) : res.data;

  return (
    <>
      <h1 className="mb-1 text-3xl font-black tracking-tight">TV shows</h1>
      <p className="mb-4 text-sm text-zinc-400">Airing or streaming in the UK over the next three days.</p>
      <GenreChips base="/tv" allLabel="All" items={genres.map(([g, n]) => ({ label: g, value: g, count: n }))} active={active} />
      <div className="mt-6">
        {list.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
            {list.map((s) => <SeriesCard key={s.id} s={s} />)}
          </div>
        ) : (
          <p className="text-zinc-400">{res.failed ? "Some information may be temporarily unavailable. Please try again in a moment." : "No shows found."}</p>
        )}
      </div>
    </>
  );
}
