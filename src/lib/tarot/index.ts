/**
 * Tarot data: loaded from the full knowledge-system dataset in `src/data/cards.json`,
 * normalized in `normalize.ts`. UI reads normalized `TarotCard` records and `tarotSystem`.
 */
export type {
  TarotArcana,
  TarotCard,
  TarotCategory,
  TarotSuit,
  TarotSystemData,
  TarotSuitPhilosophy,
  TarotInterpretationPatterns,
  TarotRelationshipGroups,
  TarotSymbolismDetail,
  RawTarotCard,
  RawTarotDataset,
  RawTarotInterpretationPatterns,
  RawTarotRelationshipGroups,
  RawTarotRelationship,
} from "./types";

export { TAROT_CARD_IMAGE_FALLBACK } from "./constants";

export { slugify } from "./slugify";
export { tarotCards, cardsBySlug, normalizeRawCard, tarotSystem } from "./normalize";
export {
  getAllCards,
  getCardBySlug,
  getCardById,
  getCardByName,
  getCardsByArcana,
  getCardsBySuit,
  getRelatedCards,
  getResolvedRelationshipGroups,
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
