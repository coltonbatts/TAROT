/**
 * Tarot data: loaded from `src/data/cards.json`, normalized in `normalize.ts`.
 * UI reads `TarotCard` only. Optional `tarot_dataset_simple.json` at the repo root is a schema stub, not the runtime source.
 */
export type {
  TarotArcana,
  TarotCard,
  TarotCategory,
  TarotSuit,
  TarotSymbolismDetail,
  RawTarotCard,
  RawTarotDataset,
  RawTarotRelationship,
} from "./types";

export { TAROT_CARD_IMAGE_FALLBACK } from "./constants";

export { slugify } from "./slugify";
export { tarotCards, cardsBySlug, normalizeRawCard } from "./normalize";
export {
  getAllCards,
  getCardBySlug,
  getCardById,
  getCardByName,
  getCardsByArcana,
  getCardsBySuit,
  getRelatedCards,
  searchCards,
} from "./selectors";
export { matchesSearch, filterCards, getCardCategory } from "./search";
export {
  capitalizeWord,
  formatArcanaHeading,
  formatCardMetaShort,
  formatCardOrdinalLabel,
  formatReferenceMetaLine,
  getCardRankLabel,
} from "./format";

import type { TarotCategory } from "./types";
import { tarotCards } from "./normalize";

export const tarotCategories: Array<{ id: TarotCategory; label: string }> = [
  { id: "all", label: "All" },
  { id: "major", label: "Major" },
  { id: "cups", label: "Cups" },
  { id: "swords", label: "Swords" },
  { id: "wands", label: "Wands" },
  { id: "pentacles", label: "Pentacles" },
];

export const TAROT_CARD_COUNT = tarotCards.length;
