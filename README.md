# Abinav Pitch Desk

A config-driven data engineering portfolio and company-specific pitch site for **Abinav S**. Built with React, TypeScript and Vite, with a restrained dark-and-gold layout 

## Run locally

Use Node.js 22.18+ (or Node.js 24).

```sh
npm ci
npm run dev
```

The root URL (`http://localhost:5173/`) renders Abinav’s portfolio. Unknown URLs render a useful recovery page.

## Verify

```sh
npm test
npm run build
```

Routing tests cover local and GitHub Pages base paths, targeted links, trailing slashes and invalid nested paths. Pull requests run tests and a production build through GitHub Actions. Dependency versions are pinned, with a committed lockfile.

## Content

- `src/content/default.json`: homepage and default pitch content.
- `src/content/walmart.json`: Walmart pitch, with production and personal-project evidence distinguished.
- `docs/walmart-research.md`: sources, requirement synthesis and claim boundaries.
- `src/types.ts`: shared content schema; project links are optional.
- `src/content/resume-reference.md`: professional facts and tailoring constraints, not rendered on the website.
- `.codex/skills/generate-pitch-json/SKILL.md`: guidance for future company pitches.
- `src/App.tsx`: shared layout and registered configs.
- `src/routing.ts`: stable company hashes and deployment-aware paths.

Production experience, the internship and the personal lakehouse project are kept distinct. Resume metrics retain their original baselines. The original PDF, phone number and GPA are not published. The lakehouse card has no fabricated repository link.

## Add a company pitch

1. Copy `src/content/default.json` to `src/content/<slug>.json`.
2. Tailor the role, intro, why-company copy, contributions and evidence to the supplied JD using the resume reference.
3. Import the JSON and register it in `configs` in `src/App.tsx`.
4. Run tests and build.
5. Compute its route using the shared implementation:

```sh
node --experimental-strip-types --input-type=module -e "import { routeHash } from './src/routing.ts'; console.log(routeHash('Company name'))"
```

Company names generate opaque six-digit routes; slug is a content identifier. These URLs do not provide privacy or authentication: every imported config is included in the public client bundle. Changing the company name changes its URL.

## GitHub Pages

After merging, enable **Settings → Pages → Source: GitHub Actions**. The main-branch workflow builds the app, copies `index.html` to `404.html` for direct pitch URLs, and deploys to:

`https://abii-18.github.io/Abinav-pitch/`

GitHub Actions builds use `/Abinav-pitch/`; local builds use `/`. Brand and recovery links retain the configured base path. Nested direct URLs use the Pages 404 fallback, which serves the app with an HTTP 404 status; the homepage uses HTTP 200. This PR prepares deployment and does not itself enable Pages.

## Attribution

The starting structure, visual design and config-driven pitch approach come from [venkxycodes/pitch-desk](https://github.com/venkxycodes/pitch-desk), reviewed at commit `e910399c16694217f8f9acffafb10f9d67e11f59`. Abinav’s content comes from his supplied resume. Upstream contains no license file; this repository does not add or imply a new license for upstream code.

## Walmart pitch

The shared `routeHash("Walmart")` produces `822123`; links use `pitchHref("Walmart", baseUrl)`.

- Local development: `http://localhost:5173/822123`
- GitHub Pages: `https://abii-18.github.io/Abinav-pitch/822123`
- A trailing slash is accepted; nested paths show the recovery page.
- Root and the existing default pitch (`312011`) retain their behavior.

Four contribution cards use the shared two-column variant (one column on mobile). The existing three-card default remains unchanged. Experience tags use clean technology names; production scope is explicit in the Experience paragraph and personal-project scope remains explicit in the contribution and project content. No project URL is fabricated.

For a deployment-base check locally, build with `GITHUB_ACTIONS=true`, copy `dist/index.html` to `dist/404.html` as the existing workflow does, and preview the result. The Pages fallback renders direct pitch links while retaining an HTTP 404 status. Local Vite preview alone does not reproduce that HTTP status.
