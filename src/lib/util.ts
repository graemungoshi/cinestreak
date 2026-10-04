import type { Episode, Season } from "./types";

export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function stripHtml(html?: string | null): string {
  return (html ?? "")
    .replace(/<[^>]*>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

export function parseNum(v: string): number | null {
  const n = Number.parseInt(v, 10);
  return Number.isInteger(n) && n >= 0 && String(n) === v ? n : null;
}

export function fmtDate(d?: string): string | undefined {
  if (!d) return undefined;
  const dt = new Date(`${d}T00:00:00Z`);
  if (Number.isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

export function deriveSeasons(seriesId: string, episodes: Episode[]): Season[] {
  const map = new Map<number, Season>();
  for (const e of episodes) {
    const s = map.get(e.season);
    if (!s) {
      map.set(e.season, { seriesId, number: e.season, episodeCount: 1, airDate: e.airDate });
    } else {
      s.episodeCount += 1;
      if (e.airDate && (!s.airDate || e.airDate < s.airDate)) s.airDate = e.airDate;
    }
  }
  return [...map.values()].sort((a, b) => a.number - b.number);
}

/** Run a data call; never throw. Pages use `failed` to show a friendly message. */
export async function tryOr<T>(fn: () => Promise<T>, fallback: T): Promise<{ data: T; failed: boolean }> {
  try {
    return { data: await fn(), failed: false };
  } catch {
    return { data: fallback, failed: true };
  }
}
