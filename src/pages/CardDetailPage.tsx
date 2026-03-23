import { useEffect, useMemo } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { CardReferenceBody } from "../components/CardReferenceBody";
import { formatArcanaHeading, getCardBySlug } from "../lib/tarot";

export function CardDetailPage() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
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
    document.title = card ? `${card.name} · Tarot` : "Tarot";
  }, [card]);

  if (!card) {
    return (
      <div className="flex min-h-[70vh] flex-col justify-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-xl space-y-6 border border-line bg-panel p-8 sm:p-10">
          <p className="font-mono text-[10px] uppercase tracking-label text-muted">404</p>
          <h1 className="font-display text-[clamp(2rem,4vw,3rem)] font-medium leading-tight tracking-tight">
            Record not found
          </h1>
          <p className="text-sm text-muted">Unknown card.</p>
          <Link
            to={backToLibrary}
            aria-label="Back"
            className="inline-flex border border-line px-4 py-2.5 font-mono text-sm text-bone transition duration-300 hover:border-line-strong hover:bg-blood/20 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-line-strong"
          >
            ←
          </Link>
        </div>
      </div>
    );
  }

  return (
    <article className="mx-auto w-full max-w-[1200px] px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pt-10">
      <header className="mb-12 space-y-8 border-b border-line pb-10 lg:mb-16 lg:pb-12">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <Link
            to={backToLibrary}
            aria-label="Back"
            className="inline-flex font-mono text-sm text-muted transition duration-300 hover:text-bone focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-line-strong"
          >
            ←
          </Link>
          <Link
            to="/system"
            className="inline-flex font-mono text-sm text-muted transition duration-300 hover:text-bone focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-line-strong"
          >
            System
          </Link>
        </div>

        <div className="space-y-3">
          <p className="font-display text-sm font-normal italic tracking-wide text-muted/90">
            {formatArcanaHeading(card)}
          </p>
          <h1 className="font-display text-[clamp(2.75rem,8vw,5.5rem)] font-medium leading-[0.92] tracking-tight text-balance">
            {card.name}
          </h1>
        </div>
      </header>

      <CardReferenceBody card={card} backSearch={librarySearch} syncOrientationInUrl />
    </article>
  );
}
