import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { formatReferenceMetaLine, getRelatedCards, type TarotCard } from "../lib/tarot";
import { TarotCardImage } from "./TarotCardImage";

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

type CardReferenceBodyProps = {
  card: TarotCard;
  /** Library query string (no leading `?`) to preserve when linking to related cards. */
  backSearch?: string;
};

export function CardReferenceBody({ card, backSearch }: CardReferenceBodyProps) {
  const related = getRelatedCards(card);
  const sym = card.symbolismDetail;
  const hasSymbolismStructure =
    sym &&
    (sym.objects.length > 0 || sym.colors.length > 0 || hasText(sym.direction));
  const hasSymbolismProse = hasText(card.symbolism) && !hasSymbolismStructure;

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
        {card.keywords.length > 0 ? (
          <section>
            <h2 className="mb-4 font-mono text-[10px] uppercase tracking-label text-muted">Keywords</h2>
            <p className="font-mono text-sm leading-snug text-bone">{card.keywords.join(" · ")}</p>
          </section>
        ) : null}

        {hasText(card.coreMeaning) ? (
          <Section title="Core meaning">
            <p className="max-w-prose whitespace-pre-line font-body text-[0.9375rem] leading-[1.75] text-bone/95">
              {card.coreMeaning}
            </p>
          </Section>
        ) : null}

        {hasText(card.uprightMeaning) ? (
          <Section title="Upright">
            <p className="max-w-prose whitespace-pre-line font-body text-[0.9375rem] leading-[1.75] text-bone/95">
              {card.uprightMeaning}
            </p>
          </Section>
        ) : null}

        {hasText(card.reversedMeaning) ? (
          <Section title="Reversed">
            <p className="max-w-prose whitespace-pre-line font-body text-[0.9375rem] leading-[1.75] text-bone/95">
              {card.reversedMeaning}
            </p>
          </Section>
        ) : null}

        {hasText(card.archetype) ? (
          <Section title="Archetype">
            <p className="max-w-prose text-sm leading-relaxed text-muted">{card.archetype}</p>
          </Section>
        ) : null}

        {typeof card.numerology === "number" ? (
          <Section title="Numerology">
            <p className="font-mono text-sm tabular-nums text-bone/90">{card.numerology}</p>
          </Section>
        ) : null}

        {hasText(card.suitMeaning) ? (
          <Section title="Suit meaning">
            <p className="max-w-prose text-sm leading-relaxed text-muted">{card.suitMeaning}</p>
          </Section>
        ) : null}

        {hasSymbolismStructure && sym ? (
          <Section title="Symbolism" titleClassName="mb-4 font-mono text-[10px] uppercase tracking-label text-ochre/90">
            <div className="max-w-prose space-y-6 text-sm leading-relaxed text-muted">
              {sym.objects.length > 0 ? (
                <div>
                  <h3 className="mb-2 font-mono text-[10px] uppercase tracking-label text-muted">Objects</h3>
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

        {card.interpretationPatterns.length > 0 ? (
          <Section title="Interpretation patterns">
            <ul className="max-w-prose list-inside list-disc space-y-1 text-sm leading-relaxed text-muted">
              {card.interpretationPatterns.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </Section>
        ) : null}

        {related.length > 0 ? (
          <Section title="Related">
            <ul className="max-w-prose space-y-2 text-sm leading-relaxed">
              {related.map((r) => (
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
          </Section>
        ) : null}
      </div>
    </div>
  );
}
