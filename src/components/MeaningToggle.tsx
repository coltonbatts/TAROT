export type Orientation = "upright" | "reversed";

type MeaningToggleProps = {
  value: Orientation;
  onChange: (value: Orientation) => void;
};

export function MeaningToggle({ value, onChange }: MeaningToggleProps) {
  const buttonClass = (active: boolean) =>
    [
      "flex-1 px-4 py-2.5 text-[0.72rem] uppercase tracking-[0.3em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30",
      active
        ? "bg-white text-charcoal-950"
        : "text-white/65 hover:bg-white/[0.04] hover:text-bone-50",
    ].join(" ");

  return (
    <div className="grid w-full grid-cols-2 border border-white/10 bg-white/[0.02]">
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
