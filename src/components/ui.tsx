/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { SITE } from "@/lib/site";
import type { SeriesSummary } from "@/lib/types";

export function Poster({ url, title, ratio = "aspect-[2/3]" }: { url?: string; title: string; ratio?: string }) {
  if (url) {
    return <img src={url} alt={`${title} poster`} loading="lazy" className={`${ratio} w-full rounded-lg bg-zinc-800 object-cover`} />;
  }
  return (
    <div className={`${ratio} flex w-full items-end rounded-lg bg-gradient-to-br from-zinc-800 to-zinc-900 p-3 text-sm font-bold`}>
      {title}
    </div>
  );
}

export function SeriesCard({ s }: { s: SeriesSummary }) {
  return (
    <Link href={`/tv/${s.slug}`} className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-lg">
      <Poster url={s.posterUrl} title={s.title} />
      <div className="mt-2 text-sm font-semibold leading-tight group-hover:text-accent">{s.title}</div>
      <div className="text-xs text-zinc-400">
        {[s.year, s.network].filter(Boolean).join(" · ")}
        {s.rating ? ` · ★ ${s.rating.toFixed(1)}` : ""}
      </div>
    </Link>
  );
}

export function Breadcrumbs({ items }: { items: { name: string; href: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4 text-sm text-zinc-400">
      <ol className="flex flex-wrap gap-x-2">
        {items.map((it, i) => (
          <li key={it.href} className="flex gap-2">
            {i > 0 && <span aria-hidden>›</span>}
            {i === items.length - 1 ? (
              <span aria-current="page" className="text-zinc-200">{it.name}</span>
            ) : (
              <Link href={it.href} className="hover:text-accent">{it.name}</Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function breadcrumbLd(items: { name: string; href: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: SITE + it.href,
    })),
  };
}

export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

export function Unavailable() {
  return (
    <div className="mx-auto max-w-xl py-16 text-center">
      <h1 className="text-2xl font-bold">Some information may be temporarily unavailable.</h1>
      <p className="mt-2 text-zinc-400">Please try again in a moment.</p>
      <Link href="/" className="mt-6 inline-block rounded-full bg-accent px-5 py-2 font-semibold text-zinc-950">Back to home</Link>
    </div>
  );
}

export function ResultRow({ href, title, sub }: { href: string; title: string; sub?: string }) {
  return (
    <li>
      <Link href={href} className="block rounded-lg px-3 py-3 hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent">
        <div className="font-semibold">{title}</div>
        {sub && <div className="text-sm text-zinc-400">{sub}</div>}
      </Link>
    </li>
  );
}
