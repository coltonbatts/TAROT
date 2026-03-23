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
import { DeckSurface } from "../components/DeckSurface";
import { FilterTabs } from "../components/FilterTabs";
import { LibraryViewToggle } from "../components/LibraryViewToggle";
import { ViewportChamber } from "../components/ViewportChamber";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import { seededShuffle } from "../lib/deck/shuffle";
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

type LibraryView = "deck" | "spatial";

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
  const view: LibraryView = searchParams.get("view") === "spatial" ? "spatial" : "deck";
  const [searchInput, setSearchInput] = useState(queryParam);
  const deferredQuery = useDeferredValue(searchInput);
  const reducedMotion = usePrefersReducedMotion();
  const [shuffleNonce, setShuffleNonce] = useState(0);

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

  useEffect(() => {
    setShuffleNonce(0);
  }, [activeCategory, deferredQuery]);

  const displayCards = useMemo(() => {
    if (shuffleNonce === 0) return filteredCards;
    return seededShuffle(filteredCards, shuffleNonce);
  }, [filteredCards, shuffleNonce]);

  const deckGroups = useMemo(() => {
    if (!displayCards.length) return [];
    const searching = Boolean(deferredQuery.trim());
    const shuffled = shuffleNonce !== 0;
    if (searching || shuffled || activeCategory !== "all") {
      return [{ label: "", cards: displayCards }];
    }
    const majors = displayCards.filter((c) => c.arcana === "major");
    const minors = displayCards.filter((c) => c.arcana === "minor");
    const groups: { label: string; cards: TarotCard[] }[] = [];
    if (majors.length) groups.push({ label: "Major arcana", cards: majors });
    if (minors.length) groups.push({ label: "Minor arcana", cards: minors });
    return groups.length ? groups : [{ label: "", cards: displayCards }];
  }, [displayCards, deferredQuery, shuffleNonce, activeCategory]);

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

  const shuffleDeck = () => setShuffleNonce((n) => n + 1);

  const restoreOrder = () => setShuffleNonce(0);

  const drawRandom = () => {
    if (!filteredCards.length) return;
    const pick = filteredCards[Math.floor(Math.random() * filteredCards.length)];
    openCard(pick);
  };

  return (
    <div className="flex min-h-screen flex-col bg-void text-bone">
      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <header className="shrink-0 border-b border-line bg-void/95 px-4 backdrop-blur-[2px] sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-[1920px]">
            <div className="flex flex-col items-center gap-6 py-8 sm:py-10 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-start lg:gap-6 lg:pt-10">
              <div className="hidden min-w-0 lg:block" aria-hidden />
              <div className="max-w-xl text-center lg:justify-self-center lg:text-center">
                <h1 className="font-display text-[clamp(2.75rem,10vw,5rem)] font-medium leading-[0.95] tracking-tight">
                  Tarot
                </h1>
                <p className="mx-auto mt-3 max-w-md text-pretty font-body text-sm leading-relaxed text-muted sm:text-[15px]">
                  A full deck, ordered and searchable. Browse the table, or open orbit to move through the sphere.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-4 lg:justify-end lg:pt-1">
                <Link
                  to="/system"
                  className="shrink-0 font-mono text-sm text-muted transition duration-300 hover:text-bone focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-line-strong"
                >
                  System
                </Link>
                <LibraryViewToggle view={view} onChange={setView} />
              </div>
            </div>

            <div className="mx-auto max-w-2xl space-y-4 pb-6 lg:pb-8">
              <label className="block">
                <span className="sr-only">Search</span>
                <div className="flex items-end gap-2 border-b border-line pb-2">
                  <input
                    type="search"
                    value={searchInput}
                    onChange={(event) => onQueryChange(event.target.value)}
                    placeholder="Search by name"
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

              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line/60 pb-3">
                <p className="font-mono text-[10px] tabular-nums tracking-wider text-muted" aria-live="polite">
                  {filteredCards.length} / {tarotCards.length}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={shuffleDeck}
                    disabled={!filteredCards.length}
                    className="border border-transparent px-2 py-1 font-mono text-[10px] uppercase tracking-archive text-muted transition hover:border-line hover:text-bone disabled:opacity-40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-line-strong"
                  >
                    Shuffle
                  </button>
                  {shuffleNonce !== 0 ? (
                    <button
                      type="button"
                      onClick={restoreOrder}
                      className="border border-transparent px-2 py-1 font-mono text-[10px] uppercase tracking-archive text-muted transition hover:border-line hover:text-bone focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-line-strong"
                    >
                      Restore order
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={drawRandom}
                    disabled={!filteredCards.length}
                    className="border border-transparent px-2 py-1 font-mono text-[10px] uppercase tracking-archive text-muted transition hover:border-line hover:text-bone disabled:opacity-40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-line-strong"
                  >
                    Draw
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {view === "deck" ? (
          <section aria-label="Deck" className="flex min-h-0 flex-1 flex-col">
            {filteredCards.length ? (
              <DeckSurface groups={deckGroups} listSearch={listSearch} reducedMotion={reducedMotion} />
            ) : (
              <div className="flex flex-1 items-center justify-center border-t border-line px-6 py-24 text-sm text-muted">
                No matches.
              </div>
            )}
          </section>
        ) : (
          <div className="mx-auto flex min-h-0 w-full max-w-[1920px] flex-1 flex-col px-3 pb-8 pt-2 sm:px-5 lg:px-8">
            <div className="flex min-h-[min(72vh,680px)] flex-1 flex-col lg:min-h-[560px]">
              {filteredCards.length ? (
                <ViewportChamber
                  footer={
                    <p className="text-center font-mono text-[10px] tabular-nums tracking-wider text-muted">
                      {filteredCards.length} / {tarotCards.length} · orbit
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
          </div>
        )}
      </div>
    </div>
  );
}
