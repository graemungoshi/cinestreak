import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { loadEpisodes, loadSeries } from "@/lib/data";
import { SITE } from "@/lib/site";
import { deriveSeasons, fmtDate } from "@/lib/util";
import { Breadcrumbs, JsonLd, Poster, Unavailable, breadcrumbLd } from "@/components/ui";

type P = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { slug } = await params;
  const { data: s } = await loadSeries(slug);
  if (!s) return { title: "TV show", robots: { index: false } };
  return {
    title: `${s.title}${s.year ? ` (${s.year})` : ""}: seasons and episodes`,
    description: s.overview.slice(0, 155) || `Seasons and episodes of ${s.title}.`,
    alternates: { canonical: `/tv/${s.slug}` },
    openGraph: { title: s.title, images: s.posterUrl ? [s.posterUrl] : [] },
  };
}

export default async function SeriesPage({ params }: P) {
  const { slug } = await params;
  const sr = await loadSeries(slug);
  if (sr.failed) return <Unavailable />;
  const s = sr.data;
  if (!s) notFound();
  const eps = await loadEpisodes(s.id);
  const seasons = deriveSeasons(s.id, eps.data);
  const crumbs = [{ name: "Home", href: "/" }, { name: s.title, href: `/tv/${s.slug}` }];
  const meta = [s.year, s.status, s.runtime ? `${s.runtime} min` : null, s.network, s.language].filter(Boolean).join(" · ");

  return (
    <>
      <JsonLd data={breadcrumbLd(crumbs)} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "TVSeries",
          name: s.title,
          description: s.overview || undefined,
          startDate: s.premiered,
          endDate: s.ended,
          genre: s.genres,
          image: s.posterUrl,
          numberOfSeasons: seasons.length || undefined,
          url: `${SITE}/tv/${s.slug}`,
        }}
      />
      <Breadcrumbs items={crumbs} />
      <div className="grid gap-6 sm:grid-cols-[220px_1fr]">
        <div className="max-w-[220px]"><Poster url={s.posterUrl} title={s.title} /></div>
        <div>
          <h1 className="text-3xl font-black tracking-tight">{s.title}</h1>
          <p className="mt-1 text-zinc-400">{meta}</p>
          {s.rating ? <p className="mt-2 font-semibold text-amber-400">★ {s.rating.toFixed(1)} <span className="text-xs font-normal text-zinc-500">TVMaze rating</span></p> : null}
          <div className="mt-3 flex flex-wrap gap-2">
            {s.genres.map((g) => <span key={g} className="rounded-full bg-white/10 px-3 py-1 text-xs">{g}</span>)}
          </div>
          <p className="mt-4 max-w-2xl leading-relaxed text-zinc-300">{s.overview || "No overview is available yet."}</p>
          <div className="mt-5 rounded-lg border border-white/10 p-4 text-sm text-zinc-400">
            <strong className="text-zinc-200">Where to watch:</strong> streaming availability is not available yet.
          </div>
          <p className="mt-4 text-xs text-zinc-500">
            {s.sourceUrl && <a href={s.sourceUrl} rel="noopener" className="underline">View on {s.sourceName}</a>}
            {s.imdbId && <> · <a href={`https://www.imdb.com/title/${s.imdbId}/`} rel="noopener nofollow" className="underline">IMDb</a></>}
          </p>
        </div>
      </div>

      <h2 className="mb-3 mt-10 text-xl font-bold">Seasons</h2>
      {seasons.length ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {seasons.map((se) => (
            <Link key={se.number} href={`/tv/${s.slug}/season/${se.number}`} className="rounded-lg bg-white/5 p-4 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">
              <div className="font-bold">Season {se.number}</div>
              <div className="text-xs text-zinc-400">{se.episodeCount} episodes{se.airDate ? ` · ${se.airDate.slice(0, 4)}` : ""}</div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-zinc-400">{eps.failed ? "Some information may be temporarily unavailable." : `No episodes listed yet${s.premiered ? ` (premiered ${fmtDate(s.premiered)})` : ""}.`}</p>
      )}
    </>
  );
}
