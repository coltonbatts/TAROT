/**
 * Writes WebP thumbnails under public/card-images/thumbs/ for every JPG
 * in public/card-images (skips the thumbs directory itself).
 *
 * Run after adding or replacing scans: `npm run generate:thumbs`
 */
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const CARD_DIR = path.join(ROOT, "public", "card-images");
const THUMB_DIR = path.join(CARD_DIR, "thumbs");

const MAX_WIDTH = 480;
const WEBP_QUALITY = 82;

async function main() {
  await fs.mkdir(THUMB_DIR, { recursive: true });
  const entries = await fs.readdir(CARD_DIR, { withFileTypes: true });
  const jpgs = entries.filter((e) => e.isFile() && e.name.toLowerCase().endsWith(".jpg"));

  if (!jpgs.length) {
    console.warn(`No .jpg files in ${path.relative(ROOT, CARD_DIR)}`);
    return;
  }

  let ok = 0;
  for (const e of jpgs) {
    const base = e.name.replace(/\.jpg$/i, "");
    const inPath = path.join(CARD_DIR, e.name);
    const outPath = path.join(THUMB_DIR, `${base}.webp`);
    await sharp(inPath)
      .rotate()
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY, effort: 4 })
      .toFile(outPath);
    ok += 1;
  }

  console.log(`Wrote ${ok} thumbnails to ${path.relative(ROOT, THUMB_DIR)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
