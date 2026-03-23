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
      aria-label="Filter deck"
      className="flex flex-wrap gap-x-0 gap-y-0 border-b border-line"
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
              "-mb-px border-b-2 px-2.5 py-2 font-mono text-[10px] uppercase tracking-archive transition duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-line-strong sm:px-3",
              isActive
                ? "border-blood text-bone"
                : "border-transparent text-muted hover:border-line hover:text-bone",
            ].join(" ")}
          >
            <span>{tab.label}</span>
            <span className="ml-1.5 text-faint tabular-nums opacity-70">{tab.count}</span>
          </button>
        );
      })}
    </div>
  );
}
