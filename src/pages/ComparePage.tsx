import { useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { TarotCardImage } from "../components/TarotCardImage";
import {
  formatCardMetaShort,
  formatReferenceMetaLine,
  getCardBySlug,
  getResolvedRelationshipGroups,
  type TarotCard,
} from "../lib/tarot";
import { tarotCardThumbnailPath } from "../lib/tarot/thumbnailPath";

const MAX_CARDS = 6;

function normalizeSlugs(raw: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of raw) {
    const t = s.trim();
    if (!t || seen.has(t)) continue;
    seen.add(t);
    out.push(t);
    if (out.length >= MAX_CARDS) break;
  }
  return out;
}

function sharedKeywords(cards: TarotCard[]): string[] {
  if (cards.length < 2) return [];
  const lowerSets = cards.map((c) => new Set(c.meanings.upright.keywords.map((k) => k.toLowerCase())));
  const [first, ...rest] = lowerSets;
  return [...first].filter((k) => rest.every((s) => s.has(k))).sort();
}

function sharedElement(cards: TarotCard[]): string | null {
  const els = cards.map((c) => c.knowledgeMetadata?.element?.trim()).filter(Boolean) as string[];
  if (els.length !== cards.length) return null;
  const u = new Set(els.map((e) => e.toLowerCase()));
  return u.size === 1 ? els[0]! : null;
}

function crossDatasetNotes(cards: TarotCard[]): string[] {
  const notes: string[] = [];
  const seen = new Set<string>();
  for (let i = 0; i < cards.length; i++) {
    for (let j = 0; j < cards.length; j++) {
      if (i === j) continue;
      const a = cards[i]!;
      const b = cards[j]!;
      const g = getResolvedRelationshipGroups(a);
      const push = (line: string) => {
        if (seen.has(line)) return;
        seen.add(line);
        notes.push(line);
      };
      if (g.similar.some((c) => c.slug === b.slug)) {
        push(`${a.name} → similar: ${b.name}`);
      }
      if (g.contrasting.some((c) => c.slug === b.slug)) {
        push(`${a.name} → contrasting: ${b.name}`);
      }
      if (g.previous.some((c) => c.slug === b.slug)) {
        push(`${a.name} → sequence before: ${b.name}`);
      }
      if (g.next.some((c) => c.slug === b.slug)) {
        push(`${a.name} → sequence after: ${b.name}`);
      }
    }
  }
  return notes;
}

export function ComparePage() {
  const [searchParams] = useSearchParams();
  const slugs = useMemo(() => normalizeSlugs(searchParams.getAll("c")), [searchParams]);

  const cards = useMemo(() => {
    const out: TarotCard[] = [];
    for (const slug of slugs) {
      const c = getCardBySlug(slug);
      if (c) out.push(c);
    }
    return out;
  }, [slugs]);

  const sharedKw = useMemo(() => sharedKeywords(cards), [cards]);
  const element = useMemo(() => sharedElement(cards), [cards]);
  const datasetLines = useMemo(() => crossDatasetNotes(cards), [cards]);

  useEffect(() => {
    document.title = cards.length >= 2 ? `Compare · ${cards.length} cards` : "Compare · Tarot";
  }, [cards.length]);

  return (
    <article className="mx-auto w-full max-w-[1400px] px-4 pb-28 pt-6 sm:px-6 lg:px-10 lg:pt-8">
      <nav className="mb-8 flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-line/60 pb-6">
        <Link
          to="/"
          className="font-mono text-sm text-muted transition hover:text-bone focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-line-strong"
        >
          ← Index
        </Link>
        <Link
          to="/system"
          className="font-mono text-sm text-muted transition hover:text-bone focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-line-strong"
        >
          Study
        </Link>
      </nav>

      {cards.length < 2 ? (
        <div className="max-w-xl space-y-4 border border-line bg-panel p-8">
          <h1 className="font-display text-2xl font-medium tracking-tight">Compare</h1>
          <p className="text-sm text-muted">
            Index → &ldquo;Select for compare&rdquo; → pick cards → Open compare. URL:{" "}
            <code className="font-mono text-[11px] text-faint">/compare?c=…&amp;c=…</code>
          </p>
          <Link
            to="/"
            className="inline-flex border border-line px-4 py-2 font-mono text-sm text-bone hover:border-line-strong focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-line-strong"
          >
            Index
          </Link>
        </div>
      ) : (
        <>
          <header className="mb-10">
            <h1 className="font-display text-[clamp(1.75rem,4vw,2.5rem)] font-medium tracking-tight">Compare</h1>
            <p className="mt-2 font-mono text-[10px] text-muted">{cards.length} cards · upright keywords & dataset links</p>
          </header>

          {(sharedKw.length > 0 || element || datasetLines.length > 0) && (
            <section className="mb-12 space-y-6 border border-line/60 bg-panel/40 p-6" aria-label="Overlap">
              {sharedKw.length > 0 ? (
                <div>
                  <h2 className="mb-2 font-mono text-[10px] uppercase tracking-label text-muted">Shared upright keywords</h2>
                  <p className="text-sm leading-relaxed text-bone/90">{sharedKw.join(" · ")}</p>
                </div>
              ) : null}
              {element ? (
                <div>
                  <h2 className="mb-2 font-mono text-[10px] uppercase tracking-label text-muted">Shared element (metadata)</h2>
                  <p className="text-sm text-bone/90">{element}</p>
                </div>
              ) : null}
              {datasetLines.length > 0 ? (
                <div>
                  <h2 className="mb-2 font-mono text-[10px] uppercase tracking-label text-muted">Recorded relationships</h2>
                  <ul className="list-inside list-disc space-y-1 font-mono text-[11px] text-muted">
                    {datasetLines.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </section>
          )}

          <div className="grid gap-10 [grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr))]">
            {cards.map((card) => (
              <section key={card.slug} className="border border-line/50 bg-void/40 p-4" aria-label={card.name}>
                <Link
                  to={`/cards/${card.slug}`}
                  className="mb-4 block outline-none focus-visible:ring-1 focus-visible:ring-line-strong"
                >
                  <div className="mx-auto aspect-[2/3] max-w-[200px] overflow-hidden bg-void">
                    <TarotCardImage
                      src={tarotCardThumbnailPath(card.imagePath)}
                      highResSrc={card.imagePath}
                      alt=""
                      className="h-full w-full object-contain object-center"
                      loading="lazy"
                    />
                  </div>
                </Link>
                <h2 className="font-display text-lg font-medium leading-tight">
                  <Link
                    to={`/cards/${card.slug}`}
                    className="hover:text-bone/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-line-strong"
                  >
                    {card.name}
                  </Link>
                </h2>
                <p className="mt-1 font-mono text-[10px] text-muted">{formatCardMetaShort(card)}</p>
                <p className="mt-1 font-mono text-[10px] leading-relaxed text-faint">{formatReferenceMetaLine(card)}</p>
                {card.knowledgeMetadata?.astrology ? (
                  <p className="mt-3 font-mono text-[10px] text-muted">
                    {card.knowledgeMetadata.astrology}
                    {card.knowledgeMetadata.hebrewLetter ? ` · ${card.knowledgeMetadata.hebrewLetter}` : null}
                  </p>
                ) : null}
                <div className="mt-4 space-y-2 border-t border-line/40 pt-4">
                  <h3 className="font-mono text-[10px] uppercase tracking-label text-muted">Upright</h3>
                  {card.meanings.upright.keywords.length ? (
                    <p className="text-sm leading-snug text-bone/85">{card.meanings.upright.keywords.join(" · ")}</p>
                  ) : null}
                  {card.meanings.upright.summary ? (
                    <p className="text-sm leading-relaxed text-muted">{card.meanings.upright.summary}</p>
                  ) : null}
                </div>
                {card.interpretationPatterns.systemLinks.length ? (
                  <div className="mt-4">
                    <h3 className="mb-1 font-mono text-[10px] uppercase tracking-label text-muted">System links</h3>
                    <ul className="space-y-1 font-mono text-[11px] text-faint">
                      {card.interpretationPatterns.systemLinks.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </section>
            ))}
          </div>
        </>
      )}
    </article>
  );
}
