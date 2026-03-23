import type { TarotCard, TarotCategory } from "./types";

function searchHaystack(card: TarotCard): string {
  const sym = card.symbolismDetail;
  const symbolismExtra = sym
    ? [sym.objects.join(" "), sym.colors.join(" "), sym.direction].filter(Boolean).join(" ")
    : "";
  const relationshipText = [
    ...card.relationships.similar,
    ...card.relationships.contrasting,
    ...card.relationships.previous,
    ...card.relationships.next,
  ]
    .map((item) => (typeof item === "string" ? item : ""))
    .filter(Boolean)
    .join(" ");
  const suitPhilosophyText = card.suitPhilosophy
    ? [
        card.suitPhilosophy.element,
        card.suitPhilosophy.domain,
        card.suitPhilosophy.shadow,
        card.suitPhilosophy.logic,
        card.suitPhilosophy.progression.join(" "),
      ]
        .filter(Boolean)
        .join(" ")
    : "";
  const interpretationText = [
    card.interpretationPatterns.developmentalRole,
    card.interpretationPatterns.systemLinks.join(" "),
    card.interpretationPatterns.reversalModes.join(" "),
  ]
    .filter(Boolean)
    .join(" ");

  const meaningsText = [
    card.meanings.upright.summary,
    card.meanings.upright.detailed,
    card.meanings.upright.keywords.join(" "),
    card.meanings.reversed.summary,
    card.meanings.reversed.detailed,
    card.meanings.reversed.keywords.join(" "),
  ].join(" ");

  const knowledgeText = card.knowledgeMetadata
    ? [
        card.knowledgeMetadata.element,
        card.knowledgeMetadata.astrology,
        card.knowledgeMetadata.hebrewLetter,
        card.knowledgeMetadata.qabalisticPath,
        card.knowledgeMetadata.chakra,
        card.knowledgeMetadata.elementalComposite,
      ]
        .filter(Boolean)
        .join(" ")
    : "";

  const semanticsText = card.symbolismSemantics
    ? [card.symbolismSemantics.interpretation, card.symbolismSemantics.imagery.join(" ")].join(" ")
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
    card.numerology,
    card.suitMeaning,
    suitPhilosophyText,
    interpretationText,
    meaningsText,
    knowledgeText,
    semanticsText,
    relationshipText,
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
