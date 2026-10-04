import { cached } from "./cache";

export type NewsItem = { title: string; url: string; source: string; date?: string };

// Edit this list to add or remove outlets. Check each outlet's RSS URL and
// terms of use before launch. We show headline, outlet, date and a link only.
export const NEWS_FEEDS: { name: string; url: string }[] = [
  { name: "Variety", url: "https://variety.com/feed/" },
  { name: "Deadline", url: "https://deadline.com/feed/" },
  { name: "The Hollywood Reporter", url: "https://www.hollywoodreporter.com/feed/" },
  { name: "IndieWire", url: "https://www.indiewire.com/feed/" },
  { name: "/Film", url: "https://www.slashfilm.com/feed/" },
];

const UA = "CineStreak/0.1 (https://github.com/graemungoshi/cinestreak)";

const cp = (n: number) => {
  try {
    return String.fromCodePoint(n);
  } catch {
    return "";
  }
};

export function decode(s: string): string {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => cp(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => cp(Number(d)))
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const tag = (block: string, name: string) =>
  new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, "i").exec(block)?.[1];

export function parseRss(xml: string, source: string): NewsItem[] {
  const out: NewsItem[] = [];
  for (const block of xml.match(/<item[\s>][\s\S]*?<\/item>/gi) ?? []) {
    const title = decode(tag(block, "title") ?? "");
    const url = decode(tag(block, "link") ?? "");
    if (!title || !/^https?:\/\//i.test(url)) continue;
    const raw = decode(tag(block, "pubDate") ?? "");
    const d = raw ? new Date(raw) : undefined;
    out.push({ title, url, source, date: d && !Number.isNaN(d.getTime()) ? d.toISOString() : undefined });
  }
  return out;
}

async function fetchFeed(feed: { name: string; url: string }): Promise<NewsItem[]> {
  return cached(`rss:${feed.url}`, 900, async () => {
    const res = await fetch(feed.url, {
      headers: { accept: "application/rss+xml, application/xml, text/xml", "user-agent": UA },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`${feed.name} ${res.status}`);
    return parseRss(await res.text(), feed.name).slice(0, 15);
  });
}

export async function getNews(limit = 40): Promise<NewsItem[]> {
  const settled = await Promise.allSettled(NEWS_FEEDS.map(fetchFeed));
  if (settled.every((r) => r.status === "rejected")) throw new Error("No news feeds available");
  const all = settled.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
  all.sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
  return all.slice(0, limit);
}

export function timeAgo(iso?: string, now = Date.now()): string {
  if (!iso) return "";
  const mins = Math.floor((now - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h} hour${h > 1 ? "s" : ""} ago`;
  const d = Math.floor(h / 24);
  return `${d} day${d > 1 ? "s" : ""} ago`;
}
