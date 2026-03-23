import rawCards from "../../data/cards.json";
import { slugify } from "./slugify";
import type {
  RawTarotCard,
  RawTarotDataset,
  RawTarotSymbolism,
  TarotCard,
  TarotArcana,
  TarotSuit,
  TarotSymbolismDetail,
} from "./types";

const RANK_TO_NUMBER: Record<string, number> = {
  ace: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  page: 11,
  knight: 12,
  queen: 13,
  king: 14,
};

const SUIT_ALIASES: Record<string, TarotSuit> = {
  wands: "wands",
  cups: "cups",
  swords: "swords",
  pentacles: "pentacles",
  coins: "pentacles",
  disks: "pentacles",
};

function asTrimmedString(value: unknown): string {
  if (value == null) return "";
  return String(value).trim();
}

function normalizeArcana(value: unknown): TarotArcana {
  const s = asTrimmedString(value).toLowerCase();
  if (s === "minor") return "minor";
  return "major";
}

function normalizeSuit(value: unknown): TarotSuit | undefined {
  const s = asTrimmedString(value).toLowerCase();
  if (!s) return undefined;
  return SUIT_ALIASES[s];
}

function parseSymbolism(raw: unknown): { detail?: TarotSymbolismDetail; prose?: string } {
  if (raw == null) return {};
  if (typeof raw === "string") {
    const prose = raw.trim();
    return prose ? { prose } : {};
  }
  const s = raw as RawTarotSymbolism;
  const objects = (s.objects ?? []).map((x) => asTrimmedString(x)).filter(Boolean);
  const colors = (s.colors ?? []).map((x) => asTrimmedString(x)).filter(Boolean);
  const direction = asTrimmedString(s.direction);
  const hasStructure = objects.length > 0 || colors.length > 0 || direction.length > 0;
  if (!hasStructure) return {};
  return {
    detail: { objects, colors, direction },
    prose: symbolismDetailToProse({ objects, colors, direction }),
  };
}

function symbolismDetailToProse(d: TarotSymbolismDetail): string | undefined {
  const parts: string[] = [];
  if (d.objects.length) parts.push(`Objects: ${d.objects.join("; ")}`);
  if (d.colors.length) parts.push(`Colors: ${d.colors.join("; ")}`);
  if (d.direction) parts.push(`Direction: ${d.direction}`);
  return parts.length ? parts.join("\n\n") : undefined;
}

function defaultImagePath(slug: string, explicit?: string): string {
  const path = asTrimmedString(explicit);
  if (path) return path;
  return `/card-images/${slug}.jpg`;
}

function minorRankAndNumber(rawNumber: unknown): { rank?: string; number?: number } {
  if (typeof rawNumber === "number" && Number.isFinite(rawNumber)) {
    return { number: rawNumber };
  }
  const word = asTrimmedString(rawNumber).toLowerCase();
  if (!word) return {};
  const n = RANK_TO_NUMBER[word];
  if (n != null) {
    return { rank: word, number: n };
  }
  return { rank: word };
}

export function normalizeRawCard(raw: RawTarotCard, index: number): TarotCard {
  const name = asTrimmedString(raw.name) || `Card ${index + 1}`;
  const slug =
    asTrimmedString(raw.slug) ||
    slugify(name) ||
    `card-${index}`;

  const id = asTrimmedString(raw.id) || slug;

  const arcana = normalizeArcana(raw.arcana);
  const suit = arcana === "minor" ? normalizeSuit(raw.suit) : undefined;

  let number: number | undefined;
  let rank: string | undefined;
  if (arcana === "major") {
    const n = raw.number;
    if (typeof n === "number" && Number.isFinite(n)) {
      number = n;
    } else if (typeof n === "string" && n.trim() !== "") {
      const parsed = Number(n);
      number = Number.isFinite(parsed) ? parsed : undefined;
    }
  } else {
    const rankWord = asTrimmedString(raw.rank).toLowerCase();
    if (rankWord) {
      const minor = minorRankAndNumber(rankWord);
      number = minor.number;
      rank = minor.rank;
    } else {
      const minor = minorRankAndNumber(raw.number);
      number = minor.number;
      rank = minor.rank;
    }
  }

  const keywords = (raw.keywords ?? [])
    .map((k) => asTrimmedString(k))
    .filter(Boolean);

  const uprightMeaning =
    asTrimmedString(raw.upright) || asTrimmedString(raw.uprightMeaning);
  const reversedMeaning =
    asTrimmedString(raw.reversed) || asTrimmedString(raw.reversedMeaning);
  const coreMeaning = asTrimmedString(raw.core_meaning) || undefined;
  const description = asTrimmedString(raw.description) || undefined;

  const sym = parseSymbolism(raw.symbolism);
  const symbolism = sym.prose;

  const archetype = asTrimmedString(raw.archetype) || undefined;
  const numerology =
    raw.numerology != null && Number.isFinite(Number(raw.numerology))
      ? Number(raw.numerology)
      : null;
  const suitMeaning = raw.suit_meaning != null ? asTrimmedString(raw.suit_meaning) : null;
  const suitMeaningNorm = suitMeaning || null;

  const interpretationPatterns = (raw.interpretation_patterns ?? [])
    .map((p) => asTrimmedString(p))
    .filter(Boolean);

  const rel = raw.relationships;
  const relationships = Array.isArray(rel) ? rel : [];

  const imagePath = defaultImagePath(
    slug,
    asTrimmedString(raw.imagePath) || asTrimmedString(raw.image_path),
  );

  return {
    id,
    slug,
    name,
    arcana,
    suit,
    number,
    rank,
    imagePath,
    keywords,
    uprightMeaning,
    reversedMeaning,
    description,
    symbolism,
    coreMeaning,
    symbolismDetail: sym.detail,
    archetype,
    numerology,
    suitMeaning: suitMeaningNorm,
    interpretationPatterns,
    relationships,
  };
}

function loadAndNormalize(dataset: RawTarotDataset | RawTarotCard[]): TarotCard[] {
  const list = Array.isArray(dataset) ? dataset : (dataset.cards ?? []);
  const seenSlugs = new Map<string, number>();
  return list.map((raw, index) => {
    const base = normalizeRawCard(raw, index);
    const count = seenSlugs.get(base.slug) ?? 0;
    seenSlugs.set(base.slug, count + 1);
    if (count === 0) return base;
    const dedupSlug = `${base.slug}-${count + 1}`;
    return { ...base, slug: dedupSlug, id: dedupSlug };
  });
}

export const tarotCards: TarotCard[] = loadAndNormalize(rawCards as RawTarotCard[]);

export const cardsBySlug = new Map(tarotCards.map((c) => [c.slug, c]));
export const cardsByNameLower = new Map(
  tarotCards.map((c) => [c.name.trim().toLowerCase(), c]),
);
