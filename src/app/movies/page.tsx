import type { Metadata } from "next";
import { movieCall } from "@/lib/providers";
import { GENRES } from "@/lib/genres";
import { tryOr } from "@/lib/util";
import { FilmCard, GenreChips } from "@/components/ui";
import type { MovieSummary } from "@/lib/types";

export const metadata: Metadata = {
  title: "Movies by genre",
  description: "Browse well-known films by genre, with cast, crew and details.",
  alternates: { canonical: "/movies" },
};

export default async function MoviesPage({ searchParams }: { searchParams: Promise<{ genre?: string }> }) {
  const { genre } = await searchParams;
  const active = GENRES.find((g) => g.slug === genre) ?? GENRES[0];
  const res = await tryOr(() => movieCall((p) => p.browseByGenre(active.wikidata)), [] as MovieSummary[]);

  return (
    <>
      <h1 className="mb-4 text-3xl font-black tracking-tight">Movies</h1>
      <GenreChips base="/movies" items={GENRES.map((g) => ({ label: g.label, value: g.slug }))} active={active.slug} />
      <h2 className="mb-4 mt-6 text-xl font-bold">{active.label}</h2>
      {res.data.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
          {res.data.map((m) => <FilmCard key={m.id} m={m} />)}
        </div>
      ) : (
        <p className="text-zinc-400">
          {res.failed ? "Some information may be temporarily unavailable. Please try again in a moment." : "No films found for this genre yet."}
        </p>
      )}
      <p className="mt-8 text-xs text-zinc-500">
        Films are the most widely documented titles on Wikidata in each genre. Posters appear only where a freely licensed image exists on Wikimedia Commons.
      </p>
    </>
  );
}
