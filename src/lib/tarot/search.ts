import type { TarotCard, TarotCategory } from "./types";

function searchHaystack(card: TarotCard): string {
  const sym = card.symbolismDetail;
  const symbolismExtra = sym
    ? [sym.objects.join(" "), sym.colors.join(" "), sym.direction].filter(Boolean).join(" ")
    : "";

  return [
    card.name,
    card.slug,
    card.arcana,
    card.suit,
    card.rank,
    card.number,
    card.keywords.join(" "),
    card.uprightMeaning,
    card.reversedMeaning,
    card.description,
    card.symbolism,
    card.coreMeaning,
    card.archetype,
    card.suitMeaning,
    card.interpretationPatterns.join(" "),
    symbolismExtra,
  ]
    .filter((x) => x != null && x !== "")
    .join(" ")
    .toLowerCase();
}

export function matchesSearch(card: TarotCard, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return searchHaystack(card).includes(q);
}

export function filterCards(
  cardsToFilter: TarotCard[],
  category: TarotCategory,
  query: string,
): TarotCard[] {
  return cardsToFilter.filter((card) => {
    const categoryMatch = category === "all" || getCardCategory(card) === category;
    const searchMatch = query.trim() ? matchesSearch(card, query) : true;
    return categoryMatch && searchMatch;
  });
}

export function getCardCategory(card: TarotCard): TarotCategory {
  return card.arcana === "major" ? "major" : card.suit ?? "all";
}
