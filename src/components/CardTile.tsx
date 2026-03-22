import { Link } from "react-router-dom";
import { getCardRankLabel, type TarotCard } from "../lib/tarot";

type CardTileProps = {
  card: TarotCard;
  index: number;
  search: string;
};

function categoryLabel(card: TarotCard) {
  if (card.arcana === "major") {
    return "Major Arcana";
  }

  return card.suit ? card.suit.charAt(0).toUpperCase() + card.suit.slice(1) : "Minor Arcana";
}

export function CardTile({ card, index, search }: CardTileProps) {
  return (
    <Link
      to={{
        pathname: `/cards/${card.slug}`,
        search: search ? `?${search}` : "",
      }}
      aria-label={`Open ${card.name}`}
      className="group block outline-none focus-visible:ring-2 focus-visible:ring-white/35 focus-visible:ring-offset-0"
      style={{ animationDelay: `${index * 24}ms` }}
    >
      <article className="animate-enter flex flex-col gap-4 py-4 transition duration-300 hover:bg-white/[0.02] sm:flex-row sm:items-center sm:gap-6 sm:py-5">
        <div className="w-full max-w-[7.25rem] shrink-0 sm:max-w-[8.5rem]">
          <div className="overflow-hidden border border-white/10 bg-white/[0.02]">
            <img
              src={card.imagePath}
              alt={`${card.name} tarot card scan`}
              className="aspect-[4/5] w-full object-cover contrast-[1.04] grayscale-[0.08] transition duration-700 group-hover:scale-[1.03]"
              loading="lazy"
            />
          </div>
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-[0.64rem] uppercase tracking-[0.34em] text-white/36">
            {categoryLabel(card)}
          </p>
          <h2 className="truncate font-display text-[clamp(1.7rem,2vw,2.5rem)] leading-[0.9] tracking-[-0.06em] text-bone-50">
            {card.name}
          </h2>
          <p className="max-w-3xl text-[0.95rem] leading-6 text-smoke-100/66">
            {getCardRankLabel(card)}
          </p>
          {card.keywords?.length ? (
            <p className="line-clamp-2 text-[0.86rem] leading-6 text-smoke-100/52">
              {card.keywords.slice(0, 4).join(" · ")}
            </p>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-4 text-[0.66rem] uppercase tracking-[0.3em] text-white/36 sm:min-w-[7rem] sm:flex-col sm:items-end sm:justify-center sm:text-right">
          <span>{card.number ?? card.rank?.toUpperCase() ?? "ARC"}</span>
          <span className="text-white/52 transition group-hover:text-bone-50">Open</span>
        </div>
      </article>
    </Link>
  );
}
