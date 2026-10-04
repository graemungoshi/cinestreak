import Link from "next/link";
import { tvCall } from "@/lib/providers";
import { tryOr } from "@/lib/util";
import { SeriesCard } from "@/components/ui";
import type { SeriesSummary } from "@/lib/types";

export const dynamic = "force-dynamic";
export default async function Home() {
  const airing = await tryOr(() => tvCall((p) => p.getAiringToday("GB")), [] as SeriesSummary[]);
  return (
    <>
      <section className="rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-800 p-6 sm:p-10">
        <h1 className="text-3xl font-black tracking-tight sm:text-5xl">What should you watch tonight?</h1>
        <p className="mt-3 max-w-xl text-zinc-300">
          Search any TV show for its seasons, episodes and air dates. Movies, ratings and streaming availability are coming in later releases.
        </p>
        <form action="/search" role="search" className="mt-6 flex max-w-lg gap-2">
          <input name="q" type="search" maxLength={100} placeholder="Try “Severance” or “Slow Horses”" aria-label="Search TV shows" className="flex-1 rounded-full bg-white/10 px-4 py-3 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-400" />
          <button className="rounded-full bg-amber-400 px-5 font-semibold text-zinc-950">Search</button>
        </form>
      </section>

      <h2 className="mb-4 mt-10 text-xl font-bold">Airing today in the UK</h2>
      {airing.data.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
          {airing.data.map((s) => <SeriesCard key={s.id} s={s} />)}
        </div>
      ) : (
        <p className="text-zinc-400">
          {airing.failed ? "Some information may be temporarily unavailable." : "No listings found for today."}{" "}
          <Link href="/search?q=drama" className="text-amber-400 underline">Browse dramas</Link>
        </p>
      )}
    </>
  );
}
