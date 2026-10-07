# Abinav Pitch Desk

A config-driven data engineering portfolio and company-specific pitch site for **Abinav S**. Built with React, TypeScript and Vite, with a restrained dark-and-gold layout adapted from [venkxycodes/pitch-desk](https://github.com/venkxycodes/pitch-desk).

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
