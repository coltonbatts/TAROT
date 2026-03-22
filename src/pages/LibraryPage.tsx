import {
  startTransition,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSearchParams } from "react-router-dom";
import { CardTile } from "../components/CardTile";
import { FilterTabs } from "../components/FilterTabs";
import {
  filterCards,
  tarotCards,
  tarotCategories,
  type TarotCategory,
} from "../lib/tarot";

export function LibraryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get("q") ?? "";
  const activeCategory = (searchParams.get("category") ?? "all") as TarotCategory;
  const [searchInput, setSearchInput] = useState(queryParam);
  const deferredQuery = useDeferredValue(searchInput);

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

  const listSearch = useMemo(() => {
    const next = new URLSearchParams(searchParams);
    next.delete("orientation");
    return next.toString();
  }, [searchParams]);

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

  return (
    <div className="space-y-8 pb-16 lg:space-y-10">
      <section className="pt-1 sm:pt-4">
        <div className="max-w-5xl space-y-6">
          <h1 className="font-display text-[clamp(4.5rem,11vw,9.5rem)] leading-[0.84] tracking-[-0.08em] text-bone-50">
            Tarot
          </h1>

          <div className="max-w-3xl space-y-3">
            <label
              htmlFor="tarot-search"
              className="text-[0.66rem] uppercase tracking-[0.34em] text-white/36"
            >
              Search
            </label>
            <div className="flex items-end gap-3 border-b border-white/10 pb-3">
              <input
                id="tarot-search"
                type="search"
                value={searchInput}
                onChange={(event) => onQueryChange(event.target.value)}
                placeholder="Card, keyword, meaning"
                aria-label="Search tarot cards"
                className="min-w-0 flex-1 bg-transparent text-[1rem] text-bone-50 outline-none placeholder:text-white/26 sm:text-[1.08rem]"
              />
              {searchInput ? (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="shrink-0 text-[0.68rem] uppercase tracking-[0.26em] text-white/42 transition hover:text-bone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                >
                  Clear
                </button>
              ) : null}
            </div>
          </div>

          <div className="space-y-3">
            <FilterTabs tabs={counts} active={activeCategory} onChange={onCategoryChange} />
            <p
              aria-live="polite"
              className="text-[0.68rem] uppercase tracking-[0.28em] text-white/34"
            >
              {filteredCards.length
                ? `${filteredCards.length} card${filteredCards.length === 1 ? "" : "s"} visible`
                : "No cards match this search."}
            </p>
          </div>
        </div>
      </section>

      <section aria-label="Tarot deck" className="pt-1">
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
    </div>
  );
}
