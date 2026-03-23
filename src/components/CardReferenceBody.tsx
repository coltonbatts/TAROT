import type { ReactNode } from "react";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CardStage } from "./CardStage";
import {
  formatArcanaHeading,
  formatReferenceMetaLine,
  getResolvedRelationshipGroups,
  type TarotCard,
  type TarotOrientation,
} from "../lib/tarot";
import type { FidelityMajorCard } from "../lib/tarot/fidelityTypes";

const AttributedMajorDetailLazy = lazy(() =>
  import("./AttributedMajorDetail").then((m) => ({ default: m.AttributedMajorDetail })),
);

function hasText(value: string | undefined | null): boolean {
  return Boolean(value && value.trim());
}

/** Split dataset `detailed` text on blank lines into paragraphs for reading. */
function meaningParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim().replace(/\n/g, " "))
    .filter(Boolean);
}

type StudyDisclosureProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  defaultOpen?: boolean;
};

function StudyDisclosure({ title, subtitle, children, defaultOpen = false }: StudyDisclosureProps) {
  return (
    <details
      open={defaultOpen}
      className="group border border-line bg-[#030303] text-left motion-safe:transition-colors motion-safe:duration-300 hover:border-line-strong"
    >
      <summary className="flex cursor-pointer list-none items-start justify-between gap-4 px-4 py-4 [&::-webkit-details-marker]:hidden">
        <span className="min-w-0 space-y-1">
          <span className="block font-mono text-[10px] uppercase tracking-label text-muted motion-safe:transition-colors motion-safe:duration-300 group-hover:text-bone/75 group-open:text-bone/85">
            {title}
          </span>
          {subtitle ? (
            <span className="block font-body text-sm leading-snug text-bone/55">{subtitle}</span>
          ) : null}
        </span>
        <span
          className="mt-0.5 shrink-0 font-mono text-[10px] text-faint motion-safe:transition-transform motion-safe:duration-300 group-open:rotate-180"
          aria-hidden
        >
          ↓
        </span>
      </summary>
      <div className="border-t border-line px-4 pb-5 pt-1">{children}</div>
    </details>
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

type OrientationToggleProps = {
  value: TarotOrientation;
  onChange: (next: TarotOrientation) => void;
};

function OrientationToggle({ value, onChange }: OrientationToggleProps) {
  return (
    <div
      className="inline-flex w-full max-w-[17rem] border border-line bg-[#020202] p-1 sm:w-auto sm:max-w-none"
      role="group"
      aria-label="Reading orientation"
    >
      {(["upright", "reversed"] as const).map((o) => {
        const isActive = value === o;
        const label = o === "upright" ? "Upright" : "Reversed";
        return (
          <button
            key={o}
            type="button"
            onClick={() => onChange(o)}
            className={[
              "min-w-0 flex-1 px-4 py-2.5 font-mono text-[10px] uppercase tracking-label motion-safe:transition motion-safe:duration-300 sm:min-w-[6.5rem]",
              isActive
                ? "bg-blood/30 text-bone shadow-[inset_0_0_0_1px_rgba(226,221,212,0.12)]"
                : "text-muted hover:text-bone/85",
            ].join(" ")}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

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

  const hasGrammarSection =
    hasText(card.archetype) ||
    hasText(card.numerology) ||
    hasText(card.suitMeaning) ||
    hasSuitPhilosophy;

  const grammarSubtitleParts: string[] = [];
  if (hasText(card.archetype)) grammarSubtitleParts.push("Archetype");
  if (hasText(card.numerology)) grammarSubtitleParts.push("Numerology");
  if (hasText(card.suitMeaning) || hasSuitPhilosophy) grammarSubtitleParts.push("Suit");

  const hasStudyDisclosures =
    hasCorrespondences ||
    hasGrammarSection ||
    hasText(card.description) ||
    hasPatterns ||
    hasRelationshipGroups ||
    fidelityMajor ||
    (card.arcana === "major" && fidelityLoading);

  function cycleOrientation() {
    setOrientation(activeOrientation === "upright" ? "reversed" : "upright");
  }

  return (
    <div className="flex flex-col gap-14 lg:gap-20">
      <section
        className="relative border-b border-line/60 pb-14 pt-2 lg:pb-20 lg:pt-4"
        aria-labelledby="card-hero-title"
      >
        <div
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.85]"
          aria-hidden
          style={{
            background:
              "radial-gradient(ellipse 65% 55% at 50% 38%, rgba(122, 107, 72, 0.14) 0%, transparent 58%), radial-gradient(ellipse 50% 40% at 70% 80%, rgba(76, 66, 88, 0.1) 0%, transparent 55%)",
          }}
        />
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-10 lg:gap-12">
          <CardStage
            src={card.imagePath}
            alt={card.name}
            orientation={activeOrientation}
            metaLine={formatReferenceMetaLine(card)}
            onOrientationCycle={syncOrientationInUrl ? cycleOrientation : undefined}
          />
          <div id="card-hero-title" className="max-w-2xl space-y-3 text-center">
            <p className="font-display text-sm font-normal italic tracking-wide text-muted/90">
              {formatArcanaHeading(card)}
            </p>
            <h1 className="font-display text-[clamp(2.5rem,6.5vw,4.25rem)] font-medium leading-[0.92] tracking-tight text-balance">
              {card.name}
            </h1>
          </div>
        </div>
      </section>

      <div className="mx-auto min-w-0 w-full max-w-2xl space-y-10 lg:max-w-3xl">
        <header className="space-y-6 border-b border-line pb-10">
          <div className="border border-line bg-[#030303] p-5 sm:p-6">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
              <div className="min-w-0 flex-1 space-y-1">
                <p className="font-mono text-[10px] uppercase tracking-label text-muted">Reading</p>
                <p className="font-body text-sm leading-relaxed text-bone/55">
                  {activeOrientation === "upright"
                    ? "Face of the card toward the reader."
                    : "Inverted axis — shadow emphasis and internal pressure."}
                </p>
              </div>
              {syncOrientationInUrl ? (
                <OrientationToggle value={activeOrientation} onChange={setOrientation} />
              ) : null}
            </div>

            <div className="mt-8 space-y-6 border-t border-line/80 pt-8">
              {activeMeaning.keywords.length > 0 ? (
                <p className="font-mono text-[13px] leading-relaxed text-bone/90">
                  {activeMeaning.keywords.join(" · ")}
                </p>
              ) : null}

              {hasText(activeMeaning.summary) ? (
                <p className="max-w-prose font-body text-[1.0625rem] leading-[1.7] text-bone/95">
                  {activeMeaning.summary}
                </p>
              ) : null}

              {detailedDiffersFromSummary ? (
                <details className="group max-w-prose border border-dashed border-line bg-black/30">
                  <summary className="cursor-pointer px-4 py-3 font-mono text-[10px] uppercase tracking-label text-muted motion-safe:transition-colors motion-safe:duration-300 hover:text-bone/80 group-open:border-b group-open:border-line group-open:text-bone/80 [&::-webkit-details-marker]:hidden">
                    <span className="inline-flex items-center gap-2">
                      Deeper reading
                      <span className="text-faint group-open:rotate-180 motion-safe:transition-transform motion-safe:duration-300">
                        ↓
                      </span>
                    </span>
                  </summary>
                  <div className="space-y-4 px-4 pb-5 pt-4">
                    {meaningParagraphs(activeMeaning.detailed).map((para, i) => (
                      <p key={i} className="font-body text-[0.9375rem] leading-[1.8] text-bone/88">
                        {para}
                      </p>
                    ))}
                  </div>
                </details>
              ) : hasText(activeMeaning.detailed) ? (
                <div className="max-w-prose space-y-4">
                  {meaningParagraphs(activeMeaning.detailed).map((para, i) => (
                    <p key={i} className="font-body text-[0.9375rem] leading-[1.8] text-bone/90">
                      {para}
                    </p>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </header>

        {hasSymbolismSemantics && sem ? (
          <section
            className="border-l-2 border-ochre/35 pl-6 sm:pl-8"
            aria-labelledby="symbolism-heading"
          >
            <h2
              id="symbolism-heading"
              className="mb-6 font-mono text-[10px] uppercase tracking-label text-ochre/90"
            >
              Symbolism
            </h2>
            <div className="max-w-prose space-y-6 text-sm leading-relaxed text-muted">
              {hasText(sem.interpretation) ? (
                <p className="text-bone/88">{sem.interpretation}</p>
              ) : null}
              {sem.imagery.length > 0 ? (
                <div>
                  <h3 className="mb-2 font-mono text-[10px] uppercase tracking-label text-muted">
                    Imagery
                  </h3>
                  <ul className="list-inside list-disc space-y-1.5 marker:text-faint">
                    {sem.imagery.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {sym && sym.colors.length > 0 ? (
                <div>
                  <h3 className="mb-2 font-mono text-[10px] uppercase tracking-label text-muted">
                    Colors
                  </h3>
                  <p>{sym.colors.join(" · ")}</p>
                </div>
              ) : null}
              {sym && hasText(sym.direction) ? (
                <div>
                  <h3 className="mb-2 font-mono text-[10px] uppercase tracking-label text-muted">
                    Direction
                  </h3>
                  <p className="whitespace-pre-line">{sym.direction}</p>
                </div>
              ) : null}
            </div>
          </section>
        ) : hasSymbolismStructure && sym ? (
          <section
            className="border-l-2 border-ochre/35 pl-6 sm:pl-8"
            aria-labelledby="symbolism-heading"
          >
            <h2
              id="symbolism-heading"
              className="mb-6 font-mono text-[10px] uppercase tracking-label text-ochre/90"
            >
              Symbolism
            </h2>
            <div className="max-w-prose space-y-6 text-sm leading-relaxed text-muted">
              {sym.objects.length > 0 ? (
                <div>
                  <h3 className="mb-2 font-mono text-[10px] uppercase tracking-label text-muted">
                    Imagery
                  </h3>
                  <ul className="list-inside list-disc space-y-1.5 marker:text-faint">
                    {sym.objects.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {sym.colors.length > 0 ? (
                <div>
                  <h3 className="mb-2 font-mono text-[10px] uppercase tracking-label text-muted">
                    Colors
                  </h3>
                  <p>{sym.colors.join(" · ")}</p>
                </div>
              ) : null}
              {hasText(sym.direction) ? (
                <div>
                  <h3 className="mb-2 font-mono text-[10px] uppercase tracking-label text-muted">
                    Direction
                  </h3>
                  <p className="whitespace-pre-line">{sym.direction}</p>
                </div>
              ) : null}
            </div>
          </section>
        ) : hasSymbolismProse ? (
          <section
            className="border-l-2 border-ochre/35 pl-6 sm:pl-8"
            aria-labelledby="symbolism-heading"
          >
            <h2
              id="symbolism-heading"
              className="mb-6 font-mono text-[10px] uppercase tracking-label text-ochre/90"
            >
              Symbolism
            </h2>
            <p className="max-w-prose whitespace-pre-line text-sm leading-relaxed text-muted">
              {card.symbolism}
            </p>
          </section>
        ) : null}

        {hasStudyDisclosures ? (
        <div className="space-y-3">
          <h2 className="font-mono text-[10px] uppercase tracking-label text-faint">Study</h2>
          <div className="flex flex-col gap-3">
            {hasCorrespondences && km ? (
              <StudyDisclosure title="Correspondences" subtitle="Elements, letters, paths">
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
              </StudyDisclosure>
            ) : null}

            {hasGrammarSection ? (
              <StudyDisclosure
                title="Grammar of the card"
                subtitle={grammarSubtitleParts.join(" · ")}
              >
                <div className="max-w-prose space-y-8 text-sm leading-relaxed text-muted">
                  {hasText(card.archetype) ? (
                    <div>
                      <h3 className="mb-2 font-mono text-[10px] uppercase tracking-label text-muted">
                        Archetype
                      </h3>
                      <p>{card.archetype}</p>
                    </div>
                  ) : null}
                  {hasText(card.numerology) ? (
                    <div>
                      <h3 className="mb-2 font-mono text-[10px] uppercase tracking-label text-muted">
                        Numerology
                      </h3>
                      <p className="whitespace-pre-line font-mono text-sm text-bone/90">
                        {card.numerology}
                      </p>
                    </div>
                  ) : null}
                  {hasText(card.suitMeaning) || hasSuitPhilosophy ? (
                    <div>
                      <h3 className="mb-2 font-mono text-[10px] uppercase tracking-label text-muted">
                        Suit logic
                      </h3>
                      <div className="space-y-6">
                        {hasText(card.suitMeaning) ? <p>{card.suitMeaning}</p> : null}
                        {hasSuitPhilosophy && card.suitPhilosophy ? (
                          <>
                            {hasText(card.suitPhilosophy.shadow) ? (
                              <div>
                                <h4 className="mb-2 font-mono text-[10px] uppercase tracking-label text-faint">
                                  Shadow
                                </h4>
                                <p>{card.suitPhilosophy.shadow}</p>
                              </div>
                            ) : null}
                            {card.suitPhilosophy.progression.length > 0 ? (
                              <div>
                                <h4 className="mb-2 font-mono text-[10px] uppercase tracking-label text-faint">
                                  Progression
                                </h4>
                                <ul className="list-inside list-disc space-y-1 marker:text-faint">
                                  {card.suitPhilosophy.progression.map((item) => (
                                    <li key={item}>{item}</li>
                                  ))}
                                </ul>
                              </div>
                            ) : null}
                          </>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                </div>
              </StudyDisclosure>
            ) : null}

            {hasText(card.description) ? (
              <StudyDisclosure title="Notes" subtitle="Editorial and context">
                <p className="max-w-prose whitespace-pre-line text-sm leading-relaxed text-muted">
                  {card.description}
                </p>
              </StudyDisclosure>
            ) : null}

            {hasPatterns ? (
              <StudyDisclosure title="Interpretation patterns" subtitle="Systems and reversals">
                <div className="max-w-prose space-y-6 text-sm leading-relaxed text-muted">
                  {hasText(card.interpretationPatterns.developmentalRole) ? (
                    <div>
                      <h3 className="mb-2 font-mono text-[10px] uppercase tracking-label text-muted">
                        Development
                      </h3>
                      <p>{card.interpretationPatterns.developmentalRole}</p>
                    </div>
                  ) : null}
                  {card.interpretationPatterns.systemLinks.length > 0 ? (
                    <div>
                      <h3 className="mb-2 font-mono text-[10px] uppercase tracking-label text-muted">
                        System links
                      </h3>
                      <ul className="list-inside list-disc space-y-1 marker:text-faint">
                        {card.interpretationPatterns.systemLinks.map((line) => (
                          <li key={line}>{line}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {card.interpretationPatterns.reversalModes.length > 0 ? (
                    <div>
                      <h3 className="mb-2 font-mono text-[10px] uppercase tracking-label text-muted">
                        Reversal modes
                      </h3>
                      <ul className="list-inside list-disc space-y-1 marker:text-faint">
                        {card.interpretationPatterns.reversalModes.map((line) => (
                          <li key={line}>{line}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              </StudyDisclosure>
            ) : null}

            {hasRelationshipGroups ? (
              <StudyDisclosure title="Relationships" subtitle="Similar, contrasting, sequence">
                <div className="max-w-prose space-y-6 text-sm leading-relaxed text-muted">
                  {relationships.similar.length > 0 ? (
                    <div>
                      <h3 className="mb-2 font-mono text-[10px] uppercase tracking-label text-muted">
                        Similar
                      </h3>
                      <CardLinkList cards={relationships.similar} backSearch={backSearch} />
                    </div>
                  ) : null}
                  {relationships.contrasting.length > 0 ? (
                    <div>
                      <h3 className="mb-2 font-mono text-[10px] uppercase tracking-label text-muted">
                        Contrasting
                      </h3>
                      <CardLinkList cards={relationships.contrasting} backSearch={backSearch} />
                    </div>
                  ) : null}
                  {relationships.previous.length > 0 || relationships.next.length > 0 ? (
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div>
                        <h3 className="mb-2 font-mono text-[10px] uppercase tracking-label text-muted">
                          Previous
                        </h3>
                        <CardLinkList cards={relationships.previous} backSearch={backSearch} />
                      </div>
                      <div>
                        <h3 className="mb-2 font-mono text-[10px] uppercase tracking-label text-muted">
                          Next
                        </h3>
                        <CardLinkList cards={relationships.next} backSearch={backSearch} />
                      </div>
                    </div>
                  ) : null}
                </div>
              </StudyDisclosure>
            ) : null}

            {card.arcana === "major" && fidelityLoading ? (
              <p className="border border-line border-dashed px-4 py-3 font-mono text-[10px] text-faint" aria-busy="true">
                Loading sources…
              </p>
            ) : null}
            {fidelityMajor ? (
              <StudyDisclosure title="Sources" subtitle="Attributed major arcana">
                <Suspense
                  fallback={
                    <p className="font-mono text-[10px] text-faint" aria-busy="true">
                      …
                    </p>
                  }
                >
                  <AttributedMajorDetailLazy fidelity={fidelityMajor} backSearch={backSearch} />
                </Suspense>
              </StudyDisclosure>
            ) : null}
          </div>
        </div>
        ) : null}
      </div>
    </div>
  );
}
