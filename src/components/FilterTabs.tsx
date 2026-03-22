import type { TarotCategory } from "../lib/tarot";

type Tab = {
  id: TarotCategory;
  label: string;
  count: number;
};

type FilterTabsProps = {
  tabs: Tab[];
  active: TarotCategory;
  onChange: (tab: TarotCategory) => void;
};

export function FilterTabs({ tabs, active, onChange }: FilterTabsProps) {
  return (
    <div
      role="group"
      aria-label="Browse tarot categories"
      className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === active;

        return (
          <button
            key={tab.id}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(tab.id)}
            className={[
              "shrink-0 border px-3 py-2 text-[0.68rem] uppercase tracking-[0.26em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30",
              isActive
                ? "border-white bg-white text-charcoal-950"
                : "border-white/10 bg-transparent text-white/60 hover:border-white/20 hover:bg-white/[0.03] hover:text-bone-50",
            ].join(" ")}
          >
            <span>{tab.label}</span>
            <span className="ml-2 text-white/42">{tab.count}</span>
          </button>
        );
      })}
    </div>
  );
}
