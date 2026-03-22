export type LibraryViewMode = "spatial" | "index";

type Props = {
  view: LibraryViewMode;
  onChange: (view: LibraryViewMode) => void;
};

function IconList({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <path d="M5 7h14M5 12h14M5 17h9" strokeLinecap="round" />
    </svg>
  );
}

function IconSpatial({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <path
        d="M12 4 18 8v8l-6 4-6-4V8l6-4z"
        strokeLinejoin="round"
      />
      <path
        d="M12 12 12 4M12 12 18 8M12 12 6 8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const btn =
  "flex h-10 w-10 items-center justify-center text-muted transition duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-line-strong sm:h-11 sm:w-11";

export function LibraryViewToggle({ view, onChange }: Props) {
  return (
    <nav
      className="flex overflow-hidden rounded-md border border-line"
      aria-label="Library view"
    >
      <button
        type="button"
        aria-label="List view"
        aria-pressed={view === "index"}
        title="List"
        onClick={() => onChange("index")}
        className={[
          btn,
          view === "index" ? "bg-blood/30 text-bone" : "hover:bg-white/[0.04] hover:text-bone",
        ].join(" ")}
      >
        <IconList className="h-5 w-5" />
      </button>
      <button
        type="button"
        aria-label="Spatial view"
        aria-pressed={view === "spatial"}
        title="Spatial"
        onClick={() => onChange("spatial")}
        className={[
          btn,
          "border-l border-line",
          view === "spatial" ? "bg-blood/30 text-bone" : "hover:bg-white/[0.04] hover:text-bone",
        ].join(" ")}
      >
        <IconSpatial className="h-5 w-5" />
      </button>
    </nav>
  );
}
