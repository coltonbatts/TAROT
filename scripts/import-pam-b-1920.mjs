/**
 * Copies 1920s Pam B scans into `public/card-images/{slug}.jpg` using the app’s
 * `src/data/cards.json` order. Writes `data/pam-b-1920-manifest.json`.
 *
 * Source filenames use indices 00, 02–78 (there is no _01_; _02 is The Magician).
 * Deck index i maps to source index: pam = i === 0 ? 0 : i + 1.
 */
import { copyFile, readFile, writeFile, readdir, mkdir } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const CARDS_JSON = path.join(ROOT, "src", "data", "cards.json");
const SOURCE_DIR = path.join(ROOT, "WS Tarot scans", "1920s (Pam B)");
const DEST_DIR = path.join(ROOT, "public", "card-images");
const MANIFEST_PATH = path.join(ROOT, "data", "pam-b-1920-manifest.json");

function pamIndexForDeckIndex(deckIndex) {
  if (deckIndex === 0) return 0;
  return deckIndex + 1;
}

function findSourceForPam(files, pam) {
  const token = `_${String(pam).padStart(2, "0")}_`;
  const hit = files.find((f) => f.includes(token) && /\.jpe?g$/i.test(f));
  return hit ?? null;
}

async function main() {
  const raw = JSON.parse(await readFile(CARDS_JSON, "utf8"));
  const cards = Array.isArray(raw) ? raw : raw.cards ?? [];
  if (cards.length !== 78) {
    throw new Error(`Expected 78 cards in cards.json, got ${cards.length}`);
  }

  const files = await readdir(SOURCE_DIR);
  await mkdir(DEST_DIR, { recursive: true });

  const manifestCards = [];

  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    const slug = String(card.slug ?? "").trim();
    const name = String(card.name ?? "").trim();
    if (!slug) throw new Error(`Card at index ${i} has no slug`);

    const pam = pamIndexForDeckIndex(i);
    const sourceFile = findSourceForPam(files, pam);
    if (!sourceFile) {
      throw new Error(`No source file for deck index ${i} (pam ${pam}, slug ${slug})`);
    }

    const destName = `${slug}.jpg`;
    const destPath = path.join(DEST_DIR, destName);
    await copyFile(path.join(SOURCE_DIR, sourceFile), destPath);

    manifestCards.push({
      deckIndex: i,
      name,
      slug,
      pamIndex: pam,
      sourceFile,
      canonicalFilename: destName,
    });
  }

  const manifest = {
    deck: "1920s Pam B (Rider-Waite-Smith)",
    sourceFolder: path.relative(ROOT, SOURCE_DIR),
    destinationFolder: path.relative(ROOT, DEST_DIR),
    generatedAt: new Date().toISOString(),
    mappingRule:
      "Deck order matches src/data/cards.json. Source scan indices are 00 then 02–78 (no _01_). pamIndex = deckIndex === 0 ? 0 : deckIndex + 1. Verified by image labels on Fool (_00), Magician (_02), World (_22), Ace of Wands (_23), King of Pentacles (_78).",
    cardCount: manifestCards.length,
    cards: manifestCards,
  };

  await mkdir(path.dirname(MANIFEST_PATH), { recursive: true });
  await writeFile(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

  console.log(`Wrote ${manifestCards.length} images to ${path.relative(ROOT, DEST_DIR)}`);
  console.log(`Manifest: ${path.relative(ROOT, MANIFEST_PATH)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
