import { tvmaze } from "./tvmaze";
import { wikidata } from "./wikidata";
import type { TVProvider } from "./tv-provider";
import type { MovieProvider } from "./movie-provider";
import type { PersonProvider } from "./people-provider";

// Order = priority. Add another provider to a list and the matching *Call
// helper falls back to it whenever the first one throws.
export const tvProviders: TVProvider[] = [tvmaze];
export const movieProviders: MovieProvider[] = [wikidata];
export const personProviders: PersonProvider[] = [wikidata];

async function firstOk<P, T>(list: P[], fn: (p: P) => Promise<T>): Promise<T> {
  let last: unknown = new Error("No providers configured");
  for (const p of list) {
    try {
      return await fn(p);
    } catch (e) {
      last = e;
    }
  }
  throw last;
}

export const tvCall = <T>(fn: (p: TVProvider) => Promise<T>) => firstOk(tvProviders, fn);
export const movieCall = <T>(fn: (p: MovieProvider) => Promise<T>) => firstOk(movieProviders, fn);
export const personCall = <T>(fn: (p: PersonProvider) => Promise<T>) => firstOk(personProviders, fn);
