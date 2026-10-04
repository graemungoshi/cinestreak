export type SeriesSummary = {
  id: string;
  slug: string;
  title: string;
  year?: number;
  posterUrl?: string;
  rating?: number;
  network?: string;
  genres: string[];
};

export type TVSeries = SeriesSummary & {
  overview: string;
  status: string;
  premiered?: string;
  ended?: string;
  runtime?: number;
  language?: string;
  imdbId?: string;
  sourceName: string;
  sourceUrl?: string;
};

export type Season = { seriesId: string; number: number; episodeCount: number; airDate?: string };

export type Episode = {
  id: string;
  seriesId: string;
  season: number;
  number: number;
  title: string;
  overview: string;
  airDate?: string;
  runtime?: number;
  rating?: number;
  stillUrl?: string;
};
