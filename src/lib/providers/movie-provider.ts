// Slice 2: implement with Wikidata (CC0). Interface only for now so the app
// never depends on one movie source.
export interface MovieSummary {
  id: string;
  slug: string;
  title: string;
  year?: number;
}

export interface MovieProvider {
  readonly name: string;
  searchMovies(query: string): Promise<MovieSummary[]>;
  getMovieBySlug(slug: string): Promise<MovieSummary | null>;
}
