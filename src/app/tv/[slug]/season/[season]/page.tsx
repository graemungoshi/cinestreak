import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { loadEpisodes, loadSeries } from "@/lib/data";
import { fmtDate, parseNum } from "@/lib/util";
import { Breadcrumbs, JsonLd, Unavailable, breadcrumbLd } from "@/components/ui";

type P = { params: Promise<{ slug: string; season: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { slug, season } = await params;
  const { data: s } = await loadSeries(slug);
  if (!s || parseNum(season) === null) return { title: "Season", robots: { index: false } };
  return {
    title: `${s.title} Season ${season}: episode guide`,
    description: `Episode list and air dates for ${s.title} season ${season}.`,
    alternates: { canonical: `/tv/${s.slug}/season/${season}` },
  };
}

export default async function SeasonPage({ params }: P) {
  const { slug, season } = await params;
  const n = parseNum(season);
  if (n === null) notFound();
  const sr = await loadSeries(slug);
  if (sr.failed) return <Unavailable />;
  const s = sr.data;
  if (!s) notFound();
  const er = await loadEpisodes(s.id);
  if (er.failed) return <Unavailable />;
  const eps = er.data.filter((e) => e.season === n).sort((a, b) => a.number - b.number);
  if (!eps.length) notFound();
  const all = [...new Set(er.data.map((e) => e.season))].sort((a, b) => a - b);
  const crumbs = [
    { name: "Home", href: "/" },
    { name: s.title, href: `/tv/${s.slug}` },
    { name: `Season ${n}`, href: `/tv/${s.slug}/season/${n}` },
  ];
  return (
    <>
      <JsonLd data={breadcrumbLd(crumbs)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="text-3xl font-black tracking-tight">{s.title}: Season {n}</h1>
      <p className="mt-1 text-zinc-400">{eps.length} episodes</p>
      <ol className="mt-6 divide-y divide-white/10">
        {eps.map((e) => (
          <li key={e.id}>
            <Link href={`/tv/${s.slug}/season/${n}/episode/${e.number}`} className="flex gap-4 py-3 hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent">
              <span className="w-8 shrink-0 text-right text-zinc-500">{e.number}</span>
              <span className="flex-1 font-medium">{e.title}</span>
              <span className="text-sm text-zinc-500">{fmtDate(e.airDate)}</span>
            </Link>
          </li>
        ))}
      </ol>
      <nav aria-label="Seasons" className="mt-8 flex flex-wrap gap-2">
        {all.map((x) => (
          <Link key={x} href={`/tv/${s.slug}/season/${x}`} aria-current={x === n ? "page" : undefined} className={`rounded-full px-3 py-1 text-sm ${x === n ? "bg-accent text-zinc-950" : "bg-white/10"}`}>S{x}</Link>
        ))}
      </nav>
    </>
  );
}
