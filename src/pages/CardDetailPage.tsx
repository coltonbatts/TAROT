import { useEffect, useMemo } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { MeaningToggle, type Orientation } from "../components/MeaningToggle";
import { getCardBySlug } from "../lib/tarot";

export function CardDetailPage() {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const orientation = (searchParams.get("orientation") ?? "upright") as Orientation;
  const card = useMemo(() => (slug ? getCardBySlug(slug) : undefined), [slug]);

  useEffect(() => {
    document.title = card ? `${card.name} · Tarot Reference` : "Card not found · Tarot Reference";
  }, [card]);

  const onOrientationChange = (value: Orientation) => {
    const next = new URLSearchParams(searchParams);
    next.set("orientation", value);
    setSearchParams(next, { replace: true });
  };

  if (!card) {
    return (
      <div className="mx-auto flex min-h-0 max-w-6xl flex-1 items-center justify-center py-8">
        <div className="w-full max-w-xl rounded-[2rem] border border-white/10 bg-[rgba(13,16,21,0.84)] p-6 text-center shadow-panel backdrop-blur-xl">
          <p className="text-[0.68rem] uppercase tracking-[0.34em] text-gold-100/70">
            Card not found
          </p>
          <h1 className="mt-3 font-display text-4xl leading-none text-bone-50">
            That card is not in this deck.
          </h1>
          <p className="mt-4 text-sm leading-7 text-smoke-100/72">
            The slug in the URL does not match a local tarot card.
          </p>
          <Link
            to={{
              pathname: "/",
              search: searchParams.toString() ? `?${searchParams.toString()}` : "",
            }}
            className="mt-6 inline-flex rounded-full border border-gold-200/20 bg-gold-300 px-5 py-2.5 text-sm font-medium text-charcoal-950 transition hover:bg-gold-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300/40"
          >
            Return to library
          </Link>
        </div>
      </div>
    );
  }

  const meaning = orientation === "upright" ? card.uprightMeaning : card.reversedMeaning;

  return (
    <article className="mx-auto flex min-h-0 w-full max-w-[1600px] flex-1 flex-col gap-5 py-8">
      <header className="rounded-[2rem] border border-white/10 bg-[rgba(13,16,21,0.84)] px-5 py-5 shadow-panel backdrop-blur-xl sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <p className="text-[0.68rem] uppercase tracking-[0.34em] text-gold-100/70">
              Card page
            </p>
            <h1 className="font-display text-5xl leading-[0.92] tracking-[-0.03em] text-bone-50 sm:text-6xl">
              {card.name}
            </h1>
            <p className="text-sm leading-7 text-smoke-100/72">
              {card.arcana === "major" ? "Major Arcana" : capitalize(card.suit ?? "Minor Arcana")}
              {card.rank ? ` · ${card.rank}` : ""}
              {card.number != null ? ` · ${card.number}` : ""}
            </p>
          </div>

          <div className="w-full max-w-[18rem]">
            <MeaningToggle value={orientation} onChange={onOrientationChange} />
          </div>
        </div>
      </header>

      <div className="grid min-h-0 gap-5 xl:grid-cols-[minmax(280px,0.92fr)_minmax(0,1.08fr)]">
        <aside className="space-y-5">
          <section className="paper-texture overflow-hidden rounded-[2rem] border border-white/10 bg-[rgba(13,16,21,0.84)] shadow-panel backdrop-blur-xl">
            <div className="border-b border-white/[0.08] px-4 py-3">
              <p className="text-[0.66rem] uppercase tracking-[0.3em] text-gold-100/65">
                Local scan
              </p>
            </div>
            <div className="bg-charcoal-800 p-4 sm:p-5">
              <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-charcoal-950">
                <img
                  src={card.imagePath}
                  alt={card.name}
                  className="aspect-[5/8] w-full object-cover"
                  loading="eager"
                />
              </div>
            </div>
          </section>

          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <InfoCard label="Arcana" value={card.arcana === "major" ? "Major" : "Minor"} />
            <InfoCard label="Suit" value={card.suit ? capitalize(card.suit) : "None"} />
            <InfoCard label="Number" value={card.number != null ? String(card.number) : "—"} />
            <InfoCard label="Rank" value={card.rank ?? "—"} />
          </section>
        </aside>

        <section className="space-y-5">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-panel">
            <p className="text-[0.66rem] uppercase tracking-[0.3em] text-gold-100/65">
              Meaning
            </p>
            <h2 className="mt-2 font-display text-3xl leading-none text-bone-50">
              {orientation === "upright" ? "Upright" : "Reversed"}
            </h2>

            <div className="mt-4 rounded-[1.35rem] border border-white/10 bg-charcoal-900/80 p-4">
              <p className="whitespace-pre-line text-[1rem] leading-8 text-smoke-100/92">
                {meaning}
              </p>
            </div>

            {card.keywords?.length ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {card.keywords.map((keyword) => (
                  <span
                    key={keyword}
                    className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs uppercase tracking-[0.2em] text-smoke-100/75"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          {card.description ? (
            <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 shadow-panel">
              <p className="text-[0.66rem] uppercase tracking-[0.3em] text-gold-100/65">
                Description
              </p>
              <p className="mt-3 text-sm leading-7 text-smoke-100/82">{card.description}</p>
            </section>
          ) : null}

          {card.symbolism ? (
            <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 shadow-panel">
              <p className="text-[0.66rem] uppercase tracking-[0.3em] text-gold-100/65">
                Symbolism
              </p>
              <p className="mt-3 text-sm leading-7 text-smoke-100/82">{card.symbolism}</p>
            </section>
          ) : null}

          <div className="flex items-center justify-between gap-4 rounded-[1.4rem] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-smoke-100/70">
            <Link
              to={{
                pathname: "/",
                search: searchParams.toString() ? `?${searchParams.toString()}` : "",
              }}
              className="text-gold-100 transition hover:text-bone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300/40"
            >
              Back to library
            </Link>
            <span className="uppercase tracking-[0.24em]">{card.slug.replaceAll("-", " ")}</span>
          </div>
        </section>
      </div>
    </article>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
      <div className="text-[0.66rem] uppercase tracking-[0.28em] text-gold-100/65">
        {label}
      </div>
      <div className="mt-2 font-display text-2xl leading-none text-bone-50">
        {value}
      </div>
    </div>
  );
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
