import { Link } from "react-router-dom";
import { formatCardMetaShort, formatCardOrdinalLabel, type TarotCard } from "../lib/tarot";
import { TarotCardImage } from "./TarotCardImage";

type CardTileProps = {
  card: TarotCard;
  index: number;
  search: string;
};

/** Portrait tarot proportion (~2:3 width:height), rounded like a physical card. */
export function CardTile({ card, index, search }: CardTileProps) {
  return (
    <Link
      to={{
        pathname: `/cards/${card.slug}`,
        search: search ? `?${search}` : "",
      }}
      aria-label={card.name}
      className="group block outline-none transition-opacity duration-300 focus-visible:ring-1 focus-visible:ring-line-strong focus-visible:ring-offset-2 focus-visible:ring-offset-void"
      style={{ animationDelay: `${index * 20}ms` }}
    >
      <article className="animate-fade-up flex flex-col gap-4 border-b border-line py-5 transition-colors duration-300 last:border-b-0 hover:bg-white/[0.035] sm:flex-row sm:items-center sm:gap-8 sm:py-6">
        <div className="w-[5.75rem] shrink-0 sm:w-[6.75rem]">
          <div className="rounded-xl border border-line bg-void p-1 shadow-none">
            <div className="overflow-hidden rounded-lg bg-void">
              <TarotCardImage
                src={card.imagePath}
                alt=""
                className="aspect-[2/3] w-full object-contain object-center transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                loading="lazy"
              />
            </div>
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
          <p className="font-display text-[12px] font-normal italic tracking-wide text-muted">
            {formatCardMetaShort(card)}
          </p>
          <h2 className="font-display text-[clamp(1.45rem,2vw,2.1rem)] font-medium leading-tight tracking-tight">
            {card.name}
          </h2>
        </div>

        <div className="hidden font-mono text-[10px] tabular-nums text-faint sm:block sm:w-12 sm:text-right">
          {formatCardOrdinalLabel(card)}
        </div>
      </article>
    </Link>
  );
}
