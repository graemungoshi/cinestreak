import type { Episode, SeriesSummary, TVSeries } from "../types";

export interface TVProvider {
  readonly name: string;
  searchSeries(query: string): Promise<SeriesSummary[]>;
  /** Resolves a canonical slug to a series, or null if not found. */
  getSeriesBySlug(slug: string): Promise<TVSeries | null>;
  getEpisodes(seriesId: string): Promise<Episode[]>;
  getAiringToday(country: string): Promise<SeriesSummary[]>;
}
