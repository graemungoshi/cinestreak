import type { Movie, MovieSummary } from "../types";

export interface MovieProvider {
  readonly name: string;
  searchMovies(query: string): Promise<MovieSummary[]>;
  /** Returns null when the id is not a film. Throws when the source is unreachable. */
  getMovie(id: string): Promise<Movie | null>;
  /** Well-known films in a genre, using the genre label as written on Wikidata. */
  browseByGenre(genreLabel: string): Promise<MovieSummary[]>;
}
