import {
  lazy,
  startTransition,
  Suspense,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CardTile } from "../components/CardTile";
import { FilterTabs } from "../components/FilterTabs";
import { LibraryViewToggle } from "../components/LibraryViewToggle";
import { ViewportChamber } from "../components/ViewportChamber";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import {
  filterCards,
  tarotCards,
  tarotCategories,
  type TarotCard,
  type TarotCategory,
} from "../lib/tarot";

const TarotCanvasLazy = lazy(() =>
  import("../scene/TarotCanvas").then((module) => ({ default: module.TarotCanvas })),
);

type LibraryView = "spatial" | "index";

function librarySearchString(searchParams: URLSearchParams) {
  const next = new URLSearchParams(searchParams);
  next.delete("orientation");
  next.delete("card");
  next.delete("view");
  return next.toString();
}

export function LibraryPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get("q") ?? "";
  const activeCategory = (searchParams.get("category") ?? "all") as TarotCategory;
  const view: LibraryView = searchParams.get("view") === "spatial" ? "spatial" : "index";
  const [searchInput, setSearchInput] = useState(queryParam);
  const deferredQuery = useDeferredValue(searchInput);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    setSearchInput(queryParam);
  }, [queryParam]);

  useEffect(() => {
    document.title = "Tarot";
  }, []);

  const filteredCards = useMemo(
    () => filterCards(tarotCards, activeCategory, deferredQuery),
    [activeCategory, deferredQuery],
  );

  const counts = useMemo(
    () =>
      tarotCategories.map((category) => ({
        ...category,
        count:
          category.id === "all"
            ? tarotCards.length
            : tarotCards.filter((card) =>
                category.id === "major"
                  ? card.arcana === "major"
                  : card.suit === category.id,
              ).length,
      })),
    [],
  );

  const listSearch = useMemo(() => librarySearchString(searchParams), [searchParams]);

  const openCard = (card: TarotCard) => {
    const qs = listSearch ? `?${listSearch}` : "";
    navigate(`/cards/${card.slug}${qs}`);
  };

  const setView = (next: LibraryView) => {
    startTransition(() => {
      const nextParams = new URLSearchParams(searchParams);
      if (next === "spatial") {
        nextParams.set("view", "spatial");
      } else {
        nextParams.delete("view");
      }
      setSearchParams(nextParams, { replace: true });
    });
  };

  const onQueryChange = (value: string) => {
    setSearchInput(value);
    startTransition(() => {
      const next = new URLSearchParams(searchParams);
      if (value.trim()) {
        next.set("q", value);
      } else {
        next.delete("q");
      }
      setSearchParams(next, { replace: true });
    });
  };

  const onCategoryChange = (category: TarotCategory) => {
    startTransition(() => {
      const next = new URLSearchParams(searchParams);
      if (category === "all") {
        next.delete("category");
      } else {
        next.set("category", category);
      }

      if (searchInput.trim()) {
        next.set("q", searchInput);
      } else {
        next.delete("q");
      }

      setSearchParams(next, { replace: true });
    });
  };

  const clearSearch = () => onQueryChange("");

  const categoryLabel = (c: TarotCategory) =>
    tarotCategories.find((t) => t.id === c)?.label ?? c;

  return (
    <div className="flex min-h-screen flex-col bg-void text-bone">
      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <header className="shrink-0 border-b border-line bg-void/95 px-4 backdrop-blur-[2px] sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-[1920px]">
            <div className="flex flex-col items-center gap-5 py-8 sm:py-10 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:gap-3">
              <div className="hidden min-w-0 lg:block" aria-hidden />
              <h1 className="text-center font-display text-[clamp(2.75rem,12vw,5.5rem)] font-medium leading-none tracking-tight lg:justify-self-center">
                Tarot
              </h1>
              <div className="flex items-center justify-center gap-5 lg:justify-end">
                <Link
                  to="/system"
                  className="shrink-0 font-mono text-sm text-muted transition duration-300 hover:text-bone focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-line-strong"
                >
                  System
                </Link>
                <LibraryViewToggle view={view} onChange={setView} />
              </div>
            </div>

            <div className="mx-auto max-w-2xl space-y-5 pb-8">
              <label className="block">
                <span className="sr-only">Search</span>
                <div className="flex items-end gap-2 border-b border-line pb-2">
                  <input
                    type="search"
                    value={searchInput}
                    onChange={(event) => onQueryChange(event.target.value)}
                    placeholder="Search"
                    className="min-w-0 flex-1 bg-transparent font-body text-base text-bone outline-none placeholder:text-faint/70"
                  />
                  {searchInput ? (
                    <button
                      type="button"
                      onClick={clearSearch}
                      aria-label="Clear search"
                      className="flex h-8 w-8 shrink-0 items-center justify-center text-muted transition hover:text-bone focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-line-strong"
                    >
                      <span className="text-lg leading-none" aria-hidden>
                        ×
                      </span>
                    </button>
                  ) : null}
                </div>
              </label>

              <FilterTabs tabs={counts} active={activeCategory} onChange={onCategoryChange} />
              <p className="sr-only" aria-live="polite">
                {filteredCards.length} cards
              </p>
            </div>
          </div>
        </header>

        {view === "index" ? (
          <section
            aria-label="Deck"
            className="mx-auto w-full max-w-[1920px] flex-1 px-4 pb-24 pt-2 sm:px-6 lg:px-8"
          >
            {filteredCards.length ? (
              <div className="border-t border-line">
                {filteredCards.map((card, index) => (
                  <CardTile key={card.id} card={card} index={index} search={listSearch} />
                ))}
              </div>
            ) : (
              <div className="border border-line py-16 text-center text-sm text-muted">No matches.</div>
            )}
          </section>
        ) : (
          <div className="mx-auto grid min-h-0 w-full max-w-[1920px] flex-1 grid-cols-1 gap-0 lg:grid-cols-[minmax(180px,220px)_1fr_minmax(140px,180px)] lg:min-h-0 lg:flex-1 lg:px-6 lg:pb-6">
            <aside className="hidden min-h-0 flex-col border-line lg:flex lg:border-r">
              <nav
                className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 py-3"
                aria-label="Cards"
              >
                <ul className="space-y-0.5">
                  {filteredCards.map((card) => (
                    <li key={card.id}>
                      <Link
                        to={{ pathname: `/cards/${card.slug}`, search: listSearch ? `?${listSearch}` : "" }}
                        className="block truncate border-l-2 border-transparent py-1.5 pl-2 font-mono text-[11px] text-muted transition duration-300 hover:border-line-strong hover:text-bone focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-line-strong"
                      >
                        {card.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>

            <div className="flex min-h-[min(72vh,680px)] flex-1 flex-col p-3 sm:p-4 lg:min-h-[560px] lg:p-4">
              {filteredCards.length ? (
                <ViewportChamber
                  footer={
                    <p className="text-center font-mono text-[10px] tabular-nums tracking-wider text-muted">
                      {filteredCards.length}/{tarotCards.length}
                    </p>
                  }
                >
                  <Suspense
                    fallback={
                      <div className="flex h-64 w-full items-center justify-center font-mono text-[10px] text-muted lg:h-full">
                        …
                      </div>
                    }
                  >
                    <TarotCanvasLazy
                      cards={filteredCards}
                      onSelectCard={openCard}
                      reducedMotion={reducedMotion}
                    />
                  </Suspense>
                </ViewportChamber>
              ) : (
                <div className="flex flex-1 items-center justify-center border border-line bg-inset px-6 py-20 text-sm text-muted">
                  No matches.
                </div>
              )}
            </div>

            <aside className="hidden items-start justify-end border-line pt-4 lg:flex lg:border-l lg:px-3">
              <p className="max-w-full text-right font-mono text-[10px] leading-relaxed text-muted">
                <span className="block truncate text-bone/80">{categoryLabel(activeCategory)}</span>
                {deferredQuery.trim() ? (
                  <span className="mt-2 block truncate opacity-80">{deferredQuery.trim()}</span>
                ) : null}
              </p>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
