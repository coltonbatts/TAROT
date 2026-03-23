import { cardsByNameLower, cardsBySlug, tarotCards } from "./normalize";
import type { TarotArcana, TarotCard, TarotSuit } from "./types";
import { matchesSearch } from "./search";

function asTrimmedString(value: unknown): string {
  if (value == null) return "";
  return String(value).trim();
}

export function getCardById(id: string): TarotCard | undefined {
  const key = id.trim();
  if (!key) return undefined;
  return tarotCards.find((c) => c.id === key);
}

function resolveRelationshipEntry(entry: unknown, selfSlug: string): TarotCard | undefined {
  if (entry == null) return undefined;

  if (typeof entry === "string") {
    const s = asTrimmedString(entry);
    if (!s) return undefined;
    const bySlug = getCardBySlug(s);
    if (bySlug && bySlug.slug !== selfSlug) return bySlug;
    return undefined;
  }

  if (typeof entry === "object" && !Array.isArray(entry)) {
    const o = entry as Record<string, unknown>;
    const slug = asTrimmedString(o.slug);
    const id = asTrimmedString(o.id);
    if (slug) {
      const c = getCardBySlug(slug);
      if (c && c.slug !== selfSlug) return c;
    }
    if (id) {
      const c = getCardById(id);
      if (c && c.slug !== selfSlug) return c;
    }
  }

  return undefined;
}

/** Resolves `card.relationships` to other deck cards (slug strings or `{ slug?, id? }`). Preserves order, dedupes by slug. */
export function getRelatedCards(card: TarotCard): TarotCard[] {
  const rel = card.relationships;
  if (!Array.isArray(rel) || rel.length === 0) return [];

  const seen = new Set<string>();
  const out: TarotCard[] = [];
  for (const entry of rel) {
    const resolved = resolveRelationshipEntry(entry, card.slug);
    if (!resolved || seen.has(resolved.slug)) continue;
    seen.add(resolved.slug);
    out.push(resolved);
  }
  return out;
}

export function getAllCards(): readonly TarotCard[] {
  return tarotCards;
}

export function getCardBySlug(slug: string): TarotCard | undefined {
  if (!slug) return undefined;
  return cardsBySlug.get(slug.trim());
}

export function getCardByName(name: string): TarotCard | undefined {
  const key = name.trim().toLowerCase();
  if (!key) return undefined;
  return cardsByNameLower.get(key);
}

function normalizeArcanaFilter(arcana: string): TarotArcana | undefined {
  const a = arcana.trim().toLowerCase();
  if (a === "major" || a === "minor") return a;
  return undefined;
}

export function getCardsByArcana(arcana: string): TarotCard[] {
  const a = normalizeArcanaFilter(arcana);
  if (!a) return [];
  return tarotCards.filter((c) => c.arcana === a);
}

function normalizeSuitFilter(suit: string): TarotSuit | undefined {
  const s = suit.trim().toLowerCase();
  if (s === "cups" || s === "swords" || s === "wands" || s === "pentacles") return s;
  if (s === "coins" || s === "disks") return "pentacles";
  return undefined;
}

export function getCardsBySuit(suit: string): TarotCard[] {
  const su = normalizeSuitFilter(suit);
  if (!su) return [];
  return tarotCards.filter((c) => c.suit === su);
}

export function searchCards(query: string): TarotCard[] {
  const q = query.trim();
  if (!q) return [...tarotCards];
  return tarotCards.filter((c) => matchesSearch(c, q));
}
