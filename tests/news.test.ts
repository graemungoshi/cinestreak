import { describe, expect, it } from "vitest";
import { parseRss, timeAgo } from "../src/lib/news";

const XML = `<?xml version="1.0"?><rss><channel>
<item><title><![CDATA[Tom &amp; Jerry get a sequel]]></title><link>https://example.com/a</link><pubDate>Sat, 03 Oct 2026 10:00:00 GMT</pubDate></item>
<item><title>Bad link item</title><link>javascript:alert(1)</link></item>
<item><title>Caf&#233; opening &#x2013; reviewed</title><link>https://example.com/b</link></item>
</channel></rss>`;

describe("parseRss", () => {
  it("parses items, decodes entities and rejects non-http links", () => {
    const items = parseRss(XML, "Test");
    expect(items).toHaveLength(2);
    expect(items[0]).toEqual({ title: "Tom & Jerry get a sequel", url: "https://example.com/a", source: "Test", date: "2026-10-03T10:00:00.000Z" });
    expect(items[1].title).toBe("Café opening – reviewed");
    expect(items[1].date).toBeUndefined();
  });
});

describe("timeAgo", () => {
  it("formats relative times", () => {
    const now = Date.parse("2026-10-04T12:00:00Z");
    expect(timeAgo("2026-10-04T11:30:00Z", now)).toBe("30 min ago");
    expect(timeAgo("2026-10-04T09:00:00Z", now)).toBe("3 hours ago");
    expect(timeAgo("2026-10-02T12:00:00Z", now)).toBe("2 days ago");
    expect(timeAgo(undefined, now)).toBe("");
  });
});
