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
              "shrink-0 rounded-full border px-4 py-2 text-sm transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300/40",
              isActive
                ? "border-gold-200/40 bg-gold-300 text-charcoal-950 shadow-glow"
                : "border-white/10 bg-white/5 text-smoke-100/80 hover:border-gold-200/20 hover:bg-white/[0.08] hover:text-bone-50",
            ].join(" ")}
          >
            {tab.label}
            <span className="ml-2 text-xs opacity-70">{tab.count}</span>
          </button>
        );
      })}
    </div>
  );
}
