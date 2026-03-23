import { useEffect, useMemo } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { CardReferenceBody } from "../components/CardReferenceBody";
import { getCardBySlug } from "../lib/tarot";

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
    <article className="relative mx-auto w-full max-w-[1180px] px-4 pb-28 pt-5 sm:px-6 lg:px-10 lg:pt-8">
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-40"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(122, 107, 72, 0.07) 0%, transparent 55%), radial-gradient(ellipse 60% 40% at 100% 30%, rgba(76, 66, 88, 0.06) 0%, transparent 50%)",
        }}
      />
      <nav className="mb-10 flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-line/60 pb-6 lg:mb-12">
        <Link
          to={backToLibrary}
          aria-label="Back to library"
          className="inline-flex font-mono text-sm text-muted transition duration-300 hover:text-bone focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-line-strong"
        >
          ← Index
        </Link>
        <Link
          to="/system"
          className="inline-flex font-mono text-sm text-muted transition duration-300 hover:text-bone focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-line-strong"
        >
          Study
        </Link>
      </nav>

      <CardReferenceBody card={card} backSearch={librarySearch} syncOrientationInUrl />
    </article>
  );
}
