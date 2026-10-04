import { movieCall, personCall, tvCall } from "./providers";
import type { Episode, Movie, MovieSummary, Person, TVSeries } from "./types";
import { tryOr } from "./util";

export const loadSeries = (slug: string) =>
  tryOr(() => tvCall((p) => p.getSeriesBySlug(slug)), null as TVSeries | null);

export const loadEpisodes = (seriesId: string) =>
  tryOr(() => tvCall((p) => p.getEpisodes(seriesId)), [] as Episode[]);

export const loadMovie = (id: string) => tryOr(() => movieCall((p) => p.getMovie(id)), null as Movie | null);

export const loadPerson = (id: string) => tryOr(() => personCall((p) => p.getPerson(id)), null as Person | null);

export const loadFilmography = (id: string) =>
  tryOr(() => personCall((p) => p.getFilmography(id)), [] as MovieSummary[]);
