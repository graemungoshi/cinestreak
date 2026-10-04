# Data sources

Rule: a source is only used in production if its terms permit it. "Free" does not mean "free for commercial use". Re-check each source's current terms before launch.

## TVMaze (in use: TV shows, seasons, episodes, schedule)
- **Provides:** show, episode and schedule metadata, images (poster/still URLs), ratings.
- **Docs:** https://www.tvmaze.com/api
- **Rate limit:** at least 20 calls per 10 seconds per IP (HTTP 429 when exceeded). The provider caches, de-duplicates and backs off.
- **Licence:** data under CC BY-SA 4.0; attribution required. The footer credits TVMaze and each show page links back to its TVMaze page.
- **Commercial use:** a TVMaze forum reply says commercial use is fine with credit. Other third-party pages say commercial use needs a licence. **Get written confirmation from TVMaze before monetising.** Note that ShareAlike may apply to derived data you republish.
- **Caching:** short-lived in-memory caching only for now. Confirm before storing data in your own database (slice 2).
- **Images:** hotlinked from TVMaze, not downloaded or re-hosted.

## Planned
- **Wikidata** (CC0): movies and people metadata, slice 2.
- **Streaming availability:** no source selected. UI shows "not available yet". Needs a licensed provider.
- **Ratings/posters for movies:** no commercial-safe free source identified. TMDB is non-commercial on its free tier.

## Not used
- IMDb (datasets are non-commercial; no scraping), TMDB free tier, JustWatch (no public API), scraping of any site.
