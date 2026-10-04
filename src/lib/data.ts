import { tvCall } from "./providers";
import type { Episode, TVSeries } from "./types";
import { tryOr } from "./util";

export const loadSeries = (slug: string) =>
  tryOr(() => tvCall((p) => p.getSeriesBySlug(slug)), null as TVSeries | null);

export const loadEpisodes = (seriesId: string) =>
  tryOr(() => tvCall((p) => p.getEpisodes(seriesId)), [] as Episode[]);
