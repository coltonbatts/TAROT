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
import {
  filterCards,
  tarotCards,
  tarotCategories,
  type TarotCard,
  type TarotCategory,
} from "../lib/tarot";
import {
  getLibraryWordmarkPresetIndex,
  LIBRARY_WORDMARK_PRESETS,
} from "../lib/ui/libraryWordmark";

const TarotCanvasLazy = lazy(() =>
  import("../scene/TarotCanvas").then((module) => ({ default: module.TarotCanvas })),
);

type LibraryView = "deck" | "spatial";

const MAX_COMPARE = 6;

function librarySearchString(searchParams: URLSearchParams) {
  const next = new URLSearchParams(searchParams);
  next.delete("orientation");
  next.delete("card");
  next.delete("view");
  return next.toString();
}

function compareQuery(slugs: string[]) {
  const q = new URLSearchParams();
  for (const s of slugs) q.append("c", s);
  return q.toString();
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
  const [compareMode, setCompareMode] = useState(false);
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);

  useEffect(() => {
    setSearchInput(queryParam);
  }, [queryParam]);

  useEffect(() => {
    document.title = "Tarot";
  }, []);

  useEffect(() => {
    if (!compareMode) setSelectedSlugs([]);
  }, [compareMode]);

  const filteredCards = useMemo(
    () => filterCards(tarotCards, activeCategory, deferredQuery),
    [activeCategory, deferredQuery],
  );

  const deckGroups = useMemo(() => {
    if (!filteredCards.length) return [];
    const searching = Boolean(deferredQuery.trim());
    if (searching || activeCategory !== "all") {
      return [{ label: "", cards: filteredCards }];
    }
    const majors = filteredCards.filter((c) => c.arcana === "major");
    const minors = filteredCards.filter((c) => c.arcana === "minor");
    const groups: { label: string; cards: TarotCard[] }[] = [];
    if (majors.length) groups.push({ label: "Major arcana", cards: majors });
    if (minors.length) groups.push({ label: "Minor arcana", cards: minors });
    return groups.length ? groups : [{ label: "", cards: filteredCards }];
  }, [filteredCards, deferredQuery, activeCategory]);

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

  const wordmarkPreset = LIBRARY_WORDMARK_PRESETS[getLibraryWordmarkPresetIndex(searchParams)];

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

  const toggleCompareSelect = (slug: string) => {
    setSelectedSlugs((prev) => {
      const set = new Set(prev);
      if (set.has(slug)) set.delete(slug);
      else if (set.size < MAX_COMPARE) set.add(slug);
      return [...set];
    });
  };

  const clearSelection = () => setSelectedSlugs([]);

  const goCompare = () => {
    if (selectedSlugs.length < 2) return;
    navigate(`/compare?${compareQuery(selectedSlugs)}`);
  };

  const toolbar = (
    <div className="mx-auto max-w-2xl space-y-4">
      <label className="block">
        <span className="sr-only">Search cards</span>
        <div className="flex items-end gap-2 border-b border-line pb-2">
          <input
            type="search"
            value={searchInput}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Name"
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
        <button
          type="button"
          aria-pressed={compareMode}
          onClick={() => setCompareMode((v) => !v)}
          className={[
            "border px-2 py-1 font-mono text-[10px] uppercase tracking-archive transition focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-line-strong",
            compareMode
              ? "border-line-strong bg-blood/25 text-bone"
              : "border-transparent text-muted hover:border-line hover:text-bone",
          ].join(" ")}
        >
          Select for compare
        </button>
      </div>
    </div>
  );

  return (
    <div
      className={[
        "flex flex-col bg-void text-bone",
        /* Deck view: pin layout to the viewport so flex + overflow-y-auto on DeckSurface forms one reliable scroll container (avoids split/window vs. pane scroll on trackpads). */
        view === "deck" ? "h-dvh max-h-dvh min-h-0 overflow-hidden" : "min-h-screen",
      ].join(" ")}
    >
      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <header className="shrink-0 border-b border-line bg-void/95 px-4 backdrop-blur-[2px] sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-[1920px]">
            <div className="flex justify-center pt-9 pb-2 sm:pt-11 sm:pb-3">
              <h1 className={`text-center ${wordmarkPreset.className}`}>Tarot</h1>
            </div>
            <nav
              aria-label="Site"
              className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 border-t border-line/60 py-5"
            >
              <Link
                to="/compare"
                className="font-mono text-sm text-muted transition duration-300 hover:text-bone focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-line-strong"
              >
                Compare
              </Link>
              <Link
                to="/system"
                className="font-mono text-sm text-muted transition duration-300 hover:text-bone focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-line-strong"
              >
                Study
              </Link>
              <LibraryViewToggle view={view} onChange={setView} />
            </nav>
          </div>
        </header>

        {view === "deck" ? (
          <section aria-label="Cards" className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="shrink-0 px-4 py-6 sm:px-6 lg:px-8">{toolbar}</div>
            {compareMode ? (
              <p className="px-4 pb-2 font-mono text-[10px] text-muted sm:px-6 lg:px-8">
                Tap cards to select (max {MAX_COMPARE}). Open entry pages when this mode is off.
              </p>
            ) : null}
            {filteredCards.length ? (
              <DeckSurface
                groups={deckGroups}
                listSearch={listSearch}
                reducedMotion={reducedMotion}
                compareMode={compareMode}
                selectedSlugs={selectedSlugs}
                onToggleCompare={toggleCompareSelect}
              />
            ) : (
              <div className="flex flex-1 items-center justify-center px-6 py-24 text-sm text-muted">
                No matches.
              </div>
            )}
          </section>
        ) : (
          <div className="mx-auto flex min-h-0 w-full max-w-[1920px] flex-1 flex-col px-3 pb-8 pt-2 sm:px-5 lg:px-8">
            <div className="shrink-0 border-b border-line/50 pb-6 pt-2">
              <div className="mx-auto max-w-2xl">{toolbar}</div>
            </div>
            <div className="flex min-h-[min(72vh,680px)] flex-1 flex-col lg:min-h-[560px]">
              {filteredCards.length ? (
                <ViewportChamber
                  footer={
                    <p className="text-center font-mono text-[10px] tabular-nums tracking-wider text-muted">
                      {filteredCards.length} / {tarotCards.length}
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
                <div className="flex flex-1 flex-col items-center justify-center gap-4 border border-line bg-inset px-6 py-20 text-sm text-muted">
                  <p>No matches.</p>
                  <Link
                    to="/"
                    className="font-mono text-[10px] uppercase tracking-archive text-muted underline-offset-4 hover:text-bone hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-line-strong"
                  >
                    Grid
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {compareMode && selectedSlugs.length > 0 ? (
        <div
          className="fixed bottom-0 left-0 right-0 z-40 border-t border-line bg-void/95 px-4 py-3 backdrop-blur-sm sm:px-6"
          role="region"
          aria-label="Compare selection"
        >
          <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-center gap-3">
            <span className="font-mono text-[10px] tabular-nums text-muted">{selectedSlugs.length} selected</span>
            <button
              type="button"
              onClick={clearSelection}
              className="border border-line/60 px-3 py-1.5 font-mono text-[10px] uppercase tracking-archive text-muted hover:border-line hover:text-bone focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-line-strong"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={goCompare}
              disabled={selectedSlugs.length < 2}
              className="border border-line px-3 py-1.5 font-mono text-[10px] uppercase tracking-archive text-bone transition hover:bg-blood/20 disabled:opacity-35 disabled:hover:bg-transparent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-line-strong"
            >
              Open compare
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
