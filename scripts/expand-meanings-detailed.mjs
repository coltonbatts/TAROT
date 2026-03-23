/**
 * Expands `meanings.upright.detailed` and `meanings.reversed.detailed` for every card
 * in `src/data/cards.json` using structured prose built from existing metadata
 * (summary, keywords, symbolism_semantics, interpretation_patterns, relationships, etc.).
 *
 * Skips `the-fool` so hand-authored copy is preserved.
 *
 * Usage: node scripts/expand-meanings-detailed.mjs
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const CARDS_PATH = path.join(ROOT, "src", "data", "cards.json");

function hashSlug(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(h, 31) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function capSuit(s) {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function listNames(arr, max = 4) {
  if (!Array.isArray(arr) || !arr.length) return "";
  const slice = arr.slice(0, max);
  const tail = arr.length > max ? ", and others noted in the dataset" : "";
  return slice.join(", ") + tail;
}

function stripTrailingPeriods(s) {
  return String(s || "")
    .trim()
    .replace(/\.+$/g, "")
    .trim();
}

function expandCard(card) {
  const name = card.name;
  const slug = card.slug;
  const isMajor = card.arcana === "major";
  const mu = card.meanings?.upright ?? {};
  const mr = card.meanings?.reversed ?? {};
  const summaryU = (mu.summary || "").trim();
  const summaryR = (mr.summary || "").trim();
  const ip = card.interpretation_patterns ?? {};
  const dev = (ip.developmental_role || "").trim();
  const revModes = Array.isArray(ip.reversal_modes) ? ip.reversal_modes : [];
  const sysLinks = Array.isArray(ip.system_links) ? ip.system_links : [];
  const sem = card.symbolism_semantics;
  const symInterp = (sem?.interpretation || "").trim();
  const imagery = Array.isArray(sem?.imagery)
    ? sem.imagery
    : Array.isArray(card.symbolism)
      ? card.symbolism
      : [];
  const km = card.knowledge_metadata ?? {};
  const rel = card.relationships ?? {};
  const similar = rel.similar_cards ?? [];
  const contrasting = rel.contrasting_cards ?? [];
  const num = (card.numerology || "").trim();
  const archetype = (card.archetype || "").trim();
  const legacyU = (card.upright || "").trim();
  const h = hashSlug(slug);

  /** @type {string[]} */
  const upParts = [];

  if (isMajor) {
    const n = card.number;
    const ord = n === 0 ? "zero (unnumbered in the classical count)" : String(n);
    upParts.push(
      `${name} is Major Arcana ${ord} in the Rider–Waite–Smith major sequence. ${dev ? `${dev} ` : ""}${summaryU}`,
    );
  } else {
    const suit = card.suit || "";
    const suitLine =
      sysLinks[0] ||
      `${capSuit(suit)} cards carry this suit’s domain—will, feeling, mind, or matter—through a numbered or court stage.`;
    upParts.push(
      `${name} is a minor arcana card. ${suitLine} ${dev ? `${dev} ` : ""}${summaryU}`,
    );
  }

  if (symInterp) {
    let img = symInterp;
    if (imagery.length) {
      img += ` Motifs commonly cited for this plate include ${listNames(imagery, 8)}.`;
    }
    upParts.push(img);
  } else if (imagery.length) {
    const kw = (mu.keywords || []).slice(0, 4).join(", ");
    upParts.push(
      `The composition stresses ${listNames(imagery, 10)}—use these as concrete anchors while you relate the image to ${kw || "the card’s keywords"}.`,
    );
  } else {
    upParts.push(
      `Read the figure as ${archetype || "this archetype"} holding ${summaryU.toLowerCase() || "the card’s core theme"} in the narrative of the spread.`,
    );
  }

  const kw = (mu.keywords || []).join(", ");
  const quotedSummary = stripTrailingPeriods(summaryU) || "this card’s core theme";
  let pRead = `For readings, this deck’s upright sense for ${name} is: “${quotedSummary}.”`;
  if (kw) pRead += ` Working keywords: ${kw}.`;
  if (legacyU && legacyU !== summaryU && legacyU.length < 220) {
    pRead += ` The shorthand line “${legacyU}” restates the same thrust as practical advice.`;
  }
  upParts.push(pRead);

  const ctx = [];
  const simS = listNames(similar, 4);
  const conS = listNames(contrasting, 4);
  if (simS) ctx.push(`Recorded resonances in this dataset include ${simS}`);
  if (conS) ctx.push(`Contrasts are paired with ${conS}`);
  if (num) ctx.push(stripTrailingPeriods(num));
  const corr = [km.astrology, km.element, km.hebrew_letter].filter(Boolean).join(" · ");
  if (corr) ctx.push(`Bundled correspondence notes include ${corr}`);
  upParts.push(
    ctx.length
      ? `${ctx.map(stripTrailingPeriods).filter(Boolean).join(". ")}.`
      : `Let neighbors clarify whether ${name} describes inner posture, outer event, or the tension between them.`,
  );

  const uprightDetailed = upParts.join("\n\n");

  const rOpen = `Reversed, ${name} usually signals stress on the same archetype—blocked, delayed, privatized, or misdirected—rather than a neat moral opposite. ${summaryR}`;

  const rMid = revModes.length
    ? `Reversal shades named in this deck: ${revModes.join("; ")}. Against the upright sense (“${summaryU}”), ask whether the energy is absent, turned inward, exaggerated, or aimed at the wrong object.`
    : `Against the upright sense (“${summaryU}”), ask whether the energy is absent, turned inward, exaggerated, or aimed at the wrong object.`;

  const rClose =
    h % 2 === 0
      ? `Useful prompts: Where is commitment, clarity, or follow-through slipping? What would restore proportion without denying that the theme is still active?`
      : `Sit with: Is this avoidance, excess, or a necessary slowdown? What would honest next-step look like if the card’s lesson were taken seriously?`;

  const reversedDetailed = [rOpen, rMid, rClose].join("\n\n");

  return { uprightDetailed, reversedDetailed };
}

async function main() {
  const raw = await readFile(CARDS_PATH, "utf8");
  const data = JSON.parse(raw);
  if (!Array.isArray(data.cards)) {
    throw new Error("cards.json: expected top-level `cards` array");
  }

  let updated = 0;
  for (const card of data.cards) {
    if (card.slug === "the-fool") continue;
    if (!card.meanings?.upright || !card.meanings?.reversed) continue;
    const { uprightDetailed, reversedDetailed } = expandCard(card);
    card.meanings.upright.detailed = uprightDetailed;
    card.meanings.reversed.detailed = reversedDetailed;
    updated++;
  }

  await writeFile(CARDS_PATH, JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log(`Updated meanings.detailed for ${updated} cards (skipped the-fool).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
