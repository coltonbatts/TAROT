/** Raw JSON shape: tolerate extra keys and partial fields when the dataset grows. */
export type TarotArcana = "major" | "minor";
export type TarotSuit = "cups" | "swords" | "wands" | "pentacles";

export type RawTarotSymbolism = {
  objects?: string[] | null;
  colors?: string[] | null;
  direction?: string | null;
};

/**
 * Optional `relationships[]` entries: slug string, or an object with `slug` and/or `id`
 * matching normalized `TarotCard` fields. Extra keys are ignored.
 */
export type RawTarotRelationship =
  | string
  | { slug?: string | null; id?: string | null; [key: string]: unknown };

export type RawTarotCard = {
  name?: string | null;
  slug?: string | null;
  id?: string | null;
  arcana?: string | null;
  suit?: string | null;
  number?: string | number | null;
  /** Minor arcana court / pip label from legacy generator (e.g. `ace`, `king`) */
  rank?: string | null;
  core_meaning?: string | null;
  upright?: string | null;
  reversed?: string | null;
  /** Legacy `src/data/cards.json` field; used if `upright` is empty */
  uprightMeaning?: string | null;
  /** Legacy `src/data/cards.json` field; used if `reversed` is empty */
  reversedMeaning?: string | null;
  keywords?: string[] | null;
  symbolism?: RawTarotSymbolism | string | null;
  archetype?: string | null;
  numerology?: number | null;
  suit_meaning?: string | null;
  interpretation_patterns?: string[] | null;
  /** See `RawTarotRelationship` for supported entry shapes when populated. */
  relationships?: unknown;
  description?: string | null;
  image_path?: string | null;
  imagePath?: string | null;
  [key: string]: unknown;
};

export type RawTarotDataset = {
  system?: Record<string, unknown>;
  cards?: RawTarotCard[] | null;
};

export type TarotSymbolismDetail = {
  objects: string[];
  colors: string[];
  direction: string;
};

/**
 * Normalized card: UI and 3D code consume this only (not raw JSON).
 * Legacy fields (uprightMeaning, imagePath) stay for existing components.
 */
export type TarotCard = {
  id: string;
  slug: string;
  name: string;
  arcana: TarotArcana;
  suit?: TarotSuit;
  number?: number;
  rank?: string;
  imagePath: string;
  keywords: string[];
  uprightMeaning: string;
  reversedMeaning: string;
  description?: string;
  /** Prose or synthesized from structured symbolism for search / fallback display */
  symbolism?: string;
  coreMeaning?: string;
  symbolismDetail?: TarotSymbolismDetail;
  archetype?: string;
  numerology?: number | null;
  suitMeaning?: string | null;
  interpretationPatterns: string[];
  /** Raw `relationships` from JSON; resolve with `getRelatedCards`. */
  relationships: unknown[];
};

export type TarotCategory = "all" | TarotArcana | TarotSuit;
