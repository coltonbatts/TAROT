import {
  lazy,
  startTransition,
  Suspense,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSearchParams } from "react-router-dom";
import { CardDetailDrawer } from "../components/CardDetailDrawer";
import { CardTile } from "../components/CardTile";
import { FilterTabs } from "../components/FilterTabs";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import {
  filterCards,
  getCardBySlug,
  tarotCards,
  tarotCategories,
  type TarotCategory,
} from "../lib/tarot";
import type { Orientation } from "../components/MeaningToggle";

const TarotCanvasLazy = lazy(() =>
  import("../scene/TarotCanvas").then((module) => ({ default: module.TarotCanvas })),
);

type LibraryView = "spatial" | "index";

export function LibraryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get("q") ?? "";
  const activeCategory = (searchParams.get("category") ?? "all") as TarotCategory;
  const viewParam = (searchParams.get("view") ?? "spatial") as LibraryView;
  const view: LibraryView = viewParam === "index" ? "index" : "spatial";
  const selectedSlug = searchParams.get("card");
  const [searchInput, setSearchInput] = useState(queryParam);
  const deferredQuery = useDeferredValue(searchInput);
  const [drawerOrientation, setDrawerOrientation] = useState<Orientation>("upright");
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    setSearchInput(queryParam);
  }, [queryParam]);

  useEffect(() => {
    document.title = "Tarot · Library";
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

  const listSearch = useMemo(() => {
    const next = new URLSearchParams(searchParams);
    next.delete("orientation");
    next.delete("card");
    return next.toString();
  }, [searchParams]);

  const selectedCard = useMemo(
    () => (selectedSlug ? getCardBySlug(selectedSlug) : undefined),
    [selectedSlug],
  );

  const setView = (next: LibraryView) => {
    startTransition(() => {
      const nextParams = new URLSearchParams(searchParams);
      if (next === "spatial") {
        nextParams.delete("view");
      } else {
        nextParams.set("view", "index");
      }
      setSearchParams(nextParams, { replace: true });
    });
  };

  const setSelectedSlug = (slug: string | null) => {
    startTransition(() => {
      const next = new URLSearchParams(searchParams);
      if (slug) {
        next.set("card", slug);
      } else {
        next.delete("card");
      }
      setSearchParams(next, { replace: true });
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

  const closeDrawer = () => {
    setSelectedSlug(null);
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-charcoal-950">
      {view === "spatial" ? (
        <div className="absolute inset-0">
          {filteredCards.length ? (
            <Suspense
              fallback={
                <div className="flex h-full items-center justify-center bg-charcoal-950 text-[0.68rem] uppercase tracking-[0.28em] text-white/40">
                  Loading spatial library…
                </div>
              }
            >
              <TarotCanvasLazy
                cards={filteredCards}
                selectedSlug={selectedSlug}
                onSelectCard={(card) => {
                  setDrawerOrientation("upright");
                  setSelectedSlug(card.slug);
                }}
                controlsEnabled={!selectedSlug}
                reducedMotion={reducedMotion}
              />
            </Suspense>
          ) : (
            <div className="flex h-full items-center justify-center bg-charcoal-950 px-6 text-center text-sm text-smoke-100/58">
              No cards match this search in the spatial view. Switch to index or clear filters.
            </div>
          )}
        </div>
      ) : null}

      <div
        className={[
          "pointer-events-none relative z-10 flex min-h-0 flex-1 flex-col",
          view === "spatial" ? "" : "overflow-y-auto",
        ].join(" ")}
      >
        <header className="pointer-events-auto shrink-0 border-b border-white/10 bg-charcoal-950/78 px-4 py-4 backdrop-blur-md sm:px-6 lg:px-8">
          <div className="mx-auto flex w-full max-w-[1760px] flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-4">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <h1 className="font-display text-[clamp(3rem,8vw,6rem)] leading-[0.86] tracking-[-0.08em] text-bone-50">
                  Tarot
                </h1>
                <div
                  role="group"
                  aria-label="Library view mode"
                  className="flex gap-1 border border-white/10 bg-white/[0.02] p-1"
                >
                  <button
                    type="button"
                    aria-pressed={view === "spatial"}
                    onClick={() => setView("spatial")}
                    className={[
                      "px-3 py-2 text-[0.62rem] uppercase tracking-[0.26em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30",
                      view === "spatial"
                        ? "bg-white text-charcoal-950"
                        : "text-white/55 hover:text-bone-50",
                    ].join(" ")}
                  >
                    Spatial
                  </button>
                  <button
                    type="button"
                    aria-pressed={view === "index"}
                    onClick={() => setView("index")}
                    className={[
                      "px-3 py-2 text-[0.62rem] uppercase tracking-[0.26em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30",
                      view === "index"
                        ? "bg-white text-charcoal-950"
                        : "text-white/55 hover:text-bone-50",
                    ].join(" ")}
                  >
                    Index
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="tarot-search"
                  className="text-[0.64rem] uppercase tracking-[0.32em] text-white/34"
                >
                  Search
                </label>
                <div className="flex items-end gap-3 border-b border-white/10 pb-2.5">
                  <input
                    id="tarot-search"
                    type="search"
                    value={searchInput}
                    onChange={(event) => onQueryChange(event.target.value)}
                    placeholder="Card, keyword, meaning"
                    aria-label="Search tarot cards"
                    className="min-w-0 flex-1 bg-transparent text-[0.98rem] text-bone-50 outline-none placeholder:text-white/26 sm:text-[1.05rem]"
                  />
                  {searchInput ? (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="pointer-events-auto shrink-0 text-[0.64rem] uppercase tracking-[0.24em] text-white/42 transition hover:text-bone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                    >
                      Clear
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="space-y-2">
                <FilterTabs tabs={counts} active={activeCategory} onChange={onCategoryChange} />
                <p
                  aria-live="polite"
                  className="text-[0.64rem] uppercase tracking-[0.26em] text-white/34"
                >
                  {filteredCards.length
                    ? `${filteredCards.length} card${filteredCards.length === 1 ? "" : "s"} visible`
                    : "No cards match this search."}
                </p>
              </div>

              {view === "spatial" ? (
                <p className="max-w-xl text-[0.72rem] leading-5 text-white/38">
                  Drag to orbit · scroll to zoom · click a card to read. Filters shrink the cluster.
                </p>
              ) : null}
            </div>
          </div>
        </header>

        {view === "index" ? (
          <section
            aria-label="Tarot deck index"
            className="pointer-events-auto mx-auto w-full max-w-[1760px] flex-1 px-4 pb-20 pt-2 sm:px-6 lg:px-8"
          >
            {filteredCards.length ? (
              <div className="divide-y divide-white/10 border-y border-white/10">
                {filteredCards.map((card, index) => (
                  <CardTile key={card.id} card={card} index={index} search={listSearch} />
                ))}
              </div>
            ) : (
              <div className="border-y border-white/10 py-16 text-center text-smoke-100/60">
                Clear the search field or switch categories to bring the deck back.
              </div>
            )}
          </section>
        ) : (
          <div className="pointer-events-none flex-1" aria-hidden />
        )}
      </div>

      {selectedCard ? (
        <CardDetailDrawer
          card={selectedCard}
          orientation={drawerOrientation}
          onOrientationChange={setDrawerOrientation}
          onClose={closeDrawer}
          librarySearch={listSearch}
        />
      ) : null}
    </div>
  );
}
