# story-master---manus

## Cloudflare Pages deployment (repo root)

This repository keeps the Vite app inside:

- `storymaster-pro-complete/storymaster-pro`

To avoid "site not found" / empty deployment issues when Cloudflare builds from repository root, this repo now includes:

- Root `wrangler.toml` with a build command and output directory.
- Root `package.json` with `build`/`dev` scripts that proxy to the nested app.

### Recommended Cloudflare Pages settings

- **Build command:** `npm run build`
- **Build output directory:** `storymaster-pro-complete/storymaster-pro/dist`
- **Root directory:** leave as repo root (or set directly to `storymaster-pro-complete/storymaster-pro` and keep your old command).

## API errors

The frontend calls AI providers directly from the browser, so API failures are usually caused by:

- Missing/invalid API key in app settings.
- Model/provider mismatch (for example, a non-Gemini model with Google provider).
- Quota/credits/rate limits from the selected provider.

These are runtime/provider issues, not Cloudflare hosting reachability issues.
