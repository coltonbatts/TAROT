/**
 * Legacy maintenance script (optional). Runtime data lives in `tarot_dataset_simple.json`
 * at the repo root; the UI does not import `src/data/cards.json`.
 * Use this only if you still want to regenerate that JSON and sync images from `data/source/`.
 */
import { mkdir, readFile, writeFile, copyFile, access, readdir } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();

const SOURCE_DIR = path.join(ROOT, "data", "source");
const RAW_TAROT_JSON = path.join(SOURCE_DIR, "tarot.json");
const RAW_TAROT_INTERPRETATIONS_JSON = path.join(
  SOURCE_DIR,
  "tarot-interpretations.json",
);
const RAW_TAROT_DESCRIPTIONS_JSON = path.join(
  SOURCE_DIR,
  "tarot-descriptions.json",
);
const OUTPUT_JSON = path.join(ROOT, "src", "data", "cards.json");
const OUTPUT_IMAGE_DIR = path.join(ROOT, "public", "card-images");
const CANONICAL_SCAN_DIR = path.join(ROOT, "WS Tarot scans", "1909 (Pam A)");
const SOURCE_TAROT_URL =
  "https://raw.githubusercontent.com/metabismuth/tarot-json/master/tarot.json";
const SOURCE_INTERPRETATIONS_URL =
  "https://raw.githubusercontent.com/dariusk/corpora/master/data/divination/tarot_interpretations.json";
const SOURCE_DESCRIPTIONS_URL =
  "https://gist.githubusercontent.com/ajzeigert/32461d73c17cfd8fd475c0049db451f5/raw/";

function slugify(input) {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function normalizeRank(value) {
  const raw = String(value ?? "").trim().toLowerCase();
  const numberToWord = {
    "1": "ace",
    "2": "two",
    "3": "three",
    "4": "four",
    "5": "five",
    "6": "six",
    "7": "seven",
    "8": "eight",
    "9": "nine",
    "10": "ten",
  };
  const courtToWord = {
    "11": "page",
    "12": "knight",
    "13": "queen",
    "14": "king",
    page: "page",
    knight: "knight",
    queen: "queen",
    king: "king",
  };
  return numberToWord[raw] ?? courtToWord[raw] ?? raw;
}

async function readOrDownloadJson(filePath, url) {
  try {
    await access(filePath);
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status}`);
    }
    const text = await response.text();
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, text);
    return JSON.parse(text);
  }
}

function normalizeKey(card) {
  const suitAliases = {
    coins: "pentacles",
    pentacles: "pentacles",
    cups: "cups",
    swords: "swords",
    wands: "wands",
    major: "major",
  };
  const suit = suitAliases[(card.suit ?? "").toLowerCase()] ?? (card.suit ?? "").toLowerCase();
  const arcana = (card.arcana ?? card.suit ?? "").toLowerCase();
  const rank = normalizeRank(card.rank ?? card.number);
  return `${arcana === "major arcana" || suit === "major" ? "major" : suit}:${rank}`;
}

function sentenceList(values) {
  return values
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => (/[.!?]$/.test(value) ? value : `${value}.`))
    .join("\n\n");
}

function cleanDescription(value) {
  return value.replace(/\s+/g, " ").trim();
}

async function main() {
  const tarotSource = await readOrDownloadJson(RAW_TAROT_JSON, SOURCE_TAROT_URL);
  const meaningSource = await readOrDownloadJson(
    RAW_TAROT_INTERPRETATIONS_JSON,
    SOURCE_INTERPRETATIONS_URL,
  );
  const descriptionSource = await readOrDownloadJson(
    RAW_TAROT_DESCRIPTIONS_JSON,
    SOURCE_DESCRIPTIONS_URL,
  );

  const tarotCards = tarotSource.cards;
  const meaningCards = meaningSource.tarot_interpretations;
  const descriptionCards = descriptionSource.tarot;

  const meaningsByKey = new Map(
    meaningCards.map((card) => [normalizeKey(card), card]),
  );

  const scanEntries = await readdir(CANONICAL_SCAN_DIR, {
    withFileTypes: true,
  });
  const scanFiles = scanEntries
    .filter((entry) => entry.isFile() && entry.name !== "back.jpg")
    .sort((a, b) => {
      const left = Number(a.name.split("_")[1]);
      const right = Number(b.name.split("_")[1]);
      return left - right || a.name.localeCompare(b.name);
    });

  if (tarotCards.length !== scanFiles.length) {
    throw new Error(
      `Card count mismatch: dataset has ${tarotCards.length}, scans have ${scanFiles.length}`,
    );
  }

  if (descriptionCards.length !== tarotCards.length) {
    throw new Error(
      `Description count mismatch: dataset has ${tarotCards.length}, descriptions have ${descriptionCards.length}`,
    );
  }

  await mkdir(OUTPUT_IMAGE_DIR, { recursive: true });
  await mkdir(path.dirname(OUTPUT_JSON), { recursive: true });

  const cards = [];

  for (const [index, card] of tarotCards.entries()) {
    const meaningCard = meaningsByKey.get(
      normalizeKey({
        arcana: card.arcana,
        suit: card.suit ?? "major",
        rank: card.number,
        number: card.number,
      }),
    );

    if (!meaningCard) {
      throw new Error(`Missing meaning entry for ${card.name}`);
    }

    const sourceScan = scanFiles[index];
    const descriptionCard = descriptionCards[index];
    const slug = slugify(card.name);
    const imageFile = `${slug}.jpg`;
    const sourcePath = path.join(CANONICAL_SCAN_DIR, sourceScan.name);
    const targetPath = path.join(OUTPUT_IMAGE_DIR, imageFile);
    await copyFile(sourcePath, targetPath);

    const description = descriptionCard?.description ?? "";
    const summary =
      meaningCard.fortune_telling?.slice(0, 2).join(" ") ??
      descriptionCard?.interpretation
        ?.split("Reversed:")[0]
        .replace(/\s+/g, " ")
        .trim() ??
      "";

    const meaningRank = normalizeRank(meaningCard.rank);
    cards.push({
      id: `${card.arcana === "Major Arcana" ? "major" : (card.suit ?? "major").toLowerCase()}-${card.number}`,
      slug,
      name: card.name,
      arcana: card.arcana === "Major Arcana" ? "major" : "minor",
      suit: card.suit ? card.suit.toLowerCase() : undefined,
      number: Number(card.number),
      rank:
        card.arcana === "Major Arcana"
          ? undefined
          : meaningRank === "ace"
            ? "ace"
            : meaningRank === "page"
              ? "page"
              : meaningRank === "knight"
                ? "knight"
                : meaningRank === "queen"
                  ? "queen"
                  : meaningRank === "king"
                    ? "king"
                    : meaningRank === "two"
                      ? "two"
                      : meaningRank === "three"
                        ? "three"
                        : meaningRank === "four"
                          ? "four"
                          : meaningRank === "five"
                            ? "five"
                            : meaningRank === "six"
                              ? "six"
                              : meaningRank === "seven"
                                ? "seven"
                                : meaningRank === "eight"
                                  ? "eight"
                                  : meaningRank === "nine"
                                    ? "nine"
                                    : meaningRank === "ten"
                                      ? "ten"
                                      : meaningRank,
      imagePath: `/card-images/${imageFile}`,
      keywords: meaningCard.keywords?.map((keyword) => keyword.toLowerCase()) ?? [],
      uprightMeaning: sentenceList(meaningCard.meanings.light),
      reversedMeaning: sentenceList(meaningCard.meanings.shadow),
      description: description ? cleanDescription(description) : undefined,
      symbolism: summary ? cleanDescription(summary) : undefined,
    });
  }

  await writeFile(OUTPUT_JSON, `${JSON.stringify(cards, null, 2)}\n`);
  await copyFile(
    path.join(CANONICAL_SCAN_DIR, "back.jpg"),
    path.join(OUTPUT_IMAGE_DIR, "back.jpg"),
  ).catch(() => {});
  console.log(`Wrote ${cards.length} cards to ${path.relative(ROOT, OUTPUT_JSON)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
