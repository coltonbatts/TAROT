/** Raw JSON shape: tolerate extra keys and partial fields when the dataset grows. */
export type TarotArcana = "major" | "minor";
export type TarotSuit = "cups" | "swords" | "wands" | "pentacles";

export type RawTarotSymbolism = {
  objects?: string[] | null;
  colors?: string[] | null;
  direction?: string | null;
};

export type RawTarotInterpretationPatterns =
  | string[]
  | {
      developmental_role?: string | null;
      system_links?: string[] | null;
      reversal_modes?: string[] | null;
    };

export type RawTarotRelationshipGroups = {
  similar_cards?: Array<string | { slug?: string | null; id?: string | null }> | null;
  contrasting_cards?: Array<string | { slug?: string | null; id?: string | null }> | null;
  transitional_cards?:
    | {
        previous?: Array<string | { slug?: string | null; id?: string | null }> | null;
        next?: Array<string | { slug?: string | null; id?: string | null }> | null;
      }
    | null;
};

export type RawTarotSuitPhilosophy = {
  element?: string | null;
  domain?: string | null;
  shadow?: string | null;
  logic?: string | null;
  progression?: string[] | null;
};

export type TarotSuitPhilosophy = {
  element: string;
  domain: string;
  shadow: string;
  logic: string;
  progression: string[];
};

export type TarotInterpretationPatterns = {
  developmentalRole?: string;
  systemLinks: string[];
  reversalModes: string[];
};

export type TarotRelationshipGroups = {
  similar: unknown[];
  contrasting: unknown[];
  previous: unknown[];
  next: unknown[];
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
  symbolism?: RawTarotSymbolism | string | string[] | null;
  archetype?: string | null;
  numerology?: number | string | null;
  suit_meaning?: string | null;
  interpretation_patterns?: RawTarotInterpretationPatterns | null;
  /** See `RawTarotRelationship` for supported entry shapes when populated. */
  relationships?: unknown;
  description?: string | null;
  image_path?: string | null;
  imagePath?: string | null;
  [key: string]: unknown;
};

export type RawTarotDataset = {
  metadata?: Record<string, unknown>;
  system?: Record<string, unknown>;
  system_level_rules?: string[] | null;
  suit_philosophy?: Partial<Record<TarotSuit, RawTarotSuitPhilosophy>> | null;
  number_meanings?: Record<string, unknown> | null;
  reversal_logic?: Record<string, unknown> | null;
  relationship_rules?: Record<string, unknown> | null;
  progression_systems?: Record<string, unknown> | null;
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
  numerology?: string | null;
  suitMeaning?: string | null;
  suitPhilosophy?: TarotSuitPhilosophy | null;
  interpretationPatterns: TarotInterpretationPatterns;
  /** Relationship groups resolved by selectors; values are raw references until resolved. */
  relationships: TarotRelationshipGroups;
};

export type TarotCategory = "all" | TarotArcana | TarotSuit;

export type TarotSystemData = {
  metadata: Record<string, unknown>;
  systemLevelRules: string[];
  suitPhilosophy: Partial<Record<TarotSuit, TarotSuitPhilosophy>>;
  numberMeanings: Record<string, unknown>;
  reversalLogic: Record<string, unknown>;
  relationshipRules: Record<string, unknown>;
  progressionSystems: Record<string, unknown>;
};
