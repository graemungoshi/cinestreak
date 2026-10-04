import { cached } from "../cache";
import type { Episode, SeriesSummary, TVSeries } from "../types";
import { slugify, stripHtml } from "../util";
import type { TVProvider } from "./tv-provider";

const BASE = "https://api.tvmaze.com";

type RawImage = { medium?: string; original?: string } | null;
type RawShow = {
  id: number;
  name: string;
  premiered?: string | null;
  ended?: string | null;
  status?: string;
  runtime?: number | null;
  averageRuntime?: number | null;
  language?: string | null;
  genres?: string[];
  weight?: number;
  rating?: { average?: number | null };
  network?: { name: string } | null;
  webChannel?: { name: string } | null;
  image?: RawImage;
  summary?: string | null;
  externals?: { imdb?: string | null };
  url?: string;
};
type RawEpisode = {
  id: number;
  name: string;
  season: number;
  number: number | null;
  airdate?: string;
  runtime?: number | null;
  rating?: { average?: number | null };
  image?: RawImage;
  summary?: string | null;
};

class NotFound extends Error {}
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const https = (u?: string) => u?.replace(/^http:\/\//, "https://");

async function get<T>(path: string, ttlSec: number): Promise<T> {
  return cached<T>(`tvmaze:${path}`, ttlSec, async () => {
    for (let attempt = 0; attempt < 3; attempt++) {
      const res = await fetch(BASE + path, { headers: { accept: "application/json" } });
      if (res.status === 429) {
        await sleep(600 * (attempt + 1)); // back off, then retry
        continue;
      }
      if (res.status === 404) throw new NotFound();
      if (!res.ok) throw new Error(`TVMaze ${res.status}`);
      return (await res.json()) as T;
    }
    throw new Error("TVMaze rate limited");
  });
}

function toSummary(s: RawShow): SeriesSummary {
  return {
    id: String(s.id),
    slug: slugify(s.name),
    title: s.name,
    year: s.premiered ? Number(s.premiered.slice(0, 4)) : undefined,
    posterUrl: https(s.image?.medium),
    rating: s.rating?.average ?? undefined,
    network: s.network?.name ?? s.webChannel?.name ?? undefined,
    genres: s.genres ?? [],
  };
}

function toSeries(s: RawShow): TVSeries {
  return {
    ...toSummary(s),
    posterUrl: https(s.image?.original ?? s.image?.medium),
    overview: stripHtml(s.summary),
    status: s.status ?? "Unknown",
    premiered: s.premiered ?? undefined,
    ended: s.ended ?? undefined,
    runtime: s.averageRuntime ?? s.runtime ?? undefined,
    language: s.language ?? undefined,
    imdbId: s.externals?.imdb ?? undefined,
    sourceName: "TVMaze",
    sourceUrl: s.url,
  };
}

export const tvmaze: TVProvider = {
  name: "tvmaze",

  async searchSeries(query) {
    const res = await get<{ show: RawShow }[]>(`/search/shows?q=${encodeURIComponent(query)}`, 300);
    return res.map((r) => toSummary(r.show));
  },

  async getSeriesBySlug(slug) {
    const q = slug.replace(/-/g, " ");
    try {
      const s = await get<RawShow>(`/singlesearch/shows?q=${encodeURIComponent(q)}`, 86400);
      if (slugify(s.name) === slug) return toSeries(s);
    } catch (e) {
      if (!(e instanceof NotFound)) throw e;
    }
    const res = await get<{ show: RawShow }[]>(`/search/shows?q=${encodeURIComponent(q)}`, 86400);
    const hit = res.find((r) => slugify(r.show.name) === slug);
    return hit ? toSeries(hit.show) : null;
  },

  async getEpisodes(seriesId) {
    const eps = await get<RawEpisode[]>(`/shows/${seriesId}/episodes`, 21600);
    return eps
      .filter((e) => e.number !== null)
      .map(
        (e): Episode => ({
          id: String(e.id),
          seriesId,
          season: e.season,
          number: e.number as number,
          title: e.name,
          overview: stripHtml(e.summary),
          airDate: e.airdate || undefined,
          runtime: e.runtime ?? undefined,
          rating: e.rating?.average ?? undefined,
          stillUrl: https(e.image?.medium),
        }),
      );
  },

  async getAiringToday(country) {
    const today = new Date().toISOString().slice(0, 10);
    const items = await get<{ show?: RawShow; _embedded?: { show?: RawShow } }[]>(
      `/schedule?country=${encodeURIComponent(country)}&date=${today}`,
      1800,
    );
    const byId = new Map<number, RawShow>();
    for (const it of items) {
      const show = it.show ?? it._embedded?.show;
      if (show && show.image && !byId.has(show.id)) byId.set(show.id, show);
    }
    return [...byId.values()]
      .sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0))
      .slice(0, 18)
      .map(toSummary);
  },
};
