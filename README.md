# Job Pitch

Private tooling for generating tailored job pitch pages.

## Usage

Create or update a company configuration, then run the project build.

The build generates the corresponding pitch pages and keeps the local pitch-link registry updated.

## Development

```bash
npm install
npm run dev
```

```bash
npm run dev -- --company walmart
npm test
npm run build
npm run build:all
```

Use Node.js 22.18+ or 24. Builds discover `src/content/*.json` and reuse the existing deterministic route hashes. Each company receives an independent bundle in one Pages artifact; the root stays generic. Adding a config requires no registry or routing edits.

Both build commands regenerate the ignored root `company-links.md` from production company configs. Keep research and this generated registry local. They are excluded from the Pages artifact. GitHub Actions publishes all pitch directories together when changes reach `main`.
