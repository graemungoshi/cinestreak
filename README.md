# CineStreak

TV and movie discovery engine. **Slice 1** (this repo): Next.js + TypeScript + Tailwind on Cloudflare Workers, a swappable data-provider layer, and TV pages (home, search, show, season, episode) with SEO basics.

## What works now
- Home with "airing today in the UK", search, show / season / episode pages
- Canonical URLs (`/tv/breaking-bad/season/3/episode/5`), JSON-LD (TVSeries, TVEpisode, BreadcrumbList), robots, sitemap, PWA manifest
- Provider interfaces (`src/lib/providers`), TVMaze provider, caching with request de-duplication, retry/backoff and stale-on-error
- Graceful failure messages instead of blank pages

## Not built yet (honest list)
Movies, people, auth, watchlists, ratings, reviews, AI features, streaming availability, D1 database, KV cache, service worker/offline, PNG app icons, admin, tests beyond utilities. No data source for these has been wired in yet; see `DATA-SOURCES.md`.

## Known limits
- Show URLs are resolved by slugified name (no ID in the URL). Shows sharing a name (e.g. the two "The Office" series) may resolve to the wrong one until slice 2 adds a slug table in D1.
- The cache is per Worker instance until KV is added.

## Local development
```bash
npm install
cp .env.example .env.local
npm run dev        # http://localhost:3000
npm test && npm run typecheck && npm run lint
```

## Deploy to Cloudflare (free)
1. Push this repo to GitHub.
2. Cloudflare dashboard: **Workers & Pages → Create → Import a repository** and pick the repo.
3. Build command: `npx opennextjs-cloudflare build`. Deploy command: `npx wrangler deploy`.
4. Add the variable `NEXT_PUBLIC_SITE_URL` (your live URL) as a **build** variable, then redeploy.
5. Add your custom domain under the Worker's Settings → Domains & Routes.

Or from your machine: `npm run cf:deploy` (after `npx wrangler login`).
Check the current Cloudflare "Next.js on Workers" docs if a step differs; the dashboard changes often.

## Next slices
2: D1 + movies (Wikidata) + people + slug table + KV cache. 3: auth, watchlist, ratings. Then AI, where-to-watch, lists.
