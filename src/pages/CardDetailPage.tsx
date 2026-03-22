import { useEffect, useMemo } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { CardReferenceBody } from "../components/CardReferenceBody";
import { MeaningToggle, type Orientation } from "../components/MeaningToggle";
import { getCardBySlug } from "../lib/tarot";

export function CardDetailPage() {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const orientation = (searchParams.get("orientation") ?? "upright") as Orientation;
  const card = useMemo(() => (slug ? getCardBySlug(slug) : undefined), [slug]);
  const librarySearch = useMemo(() => {
    const next = new URLSearchParams(searchParams);
    next.delete("orientation");
    return next.toString();
  }, [searchParams]);
  const backToLibrary = {
    pathname: "/",
    search: librarySearch ? `?${librarySearch}` : "",
  };

  useEffect(() => {
    document.title = card ? `${card.name} · Tarot` : "Card not found · Tarot";
  }, [card]);

  const onOrientationChange = (value: Orientation) => {
    const next = new URLSearchParams(searchParams);
    next.set("orientation", value);
    setSearchParams(next, { replace: true });
  };

  if (!card) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center py-8">
        <div className="w-full max-w-xl space-y-4">
          <p className="text-[0.66rem] uppercase tracking-[0.36em] text-white/34">Card not found</p>
          <h1 className="font-display text-[clamp(2.75rem,5vw,4.5rem)] leading-[0.9] tracking-[-0.08em] text-bone-50">
            That card is not in this deck.
          </h1>
          <p className="max-w-lg text-sm leading-7 text-smoke-100/64">
            The slug in the URL does not match a local tarot card.
          </p>
          <Link
            to={backToLibrary}
            className="inline-flex border border-white/12 px-4 py-2 text-[0.68rem] uppercase tracking-[0.28em] text-white/70 transition hover:border-white/30 hover:text-bone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
          >
            Return to archive
          </Link>
        </div>
      </div>
    );
  }

  return (
    <article className="space-y-10 pb-16 pt-1 lg:pt-4">
      <header className="space-y-6">
        <div className="flex items-center justify-between gap-4 text-[0.66rem] uppercase tracking-[0.34em] text-white/36">
          <Link
            to={backToLibrary}
            className="transition hover:text-bone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
          >
            Back to archive
          </Link>
          <span>{card.arcana === "major" ? "Major arcana" : capitalize(card.suit ?? "Minor")}</span>
        </div>

        <div className="max-w-5xl space-y-4">
          <h1 className="font-display text-[clamp(3.8rem,9vw,7.75rem)] leading-[0.86] tracking-[-0.08em] text-bone-50">
            {card.name}
          </h1>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[0.72rem] uppercase tracking-[0.28em] text-white/42">
            <span>{card.arcana === "major" ? "Major arcana" : "Minor arcana"}</span>
            <span>{card.suit ? capitalize(card.suit) : "No suit"}</span>
            <span>
              {card.number != null ? `No. ${card.number}` : card.rank ? capitalize(card.rank) : "—"}
            </span>
          </div>
        </div>
      </header>

      <CardReferenceBody
        card={card}
        orientation={orientation}
        onOrientationChange={onOrientationChange}
        variant="page"
      />
    </article>
  );
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
