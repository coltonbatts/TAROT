# Tarot Reference

A simple, editorial tarot reference app built with React, TypeScript, Tailwind, and local JSON data.

## What it does

- browse or search the full tarot deck
- filter by Major Arcana or suit
- open a card into its own dedicated page
- view the local scan image
- switch between upright and reversed meanings

## Architecture

- `src/data/cards.json` is the runtime dataset (full upright / reversed / description / symbolism from the legacy generator); `src/lib/tarot/normalize.ts` loads and normalizes it into `TarotCard` (components do not import JSON directly). `tarot_dataset_simple.json` at the repo root is only an optional schema stub with placeholder copy—not used by the app unless you wire it back in
- `public/card-images/` holds face scans as `/card-images/{slug}.jpg`, plus `back.jpg` used as an image fallback when a face file is missing
- `src/pages/` holds the library page and the dedicated card page
- `src/components/` contains the small presentational pieces

## Run it

1. Install dependencies:

```bash
npm install
```

2. Start the app:

```bash
npm run dev
```

## Build

```bash
npm run build
```

`npm run build` runs Vite only; it does not regenerate tarot JSON.

## Usage

- The home screen is the main reference workspace.
- Clicking a card opens its dedicated card page.
- Direct links to `/cards/:slug` open the same card page.

## Data sources

- [metabismuth/tarot-json](https://github.com/metabismuth/tarot-json)
- [dariusk/corpora tarot interpretations](https://github.com/dariusk/corpora/blob/master/data/divination/tarot_interpretations.json)

## Legacy generator (optional)

`npm run generate:data` runs `scripts/generate-tarot-data.mjs`, which was written for an older pipeline (`src/data/cards.json`). The app no longer reads that file at runtime. The script can still be useful to refresh files under `public/card-images/` from `data/source/` and your local scan folder if you maintain that workflow—otherwise you can ignore it. `src/data/cards.json` is legacy output only.

## Extend it

- Enrich `tarot_dataset_simple.json` (optional fields are tolerated; see `RawTarotCard` / `RawTarotRelationship` in `src/lib/tarot/types.ts`)
- Add or replace images under `public/card-images/` to match each card’s `slug`
