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
    const byName = getCardByName(s);
    if (byName && byName.slug !== selfSlug) return byName;
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
    const name = asTrimmedString(o.name);
    if (name) {
      const c = getCardByName(name);
      if (c && c.slug !== selfSlug) return c;
    }
  }

  return undefined;
}

function resolveRelationshipList(entries: unknown[], selfSlug: string): TarotCard[] {
  const seen = new Set<string>();
  const out: TarotCard[] = [];
  for (const entry of entries) {
    const resolved = resolveRelationshipEntry(entry, selfSlug);
    if (!resolved || seen.has(resolved.slug)) continue;
    seen.add(resolved.slug);
    out.push(resolved);
  }
  return out;
}

export function getResolvedRelationshipGroups(card: TarotCard): {
  similar: TarotCard[];
  contrasting: TarotCard[];
  previous: TarotCard[];
  next: TarotCard[];
} {
  return {
    similar: resolveRelationshipList(card.relationships.similar, card.slug),
    contrasting: resolveRelationshipList(card.relationships.contrasting, card.slug),
    previous: resolveRelationshipList(card.relationships.previous, card.slug),
    next: resolveRelationshipList(card.relationships.next, card.slug),
  };
}

/** Resolves all relationship groups into a flat, ordered related-card list. */
export function getRelatedCards(card: TarotCard): TarotCard[] {
  const groups = getResolvedRelationshipGroups(card);
  const seen = new Set<string>();
  const merged: TarotCard[] = [];
  for (const item of [...groups.similar, ...groups.contrasting, ...groups.previous, ...groups.next]) {
    if (seen.has(item.slug)) continue;
    seen.add(item.slug);
    merged.push(item);
  }
  return merged;
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
