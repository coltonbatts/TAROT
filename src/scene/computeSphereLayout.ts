/**
 * Fibonacci sphere (even spacing on a shell): the full deck forms one tight “orb”
 * you orbit around. Card *order* in the scene follows your filtered `cards[]` array
 * (same canonical deck order as `getAllCards()` / `tarotCards`: Majors, then Wands/Cups/Swords/Pentacles
 * per your JSON)—there is no required spatial layout in tarot tradition; spreads are
 * for readings, not for a reference library.
 */
export type SphereSlot = {
  position: [number, number, number];
};

const PHI = (1 + Math.sqrt(5)) / 2;

export function computeSphereLayout(count: number): SphereSlot[] {
  if (count <= 0) {
    return [];
  }

  if (count === 1) {
    return [{ position: [0, 0, 4.35] }];
  }

  /** Tighter shell: cards stay in arm’s reach after zoom; radius grows gently with N. */
  const radius = Math.max(3.15, Math.min(4.55, 2.35 + count * 0.028));
  /** Slight Y squash (ellipsoid) so the cluster reads better from a typical “above table” orbit. */
  const ySquash = 0.8;

  const slots: SphereSlot[] = [];
  for (let i = 0; i < count; i++) {
    const t = (i + 0.5) / count;
    const inclination = Math.acos(1 - 2 * t);
    const azimuth = 2 * Math.PI * PHI * i;
    const sinI = Math.sin(inclination);
    const x = radius * sinI * Math.cos(azimuth);
    const y = radius * Math.cos(inclination) * ySquash;
    const z = radius * sinI * Math.sin(azimuth);
    slots.push({ position: [x, y, z] });
  }

  return slots;
}
