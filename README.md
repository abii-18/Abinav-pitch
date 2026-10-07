# Abinav Pitch Desk

A React + TypeScript + Vite data-engineering portfolio and recruiter-facing pitch desk for **Abinav S**. All pitch sources may remain in a private repository; each public route is built independently with one selected config. Existing pitch copy, components and CSS are preserved.

## Architecture

Previously, App.tsx imported default.json and walmart.json into a runtime registry. Both configs entered the same public bundle even when a recruiter visited only one route.

Now App.tsx imports only `@selected-pitch`. Vite resolves that alias to one absolute JSON path **before bundling**. There is no browser config registry, dynamic content glob, company selector or public route manifest. A build guard rejects any unselected content JSON entering the module graph. Public-directory copying is disabled and production source maps are disabled. See [Vite aliases](https://vite.dev/config/shared-options.html#resolve-alias).

`scripts/build-all.mjs` discovers every `src/content/*.json`, validates its schema/slug, uses the existing `routeHash(company)` implementation, builds each independently in a temporary staging tree, verifies bundle isolation, then assembles one deployable `dist/`. The previous output is backed up only after all staged builds pass; Windows-compatible copying retains the dist root and restores the backup if publication fails.

```text
dist/
  index.html                  generic/default portfolio
  assets/                     default-only bundle
  312011/
    index.html                existing default pitch route
    assets/                   default-only bundle
  822123/
    index.html                Walmart
    assets/                   Walmart-only bundle
  <other deterministic hash>/
    index.html
    assets/                   that company only
  404.html                    neutral recovery, no pitch bundle
  .nojekyll
```

The combined Pages artifact contains all public pitch directories, as requested. **Each downloaded route bundle contains only its selected pitch.** This provides bundle isolation, not access control: the deployed pages remain public to anyone who knows or discovers their URLs. Hashes are deterministic and not secret tokens. Raw private source files, research, resume-reference.md, tests and internal mappings are not emitted into dist.

## Run locally

Use Node.js **22.18+ or 24**, then `npm ci`.

```sh
npm run dev
npm run dev -- --company walmart
npm run dev -- --company=walmart
```

The first command previews the generic root. Walmart development previews its selected content at the root or its unchanged opaque path `/822123`. Another company's route renders the recovery page. Switch company by restarting the command; no App.tsx edit is needed.

Selection may also use `BUILD_TARGET`; CLI `--company` takes precedence. In PowerShell:

```powershell
$env:BUILD_TARGET = 'walmart'
npm run dev
Remove-Item Env:BUILD_TARGET
```

## Single-company builds

```sh
npm run build
npm run build -- --company=walmart
npm run build -- --company=default
npm run preview
```

`npm run build` type-checks and builds the default config unless BUILD_TARGET is set. A single-company build replaces dist with that one standalone preview application; it is not the multi-company deployment command. To build another existing or future config, substitute its filename slug, for example `npm run build -- --company=rapido` after rapido.json exists. Missing, unsafe or invalid selections fail instead of silently falling back.

## Adding a new company

1. Create `src/content/<company-slug>.json` using the existing PitchConfig schema. Keep the filename and JSON `slug` identical; use lowercase URL-safe slugs.
2. Write factual company-specific content using [resume-reference.md](src/content/resume-reference.md) as the source of truth. Keep production, internship and personal-project evidence distinct. Preserve metrics/baselines; do not invent technologies, streaming, AI/ML, compliance, leadership or project ownership.
3. Preview with `npm run dev -- --company <company-slug>`.
4. Run `npm test` and `npm run build:all`. The build automatically discovers and rebuilds every config, preserving existing routes.
5. When you choose to publish, push through your usual Git workflow. GitHub Actions deploys the assembled artifact once.

No edits to App.tsx, routing.ts, a company registry or GitHub Actions are needed for another valid JSON config. No manual dist copying is needed.

The hash uses the **company name**, not its slug. Walmart remains `822123`; Your team remains `312011`. Changing a company name changes its route, so keep names stable. Six-digit hashes can collide; discovery aborts on collisions instead of overwriting an existing page.

To inspect a route locally:

```sh
node --experimental-strip-types --input-type=module -e "import { routeHash } from './src/routing.ts'; console.log(routeHash('Rapido'))"
```

## Build all routes

```sh
npm run build:all
npm run build:all -- --base /Abinav-pitch/
```

The first creates a local multi-directory artifact with root base `/`. The second creates the Pages-ready artifact. GitHub Actions automatically selects `/Abinav-pitch/` from its environment. All assets use each route's full deployment base, so a Walmart page downloads assets from `/Abinav-pitch/822123/assets/`.

## GitHub Pages

[deploy.yml](.github/workflows/deploy.yml) keeps the existing checkout, Node setup, upload-pages-artifact and deploy-pages flow. It now runs:

```sh
npm ci
npm test
npm run build:all
```

One upload publishes the complete dist directory and keeps every discovered company route live simultaneously. New companies add another directory; they do not replace Walmart.

Known company URLs are physical directories with their own index.html, so direct navigation uses a static page rather than an SPA fallback. Both the existing slashless Walmart URL and its trailing-slash form resolve to the directory on Pages (the host may redirect to add the slash). Unknown routes use a **neutral 404.html**. The former index.html-to-404.html copy is removed; it must not make a default/company bundle handle all routes.

Existing Walmart URL: **https://abii-18.github.io/Abinav-pitch/822123**.

The root remains the generic portfolio; it does not show a company directory. Pages must use **Settings → Pages → Source: GitHub Actions**. A private source repository can publish a public Pages site on an eligible GitHub plan; repository visibility and Pages settings were not changed or verified remotely. The npm package's `private: true` does not set GitHub repository visibility. See [GitHub Pages availability](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages).

## Verification

```sh
npm test
npm run build
npm run build -- --company=walmart
npm run build:all
npm run build:all -- --base /Abinav-pitch/
```

Tests cover route stability, multiple configs, discovery, collision detection, invalid selections/schema, local root, deployed base and invalid nested/cross-company paths. Real production builds use actual Walmart copy plus **temporary Amazon/Mastercard test fixtures**. They verify selected content is present, other unique pitch copy is absent, assets have the correct directory base and intentionally importing two configs fails.

The end-to-end test builds all routes before and after adding fixtures, checks that invalid input preserves the previous artifact, and serves the result over HTTP to verify direct pages, assets and the slashless Walmart redirect.

Only default.json and walmart.json existed in this checkout. No Amazon or Mastercard production pitches were recreated. Their test fixtures are synthetic, remain under temporary test output and are removed afterward. Walmart's legitimate **Amazon Redshift** technology reference is preserved; that vendor substring is not an Amazon company-pitch leak.

Every build:all also checks actual outputs against every other config's unique long strings. Shared resume facts are allowed; raw JSON files/source maps in generated output fail verification. The module-graph guard catches unintended config imports even if string checks miss an encoding change.

## Content

- [default.json](src/content/default.json): generic/default content, unchanged.
- [walmart.json](src/content/walmart.json): existing Walmart content, unchanged.
- [walmart-research.md](docs/walmart-research.md): existing research, unchanged.
- [resume-reference.md](src/content/resume-reference.md): factual source, unchanged.
- [types.ts](src/types.ts): existing shared schema, unchanged.
Automatic discovery reads **src/content/*.json only**. Keep private research local; do not put it in public assets or commit it to this public repository.

## Attribution

The starting structure, visual design and original config-driven approach come from [venkxycodes/pitch-desk](https://github.com/venkxycodes/pitch-desk), reviewed at commit `e910399c16694217f8f9acffafb10f9d67e11f59`. Abinav's content comes from his supplied resume. Upstream contains no license file; this repository does not add or imply a new license for upstream code.
