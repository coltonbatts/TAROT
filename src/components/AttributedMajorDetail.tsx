import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { getCardByName } from "../lib/tarot/selectors";
import { fidelitySourceTitle } from "../lib/tarot/sourceCatalog";
import type {
  FidelityArchetypeEntry,
  FidelityMajorCard,
  FidelityMeaningEntry,
  FidelityRelationshipEdge,
  FidelitySymbolismMotif,
} from "../lib/tarot/fidelityTypes";

function trim(value: unknown): string {
  if (value == null) return "";
  return String(value).trim();
}

function meaningByline(m: FidelityMeaningEntry): string {
  const author = trim(m.author);
  const year = m.year != null ? String(m.year) : "";
  const fromBook = fidelitySourceTitle(trim(m.source));
  if (author && year) return `${author} (${year})${fromBook ? ` · ${fromBook}` : ""}`;
  if (author) return `${author}${fromBook ? ` · ${fromBook}` : ""}`;
  if (fromBook) return fromBook;
  return trim(m.source) || "Source";
}

function motifTitle(key: string): string {
  return key.replaceAll("_", " ");
}

type SectionProps = { title: string; children: ReactNode };

function Subsection({ title, children }: SectionProps) {
  return (
    <div className="space-y-3">
      <h3 className="font-mono text-[10px] uppercase tracking-label text-muted">{title}</h3>
      {children}
    </div>
  );
}

function CardNameLink({
  name,
  backSearch,
}: {
  name: string;
  backSearch?: string;
}) {
  const card = getCardByName(name);
  if (!card) {
    return <span className="text-bone/90">{name}</span>;
  }
  return (
    <Link
      to={{
        pathname: `/cards/${card.slug}`,
        search: backSearch ? `?${backSearch}` : "",
      }}
      className="text-bone/90 underline decoration-line underline-offset-4 transition hover:text-bone focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-line-strong"
    >
      {card.name}
    </Link>
  );
}

function RelationshipList({
  items,
  backSearch,
}: {
  items: FidelityRelationshipEdge[];
  backSearch?: string;
}) {
  if (!items.length) return null;
  return (
    <ul className="max-w-prose space-y-4 text-sm leading-relaxed text-muted">
      {items.map((row, i) => {
        const cardName = trim(row.card);
        const expl = trim(row.explanation);
        const src = trim(row.source);
        const conf = trim(row.confidence);
        if (!cardName && !expl) return null;
        return (
          <li key={`${cardName}-${i}`}>
            {cardName ? (
              <p className="font-mono text-xs text-bone/90">
                <CardNameLink name={cardName} backSearch={backSearch} />
              </p>
            ) : null}
            {expl ? <p className="mt-1">{expl}</p> : null}
            {(src || conf) && (
              <p className="mt-1 font-mono text-[10px] text-faint">
                {[src, conf].filter(Boolean).join(" · ")}
              </p>
            )}
          </li>
        );
      })}
    </ul>
  );
}

type Props = {
  fidelity: FidelityMajorCard;
  backSearch?: string;
};

export function AttributedMajorDetail({ fidelity, backSearch }: Props) {
  const meanings = fidelity.meanings?.filter(Boolean) ?? [];
  const upright = meanings.filter((m) => trim(m.type).toLowerCase() === "upright");
  const reversed = meanings.filter((m) => trim(m.type).toLowerCase() === "reversed");
  const otherMeanings = meanings.filter((m) => {
    const t = trim(m.type).toLowerCase();
    return t !== "upright" && t !== "reversed";
  });

  const gd = fidelity.golden_dawn;
  const hasGd =
    gd &&
    Object.values(gd).some((v) => trim(v));

  const symbolismEntries = fidelity.symbolism
    ? Object.entries(fidelity.symbolism).filter(([, v]) => v && typeof v === "object")
    : [];

  const kwEntries = fidelity.keywords ? Object.entries(fidelity.keywords) : [];
  const kwBlocks = kwEntries.filter(([, arr]) => Array.isArray(arr) && arr.length > 0);

  const archetypes = fidelity.archetype?.filter((a) => a && trim(a.description || a.name)) ?? [];

  const rel = fidelity.relationships;
  const transforms = rel?.transformations?.filter(Boolean) ?? [];

  const numerology = fidelity.numerology;

  const hasNumerologyStrings =
    numerology &&
    ["pythagorean", "golden_dawn", "case"].some((k) => trim(numerology[k]));

  const sourceConflict =
    numerology &&
    typeof numerology.source_conflict === "object" &&
    numerology.source_conflict !== null
      ? (numerology.source_conflict as Record<string, unknown>)
      : null;

  const hasAnything =
    hasGd ||
    upright.length > 0 ||
    reversed.length > 0 ||
    otherMeanings.length > 0 ||
    symbolismEntries.length > 0 ||
    kwBlocks.length > 0 ||
    archetypes.length > 0 ||
    hasNumerologyStrings ||
    sourceConflict ||
    (rel?.similar && rel.similar.length > 0) ||
    (rel?.contrasts && rel.contrasts.length > 0) ||
    rel?.progression?.previous ||
    rel?.progression?.next ||
    transforms.length > 0;

  if (!hasAnything) return null;

  return (
    <div className="border-t border-line pt-10 space-y-10">
      <header className="space-y-2">
        <h2 className="font-mono text-[10px] uppercase tracking-label text-ochre/90">Attributed sources</h2>
        <p className="max-w-prose text-sm leading-relaxed text-muted">
          Parallel readings, symbolism notes, and relationships keyed to named sources in the fidelity dataset — alongside
          the synthesized reference above.
        </p>
      </header>

      {hasGd && gd ? (
        <section className="space-y-3">
          <Subsection title="Golden Dawn correspondences">
            <dl className="grid gap-2 font-mono text-xs text-bone/90 sm:grid-cols-2">
              {Object.entries(gd).map(([k, v]) => {
                const t = trim(v);
                if (!t) return null;
                return (
                  <div key={k} className="space-y-0.5">
                    <dt className="text-faint">{motifTitle(k)}</dt>
                    <dd>{t}</dd>
                  </div>
                );
              })}
            </dl>
          </Subsection>
        </section>
      ) : null}

      {upright.length > 0 ? (
        <section className="space-y-4">
          <Subsection title="Upright (by source)">
            <ul className="max-w-prose space-y-5">
              {upright.map((m, i) => (
                <MeaningBlock key={i} m={m} />
              ))}
            </ul>
          </Subsection>
        </section>
      ) : null}

      {reversed.length > 0 ? (
        <section className="space-y-4">
          <Subsection title="Reversed (by source)">
            <ul className="max-w-prose space-y-5">
              {reversed.map((m, i) => (
                <MeaningBlock key={i} m={m} />
              ))}
            </ul>
          </Subsection>
        </section>
      ) : null}

      {otherMeanings.length > 0 ? (
        <section className="space-y-4">
          <Subsection title="Other readings">
            <ul className="max-w-prose space-y-5">
              {otherMeanings.map((m, i) => (
                <MeaningBlock key={i} m={m} showType />
              ))}
            </ul>
          </Subsection>
        </section>
      ) : null}

      {symbolismEntries.length > 0 ? (
        <section className="space-y-4">
          <Subsection title="Symbolism (attributed)">
            <ul className="max-w-prose space-y-6 text-sm leading-relaxed text-muted">
              {symbolismEntries.map(([key, raw]) => {
                const motif = raw as FidelitySymbolismMotif;
                const desc = trim(motif.description);
                const mean = trim(motif.meaning);
                const src = trim(motif.source);
                if (!desc && !mean) return null;
                return (
                  <li key={key}>
                    <p className="font-mono text-xs text-bone/90">{motifTitle(key)}</p>
                    {desc ? <p className="mt-1">{desc}</p> : null}
                    {mean ? <p className="mt-2 text-bone/85">{mean}</p> : null}
                    {src ? <p className="mt-1 font-mono text-[10px] text-faint">{src}</p> : null}
                  </li>
                );
              })}
            </ul>
          </Subsection>
        </section>
      ) : null}

      {kwBlocks.length > 0 ? (
        <section className="space-y-4">
          <Subsection title="Keywords by source">
            <div className="max-w-prose space-y-4 text-sm">
              {kwBlocks.map(([sourceId, words]) => (
                <div key={sourceId}>
                  <p className="mb-1 font-mono text-[10px] text-faint">
                    {fidelitySourceTitle(sourceId) || motifTitle(sourceId)}
                  </p>
                  <p className="leading-relaxed text-muted">{(words as string[]).join(" · ")}</p>
                </div>
              ))}
            </div>
          </Subsection>
        </section>
      ) : null}

      {archetypes.length > 0 ? (
        <section className="space-y-4">
          <Subsection title="Archetypes (attributed)">
            <ul className="max-w-prose space-y-5 text-sm leading-relaxed text-muted">
              {archetypes.map((a: FidelityArchetypeEntry, i) => {
                const n = trim(a.name);
                const trad = trim(a.tradition);
                const desc = trim(a.description);
                const src = trim(a.source);
                const conf = trim(a.confidence);
                return (
                  <li key={`${n}-${i}`}>
                    <p className="font-mono text-xs text-bone/90">
                      {n}
                      {trad ? <span className="text-faint"> — {trad}</span> : null}
                    </p>
                    {desc ? <p className="mt-1">{desc}</p> : null}
                    {(src || conf) && (
                      <p className="mt-1 font-mono text-[10px] text-faint">{[src, conf].filter(Boolean).join(" · ")}</p>
                    )}
                  </li>
                );
              })}
            </ul>
          </Subsection>
        </section>
      ) : null}

      {numerology && (hasNumerologyStrings || sourceConflict) ? (
        <section className="space-y-4">
          <Subsection title="Numerology (attributed)">
            <div className="max-w-prose space-y-4 text-sm leading-relaxed text-muted">
              {trim(numerology.pythagorean) ? (
                <div>
                  <p className="mb-1 font-mono text-[10px] text-faint">Pythagorean</p>
                  <p>{String(numerology.pythagorean)}</p>
                </div>
              ) : null}
              {trim(numerology.golden_dawn) ? (
                <div>
                  <p className="mb-1 font-mono text-[10px] text-faint">Golden Dawn</p>
                  <p>{String(numerology.golden_dawn)}</p>
                </div>
              ) : null}
              {trim(numerology.case) ? (
                <div>
                  <p className="mb-1 font-mono text-[10px] text-faint">Case</p>
                  <p>{String(numerology.case)}</p>
                </div>
              ) : null}
              {sourceConflict ? (
                <div className="space-y-2 border border-line/60 bg-void/40 p-4">
                  <p className="font-mono text-[10px] text-faint">Source conflict</p>
                  {trim(sourceConflict.description) ? (
                    <p>{String(sourceConflict.description)}</p>
                  ) : null}
                  {sourceConflict.positions && typeof sourceConflict.positions === "object" ? (
                    <dl className="grid gap-2 font-mono text-xs text-bone/85">
                      {Object.entries(sourceConflict.positions as Record<string, unknown>).map(([k, v]) => (
                        <div key={k}>
                          <dt className="text-faint">{motifTitle(k)}</dt>
                          <dd>{String(v)}</dd>
                        </div>
                      ))}
                    </dl>
                  ) : null}
                </div>
              ) : null}
            </div>
          </Subsection>
        </section>
      ) : null}

      {rel &&
      (rel.similar?.length ||
        rel.contrasts?.length ||
        rel.progression?.previous ||
        rel.progression?.next ||
        transforms.length) ? (
        <section className="space-y-6">
          <Subsection title="Relationships (attributed)">
            <div className="space-y-8">
              {rel.similar && rel.similar.length > 0 ? (
                <div>
                  <p className="mb-3 font-mono text-[10px] uppercase tracking-label text-muted">Similar</p>
                  <RelationshipList items={rel.similar} backSearch={backSearch} />
                </div>
              ) : null}
              {rel.contrasts && rel.contrasts.length > 0 ? (
                <div>
                  <p className="mb-3 font-mono text-[10px] uppercase tracking-label text-muted">Contrasts</p>
                  <RelationshipList items={rel.contrasts} backSearch={backSearch} />
                </div>
              ) : null}
              {rel.progression?.previous || rel.progression?.next ? (
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <p className="mb-3 font-mono text-[10px] uppercase tracking-label text-muted">Previous</p>
                    {rel.progression.previous ? (
                      <SingleProgression edge={rel.progression.previous} backSearch={backSearch} />
                    ) : (
                      <p className="text-sm text-faint">—</p>
                    )}
                  </div>
                  <div>
                    <p className="mb-3 font-mono text-[10px] uppercase tracking-label text-muted">Next</p>
                    {rel.progression.next ? (
                      <SingleProgression edge={rel.progression.next} backSearch={backSearch} />
                    ) : (
                      <p className="text-sm text-faint">—</p>
                    )}
                  </div>
                </div>
              ) : null}
              {transforms.length > 0 ? (
                <div>
                  <p className="mb-3 font-mono text-[10px] uppercase tracking-label text-muted">Transformations</p>
                  <ul className="max-w-prose space-y-4 text-sm leading-relaxed text-muted">
                    {transforms.map((row, i) => {
                      const o = row as Record<string, unknown>;
                      const parts = ["evolves_into", "leads_from"]
                        .map((k) => trim(o[k]))
                        .filter(Boolean);
                      const expl = trim(o.explanation);
                      const src = trim(o.source);
                      const conf = trim(o.confidence);
                      if (!parts.length && !expl) return null;
                      return (
                        <li key={i}>
                          {parts.length > 0 ? (
                            <p className="font-mono text-xs text-bone/90">{parts.join(" → ")}</p>
                          ) : null}
                          {expl ? <p className="mt-1">{expl}</p> : null}
                          {(src || conf) && (
                            <p className="mt-1 font-mono text-[10px] text-faint">
                              {[src, conf].filter(Boolean).join(" · ")}
                            </p>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : null}
            </div>
          </Subsection>
        </section>
      ) : null}
    </div>
  );
}

function SingleProgression({
  edge,
  backSearch,
}: {
  edge: FidelityRelationshipEdge;
  backSearch?: string;
}) {
  const cardName = trim(edge.card);
  const expl = trim(edge.explanation);
  if (!cardName && !expl) {
    return <p className="text-sm text-faint">—</p>;
  }
  return (
    <div className="text-sm leading-relaxed text-muted">
      {cardName ? (
        <p className="font-mono text-xs text-bone/90">
          <CardNameLink name={cardName} backSearch={backSearch} />
        </p>
      ) : null}
      {expl ? <p className="mt-1">{expl}</p> : null}
    </div>
  );
}

function MeaningBlock({ m, showType }: { m: FidelityMeaningEntry; showType?: boolean }) {
  const text = trim(m.text);
  if (!text) return null;
  const type = trim(m.type);
  const conf = trim(m.confidence);
  const notes = trim(m.notes);
  return (
    <li className="space-y-2 border-b border-line/30 pb-5 last:border-b-0 last:pb-0">
      {showType && type ? (
        <p className="font-mono text-[10px] uppercase tracking-label text-muted">{type}</p>
      ) : null}
      <p className="max-w-prose whitespace-pre-line font-body text-[0.9375rem] leading-[1.75] text-bone/95">{text}</p>
      <p className="font-mono text-[10px] text-faint">
        {meaningByline(m)}
        {conf ? ` · ${conf}` : ""}
      </p>
      {notes ? <p className="text-sm text-muted">{notes}</p> : null}
    </li>
  );
}
