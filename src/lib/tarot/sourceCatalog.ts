import catalog from "../../data/fidelity/source-catalog.json";
import type { FidelitySourceRef } from "./fidelityTypes";

const sources: FidelitySourceRef[] = Array.isArray(catalog.sources) ? catalog.sources : [];

/** Bibliography rows shared by attributed card UI without importing full `system.json`. */
export function getFidelityPrimarySources(): FidelitySourceRef[] {
  return sources;
}

export function fidelitySourceTitle(sourceId: string | null | undefined): string | undefined {
  if (!sourceId) return undefined;
  const hit = sources.find((s) => s.id === sourceId);
  if (!hit) return undefined;
  const author = hit.author?.trim();
  const year = hit.year != null ? String(hit.year) : "";
  if (author && year) return `${author} (${year})`;
  return hit.title?.trim() || hit.id || undefined;
}
