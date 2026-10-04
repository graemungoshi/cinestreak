import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { loadEpisodes, loadSeries } from "@/lib/data";
import { SITE } from "@/lib/site";
import { fmtDate, parseNum } from "@/lib/util";
import { Breadcrumbs, JsonLd, Poster, Unavailable, breadcrumbLd } from "@/components/ui";

type P = { params: Promise<{ slug: string; season: string; episode: string }> };
const code = (s: number, e: number) => `S${String(s).padStart(2, "0")}E${String(e).padStart(2, "0")}`;

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { slug, season, episode } = await params;
  const sn = parseNum(season), en = parseNum(episode);
  const { data: s } = await loadSeries(slug);
  if (!s || sn === null || en === null) return { title: "Episode", robots: { index: false } };
  const ep = (await loadEpisodes(s.id)).data.find((e) => e.season === sn && e.number === en);
  if (!ep) return { title: "Episode", robots: { index: false } };
  return {
    title: `${s.title} ${code(sn, en)}: ${ep.title}`,
    description: ep.overview.slice(0, 155) || `${s.title} season ${sn}, episode ${en}: ${ep.title}.`,
    alternates: { canonical: `/tv/${s.slug}/season/${sn}/episode/${en}` },
  };
}

export default async function EpisodePage({ params }: P) {
  const { slug, season, episode } = await params;
  const sn = parseNum(season), en = parseNum(episode);
  if (sn === null || en === null) notFound();
  const sr = await loadSeries(slug);
  if (sr.failed) return <Unavailable />;
  const s = sr.data;
  if (!s) notFound();
  const er = await loadEpisodes(s.id);
  if (er.failed) return <Unavailable />;
  const list = [...er.data].sort((a, b) => a.season - b.season || a.number - b.number);
  const i = list.findIndex((e) => e.season === sn && e.number === en);
  if (i < 0) notFound();
  const ep = list[i], prev = list[i - 1], next = list[i + 1];
  const href = (e: { season: number; number: number }) => `/tv/${s.slug}/season/${e.season}/episode/${e.number}`;
  const crumbs = [
    { name: "Home", href: "/" },
    { name: s.title, href: `/tv/${s.slug}` },
    { name: `Season ${sn}`, href: `/tv/${s.slug}/season/${sn}` },
    { name: `Episode ${en}`, href: href(ep) },
  ];
  return (
    <>
      <JsonLd data={breadcrumbLd(crumbs)} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "TVEpisode",
          name: ep.title,
          episodeNumber: en,
          description: ep.overview || undefined,
          datePublished: ep.airDate,
          timeRequired: ep.runtime ? `PT${ep.runtime}M` : undefined,
          image: ep.stillUrl,
          url: SITE + href(ep),
          partOfSeason: { "@type": "TVSeason", seasonNumber: sn },
          partOfSeries: { "@type": "TVSeries", name: s.title, url: `${SITE}/tv/${s.slug}` },
        }}
      />
      <Breadcrumbs items={crumbs} />
      <p className="text-sm text-amber-400">{code(sn, en)}</p>
      <h1 className="text-3xl font-black tracking-tight">{ep.title}</h1>
      <p className="mt-1 text-zinc-400">
        <Link href={`/tv/${s.slug}`} className="underline">{s.title}</Link>
        {[fmtDate(ep.airDate), ep.runtime ? `${ep.runtime} min` : null, ep.rating ? `★ ${ep.rating.toFixed(1)}` : null].filter(Boolean).map((x) => ` · ${x}`).join("")}
      </p>
      {ep.stillUrl && <div className="mt-5 max-w-md"><Poster url={ep.stillUrl} title={ep.title} ratio="aspect-video" /></div>}
      <p className="mt-5 max-w-2xl leading-relaxed text-zinc-300">{ep.overview || "No synopsis is available for this episode yet."}</p>
      <nav aria-label="Episode navigation" className="mt-8 flex justify-between gap-4 text-sm">
        {prev ? <Link href={href(prev)} className="rounded-lg bg-white/5 px-4 py-3 hover:bg-white/10">← {code(prev.season, prev.number)} {prev.title}</Link> : <span />}
        {next ? <Link href={href(next)} className="rounded-lg bg-white/5 px-4 py-3 text-right hover:bg-white/10">{code(next.season, next.number)} {next.title} →</Link> : <span />}
      </nav>
    </>
  );
}
