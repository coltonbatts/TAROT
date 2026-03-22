export type Orientation = "upright" | "reversed";

type MeaningToggleProps = {
  value: Orientation;
  onChange: (value: Orientation) => void;
};

export function MeaningToggle({ value, onChange }: MeaningToggleProps) {
  const buttonClass = (active: boolean) =>
    [
      "flex-1 rounded-full px-4 py-2 text-sm font-medium transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300/40",
      active
        ? "bg-gold-300 text-charcoal-950 shadow-glow"
        : "text-smoke-100/80 hover:bg-white/5 hover:text-bone-50",
    ].join(" ");

  return (
    <div className="inline-flex w-full rounded-full border border-white/10 bg-white/5 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <button
        type="button"
        onClick={() => onChange("upright")}
        aria-pressed={value === "upright"}
        className={buttonClass(value === "upright")}
      >
        Upright
      </button>
      <button
        type="button"
        onClick={() => onChange("reversed")}
        aria-pressed={value === "reversed"}
        className={buttonClass(value === "reversed")}
      >
        Reversed
      </button>
    </div>
  );
}
