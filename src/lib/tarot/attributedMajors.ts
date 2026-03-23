import major00 from "../../data/fidelity/major_arcana_00_07.json";
import major08 from "../../data/fidelity/major_arcana_08_14.json";
import major15 from "../../data/fidelity/major_arcana_15_21.json";
import type { FidelityMajorCard } from "./fidelityTypes";
import type { TarotCard } from "./types";

type MajorBundle = { cards?: FidelityMajorCard[] | null };

function mergedMajorCards(): FidelityMajorCard[] {
  const a = (major00 as MajorBundle).cards ?? [];
  const b = (major08 as MajorBundle).cards ?? [];
  const c = (major15 as MajorBundle).cards ?? [];
  return [...a, ...b, ...c].sort((x, y) => (x.number ?? 0) - (y.number ?? 0));
}

const ordered = mergedMajorCards();

const byNumber = new Map<number, FidelityMajorCard>();
for (const card of ordered) {
  if (typeof card.number === "number" && Number.isFinite(card.number)) {
    byNumber.set(card.number, card);
  }
}

/** All 22 majors from the attributed fidelity bundle (sorted by number). */
export const fidelityMajorArcana: readonly FidelityMajorCard[] = ordered;

/** Multi-source record for this major arcana card, if present in the fidelity bundle. */
export function getFidelityMajorForCard(card: TarotCard): FidelityMajorCard | null {
  if (card.arcana !== "major" || card.number == null) return null;
  return byNumber.get(card.number) ?? null;
}
