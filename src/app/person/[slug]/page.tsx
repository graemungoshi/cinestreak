import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { loadFilmography, loadPerson } from "@/lib/data";
import { qidFromSlug } from "@/lib/slug";
import { SITE } from "@/lib/site";
import { fmtDate } from "@/lib/util";
import { Breadcrumbs, JsonLd, Poster, Unavailable, breadcrumbLd } from "@/components/ui";

type P = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { slug } = await params;
  const id = qidFromSlug(slug);
  const { data: p } = id ? await loadPerson(id) : { data: null };
  if (!p) return { title: "Person", robots: { index: false } };
  return {
    title: `${p.name}: biography and filmography`,
    description: (p.bio || p.description || `Films and credits of ${p.name}.`).slice(0, 155),
    alternates: { canonical: `/person/${p.slug}` },
    openGraph: { title: p.name, images: p.imageUrl ? [p.imageUrl] : [] },
  };
}

export default async function PersonPage({ params }: P) {
  const { slug } = await params;
  const id = qidFromSlug(slug);
  if (!id) notFound();
  const [pr, fr] = await Promise.all([loadPerson(id), loadFilmography(id)]);
  if (pr.failed) return <Unavailable />;
  const p = pr.data;
  if (!p) notFound();
  if (slug !== p.slug) permanentRedirect(`/person/${p.slug}`);

  const crumbs = [{ name: "Home", href: "/" }, { name: p.name, href: `/person/${p.slug}` }];
  const born = [fmtDate(p.birthDate), p.birthPlace].filter(Boolean).join(", ");

  return (
    <>
      <JsonLd data={breadcrumbLd(crumbs)} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Person",
          name: p.name,
          description: p.description,
          birthDate: p.birthDate,
          deathDate: p.deathDate,
          jobTitle: p.occupations,
          image: p.imageUrl,
          url: `${SITE}/person/${p.slug}`,
        }}
      />
      <Breadcrumbs items={crumbs} />
      <div className="grid gap-6 sm:grid-cols-[220px_1fr]">
        <div className="max-w-[220px]">
          <Poster url={p.imageUrl} title={p.name} />
          {p.imageCreditUrl && (
            <a href={p.imageCreditUrl} rel="noopener" className="mt-1 block text-xs text-zinc-500 underline">Image: Wikimedia Commons</a>
          )}
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight">{p.name}</h1>
          <p className="mt-1 text-zinc-400">{p.occupations.join(", ") || p.description}</p>
          {born && <p className="mt-2 text-sm text-zinc-300">Born: {born}</p>}
          {p.deathDate && <p className="text-sm text-zinc-300">Died: {fmtDate(p.deathDate)}</p>}
          <p className="mt-4 max-w-2xl leading-relaxed text-zinc-300">{p.bio || "No biography is available yet."}</p>
          {p.bio && p.bioUrl && (
            <p className="mt-1 text-xs text-zinc-500">
              Biography from <a href={p.bioUrl} rel="noopener" className="underline">Wikipedia</a> (CC BY-SA).
            </p>
          )}
          <p className="mt-4 text-xs text-zinc-500">
            <a href={p.sourceUrl} rel="noopener" className="underline">Wikidata</a>
            {p.imdbId && <> · <a href={`https://www.imdb.com/name/${p.imdbId}/`} rel="noopener nofollow" className="underline">IMDb</a></>}
          </p>
        </div>
      </div>

      <h2 className="mb-3 mt-10 text-xl font-bold">Films</h2>
      {fr.data.length > 0 ? (
        <ol className="divide-y divide-white/10">
          {fr.data.map((f) => (
            <li key={f.id}>
              <Link href={`/movie/${f.slug}`} className="flex gap-4 py-3 hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent">
                <span className="w-12 shrink-0 text-zinc-500">{f.year ?? "—"}</span>
                <span className="font-medium">{f.title}</span>
              </Link>
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-zinc-400">{fr.failed ? "Some information may be temporarily unavailable." : "No films are listed for this person yet."}</p>
      )}
    </>
  );
}
