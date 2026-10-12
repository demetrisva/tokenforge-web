# tokenforge-web

The public site at **tokenforge.eu** — a small toolbox of security and network tools.
Static files, no build step, deployed to **Cloudflare Pages**. The backend for the
server-lookup tools lives separately in `tokenforge-infra` (stack `tools-api`,
served at `api.tokenforge.eu`).

```
index.html            home
tools/index.html      tool index
tools/jwt/            JWT decoder        (runs entirely in the browser)
tools/spf-dmarc/      email auth check   (calls api.tokenforge.eu)
tools/ssl/            TLS inspector      (calls api.tokenforge.eu)
assets/               css + per-tool js
_headers              Cloudflare Pages security headers (CSP, HSTS, …)
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

## Deploy (Cloudflare Pages)

1. Cloudflare dashboard → **Workers &amp; Pages → Create → Pages → Connect to Git**.
2. Pick this repo. Framework preset **None**, build command **empty**, output dir **/**.
3. Add the custom domain **tokenforge.eu** (and `www` if wanted).

Every push to `main` publishes automatically. There is no build to break.

## Adding a tool

- Browser-only: add `tools/<name>/index.html` and `assets/<name>.js`, then a card on
  the home and tools pages.
- Server-lookup: add the page + js here, and the endpoint in `tokenforge-infra`'s
  `tools-api`. Keep SSRF guards on anything that makes outbound connections.
