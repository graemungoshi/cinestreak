import { cached } from "../cache";
import { makeSlug } from "../slug";
import type { Credit, MovieSummary, PersonSummary } from "../types";
import type { MovieProvider } from "./movie-provider";
import type { PersonProvider } from "./people-provider";

const UA = "CineStreak/0.1 (https://github.com/graemungoshi/cinestreak)";
const API = "https://www.wikidata.org/w/api.php";
const SPARQL = "https://query.wikidata.org/sparql";

type Claim = { mainsnak?: { datavalue?: { value?: any } }; rank?: string };
type Entity = {
  id?: string;
  missing?: string;
  labels?: Record<string, { value: string }>;
  descriptions?: Record<string, { value: string }>;
  claims?: Record<string, Claim[]>;
  sitelinks?: Record<string, { title: string }>;
};
type Entities = { entities?: Record<string, Entity> };
type SparqlResult = { results?: { bindings?: Record<string, { value: string }>[] } };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function getJson<T>(url: string, ttlSec: number, accept = "application/json", timeoutMs = 15000): Promise<T> {
  return cached<T>(`wd:${url}`, ttlSec, async () => {
    for (let attempt = 0; attempt < 3; attempt++) {
      const res = await fetch(url, { headers: { accept, "user-agent": UA, "api-user-agent": UA }, signal: AbortSignal.timeout(timeoutMs) });
      if (res.status === 429 || res.status >= 500) {
        await sleep(700 * (attempt + 1));
        continue;
      }
      if (!res.ok) throw new Error(`Wikimedia ${res.status}`);
      return (await res.json()) as T;
    }
    throw new Error("Wikimedia unavailable");
  });
}

async function entity(id: string): Promise<Entity | null> {
  const url = `${API}?action=wbgetentities&ids=${id}&props=claims%7Clabels%7Cdescriptions%7Csitelinks&languages=en&sitefilter=enwiki&format=json`;
  const r = await getJson<Entities>(url, 86400);
  const e = r.entities?.[id];
  return e && !e.missing ? e : null;
}

async function labelsFor(list: string[]): Promise<Record<string, string>> {
  const uniq = [...new Set(list)];
  const out: Record<string, string> = {};
  for (let i = 0; i < uniq.length; i += 50) {
    const chunk = uniq.slice(i, i + 50);
    const url = `${API}?action=wbgetentities&ids=${chunk.join("%7C")}&props=labels&languages=en&format=json`;
    const r = await getJson<Entities>(url, 86400);
    for (const [id, e] of Object.entries(r.entities ?? {})) {
      const l = e.labels?.en?.value;
      if (l) out[id] = l;
    }
  }
  return out;
}

async function wikiSummary(title: string): Promise<{ text?: string; url?: string }> {
  try {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g, "_"))}`;
    const r = await getJson<{ type?: string; extract?: string; content_urls?: { desktop?: { page?: string } } }>(url, 86400);
    if (r.type === "disambiguation") return {};
    return { text: r.extract, url: r.content_urls?.desktop?.page };
  } catch {
    return {};
  }
}

const vals = (e: Entity, p: string): any[] =>
  (e.claims?.[p] ?? [])
    .filter((c) => c.rank !== "deprecated")
    .map((c) => c.mainsnak?.datavalue?.value)
    .filter((v) => v !== undefined && v !== null);

const ids = (e: Entity, p: string, max = 99): string[] =>
  vals(e, p)
    .map((v) => v?.id)
    .filter((x): x is string => typeof x === "string")
    .slice(0, max);

const firstString = (e: Entity, p: string): string | undefined => {
  const v = vals(e, p).find((x) => typeof x === "string");
  return v as string | undefined;
};

/** Wikidata time -> "YYYY-MM-DD", "YYYY-MM" or "YYYY" depending on precision. */
export function parseTime(v: any): string | undefined {
  const t = typeof v?.time === "string" ? v.time : undefined;
  const m = t ? /^[+-](\d{4,})-(\d{2})-(\d{2})/.exec(t) : null;
  if (!m) return undefined;
  if (m[2] === "00") return m[1];
  if (m[3] === "00") return `${m[1]}-${m[2]}`;
  return `${m[1]}-${m[2]}-${m[3]}`;
}

export function parseMinutes(v: any): number | undefined {
  const a = Number.parseFloat(v?.amount);
  if (!Number.isFinite(a) || a <= 0) return undefined;
  const unit = String(v?.unit ?? "");
  if (unit.endsWith("/Q11574")) return Math.round(a / 60); // seconds
  if (unit.endsWith("/Q25235")) return Math.round(a * 60); // hours
  return Math.round(a); // minutes (Q7727) or unitless
}

const yearOf = (d?: string) => (d ? Number(d.slice(0, 4)) || undefined : undefined);

const commons = (name: string) => ({
  url: `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(name)}?width=500`,
  page: `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(name.replace(/ /g, "_"))}`,
});

const credits = (list: string[], labels: Record<string, string>): Credit[] =>
  list
    .filter((id) => labels[id])
    .map((id) => ({ id, name: labels[id], slug: makeSlug(labels[id], undefined, id) }));

const names = (list: string[], labels: Record<string, string>) => list.map((id) => labels[id]).filter(Boolean);

const FILM_DESC = /\b(film|movie)\b/i;
const NOT_FILM = /television|tv series|web series|video game/i;
const PERSON_DESC = /actor|actress|director|filmmaker|producer|screenwriter|writer|cinematographer|composer|comedian|presenter/i;

function isFilm(e: Entity): boolean {
  const d = e.descriptions?.en?.value ?? "";
  return ids(e, "P31").includes("Q11424") || (FILM_DESC.test(d) && !NOT_FILM.test(d));
}

async function searchEntities(query: string) {
  const url = `${API}?action=wbsearchentities&search=${encodeURIComponent(query)}&language=en&uselang=en&type=item&limit=50&format=json`;
  const r = await getJson<{ search?: { id: string; label?: string; description?: string }[] }>(url, 300);
  return r.search ?? [];
}

export const wikidata: MovieProvider & PersonProvider = {
  name: "wikidata",

  async searchMovies(query) {
    const hits = await searchEntities(query);
    return hits
      .filter((h) => h.label && h.description && FILM_DESC.test(h.description) && !NOT_FILM.test(h.description))
      .map((h): MovieSummary => {
        const year = Number(/\b(1[89]\d{2}|20\d{2})\b/.exec(h.description ?? "")?.[1]) || undefined;
        return { id: h.id, slug: makeSlug(h.label as string, year, h.id), title: h.label as string, year, description: h.description };
      });
  },

  async searchPeople(query) {
    const hits = await searchEntities(query);
    return hits
      .filter((h) => h.label && h.description && PERSON_DESC.test(h.description))
      .map((h): PersonSummary => ({ id: h.id, slug: makeSlug(h.label as string, undefined, h.id), name: h.label as string, description: h.description }));
  },

  async getMovie(id) {
    if (!/^Q\d+$/.test(id)) return null;
    const e = await entity(id);
    const title = e?.labels?.en?.value;
    if (!e || !title || !isFilm(e)) return null;

    const releaseDate = vals(e, "P577").map(parseTime).filter((x): x is string => !!x).sort()[0];
    const year = yearOf(releaseDate);
    const g = ids(e, "P136", 6), d = ids(e, "P57", 4), c = ids(e, "P161", 12), w = ids(e, "P58", 4);
    const m = ids(e, "P86", 2), ct = ids(e, "P495", 3), lg = ids(e, "P364", 2), co = ids(e, "P272", 4);

    const [labels, wiki] = await Promise.all([
      labelsFor([...g, ...d, ...c, ...w, ...m, ...ct, ...lg, ...co]),
      e.sitelinks?.enwiki ? wikiSummary(e.sitelinks.enwiki.title) : Promise.resolve({} as { text?: string; url?: string }),
    ]);
    const file = firstString(e, "P18");
    const img = file ? commons(file) : undefined;
    const runtime = vals(e, "P2047").map(parseMinutes).find((x) => x);

    return {
      id,
      slug: makeSlug(title, year, id),
      title,
      year,
      description: e.descriptions?.en?.value,
      overview: wiki.text ?? "",
      overviewUrl: wiki.url,
      releaseDate,
      runtime,
      genres: names(g, labels),
      countries: names(ct, labels),
      languages: names(lg, labels),
      directors: credits(d, labels),
      writers: credits(w, labels),
      composers: credits(m, labels),
      cast: credits(c, labels),
      companies: names(co, labels),
      imageUrl: img?.url,
      imageCreditUrl: img?.page,
      imdbId: firstString(e, "P345")?.startsWith("tt") ? firstString(e, "P345") : undefined,
      wikipediaUrl: wiki.url,
      sourceName: "Wikidata",
      sourceUrl: `https://www.wikidata.org/wiki/${id}`,
    };
  },

  async getPerson(id) {
    if (!/^Q\d+$/.test(id)) return null;
    const e = await entity(id);
    const name = e?.labels?.en?.value;
    if (!e || !name || !ids(e, "P31").includes("Q5")) return null;

    const place = ids(e, "P19", 1), occ = ids(e, "P106", 6);
    const [labels, wiki] = await Promise.all([
      labelsFor([...place, ...occ]),
      e.sitelinks?.enwiki ? wikiSummary(e.sitelinks.enwiki.title) : Promise.resolve({} as { text?: string; url?: string }),
    ]);
    const file = firstString(e, "P18");
    const img = file ? commons(file) : undefined;
    const imdb = firstString(e, "P345");

    return {
      id,
      slug: makeSlug(name, undefined, id),
      name,
      description: e.descriptions?.en?.value,
      bio: wiki.text ?? "",
      bioUrl: wiki.url,
      birthDate: vals(e, "P569").map(parseTime).find(Boolean),
      birthPlace: labels[place[0]],
      deathDate: vals(e, "P570").map(parseTime).find(Boolean),
      occupations: names(occ, labels),
      imageUrl: img?.url,
      imageCreditUrl: img?.page,
      imdbId: imdb?.startsWith("nm") ? imdb : undefined,
      sourceName: "Wikidata",
      sourceUrl: `https://www.wikidata.org/wiki/${id}`,
    };
  },

  async browseByGenre(genreLabel) {
    if (!/^[a-z ]{3,40}$/.test(genreLabel)) return [];
    const q = `SELECT ?film ?filmLabel (MIN(?d) AS ?date) (SAMPLE(?img) AS ?image) ?sl WHERE { ?g rdfs:label "${genreLabel}"@en . ?film wdt:P136 ?g ; wdt:P31 wd:Q11424 ; wikibase:sitelinks ?sl . OPTIONAL { ?film wdt:P577 ?d } OPTIONAL { ?film wdt:P18 ?img } SERVICE wikibase:label { bd:serviceParam wikibase:language "en". } } GROUP BY ?film ?filmLabel ?sl ORDER BY DESC(?sl) LIMIT 48`;
    const r = await getJson<SparqlResult>(`${SPARQL}?format=json&query=${encodeURIComponent(q)}`, 86400, "application/sparql-results+json", 25000);
    const seen = new Set<string>();
    const out: MovieSummary[] = [];
    for (const b of r.results?.bindings ?? []) {
      const fid = b.film?.value.split("/").pop();
      const title = b.filmLabel?.value;
      if (!fid || !/^Q\d+$/.test(fid) || !title || /^Q\d+$/.test(title) || seen.has(fid)) continue;
      seen.add(fid);
      const year = b.date ? Number(b.date.value.slice(0, 4)) || undefined : undefined;
      const img = b.image?.value ? `${b.image.value.replace(/^http:/, "https:")}?width=300` : undefined;
      out.push({ id: fid, slug: makeSlug(title, year, fid), title, year, posterUrl: img });
    }
    return out;
  },

  async getFilmography(id) {
    if (!/^Q\d+$/.test(id)) return [];
    const q = `SELECT ?film ?filmLabel (MIN(?d) AS ?date) WHERE { { ?film wdt:P161 wd:${id} } UNION { ?film wdt:P57 wd:${id} } ?film wdt:P31/wdt:P279* wd:Q11424 . OPTIONAL { ?film wdt:P577 ?d } SERVICE wikibase:label { bd:serviceParam wikibase:language "en". } } GROUP BY ?film ?filmLabel ORDER BY DESC(?date) LIMIT 80`;
    const r = await getJson<SparqlResult>(`${SPARQL}?format=json&query=${encodeURIComponent(q)}`, 86400, "application/sparql-results+json");
    const seen = new Set<string>();
    const out: MovieSummary[] = [];
    for (const b of r.results?.bindings ?? []) {
      const fid = b.film?.value.split("/").pop();
      const title = b.filmLabel?.value;
      if (!fid || !/^Q\d+$/.test(fid) || !title || /^Q\d+$/.test(title) || seen.has(fid)) continue;
      seen.add(fid);
      const year = b.date ? Number(b.date.value.slice(0, 4)) || undefined : undefined;
      out.push({ id: fid, slug: makeSlug(title, year, fid), title, year });
    }
    return out;
  },
};
