import type { TarotCard } from "../lib/tarot";

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function metaLine(card: TarotCard) {
  const parts = [
    card.arcana === "major" ? "Major arcana" : "Minor arcana",
    card.suit ? capitalize(card.suit) : null,
    card.number != null ? `No. ${card.number}` : card.rank ? capitalize(card.rank) : null,
  ].filter(Boolean);
  return parts.join(" · ");
}

type CardReferenceBodyProps = {
  card: TarotCard;
};

/**
 * Study layout: artifact image, keywords, upright and reversed as separate panels.
 */
export function CardReferenceBody({ card }: CardReferenceBodyProps) {
  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(220px,320px)_1fr] lg:gap-14 lg:items-start">
      <figure className="space-y-3 lg:sticky lg:top-8">
        <div className="rounded-2xl border border-line bg-void p-2 sm:p-2.5">
          <div className="overflow-hidden rounded-xl bg-void">
            <img
              src={card.imagePath}
              alt={card.name}
              className="aspect-[2/3] w-full object-contain object-center contrast-[1.02]"
              loading="eager"
            />
          </div>
        </div>
        <figcaption className="font-mono text-[10px] tracking-wide text-faint">
          <span className="truncate block">{metaLine(card)}</span>
        </figcaption>
      </figure>

      <div className="min-w-0 space-y-10">
        {card.keywords?.length ? (
          <section>
            <h2 className="mb-4 font-mono text-[10px] uppercase tracking-label text-muted">Keywords</h2>
            <p className="font-mono text-sm leading-snug text-bone">{card.keywords.join(" · ")}</p>
          </section>
        ) : null}

        <section className="border-t border-line pt-8">
          <h2 className="mb-4 font-mono text-[10px] uppercase tracking-label text-muted">Upright</h2>
          <p className="max-w-prose whitespace-pre-line font-body text-[0.9375rem] leading-[1.75] text-bone/95">
            {card.uprightMeaning}
          </p>
        </section>

        <section className="border-t border-line pt-8">
          <h2 className="mb-4 font-mono text-[10px] uppercase tracking-label text-muted">Reversed</h2>
          <p className="max-w-prose whitespace-pre-line font-body text-[0.9375rem] leading-[1.75] text-bone/95">
            {card.reversedMeaning}
          </p>
        </section>

        {card.description || card.symbolism ? (
          <div className="grid gap-10 border-t border-line pt-10 md:grid-cols-2 md:gap-12">
            {card.description ? (
              <section>
                <h2 className="mb-3 font-mono text-[10px] uppercase tracking-label text-muted">Notes</h2>
                <p className="max-w-prose text-sm leading-relaxed text-muted">{card.description}</p>
              </section>
            ) : null}
            {card.symbolism ? (
              <section>
                <h2 className="mb-3 font-mono text-[10px] uppercase tracking-label text-ochre/90">Symbolism</h2>
                <p className="max-w-prose text-sm leading-relaxed text-muted">{card.symbolism}</p>
              </section>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
