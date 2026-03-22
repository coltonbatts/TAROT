import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { CardReferenceBody } from "./CardReferenceBody";
import type { Orientation } from "./MeaningToggle";
import type { TarotCard } from "../lib/tarot";

type CardDetailDrawerProps = {
  card: TarotCard;
  orientation: Orientation;
  onOrientationChange: (value: Orientation) => void;
  onClose: () => void;
  librarySearch: string;
};

export function CardDetailDrawer({
  card,
  orientation,
  onOrientationChange,
  onClose,
  librarySearch,
}: CardDetailDrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const fullPageTo = {
    pathname: `/cards/${card.slug}`,
    search: librarySearch ? `?${librarySearch}` : "",
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    const node = panelRef.current;
    if (!node) {
      return;
    }
    const focusable = node.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    focusable[0]?.focus();
  }, [card.slug]);

  const content = (
    <div
      className="fixed inset-0 z-40 flex justify-end bg-black/48 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-card-title"
    >
      <button
        type="button"
        aria-label="Close card details"
        tabIndex={-1}
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        className="archive-panel-strong relative z-10 flex h-full w-full max-w-lg flex-col border-l border-white/12 bg-charcoal-950/94 shadow-panel"
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4">
          <div className="min-w-0 space-y-2">
            <p className="text-[0.62rem] uppercase tracking-[0.34em] text-white/36">
              {card.arcana === "major" ? "Major arcana" : capitalize(card.suit ?? "Minor")}
            </p>
            <h2
              id="drawer-card-title"
              className="font-display text-[clamp(2.1rem,4vw,3.25rem)] leading-[0.9] tracking-[-0.06em] text-bone-50"
            >
              {card.name}
            </h2>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[0.66rem] uppercase tracking-[0.26em] text-white/40">
              <span>{card.arcana === "major" ? "Major arcana" : "Minor arcana"}</span>
              <span>{card.suit ? capitalize(card.suit) : "—"}</span>
              <span>
                {card.number != null ? `No. ${card.number}` : card.rank ? capitalize(card.rank) : "—"}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 border border-white/12 px-3 py-2 text-[0.62rem] uppercase tracking-[0.28em] text-white/60 transition hover:border-white/24 hover:text-bone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
          >
            Close
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5">
          <CardReferenceBody
            card={card}
            orientation={orientation}
            onOrientationChange={onOrientationChange}
            variant="drawer"
          />
        </div>

        <div className="border-t border-white/10 px-5 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[0.62rem] uppercase tracking-[0.3em] text-white/34">Reference</p>
            <Link
              to={fullPageTo}
              className="inline-flex justify-center border border-white/14 px-4 py-2.5 text-center text-[0.66rem] uppercase tracking-[0.26em] text-white/72 transition hover:border-white/28 hover:text-bone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
            >
              Open full page
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
