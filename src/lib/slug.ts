import { slugify } from "./util";

/** "inception-2010-q25188". Slice 2b replaces the Q-suffix with a database slug table. */
export function makeSlug(title: string, year: number | undefined, id: string): string {
  const num = id.replace(/^Q/i, "");
  return [slugify(title) || "title", year, `q${num}`].filter(Boolean).join("-");
}

export function qidFromSlug(slug: string): string | null {
  const m = /-q(\d{1,12})$/.exec(slug);
  return m ? `Q${m[1]}` : null;
}
