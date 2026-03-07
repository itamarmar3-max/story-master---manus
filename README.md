# story-master---manus

## Where the app actually lives

The Vite app is inside:

- `storymaster-pro-complete/storymaster-pro`

This repository now includes root-level deployment config so hosting providers that build from repo root can still find/build/publish the app correctly.

## Vercel deployment (important)

If your logs show `Running "vercel build"`, your deployment is running on **Vercel** (not Cloudflare).

This repo includes `vercel.json` so Vercel will:

- install nested app dependencies via `npm run install:app`
- build nested app via `npm run build`
- publish `storymaster-pro-complete/storymaster-pro/dist`

## Cloudflare Pages deployment

This repo also includes `wrangler.toml` with:

- build command: `npm run install:app && npm run build`
- output directory: `storymaster-pro-complete/storymaster-pro/dist`

## API errors vs hosting errors

The frontend calls AI providers directly from the browser. API failures are usually runtime/provider related, for example:

- missing/invalid API key in app settings
- model/provider mismatch
- quota/credits/rate limits

These are different from hosting issues like 404/site-not-found.
