import { describe, expect, it } from "vitest";
import { deriveSeasons, parseNum, slugify, stripHtml } from "../src/lib/util";

describe("slugify", () => {
  it("makes clean URL slugs", () => {
    expect(slugify("Breaking Bad")).toBe("breaking-bad");
    expect(slugify("Marvel's Agents of S.H.I.E.L.D.")).toBe("marvel-s-agents-of-s-h-i-e-l-d");
    expect(slugify("Love & Death")).toBe("love-and-death");
    expect(slugify("Élite")).toBe("elite");
  });
});

describe("stripHtml", () => {
  it("removes tags and decodes entities", () => {
    expect(stripHtml("<p>Tom &amp; <b>Jerry</b></p>")).toBe("Tom & Jerry");
    expect(stripHtml(null)).toBe("");
  });
});

describe("parseNum", () => {
  it("accepts only plain non-negative integers", () => {
    expect(parseNum("3")).toBe(3);
    expect(parseNum("3abc")).toBeNull();
    expect(parseNum("-1")).toBeNull();
    expect(parseNum("03")).toBeNull();
  });
});

describe("deriveSeasons", () => {
  it("groups episodes by season", () => {
    const ep = (season: number, number: number, airDate: string) => ({
      id: `${season}-${number}`, seriesId: "1", season, number, title: "t", overview: "", airDate,
    });
    const out = deriveSeasons("1", [ep(1, 1, "2020-01-02"), ep(1, 2, "2020-01-01"), ep(2, 1, "2021-01-01")]);
    expect(out).toEqual([
      { seriesId: "1", number: 1, episodeCount: 2, airDate: "2020-01-01" },
      { seriesId: "1", number: 2, episodeCount: 1, airDate: "2021-01-01" },
    ]);
  });
});
