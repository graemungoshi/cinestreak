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

export type Credit = { id: string; name: string; slug: string };

export type MovieSummary = { id: string; slug: string; title: string; year?: number; description?: string };

export type Movie = MovieSummary & {
  overview: string;
  overviewUrl?: string;
  releaseDate?: string;
  runtime?: number;
  genres: string[];
  countries: string[];
  languages: string[];
  directors: Credit[];
  writers: Credit[];
  composers: Credit[];
  cast: Credit[];
  companies: string[];
  imageUrl?: string;
  imageCreditUrl?: string;
  imdbId?: string;
  wikipediaUrl?: string;
  sourceName: string;
  sourceUrl: string;
};

export type PersonSummary = { id: string; slug: string; name: string; description?: string };

export type Person = PersonSummary & {
  bio: string;
  bioUrl?: string;
  birthDate?: string;
  birthPlace?: string;
  deathDate?: string;
  occupations: string[];
  imageUrl?: string;
  imageCreditUrl?: string;
  imdbId?: string;
  sourceName: string;
  sourceUrl: string;
};
