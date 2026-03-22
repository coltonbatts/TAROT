# Tarot Reference

A simple, editorial tarot reference app built with React, TypeScript, Tailwind, and local JSON data.

## What it does

- browse or search the full tarot deck
- filter by Major Arcana or suit
- open a card into its own dedicated page
- view the local scan image
- switch between upright and reversed meanings

## Architecture

- `scripts/generate-tarot-data.mjs` pulls open tarot sources, normalizes the data, and copies card images into the app
- `src/data/cards.json` is the generated local dataset imported by the UI
- `public/card-images/` contains the renamed local scans used at runtime
- `src/pages/` now holds the library page and the dedicated card page
- `src/components/` contains the small presentational pieces

## Run it

1. Install dependencies:

```bash
npm install
```

2. Generate data and images:

```bash
npm run generate:data
```

3. Start the app:

```bash
npm run dev
```

## Build

```bash
npm run build
```

The build script regenerates the local tarot dataset before bundling.

## Usage

- The home screen is the main reference workspace.
- Clicking a card opens its dedicated card page.
- Direct links to `/cards/:slug` open the same card page.

## Data sources

- [metabismuth/tarot-json](https://github.com/metabismuth/tarot-json)
- [dariusk/corpora tarot interpretations](https://github.com/dariusk/corpora/blob/master/data/divination/tarot_interpretations.json)

## Extend it

- Add a second scan set by updating `scripts/generate-tarot-data.mjs`
- Swap the card image source by changing the canonical scan directory
- Add more card fields by extending the generated JSON schema and the `TarotCard` type in `src/lib/tarot.ts`
