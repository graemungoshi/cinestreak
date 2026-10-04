import { describe, expect, it } from "vitest";
import { makeSlug, qidFromSlug } from "../src/lib/slug";
import { isoDuration, runtimeText } from "../src/lib/format";

describe("slugs", () => {
  it("builds readable slugs with a Wikidata suffix", () => {
    expect(makeSlug("Inception", 2010, "Q25188")).toBe("inception-2010-q25188");
    expect(makeSlug("Christopher Nolan", undefined, "Q25191")).toBe("christopher-nolan-q25191");
  });
  it("extracts the id back out", () => {
    expect(qidFromSlug("inception-2010-q25188")).toBe("Q25188");
    expect(qidFromSlug("inception")).toBeNull();
    expect(qidFromSlug("x-q12abc")).toBeNull();
  });
});

describe("format", () => {
  it("formats runtimes", () => {
    expect(runtimeText(148)).toBe("2h 28m");
    expect(runtimeText(45)).toBe("45m");
    expect(runtimeText(undefined)).toBeUndefined();
    expect(isoDuration(148)).toBe("PT2H28M");
  });
});
