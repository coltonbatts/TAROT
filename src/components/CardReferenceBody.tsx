import { MeaningToggle, type Orientation } from "./MeaningToggle";
import type { TarotCard } from "../lib/tarot";

type CardReferenceBodyProps = {
  card: TarotCard;
  orientation: Orientation;
  onOrientationChange: (value: Orientation) => void;
  /** Tighter typography for overlay drawer */
  variant?: "page" | "drawer";
};

export function CardReferenceBody({
  card,
  orientation,
  onOrientationChange,
  variant = "page",
}: CardReferenceBodyProps) {
  const meaning = orientation === "upright" ? card.uprightMeaning : card.reversedMeaning;
  const imageLeft = card.arcana === "major";
  const gridClass = imageLeft
    ? "xl:grid-cols-[minmax(240px,0.82fr)_minmax(0,1.18fr)]"
    : "xl:grid-cols-[minmax(0,1.18fr)_minmax(240px,0.82fr)]";
  const proseClass =
    variant === "drawer"
      ? "max-w-[48ch] whitespace-pre-line text-[clamp(0.98rem,0.9vw+0.78rem,1.22rem)] leading-[1.82] text-bone-50/92"
      : "max-w-[52ch] whitespace-pre-line text-[clamp(1.05rem,1vw+0.82rem,1.5rem)] leading-[1.9] text-bone-50/92";

  return (
    <section className={`grid gap-6 xl:items-start ${gridClass}`}>
      <aside
        className={
          imageLeft ? "space-y-2 xl:sticky xl:top-6 xl:order-1" : "space-y-2 xl:sticky xl:top-6 xl:order-2"
        }
      >
        <div className="border border-white/10 bg-white/[0.02] p-2.5">
          <img
            src={card.imagePath}
            alt={`${card.name} tarot card scan`}
            className="aspect-[5/8] w-full object-cover contrast-[1.05] grayscale-[0.08]"
            loading="eager"
          />
        </div>
        <div className="flex items-center justify-between text-[0.62rem] uppercase tracking-[0.28em] text-white/32">
          <span>Scan</span>
          <span className="truncate">{card.slug.replaceAll("-", " ")}</span>
        </div>
      </aside>

      <div className={imageLeft ? "space-y-6 xl:order-2" : "space-y-6 xl:order-1"}>
        <section className="space-y-3">
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[0.64rem] uppercase tracking-[0.3em] text-white/34">Meaning</p>
            <div className="w-full sm:max-w-[16rem]">
              <MeaningToggle value={orientation} onChange={onOrientationChange} />
            </div>
          </div>

          <div className="border-y border-white/10 py-5">
            <p className={proseClass}>{meaning}</p>
          </div>

          {card.keywords?.length ? (
            <div className="flex flex-wrap gap-1.5">
              {card.keywords.map((keyword) => (
                <span
                  key={keyword}
                  className="border border-white/10 px-2.5 py-1 text-[0.62rem] uppercase tracking-[0.22em] text-white/56"
                >
                  {keyword}
                </span>
              ))}
            </div>
          ) : null}
        </section>

        {card.description || card.symbolism ? (
          <section className="grid gap-6 border-t border-white/10 pt-5 md:grid-cols-2">
            {card.description ? (
              <div className="space-y-2">
                <p className="text-[0.62rem] uppercase tracking-[0.3em] text-white/34">Description</p>
                <p className="max-w-[38ch] text-sm leading-6 text-smoke-100/64">{card.description}</p>
              </div>
            ) : null}

            {card.symbolism ? (
              <div className="space-y-2">
                <p className="text-[0.62rem] uppercase tracking-[0.3em] text-white/34">Symbolism</p>
                <p className="max-w-[38ch] text-sm leading-6 text-smoke-100/64">{card.symbolism}</p>
              </div>
            ) : null}
          </section>
        ) : null}
      </div>
    </section>
  );
}
