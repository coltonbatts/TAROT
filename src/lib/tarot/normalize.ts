import rawDataset from "../../data/cards.json";
import { slugify } from "./slugify";
import type {
  RawTarotCard,
  RawTarotDataset,
  RawTarotInterpretationPatterns,
  RawTarotKnowledgeMetadata,
  RawTarotMeaningOrientationBlock,
  RawTarotRelationshipGroups,
  RawTarotStructuredMeanings,
  RawTarotSymbolism,
  RawTarotSymbolismSemantics,
  TarotCard,
  TarotArcana,
  TarotInterpretationPatterns,
  TarotKnowledgeMetadata,
  TarotMeaningOrientationBlock,
  TarotRelationshipGroups,
  TarotStructuredMeanings,
  TarotSuit,
  TarotSuitPhilosophy,
  TarotSymbolismDetail,
  TarotSymbolismSemantics,
  TarotSystemData,
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
  if (Array.isArray(raw)) {
    const objects = raw.map((item) => asTrimmedString(item)).filter(Boolean);
    if (!objects.length) return {};
    return {
      detail: { objects, colors: [], direction: "" },
      prose: symbolismDetailToProse({ objects, colors: [], direction: "" }),
    };
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

function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => asTrimmedString(item)).filter(Boolean);
}

function firstSentence(text: string): string {
  const t = text.trim();
  if (!t) return "";
  const m = t.match(/^(.+?[.!?])(\s|$)/);
  return m ? m[1].trim() : t;
}

function keywordsFromReversedText(reversed: string): string[] {
  const t = reversed.trim();
  if (!t) return [];
  return t
    .split(/[,;]|\bor\b/gi)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 6);
}

function parseMeaningOrientationBlock(
  raw: RawTarotMeaningOrientationBlock | null | undefined,
  fallback: TarotMeaningOrientationBlock,
): TarotMeaningOrientationBlock {
  if (!raw || typeof raw !== "object") return fallback;
  const keywords = stringArray(raw.keywords);
  const summary = asTrimmedString(raw.summary) || fallback.summary;
  const detailed = asTrimmedString(raw.detailed) || fallback.detailed;
  return {
    keywords: keywords.length > 0 ? keywords : fallback.keywords,
    summary,
    detailed,
  };
}

function deriveStructuredMeanings(
  raw: RawTarotCard,
  uprightMeaning: string,
  reversedMeaning: string,
  keywords: string[],
  coreMeaning: string | undefined,
): TarotStructuredMeanings {
  const uprightFallback: TarotMeaningOrientationBlock = {
    keywords,
    summary: (coreMeaning || firstSentence(uprightMeaning)).trim(),
    detailed: uprightMeaning,
  };
  const reversedFallback: TarotMeaningOrientationBlock = {
    keywords: keywordsFromReversedText(reversedMeaning),
    summary: firstSentence(reversedMeaning),
    detailed: reversedMeaning,
  };
  const m = raw.meanings && typeof raw.meanings === "object" ? (raw.meanings as RawTarotStructuredMeanings) : undefined;
  return {
    upright: parseMeaningOrientationBlock(m?.upright ?? undefined, uprightFallback),
    reversed: parseMeaningOrientationBlock(m?.reversed ?? undefined, reversedFallback),
  };
}

function parseKnowledgeMetadata(raw: unknown): TarotKnowledgeMetadata | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const o = raw as RawTarotKnowledgeMetadata;
  const element = asTrimmedString(o.element);
  const astrology = asTrimmedString(o.astrology);
  const hebrewLetter = asTrimmedString(o.hebrew_letter);
  const qabalisticPath = asTrimmedString(o.qabalistic_path);
  const chakra = asTrimmedString(o.chakra);
  const elementalComposite = asTrimmedString(o.elemental_composite);
  if (!element && !astrology && !hebrewLetter && !qabalisticPath && !chakra && !elementalComposite) {
    return undefined;
  }
  return {
    ...(element ? { element } : {}),
    ...(astrology ? { astrology } : {}),
    ...(hebrewLetter ? { hebrewLetter } : {}),
    ...(qabalisticPath ? { qabalisticPath } : {}),
    ...(chakra ? { chakra } : {}),
    ...(elementalComposite ? { elementalComposite } : {}),
  };
}

function parseSymbolismSemantics(
  raw: unknown,
  imageryFallback: string[],
  interpretationFallback: string,
): TarotSymbolismSemantics | undefined {
  if (!raw || typeof raw !== "object") {
    if (!interpretationFallback.trim() && imageryFallback.length === 0) return undefined;
    return {
      imagery: [...imageryFallback],
      interpretation: interpretationFallback.trim(),
    };
  }
  const o = raw as RawTarotSymbolismSemantics;
  const imagery = stringArray(o.imagery);
  const interpretation = asTrimmedString(o.interpretation) || interpretationFallback;
  const img = imagery.length > 0 ? imagery : imageryFallback;
  if (!interpretation && img.length === 0) return undefined;
  return { imagery: img, interpretation };
}

function parseInterpretationPatterns(raw: RawTarotInterpretationPatterns | null | undefined): TarotInterpretationPatterns {
  if (Array.isArray(raw)) {
    return {
      developmentalRole: undefined,
      systemLinks: raw.map((item) => asTrimmedString(item)).filter(Boolean),
      reversalModes: [],
    };
  }

  const obj = raw && typeof raw === "object" ? raw : undefined;
  return {
    developmentalRole: obj ? asTrimmedString(obj.developmental_role) || undefined : undefined,
    systemLinks: stringArray(obj?.system_links),
    reversalModes: stringArray(obj?.reversal_modes),
  };
}

function asRelationshipArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value.filter((entry) => entry != null) : [];
}

function parseRelationships(raw: unknown): TarotRelationshipGroups {
  if (Array.isArray(raw)) {
    return {
      similar: raw.filter((entry) => entry != null),
      contrasting: [],
      previous: [],
      next: [],
    };
  }

  if (raw && typeof raw === "object") {
    const groups = raw as RawTarotRelationshipGroups;
    const transitional =
      groups.transitional_cards && typeof groups.transitional_cards === "object"
        ? groups.transitional_cards
        : undefined;
    return {
      similar: asRelationshipArray(groups.similar_cards),
      contrasting: asRelationshipArray(groups.contrasting_cards),
      previous: asRelationshipArray(transitional?.previous),
      next: asRelationshipArray(transitional?.next),
    };
  }

  return {
    similar: [],
    contrasting: [],
    previous: [],
    next: [],
  };
}

function normalizeSuitPhilosophyEntry(raw: unknown): TarotSuitPhilosophy | null {
  if (!raw || typeof raw !== "object") return null;
  const value = raw as Record<string, unknown>;
  const element = asTrimmedString(value.element);
  const domain = asTrimmedString(value.domain);
  const shadow = asTrimmedString(value.shadow);
  const logic = asTrimmedString(value.logic);
  const progression = stringArray(value.progression);
  if (!element && !domain && !shadow && !logic && progression.length === 0) return null;
  return { element, domain, shadow, logic, progression };
}

function formatSuitMeaning(suit: TarotSuit | undefined, philosophy: TarotSuitPhilosophy | null | undefined): string | null {
  if (!suit || !philosophy) return null;
  const parts = [
    philosophy.element ? `Element: ${philosophy.element}.` : "",
    philosophy.domain ? `Domain: ${philosophy.domain}.` : "",
    philosophy.logic ? philosophy.logic : "",
  ].filter(Boolean);
  return parts.length ? parts.join(" ") : null;
}

const datasetObject: RawTarotDataset = Array.isArray(rawDataset)
  ? { cards: rawDataset as RawTarotCard[] }
  : (rawDataset as RawTarotDataset);

function loadSystemData(dataset: RawTarotDataset): TarotSystemData {
  const rawSuits = dataset.suit_philosophy ?? {};
  return {
    metadata: dataset.metadata ?? {},
    systemLevelRules: stringArray(dataset.system_level_rules),
    suitPhilosophy: {
      cups: normalizeSuitPhilosophyEntry(rawSuits.cups) ?? undefined,
      swords: normalizeSuitPhilosophyEntry(rawSuits.swords) ?? undefined,
      wands: normalizeSuitPhilosophyEntry(rawSuits.wands) ?? undefined,
      pentacles: normalizeSuitPhilosophyEntry(rawSuits.pentacles) ?? undefined,
    },
    numberMeanings:
      dataset.number_meanings && typeof dataset.number_meanings === "object"
        ? dataset.number_meanings
        : {},
    reversalLogic:
      dataset.reversal_logic && typeof dataset.reversal_logic === "object"
        ? dataset.reversal_logic
        : {},
    relationshipRules:
      dataset.relationship_rules && typeof dataset.relationship_rules === "object"
        ? dataset.relationship_rules
        : {},
    progressionSystems:
      dataset.progression_systems && typeof dataset.progression_systems === "object"
        ? dataset.progression_systems
        : {},
  };
}

export const tarotSystem: TarotSystemData = loadSystemData(datasetObject);

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
  const numerology = asTrimmedString(raw.numerology) || null;
  const suitPhilosophy = suit ? tarotSystem.suitPhilosophy[suit] ?? null : null;
  const suitMeaning =
    (raw.suit_meaning != null ? asTrimmedString(raw.suit_meaning) : "") ||
    formatSuitMeaning(suit, suitPhilosophy) ||
    null;

  const interpretationPatterns = parseInterpretationPatterns(raw.interpretation_patterns);
  const relationships = parseRelationships(raw.relationships);

  const imagePath = defaultImagePath(
    slug,
    asTrimmedString(raw.imagePath) || asTrimmedString(raw.image_path),
  );

  const meanings = deriveStructuredMeanings(raw, uprightMeaning, reversedMeaning, keywords, coreMeaning);
  const knowledgeMetadata = parseKnowledgeMetadata(raw.knowledge_metadata);
  const interpretationFallback =
    asTrimmedString((raw.symbolism_semantics as RawTarotSymbolismSemantics | undefined)?.interpretation) ||
    (coreMeaning ?? firstSentence(uprightMeaning));
  const imageryFallback = sym.detail?.objects?.length
    ? [...sym.detail.objects]
    : stringArray(raw.symbolism);
  const symbolismSemantics = parseSymbolismSemantics(
    raw.symbolism_semantics,
    imageryFallback,
    interpretationFallback,
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
    suitMeaning,
    suitPhilosophy,
    interpretationPatterns,
    relationships,
    meanings,
    knowledgeMetadata,
    symbolismSemantics,
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

export const tarotCards: TarotCard[] = loadAndNormalize(datasetObject);

export const cardsBySlug = new Map(tarotCards.map((c) => [c.slug, c]));
export const cardsByNameLower = new Map(
  tarotCards.map((c) => [c.name.trim().toLowerCase(), c]),
);
