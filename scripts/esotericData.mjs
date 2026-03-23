/**
 * Multi-tradition synthesis layer (RWS + decans + Qabalistic correspondences)
 * aligned with the research brief; consumed by buildTarotKnowledge.mjs.
 */

function firstSentence(text) {
  const t = String(text || "").trim();
  if (!t) return "";
  const cut = t.match(/^(.+?[.!?])(\s|$)/);
  return cut ? cut[1].trim() : t;
}

function keywordsFromReversed(reversed) {
  const t = String(reversed || "").trim();
  if (!t) return [];
  return t
    .split(/[,;]|\bor\b/gi)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 6);
}

/** @type {Record<number, Record<string, string>>} */
const majorEsotericByNumber = {
  0: {
    element: "Air",
    astrology: "Uranus",
    hebrew_letter: "Aleph",
    qabalistic_path: "11 · Kether → Chokmah",
    chakra: "Crown",
  },
  1: {
    astrology: "Mercury",
    hebrew_letter: "Beth",
    qabalistic_path: "12 · Kether → Binah",
    chakra: "Throat",
  },
  2: {
    astrology: "Moon",
    hebrew_letter: "Gimel",
    qabalistic_path: "13 · Kether → Tiphereth",
    chakra: "Third eye",
  },
  3: {
    astrology: "Venus",
    hebrew_letter: "Daleth",
    qabalistic_path: "14 · Chokmah → Binah",
    chakra: "Heart / sacral",
  },
  4: {
    element: "Fire",
    astrology: "Aries · Mars",
    hebrew_letter: "Heh",
    qabalistic_path: "15 · Chokmah → Tiphereth",
    chakra: "Root",
  },
  5: {
    astrology: "Taurus · Venus",
    hebrew_letter: "Vav",
    qabalistic_path: "16 · Chokmah → Chesed",
    chakra: "Throat",
  },
  6: {
    astrology: "Gemini · Mercury",
    hebrew_letter: "Zayin",
    qabalistic_path: "17 · Binah → Tiphereth",
    chakra: "Heart",
  },
  7: {
    astrology: "Cancer · Moon",
    hebrew_letter: "Chet",
    qabalistic_path: "18 · Binah → Geburah",
    chakra: "Throat",
  },
  8: {
    astrology: "Leo · Sun",
    hebrew_letter: "Tet",
    qabalistic_path: "19 · Chesed → Geburah",
    chakra: "Solar plexus",
  },
  9: {
    astrology: "Virgo · Mercury",
    hebrew_letter: "Yod",
    qabalistic_path: "20 · Chesed → Tiphereth",
    chakra: "Third eye",
  },
  10: {
    astrology: "Jupiter",
    hebrew_letter: "Kaph",
    qabalistic_path: "21 · Chesed → Netzach",
    chakra: "Solar plexus",
  },
  11: {
    astrology: "Libra · Venus",
    hebrew_letter: "Lamed",
    qabalistic_path: "22 · Geburah → Tiphereth",
    chakra: "Heart",
  },
  12: {
    element: "Water",
    astrology: "Neptune",
    hebrew_letter: "Mem",
    qabalistic_path: "23 · Geburah → Hod",
    chakra: "Third eye",
  },
  13: {
    element: "Water",
    astrology: "Scorpio · Pluto",
    hebrew_letter: "Nun",
    qabalistic_path: "24 · Tiphereth → Netzach",
    chakra: "Heart",
  },
  14: {
    astrology: "Sagittarius · Jupiter",
    hebrew_letter: "Samekh",
    qabalistic_path: "25 · Tiphereth → Yesod",
    chakra: "Solar plexus",
  },
  15: {
    astrology: "Capricorn · Saturn",
    hebrew_letter: "Ayin",
    qabalistic_path: "26 · Tiphereth → Hod",
    chakra: "Root",
  },
  16: {
    element: "Fire",
    astrology: "Mars",
    hebrew_letter: "Peh",
    qabalistic_path: "27 · Netzach → Hod",
    chakra: "Crown",
  },
  17: {
    astrology: "Aquarius · Uranus",
    hebrew_letter: "Tzaddi",
    qabalistic_path: "28 · Netzach → Yesod",
    chakra: "Crown",
  },
  18: {
    astrology: "Pisces · Neptune",
    hebrew_letter: "Qoph",
    qabalistic_path: "29 · Netzach → Malkuth",
    chakra: "Third eye",
  },
  19: {
    astrology: "Sun",
    hebrew_letter: "Resh",
    qabalistic_path: "30 · Hod → Yesod",
    chakra: "Solar plexus",
  },
  20: {
    element: "Fire",
    astrology: "Pluto",
    hebrew_letter: "Shin",
    qabalistic_path: "31 · Hod → Malkuth",
    chakra: "Crown",
  },
  21: {
    element: "Earth",
    astrology: "Saturn",
    hebrew_letter: "Tav",
    qabalistic_path: "32 · Yesod → Malkuth",
    chakra: "Root",
  },
};

/** @type {Record<string, Record<number, string>>} */
const pipDecanBySuit = {
  wands: {
    2: "Mars in Aries",
    3: "Sun in Aries",
    4: "Venus in Aries",
    5: "Saturn in Leo",
    6: "Jupiter in Leo",
    7: "Mars in Leo",
    8: "Mercury in Sagittarius",
    9: "Moon in Sagittarius",
    10: "Saturn in Sagittarius",
  },
  cups: {
    2: "Venus in Cancer",
    3: "Mercury in Cancer",
    4: "Moon in Cancer",
    5: "Mars in Scorpio",
    6: "Sun in Scorpio",
    7: "Venus in Scorpio",
    8: "Saturn in Pisces",
    9: "Jupiter in Pisces",
    10: "Mars in Pisces",
  },
  swords: {
    2: "Moon in Libra",
    3: "Saturn in Libra",
    4: "Jupiter in Libra",
    5: "Venus in Aquarius",
    6: "Mercury in Aquarius",
    7: "Moon in Aquarius",
    8: "Jupiter in Gemini",
    9: "Mars in Gemini",
    10: "Sun in Gemini",
  },
  pentacles: {
    2: "Jupiter in Capricorn",
    3: "Mars in Capricorn",
    4: "Sun in Capricorn",
    5: "Mercury in Taurus",
    6: "Moon in Taurus",
    7: "Saturn in Taurus",
    8: "Sun in Virgo",
    9: "Venus in Virgo",
    10: "Mercury in Virgo",
  },
};

/** @type {Record<string, Record<string, string>>} */
const courtElementalComposite = {
  wands: {
    page: "Earth of Fire",
    knight: "Air of Fire",
    queen: "Water of Fire",
    king: "Fire of Fire",
  },
  cups: {
    page: "Earth of Water",
    knight: "Air of Water",
    queen: "Water of Water",
    king: "Fire of Water",
  },
  swords: {
    page: "Earth of Air",
    knight: "Air of Air",
    queen: "Water of Air",
    king: "Fire of Air",
  },
  pentacles: {
    page: "Earth of Earth",
    knight: "Air of Earth",
    queen: "Water of Earth",
    king: "Fire of Earth",
  },
};

/** @type {Record<string, string>} */
const aceRootPhrase = {
  wands: "Root of Fire — pure spark of will and new creative opportunity.",
  cups: "Root of Water — beginning of love, joy, and spiritual communion.",
  swords: "Root of Air — mental clarity, breakthrough, and the triumph of truth.",
  pentacles: "Root of Earth — seed of material success and tangible opportunity.",
};

/** @type {Record<string, string>} */
const majorInterpretation = {
  "The Fool":
    "Zero-point potential: the unformed moment before pattern; associated with sudden breakthroughs and stepping outside convention.",
  "The Magician":
    "Conscious will channeling inspiration into form — the Hermetic bridge between above and below; skill, speech, and the four tools in play.",
  "The High Priestess":
    "Guardian of the unmanifest: intuition, lunar depth, and knowledge held in stillness between balanced opposites.",
  "The Empress":
    "The great mother of manifestation — Venusian abundance, fertility, and the sensual garden where life flourishes.",
  "The Emperor":
    "Law, boundary, and temporal authority — Mars–Aries ordering force that stabilizes creative chaos into structure.",
  "The Hierophant":
    "Tradition as bridge: formal teaching, shared doctrine, and the social body of the sacred.",
  "The Lovers":
    "Moral and aesthetic alignment — not only romance but the inner harmony required to choose a path truthfully.",
  "The Chariot":
    "Directed will mastering opposing drives — triumph in the world through focus and containment of conflicting forces.",
  Strength:
    "Power through compassion: instinct integrated without domination — the gentle closure of the lion’s jaws.",
  "The Hermit":
    "The inward lamp — measured retreat, discrimination, and wisdom offered to those who walk behind.",
  "Wheel of Fortune":
    "Cyclical fate and karmic turning — ascent and descent beyond ego control; a hinge in the story.",
  Justice:
    "Clear reckoning — Libra’s scales; cause, effect, and the ethics of what must now be owned.",
  "The Hanged Man":
    "Sacred pause: enlightenment through voluntary suspension — seeing from an inverted angle.",
  Death:
    "Transformation, not annihilation — the necessary clearing that makes room for a new cycle (Scorpio–Pluto).",
  Temperance:
    "Alchemical mixing — temperate middle path, healing integration, and measured exchange between vessels.",
  "The Devil":
    "Self-imposed bondage of appetite and shadow — chains loose enough to escape once the knot is seen.",
  "The Tower":
    "Sudden restructuring — lightning striking false security so a truer architecture can emerge.",
  "The Star":
    "After the storm, quiet renewal — hope, guidance, and the soul’s drink from living water.",
  "The Moon":
    "The lucid–irrational border — dreams, projections, and navigation by uncertain light.",
  "The Sun":
    "Radiant clarity and vital joy — the self shown without concealment; fruition in the open.",
  Judgement:
    "The call to rise — reckoning, rebirth, and answering what transcends the personal story.",
  "The World":
    "Integrated completion — the dance inside the wreath; mastery that closes the ring and opens the next.",
};

function knowledgeMetadataFor(card) {
  if (card.arcana === "major" && typeof card.number === "number") {
    const row = majorEsotericByNumber[card.number];
    if (!row) return {};
    return { ...row };
  }
  if (card.arcana === "minor" && card.suit && typeof card.number === "number") {
    const decan = pipDecanBySuit[card.suit]?.[card.number];
    if (decan) return { astrology: decan };
    if (card.number === 1 && aceRootPhrase[card.suit]) {
      return { astrology: aceRootPhrase[card.suit] };
    }
  }
  if (card.arcana === "minor" && card.suit && typeof card.number === "string") {
    const rank = card.number;
    const composite = courtElementalComposite[card.suit]?.[rank];
    if (composite) return { elemental_composite: composite };
  }
  return {};
}

function interpretationFor(card) {
  if (card.arcana === "major" && majorInterpretation[card.name]) {
    return majorInterpretation[card.name];
  }
  if (card.arcana === "minor" && card.suit && typeof card.number === "number") {
    const n = card.number;
    if (n === 1) return aceRootPhrase[card.suit] || "";
    const decan = pipDecanBySuit[card.suit]?.[n];
    const base = decan
      ? `${decan} decan: ${card.core_meaning || firstSentence(card.upright)}`
      : card.core_meaning || firstSentence(card.upright);
    return base;
  }
  if (card.arcana === "minor" && typeof card.number === "string") {
    const composite = courtElementalComposite[card.suit]?.[card.number];
    return composite
      ? `${composite} — ${card.core_meaning || firstSentence(card.upright)}`
      : card.core_meaning || firstSentence(card.upright);
  }
  return card.core_meaning || firstSentence(card.upright);
}

/**
 * @param {object} card
 * @returns {object}
 */
export function enrichTarotCard(card) {
  const imagery = Array.isArray(card.symbolism) ? [...card.symbolism] : [];
  const meanings = {
    upright: {
      keywords: Array.isArray(card.keywords) ? [...card.keywords] : [],
      summary: (card.core_meaning || firstSentence(card.upright)).trim(),
      detailed: String(card.upright || "").trim(),
    },
    reversed: {
      keywords: keywordsFromReversed(card.reversed),
      summary: firstSentence(card.reversed),
      detailed: String(card.reversed || "").trim(),
    },
  };

  const knowledge_metadata = knowledgeMetadataFor(card);
  const symbolism_semantics = {
    imagery,
    interpretation: interpretationFor(card),
  };

  return {
    ...card,
    meanings,
    knowledge_metadata,
    symbolism_semantics,
  };
}
