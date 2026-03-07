# story-master---manus

## Where the app actually lives

The Vite app is inside:

- `storymaster-pro-complete/storymaster-pro`

This repository includes root-level deployment config so providers that build from repo root still install/build/publish the nested app correctly.

## Quick deployment checklist (Vercel)

If your logs show `Running "vercel build"`, you are deploying to **Vercel**.

1. Import the repo in Vercel.
2. Keep **Root Directory** as repository root (`/`).
3. Ensure **Install Command** is `npm run install:app`.
4. Ensure **Build Command** is `npm run build`.
5. Ensure **Output Directory** is `storymaster-pro-complete/storymaster-pro/dist`.

> The same values are already committed in `vercel.json`.

## Quick deployment checklist (Cloudflare Pages)

Use repository root and these values:

- Build command: `npm run install:app && npm run build`
- Build output directory: `storymaster-pro-complete/storymaster-pro/dist`

> These are already committed in `wrangler.toml`.

## Included deployment config files

- `package.json` (root): provides `install:app`, `build`, `dev` scripts that proxy into the nested app.
- `vercel.json`: explicit Vercel install/build/output mapping.
- `wrangler.toml`: explicit Cloudflare Pages build/output mapping.

## API errors vs hosting errors

The frontend calls AI providers directly from the browser. API failures are usually runtime/provider related, for example:

- missing/invalid API key in app settings
- model/provider mismatch
- quota/credits/rate limits

These are different from hosting issues like 404/site-not-found.

## הערה חשובה בעברית

אם בלוג כתוב `vercel build`, אז הפריסה לא רצה ב-Cloudflare אלא ב-Vercel. במקרה כזה צריך לבדוק הגדרות Vercel (Install/Build/Output) ולא רק Cloudflare.
