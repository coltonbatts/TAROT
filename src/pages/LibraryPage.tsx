import { startTransition, useDeferredValue, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CardTile } from "../components/CardTile";
import { FilterTabs } from "../components/FilterTabs";
import { filterCards, tarotCards, tarotCategories, type TarotCategory } from "../lib/tarot";

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
    document.title = "Tarot Reference";
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

  const search = searchParams.toString();

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
    <div className="space-y-5 pb-12">
      <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[rgba(13,16,21,0.84)] shadow-panel backdrop-blur-xl">
        <div className="relative overflow-hidden px-5 py-6 sm:px-6 sm:py-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(193,155,85,0.15),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.04),transparent_28%)]" />
          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-3">
              <p className="text-[0.68rem] uppercase tracking-[0.34em] text-gold-100/70">
                Archive
              </p>
              <h1 className="font-display text-5xl leading-[0.92] tracking-[-0.03em] text-bone-50 sm:text-6xl">
                Browse the deck, then open a card page.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-smoke-100/75 sm:text-lg">
                Search by card name, keyword, or meaning, filter by suit, and open any card
                into its own reading page.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[30rem] lg:grid-cols-1 xl:grid-cols-3">
              <Stat label="Cards" value={String(tarotCards.length)} />
              <Stat label="Visible" value={String(filteredCards.length)} />
              <Stat label="Source" value="Local JSON" />
            </div>
          </div>

          <div className="relative mt-5 grid gap-3 lg:grid-cols-[minmax(0,1.2fr)_auto] lg:items-end">
            <div className="rounded-[1.35rem] border border-white/10 bg-charcoal-800/85 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <div className="flex items-center gap-3">
                <span className="text-[0.65rem] uppercase tracking-[0.28em] text-smoke-100/50">
                  Search
                </span>
                <input
                  type="search"
                  value={searchInput}
                  onChange={(event) => onQueryChange(event.target.value)}
                  placeholder="Card, keyword, or meaning"
                  className="min-w-0 flex-1 bg-transparent text-sm text-bone-50 outline-none placeholder:text-smoke-100/40"
                />
                {searchInput ? (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.22em] text-smoke-100/70 transition hover:border-gold-200/25 hover:bg-white/10 hover:text-bone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300/40"
                  >
                    Clear
                  </button>
                ) : null}
              </div>
            </div>

            <div className="min-w-0">
              <FilterTabs tabs={counts} active={activeCategory} onChange={onCategoryChange} />
            </div>
          </div>

          <p
            aria-live="polite"
            className="relative mt-3 text-[0.72rem] uppercase tracking-[0.28em] text-smoke-100/45"
          >
            {filteredCards.length
              ? "Open a card to view its dedicated page."
              : "No cards match the current filter."}
          </p>
        </div>
      </section>

      <section className="space-y-3">
        {filteredCards.length ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {filteredCards.map((card, index) => (
              <CardTile key={card.id} card={card} index={index} search={search} />
            ))}
          </div>
        ) : (
          <div className="rounded-[2rem] border border-dashed border-white/10 bg-white/[0.03] p-10 text-center text-smoke-100/70">
            Clear the search field or switch categories to bring the deck back.
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.3rem] border border-white/10 bg-white/[0.04] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
      <div className="text-[0.62rem] uppercase tracking-[0.3em] text-gold-100/65">
        {label}
      </div>
      <div className="mt-2 font-display text-2xl leading-none text-bone-50">
        {value}
      </div>
    </div>
  );
}
