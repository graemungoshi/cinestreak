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

## Wikidata (in use: films and people)
- **Provides:** film and person facts (dates, runtime, genres, cast and crew links, external IDs), search, filmography (SPARQL).
- **Docs:** https://www.wikidata.org/wiki/Wikidata:Data_access
- **Licence:** CC0 (public domain), no attribution required; we credit it anyway.
- **Limits:** keep request volume low and send a descriptive User-Agent (done). The SPARQL endpoint has query time limits; failures degrade to "temporarily unavailable".
- **Caveat:** coverage and quality vary by film. Many films have no cast or image on Wikidata.

## Wikipedia (in use: summaries and biographies)
- **Provides:** short extracts via the REST summary API.
- **Licence:** CC BY-SA 4.0. Each page shows a "Summary from Wikipedia" credit with a link. ShareAlike may apply to the text.

## Wikimedia Commons (in use: images, where a file exists)
- **Provides:** free-licence images linked from Wikidata (P18). Hotlinked, not copied. Each image links to its Commons file page, which states its licence and author.
- **Caveat:** most modern film posters are not on Commons, so many films show a placeholder.

## News (RSS headlines from film and TV outlets)
- **Outlets:** configured in `src/lib/news.ts` (Variety, Deadline, The Hollywood Reporter, IndieWire, /Film). Verify each feed URL still works.
- **What we show:** headline, outlet name, relative time and a link to the original story. No article text or images.
- **Terms:** each outlet has its own terms for syndication and commercial use. Review them before you add ads or affiliate links, and remove any outlet that objects.
- **X (Twitter):** not used. Its API is paid.

## Planned
- **Streaming availability:** no source selected. UI shows "not available yet". Needs a licensed provider.
- **Ratings/posters for movies:** no commercial-safe free source identified. TMDB is non-commercial on its free tier.

## Not used
- IMDb (datasets are non-commercial; no scraping), TMDB free tier, JustWatch (no public API), scraping of any site.
