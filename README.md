# tokenforge-web

The public site at **tokenforge.eu** — a small toolbox of security and network tools.
Static files, no build step, deployed to **Cloudflare Workers static assets**. The backend for the
server-lookup tools lives separately in `tokenforge-infra` (stack `tools-api`,
served at `api.tokenforge.eu`).

```
index.html            home
tools/index.html      tool index
tools/jwt/            JWT decoder        (runs entirely in the browser)
tools/spf-dmarc/      email auth check   (calls api.tokenforge.eu)
tools/ssl/            TLS inspector      (calls api.tokenforge.eu)
assets/               css + per-tool js
_headers              Cloudflare Workers static assets security headers (CSP, HSTS, …)
robots.txt
```

## Design rules

- **Browser-only tools never phone home.** The JWT decoder parses locally; the token
  is never sent anywhere and the signature is deliberately not verified (no keys).
- **Server-lookup tools are read-only** and call `api.tokenforge.eu` for DNS/TLS
  lookups only. No arbitrary-target scanning lives here — that is the private,
  Tailscale-only scanner in `tokenforge-infra`.
- **Strict CSP.** All scripts are external files on our own origin; `_headers` sets
  the Content-Security-Policy, HSTS and the rest, so the site passes its own header
  grader.

## Deployment

The connected Cloudflare **tokenforge-web** Worker publishes static assets from this repository. `wrangler.json` defines the asset directory and previews; production hostnames are managed in the Cloudflare dashboard. Every push to `main` triggers Workers Builds. Branches get isolated static previews; backend lookups permit only the production origins.

Run `node --test tests/*.test.mjs`, check the branch build, then merge. Check the resulting production build and live tool flows after deployment. There is no frontend compilation step.

## Adding a tool

- Browser-only: add `tools/<name>/index.html` and `assets/<name>.js`, then a card on
  the home and tools pages.
- Server-lookup: add the page + js here, and the endpoint in `tokenforge-infra`'s
  `tools-api`. Keep SSRF guards on anything that makes outbound connections.

## Toolbox completion

The site now includes local CIDR, random-password, UTF-8 Base64, SHA-2 hashing, numeric cron-field and RouterOS address-list helpers, plus bounded DNS and HTTPS-header lookups. Lookup limits and privacy behavior are documented at `/docs/`. Header presence is not a certification; DNS is a single resolver view; email checks discover records rather than implementing a full SPF evaluator. TLS only connects to validated public IPv4 addresses on port 443 and verifies certificates. `www.tokenforge.eu` is canonical.

Run `node --test tests/*.test.mjs` before publishing. Backend-dependent cards must only ship after the API route passes live browser tests. GitHub pushes to `main` publish automatically through Cloudflare.

The active Cloudflare project uses Workers Builds. `wrangler.json` supplies static-asset and Preview configuration; `.assetsignore` excludes tests and configuration from the public asset bundle. Backend CORS permits production hostnames only, so lookup forms are tested on the production origin after deployment.
