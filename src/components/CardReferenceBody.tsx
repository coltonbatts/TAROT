import type { ReactNode } from "react";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  formatReferenceMetaLine,
  getResolvedRelationshipGroups,
  type TarotCard,
  type TarotOrientation,
} from "../lib/tarot";
import type { FidelityMajorCard } from "../lib/tarot/fidelityTypes";
import { TarotCardImage } from "./TarotCardImage";

const AttributedMajorDetailLazy = lazy(() =>
  import("./AttributedMajorDetail").then((m) => ({ default: m.AttributedMajorDetail })),
);

function hasText(value: string | undefined | null): boolean {
  return Boolean(value && value.trim());
}

type SectionProps = {
  title: string;
  titleClassName?: string;
  children: ReactNode;
};

function Section({ title, titleClassName, children }: SectionProps) {
  return (
    <section className="border-t border-line pt-8 first:border-t-0 first:pt-0">
      <h2
        className={
          titleClassName ??
          "mb-4 font-mono text-[10px] uppercase tracking-label text-muted"
        }
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

type CardLinkListProps = {
  cards: TarotCard[];
  backSearch?: string;
};

function CardLinkList({ cards, backSearch }: CardLinkListProps) {
  if (!cards.length) return null;
  return (
    <ul className="max-w-prose space-y-2 text-sm leading-relaxed">
      {cards.map((r) => (
        <li key={r.slug}>
          <Link
            to={{
              pathname: `/cards/${r.slug}`,
              search: backSearch ? `?${backSearch}` : "",
            }}
            className="text-bone/90 transition duration-300 hover:text-bone focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-line-strong"
          >
            {r.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}

const ORIENTATION_PARAM = "orientation";

type CardReferenceBodyProps = {
  card: TarotCard;
  /** Library query string (no leading `?`) to preserve when linking to related cards. */
  backSearch?: string;
  /** When true, upright/reversed follows `?orientation=` (card detail page). */
  syncOrientationInUrl?: boolean;
  /** Fixed orientation when not syncing to URL (e.g. embedded previews). */
  orientation?: TarotOrientation;
};

export function CardReferenceBody({
  card,
  backSearch,
  syncOrientationInUrl = false,
  orientation: orientationProp,
}: CardReferenceBodyProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  const activeOrientation: TarotOrientation = useMemo(() => {
    if (!syncOrientationInUrl) return orientationProp ?? "upright";
    return searchParams.get(ORIENTATION_PARAM) === "reversed" ? "reversed" : "upright";
  }, [syncOrientationInUrl, orientationProp, searchParams]);

  function setOrientation(next: TarotOrientation) {
    if (!syncOrientationInUrl) return;
    const nextParams = new URLSearchParams(searchParams);
    if (next === "reversed") nextParams.set(ORIENTATION_PARAM, "reversed");
    else nextParams.delete(ORIENTATION_PARAM);
    setSearchParams(nextParams, { replace: true });
  }
  const [fidelityMajor, setFidelityMajor] = useState<FidelityMajorCard | null>(null);
  const [fidelityLoading, setFidelityLoading] = useState(false);

  useEffect(() => {
    if (card.arcana !== "major") {
      setFidelityMajor(null);
      setFidelityLoading(false);
      return;
    }
    setFidelityLoading(true);
    let cancelled = false;
    void import("../lib/tarot/attributedMajors").then((mod) => {
      if (cancelled) return;
      setFidelityMajor(mod.getFidelityMajorForCard(card));
      setFidelityLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [card]);

  const relationships = getResolvedRelationshipGroups(card);
  const sym = card.symbolismDetail;
  const hasSymbolismStructure =
    sym &&
    (sym.objects.length > 0 || sym.colors.length > 0 || hasText(sym.direction));
  const hasSymbolismProse = hasText(card.symbolism) && !hasSymbolismStructure;
  const hasSuitPhilosophy = Boolean(
    card.suitPhilosophy &&
      (hasText(card.suitPhilosophy.element) ||
        hasText(card.suitPhilosophy.domain) ||
        hasText(card.suitPhilosophy.shadow) ||
        hasText(card.suitPhilosophy.logic) ||
        card.suitPhilosophy.progression.length > 0),
  );
  const hasPatterns =
    hasText(card.interpretationPatterns.developmentalRole) ||
    card.interpretationPatterns.systemLinks.length > 0 ||
    card.interpretationPatterns.reversalModes.length > 0;
  const hasRelationshipGroups =
    relationships.similar.length > 0 ||
    relationships.contrasting.length > 0 ||
    relationships.previous.length > 0 ||
    relationships.next.length > 0;

  const activeMeaning = card.meanings[activeOrientation];
  const km = card.knowledgeMetadata;
  const hasCorrespondences = Boolean(
    km &&
      (hasText(km.element) ||
        hasText(km.astrology) ||
        hasText(km.hebrewLetter) ||
        hasText(km.qabalisticPath) ||
        hasText(km.chakra) ||
        hasText(km.elementalComposite)),
  );
  const sem = card.symbolismSemantics;
  const hasSymbolismSemantics = Boolean(
    sem && (hasText(sem.interpretation) || sem.imagery.length > 0),
  );
  const detailedDiffersFromSummary =
    hasText(activeMeaning.detailed) &&
    activeMeaning.detailed.trim() !== activeMeaning.summary.trim();

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(220px,320px)_1fr] lg:gap-14 lg:items-start">
      <figure className="space-y-3 lg:sticky lg:top-8">
        <div className="rounded-2xl border border-line bg-void p-2 sm:p-2.5">
          <div className="overflow-hidden rounded-xl bg-void">
            <TarotCardImage
              src={card.imagePath}
              alt={card.name}
              className="aspect-[2/3] w-full object-contain object-center contrast-[1.02]"
              loading="eager"
            />
          </div>
        </div>
        <figcaption className="font-mono text-[10px] tracking-wide text-faint">
          <span className="block truncate">{formatReferenceMetaLine(card)}</span>
        </figcaption>
      </figure>

      <div className="min-w-0 space-y-10">
        <section className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="font-mono text-[10px] uppercase tracking-label text-muted">Reading</h2>
            {syncOrientationInUrl ? (
              <div
                className="inline-flex border border-line p-0.5"
                role="group"
                aria-label="Card orientation"
              >
                {(["upright", "reversed"] as const).map((o) => {
                  const isActive = activeOrientation === o;
                  const label = o === "upright" ? "Upright" : "Reversed";
                  return (
                    <button
                      key={o}
                      type="button"
                      onClick={() => setOrientation(o)}
                      className={[
                        "min-w-[5.5rem] px-3 py-1.5 font-mono text-[11px] uppercase tracking-label transition duration-300",
                        isActive
                          ? "bg-blood/25 text-bone"
                          : "text-muted hover:text-bone/90",
                      ].join(" ")}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>

          {activeMeaning.keywords.length > 0 ? (
            <p className="font-mono text-sm leading-snug text-bone">
              {activeMeaning.keywords.join(" · ")}
            </p>
          ) : null}

          {hasText(activeMeaning.summary) ? (
            <p className="max-w-prose font-body text-[0.9375rem] leading-[1.65] text-bone/95">
              {activeMeaning.summary}
            </p>
          ) : null}

          {detailedDiffersFromSummary ? (
            <details className="group max-w-prose border border-line border-dashed bg-void/40 px-4 py-3">
              <summary className="cursor-pointer font-mono text-[10px] uppercase tracking-label text-muted transition group-open:text-bone/80">
                Full meaning
              </summary>
              <p className="mt-4 whitespace-pre-line font-body text-[0.9375rem] leading-[1.75] text-bone/90">
                {activeMeaning.detailed}
              </p>
            </details>
          ) : hasText(activeMeaning.detailed) ? (
            <p className="max-w-prose whitespace-pre-line font-body text-[0.9375rem] leading-[1.75] text-bone/90">
              {activeMeaning.detailed}
            </p>
          ) : null}
        </section>

        {hasCorrespondences && km ? (
          <Section title="Correspondences">
            <dl className="max-w-prose grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2 font-mono text-xs leading-relaxed text-muted">
              {hasText(km.element) ? (
                <>
                  <dt className="text-faint">Element</dt>
                  <dd className="text-bone/85">{km.element}</dd>
                </>
              ) : null}
              {hasText(km.astrology) ? (
                <>
                  <dt className="text-faint">Astrology</dt>
                  <dd className="text-bone/85">{km.astrology}</dd>
                </>
              ) : null}
              {hasText(km.hebrewLetter) ? (
                <>
                  <dt className="text-faint">Hebrew letter</dt>
                  <dd className="text-bone/85">{km.hebrewLetter}</dd>
                </>
              ) : null}
              {hasText(km.qabalisticPath) ? (
                <>
                  <dt className="text-faint">Path</dt>
                  <dd className="text-bone/85">{km.qabalisticPath}</dd>
                </>
              ) : null}
              {hasText(km.chakra) ? (
                <>
                  <dt className="text-faint">Chakra</dt>
                  <dd className="text-bone/85">{km.chakra}</dd>
                </>
              ) : null}
              {hasText(km.elementalComposite) ? (
                <>
                  <dt className="text-faint">Court composite</dt>
                  <dd className="text-bone/85">{km.elementalComposite}</dd>
                </>
              ) : null}
            </dl>
          </Section>
        ) : null}

        {hasText(card.archetype) ? (
          <Section title="Archetype">
            <p className="max-w-prose text-sm leading-relaxed text-muted">{card.archetype}</p>
          </Section>
        ) : null}

        {hasText(card.numerology) ? (
          <Section title="Numerology">
            <p className="max-w-prose whitespace-pre-line font-mono text-sm text-bone/90">
              {card.numerology}
            </p>
          </Section>
        ) : null}

        {hasText(card.suitMeaning) || hasSuitPhilosophy ? (
          <Section title="Suit Logic">
            <div className="max-w-prose space-y-6 text-sm leading-relaxed text-muted">
              {hasText(card.suitMeaning) ? <p>{card.suitMeaning}</p> : null}
              {hasSuitPhilosophy && card.suitPhilosophy ? (
                <>
                  {hasText(card.suitPhilosophy.shadow) ? (
                    <div>
                      <h3 className="mb-2 font-mono text-[10px] uppercase tracking-label text-muted">Shadow</h3>
                      <p>{card.suitPhilosophy.shadow}</p>
                    </div>
                  ) : null}
                  {card.suitPhilosophy.progression.length > 0 ? (
                    <div>
                      <h3 className="mb-2 font-mono text-[10px] uppercase tracking-label text-muted">Progression</h3>
                      <ul className="list-inside list-disc space-y-1">
                        {card.suitPhilosophy.progression.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </>
              ) : null}
            </div>
          </Section>
        ) : null}

        {hasSymbolismSemantics && sem ? (
          <Section title="Symbolism" titleClassName="mb-4 font-mono text-[10px] uppercase tracking-label text-ochre/90">
            <div className="max-w-prose space-y-6 text-sm leading-relaxed text-muted">
              {hasText(sem.interpretation) ? <p className="text-bone/88">{sem.interpretation}</p> : null}
              {sem.imagery.length > 0 ? (
                <div>
                  <h3 className="mb-2 font-mono text-[10px] uppercase tracking-label text-muted">Imagery</h3>
                  <ul className="list-inside list-disc space-y-1">
                    {sem.imagery.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {sym && sym.colors.length > 0 ? (
                <div>
                  <h3 className="mb-2 font-mono text-[10px] uppercase tracking-label text-muted">Colors</h3>
                  <p>{sym.colors.join(" · ")}</p>
                </div>
              ) : null}
              {sym && hasText(sym.direction) ? (
                <div>
                  <h3 className="mb-2 font-mono text-[10px] uppercase tracking-label text-muted">Direction</h3>
                  <p className="whitespace-pre-line">{sym.direction}</p>
                </div>
              ) : null}
            </div>
          </Section>
        ) : hasSymbolismStructure && sym ? (
          <Section title="Symbolism" titleClassName="mb-4 font-mono text-[10px] uppercase tracking-label text-ochre/90">
            <div className="max-w-prose space-y-6 text-sm leading-relaxed text-muted">
              {sym.objects.length > 0 ? (
                <div>
                  <h3 className="mb-2 font-mono text-[10px] uppercase tracking-label text-muted">Imagery</h3>
                  <ul className="list-inside list-disc space-y-1">
                    {sym.objects.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {sym.colors.length > 0 ? (
                <div>
                  <h3 className="mb-2 font-mono text-[10px] uppercase tracking-label text-muted">Colors</h3>
                  <p>{sym.colors.join(" · ")}</p>
                </div>
              ) : null}
              {hasText(sym.direction) ? (
                <div>
                  <h3 className="mb-2 font-mono text-[10px] uppercase tracking-label text-muted">Direction</h3>
                  <p className="whitespace-pre-line">{sym.direction}</p>
                </div>
              ) : null}
            </div>
          </Section>
        ) : hasSymbolismProse ? (
          <Section title="Symbolism" titleClassName="mb-4 font-mono text-[10px] uppercase tracking-label text-ochre/90">
            <p className="max-w-prose whitespace-pre-line text-sm leading-relaxed text-muted">{card.symbolism}</p>
          </Section>
        ) : null}

        {hasText(card.description) ? (
          <Section title="Notes">
            <p className="max-w-prose whitespace-pre-line text-sm leading-relaxed text-muted">{card.description}</p>
          </Section>
        ) : null}

        {hasPatterns ? (
          <Section title="Interpretation patterns">
            <div className="max-w-prose space-y-6 text-sm leading-relaxed text-muted">
              {hasText(card.interpretationPatterns.developmentalRole) ? (
                <div>
                  <h3 className="mb-2 font-mono text-[10px] uppercase tracking-label text-muted">Development</h3>
                  <p>{card.interpretationPatterns.developmentalRole}</p>
                </div>
              ) : null}
              {card.interpretationPatterns.systemLinks.length > 0 ? (
                <div>
                  <h3 className="mb-2 font-mono text-[10px] uppercase tracking-label text-muted">System Links</h3>
                  <ul className="list-inside list-disc space-y-1">
                    {card.interpretationPatterns.systemLinks.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {card.interpretationPatterns.reversalModes.length > 0 ? (
                <div>
                  <h3 className="mb-2 font-mono text-[10px] uppercase tracking-label text-muted">Reversal Modes</h3>
                  <ul className="list-inside list-disc space-y-1">
                    {card.interpretationPatterns.reversalModes.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </Section>
        ) : null}

        {hasRelationshipGroups ? (
          <Section title="Relationships">
            <div className="max-w-prose space-y-6 text-sm leading-relaxed text-muted">
              {relationships.similar.length > 0 ? (
                <div>
                  <h3 className="mb-2 font-mono text-[10px] uppercase tracking-label text-muted">Similar</h3>
                  <CardLinkList cards={relationships.similar} backSearch={backSearch} />
                </div>
              ) : null}
              {relationships.contrasting.length > 0 ? (
                <div>
                  <h3 className="mb-2 font-mono text-[10px] uppercase tracking-label text-muted">Contrasting</h3>
                  <CardLinkList cards={relationships.contrasting} backSearch={backSearch} />
                </div>
              ) : null}
              {relationships.previous.length > 0 || relationships.next.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <h3 className="mb-2 font-mono text-[10px] uppercase tracking-label text-muted">Previous</h3>
                    <CardLinkList cards={relationships.previous} backSearch={backSearch} />
                  </div>
                  <div>
                    <h3 className="mb-2 font-mono text-[10px] uppercase tracking-label text-muted">Next</h3>
                    <CardLinkList cards={relationships.next} backSearch={backSearch} />
                  </div>
                </div>
              ) : null}
            </div>
          </Section>
        ) : null}

        {card.arcana === "major" && fidelityLoading ? (
          <p className="font-mono text-[10px] text-faint" aria-busy="true">
            …
          </p>
        ) : null}
        {fidelityMajor ? (
          <Suspense
            fallback={
              <p className="font-mono text-[10px] text-faint" aria-busy="true">
                …
              </p>
            }
          >
            <AttributedMajorDetailLazy fidelity={fidelityMajor} backSearch={backSearch} />
          </Suspense>
        ) : null}
      </div>
    </div>
  );
}
