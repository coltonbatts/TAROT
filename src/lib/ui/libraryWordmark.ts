/**
 * Home wordmark presets (uppercase “TAROT”). Compare: `/?mark=0` … `/?mark=4`
 * Aliases: a–e, or ids: monument, playfair, cormorant, heritage, editorial.
 */
export const LIBRARY_WORDMARK_PRESETS = [
  {
    id: "monument",
    /** Cinzel — incised caps */
    className:
      "font-wordmark font-medium uppercase tracking-[0.56em] text-[clamp(1.35rem,5.4vw,2.95rem)] leading-none text-bone pl-[0.38em]",
  },
  {
    id: "playfair",
    /** Playfair Display — high-contrast editorial */
    className:
      "font-wordmark-playfair font-semibold uppercase tracking-[0.5em] text-[clamp(1.3rem,5.2vw,2.85rem)] leading-none text-bone pl-[0.34em]",
  },
  {
    id: "cormorant",
    /** Cormorant — tall classical serif */
    className:
      "font-wordmark-cormorant font-semibold uppercase tracking-[0.52em] text-[clamp(1.4rem,5.5vw,3rem)] leading-none text-bone pl-[0.36em]",
  },
  {
    id: "heritage",
    /** Fraunces — soft variable serif (card titles) */
    className:
      "font-display font-medium uppercase tracking-[0.36em] text-[clamp(1.32rem,5.3vw,2.9rem)] leading-none text-bone pl-[0.22em]",
  },
  {
    id: "editorial",
    /** Newsreader — newsprint rhythm */
    className:
      "font-body font-normal uppercase tracking-[0.42em] text-[clamp(1.32rem,5.3vw,2.85rem)] leading-none text-bone pl-[0.28em]",
  },
] as const;

export type LibraryWordmarkPresetId = (typeof LIBRARY_WORDMARK_PRESETS)[number]["id"];

export function getLibraryWordmarkPresetIndex(searchParams: URLSearchParams): number {
  const m = (searchParams.get("mark") ?? "").toLowerCase().trim();
  const byName: Record<string, number> = {
    monument: 0,
    cinzel: 0,
    playfair: 1,
    display: 1,
    cormorant: 2,
    classical: 2,
    heritage: 3,
    fraunces: 3,
    editorial: 4,
    newsreader: 4,
    a: 0,
    b: 1,
    c: 2,
    d: 3,
    e: 4,
  };
  if (m in byName) return byName[m]!;
  const n = Number.parseInt(m, 10);
  if (n >= 0 && n < LIBRARY_WORDMARK_PRESETS.length) return n;
  return 0;
}
