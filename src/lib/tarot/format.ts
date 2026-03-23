import type { TarotCard } from "./types";

export function capitalizeWord(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/** Short line for list tiles: "Major" or "Wands · Ace". */
export function formatCardMetaShort(card: TarotCard): string {
  if (card.arcana === "major") return "Major";
  const suit = card.suit ? capitalizeWord(card.suit) : "";
  const rank = card.rank ? capitalizeWord(card.rank) : "";
  return [suit, rank].filter(Boolean).join(" · ");
}

/** Reference header subtitle: "Major" or suit name for minor. */
export function formatArcanaHeading(card: TarotCard): string {
  if (card.arcana === "major") return "Major";
  return card.suit ? capitalizeWord(card.suit) : "Minor";
}

export function getCardRankLabel(card: TarotCard): string {
  if (card.arcana === "major") {
    return "Major Arcana";
  }
  return card.rank ? capitalizeWord(card.rank) : "";
}

/** Figcaption line under the card art on the detail page. */
export function formatReferenceMetaLine(card: TarotCard): string {
  const parts = [
    card.arcana === "major" ? "Major arcana" : "Minor arcana",
    card.suit ? capitalizeWord(card.suit) : null,
    card.arcana === "major"
      ? card.number != null
        ? `No. ${card.number}`
        : null
      : card.rank
        ? capitalizeWord(card.rank)
        : card.number != null
          ? `No. ${card.number}`
          : null,
  ].filter(Boolean);
  return parts.join(" · ");
}

/** Display numeral / rank in the index column (tile). */
export function formatCardOrdinalLabel(card: TarotCard): string {
  if (card.number != null && card.arcana === "major") {
    return String(card.number);
  }
  if (card.rank) return card.rank.toUpperCase();
  if (card.number != null) return String(card.number);
  return "";
}
