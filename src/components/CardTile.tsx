import { Link } from "react-router-dom";
import type { TarotCard } from "../lib/tarot";
import { getCardRankLabel } from "../lib/tarot";

type CardTileProps = {
  card: TarotCard;
  index: number;
  selected?: boolean;
  search: string;
};

function categoryLabel(card: TarotCard) {
  if (card.arcana === "major") {
    return "Major Arcana";
  }
  return card.suit ? `${card.suit.charAt(0).toUpperCase()}${card.suit.slice(1)}` : "Minor Arcana";
}

export function CardTile({ card, index, selected, search }: CardTileProps) {
  return (
    <Link
      to={{
        pathname: `/cards/${card.slug}`,
        search: search ? `?${search}` : "",
      }}
      aria-current={selected ? "page" : undefined}
      className="group block cursor-pointer rounded-[1.75rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300/40"
      style={{ animationDelay: `${index * 32}ms` }}
    >
      <div
        className={[
          "flex items-stretch gap-3 rounded-[1.35rem] border p-3 transition duration-200",
          selected
            ? "border-gold-200/35 bg-white/[0.08] shadow-glow"
            : "border-white/10 bg-white/[0.03] group-hover:-translate-y-0.5 group-hover:border-gold-200/20 group-hover:bg-white/[0.06]",
        ].join(" ")}
      >
        <div className="paper-texture h-24 w-16 shrink-0 overflow-hidden rounded-[1rem] border border-white/10 bg-charcoal-800 sm:h-28 sm:w-[4.75rem]">
          <img
            src={card.imagePath}
            alt={card.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
            loading="lazy"
          />
        </div>
        <div className="min-w-0 flex-1 py-0.5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[0.62rem] uppercase tracking-[0.3em] text-gold-100/65">
                {categoryLabel(card)}
              </p>
              <h3 className="mt-1 truncate font-display text-[1.55rem] leading-none text-bone-50">
                {card.name}
              </h3>
            </div>
            {selected ? (
              <span className="rounded-full border border-gold-200/25 bg-gold-300/10 px-2.5 py-1 text-[0.65rem] uppercase tracking-[0.28em] text-gold-100">
                Open
              </span>
            ) : null}
          </div>
          <p className="mt-2 text-sm text-smoke-100/75">{getCardRankLabel(card)}</p>
          {card.keywords?.length ? (
            <p className="mt-1 truncate text-sm text-smoke-100/60">
              {card.keywords.slice(0, 3).join(" · ")}
            </p>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
