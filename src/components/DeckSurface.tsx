import { DeckCard } from "./DeckCard";
import type { TarotCard } from "../lib/tarot";

export type DeckGroup = {
  /** Empty string skips the section heading. */
  label: string;
  cards: TarotCard[];
};

type DeckSurfaceProps = {
  groups: DeckGroup[];
  listSearch: string;
  reducedMotion: boolean;
};

export function DeckSurface({ groups, listSearch, reducedMotion }: DeckSurfaceProps) {
  let globalIndex = 0;

  return (
    <div className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-28 pt-4 sm:px-6 lg:px-8">
      <div
        className="pointer-events-none fixed inset-0 -z-10 opacity-90"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 100% 70% at 50% -15%, rgba(122, 107, 72, 0.07) 0%, transparent 52%), radial-gradient(ellipse 70% 50% at 95% 40%, rgba(76, 66, 88, 0.055) 0%, transparent 48%), #000000",
        }}
      />
      <div className="pointer-events-none fixed inset-0 -z-10 deck-grain opacity-[0.045] mix-blend-overlay" aria-hidden />

      <div className="relative mx-auto max-w-[1680px] space-y-14 sm:space-y-16">
        {groups.map((group) => (
          <section key={group.label || "deck"} aria-label={group.label || "Cards"}>
            {group.label ? (
              <h2 className="mb-6 font-mono text-[10px] uppercase tracking-label text-muted/90 sm:mb-8">
                {group.label}
              </h2>
            ) : null}
            <div
              className="grid items-start justify-items-stretch gap-x-2 gap-y-5 [grid-template-columns:repeat(auto-fill,minmax(4.5rem,1fr))] sm:gap-x-3 sm:gap-y-7 sm:[grid-template-columns:repeat(auto-fill,minmax(5.25rem,1fr))] md:[grid-template-columns:repeat(auto-fill,minmax(5.75rem,1fr))] lg:[grid-template-columns:repeat(auto-fill,minmax(6rem,1fr))]"
            >
              {group.cards.map((card) => {
                const i = globalIndex++;
                return (
                  <DeckCard
                    key={card.id}
                    card={card}
                    index={i}
                    search={listSearch}
                    reducedMotionPref={reducedMotion}
                  />
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
