import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { loadMovie } from "@/lib/data";
import { isoDuration, runtimeText } from "@/lib/format";
import { qidFromSlug } from "@/lib/slug";
import { SITE } from "@/lib/site";
import { fmtDate } from "@/lib/util";
import { Breadcrumbs, JsonLd, Poster, Unavailable, breadcrumbLd } from "@/components/ui";
import type { Credit } from "@/lib/types";

type P = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { slug } = await params;
  const id = qidFromSlug(slug);
  const { data: m } = id ? await loadMovie(id) : { data: null };
  if (!m) return { title: "Film", robots: { index: false } };
  return {
    title: `${m.title}${m.year ? ` (${m.year})` : ""}: cast, crew and details`,
    description: (m.overview || m.description || `Cast and details for ${m.title}.`).slice(0, 155),
    alternates: { canonical: `/movie/${m.slug}` },
    openGraph: { title: m.title, images: m.imageUrl ? [m.imageUrl] : [] },
  };
}

function People({ label, list }: { label: string; list: Credit[] }) {
  if (!list.length) return null;
  return (
    <p className="mt-3 text-sm">
      <span className="text-zinc-500">{label}: </span>
      {list.map((c, i) => (
        <span key={c.id}>
          {i > 0 && ", "}
          <Link href={`/person/${c.slug}`} className="hover:text-accent">{c.name}</Link>
        </span>
      ))}
    </p>
  );
}

export default async function MoviePage({ params }: P) {
  const { slug } = await params;
  const id = qidFromSlug(slug);
  if (!id) notFound();
  const r = await loadMovie(id);
  if (r.failed) return <Unavailable />;
  const m = r.data;
  if (!m) notFound();
  if (slug !== m.slug) permanentRedirect(`/movie/${m.slug}`);

  const crumbs = [{ name: "Home", href: "/" }, { name: m.title, href: `/movie/${m.slug}` }];
  const meta = [m.year, runtimeText(m.runtime), m.genres.slice(0, 3).join(", ") || null].filter(Boolean).join(" · ");

  return (
    <>
      <JsonLd data={breadcrumbLd(crumbs)} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Movie",
          name: m.title,
          description: m.overview || m.description || undefined,
          datePublished: m.releaseDate,
          duration: isoDuration(m.runtime),
          genre: m.genres,
          image: m.imageUrl,
          url: `${SITE}/movie/${m.slug}`,
          director: m.directors.map((d) => ({ "@type": "Person", name: d.name, url: `${SITE}/person/${d.slug}` })),
          actor: m.cast.map((a) => ({ "@type": "Person", name: a.name, url: `${SITE}/person/${a.slug}` })),
        }}
      />
      <Breadcrumbs items={crumbs} />
      <div className="grid gap-6 sm:grid-cols-[220px_1fr]">
        <div className="max-w-[220px]">
          <Poster url={m.imageUrl} title={m.title} />
          {m.imageCreditUrl && (
            <a href={m.imageCreditUrl} rel="noopener" className="mt-1 block text-xs text-zinc-500 underline">Image: Wikimedia Commons</a>
          )}
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight">{m.title}</h1>
          <p className="mt-1 text-zinc-400">{meta}</p>
          <p className="mt-4 max-w-2xl leading-relaxed text-zinc-300">
            {m.overview || m.description || "No overview is available yet."}
          </p>
          {m.overview && m.overviewUrl && (
            <p className="mt-1 text-xs text-zinc-500">
              Summary from <a href={m.overviewUrl} rel="noopener" className="underline">Wikipedia</a> (CC BY-SA).
            </p>
          )}
          <People label="Directed by" list={m.directors} />
          <People label="Written by" list={m.writers} />
          <People label="Music" list={m.composers} />
          <div className="mt-5 rounded-lg border border-white/10 p-4 text-sm text-zinc-400">
            <strong className="text-zinc-200">Where to watch:</strong> streaming availability is not available yet.
          </div>
          <dl className="mt-5 grid max-w-2xl grid-cols-[110px_1fr] gap-y-1 text-sm">
            {m.releaseDate && (<><dt className="text-zinc-500">Released</dt><dd>{fmtDate(m.releaseDate)}</dd></>)}
            {m.countries.length > 0 && (<><dt className="text-zinc-500">Country</dt><dd>{m.countries.join(", ")}</dd></>)}
            {m.languages.length > 0 && (<><dt className="text-zinc-500">Language</dt><dd>{m.languages.join(", ")}</dd></>)}
            {m.companies.length > 0 && (<><dt className="text-zinc-500">Production</dt><dd>{m.companies.join(", ")}</dd></>)}
          </dl>
          <p className="mt-4 text-xs text-zinc-500">
            <a href={m.sourceUrl} rel="noopener" className="underline">Wikidata</a>
            {m.wikipediaUrl && <> · <a href={m.wikipediaUrl} rel="noopener" className="underline">Wikipedia</a></>}
            {m.imdbId && <> · <a href={`https://www.imdb.com/title/${m.imdbId}/`} rel="noopener nofollow" className="underline">IMDb</a></>}
          </p>
        </div>
      </div>

      {m.cast.length > 0 && (
        <>
          <h2 className="mb-3 mt-10 text-xl font-bold">Cast</h2>
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {m.cast.map((c) => (
              <li key={c.id}>
                <Link href={`/person/${c.slug}`} className="block rounded-lg bg-white/5 px-4 py-3 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent">{c.name}</Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}
