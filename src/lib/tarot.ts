/**
 * Deck data loads from `src/data/cards.json` (regenerated via `npm run generate:data`
 * from files in `data/source/`). Replace meanings, keywords, or metadata there and
 * re-run the script, or hand-edit `cards.json` while preserving the `TarotCard` shape.
 * Card art: point `imagePath` at files in `public/card-images/` (or any URL Vite can serve).
 */
import cards from "../data/cards.json";

export type TarotArcana = "major" | "minor";
export type TarotSuit = "cups" | "swords" | "wands" | "pentacles";
export type TarotCard = {
  id: string;
  slug: string;
  name: string;
  arcana: TarotArcana;
  suit?: TarotSuit;
  number?: number;
  rank?: string;
  imagePath: string;
  keywords?: string[];
  uprightMeaning: string;
  reversedMeaning: string;
  description?: string;
  symbolism?: string;
};

export type TarotCategory = "all" | TarotArcana | TarotSuit;

export const tarotCards = cards as TarotCard[];

export const tarotCategories: Array<{ id: TarotCategory; label: string }> = [
  { id: "all", label: "All" },
  { id: "major", label: "Major Arcana" },
  { id: "cups", label: "Cups" },
  { id: "swords", label: "Swords" },
  { id: "wands", label: "Wands" },
  { id: "pentacles", label: "Pentacles" },
];

export const cardsBySlug = new Map(tarotCards.map((card) => [card.slug, card]));

export function getCardBySlug(slug: string) {
  return cardsBySlug.get(slug);
}

export function getCardCategory(card: TarotCard): TarotCategory {
  return card.arcana === "major" ? "major" : card.suit ?? "all";
}

export function getCardRankLabel(card: TarotCard) {
  if (card.arcana === "major") {
    return "Major Arcana";
  }
  return card.rank ? card.rank[0].toUpperCase() + card.rank.slice(1) : "";
}

export function matchesSearch(card: TarotCard, query: string) {
  const haystack = [
    card.name,
    card.arcana,
    card.suit,
    card.rank,
    card.number,
    card.keywords?.join(" "),
    card.uprightMeaning,
    card.reversedMeaning,
    card.description,
    card.symbolism,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(query.trim().toLowerCase());
}

export function filterCards(cardsToFilter: TarotCard[], category: TarotCategory, query: string) {
  return cardsToFilter.filter((card) => {
    const categoryMatch =
      category === "all" || getCardCategory(card) === category;
    const searchMatch = query.trim() ? matchesSearch(card, query) : true;
    return categoryMatch && searchMatch;
  });
}
