import { tvmaze } from "./tvmaze";
import type { TVProvider } from "./tv-provider";

// Order = priority. Add a second provider here and `tvCall` falls back to it
// whenever the first one throws.
export const tvProviders: TVProvider[] = [tvmaze];

export async function tvCall<T>(fn: (p: TVProvider) => Promise<T>): Promise<T> {
  let last: unknown = new Error("No TV providers configured");
  for (const p of tvProviders) {
    try {
      return await fn(p);
    } catch (e) {
      last = e;
    }
  }
  throw last;
}
