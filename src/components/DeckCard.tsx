import { memo, useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import type { TarotCard } from "../lib/tarot";
import { tarotCardThumbnailPath } from "../lib/tarot/thumbnailPath";
import { TarotCardImage } from "./TarotCardImage";

function hashSlug(slug: string) {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = Math.imul(h, 31) + slug.charCodeAt(i);
  return h | 0;
}

export type DeckCardProps = {
  card: TarotCard;
  index: number;
  search: string;
  reducedMotionPref: boolean;
  compareMode?: boolean;
  selected?: boolean;
  onToggleCompare?: (slug: string) => void;
};

export const DeckCard = memo(function DeckCard({
  card,
  index,
  search,
  reducedMotionPref,
  compareMode = false,
  selected = false,
  onToggleCompare,
}: DeckCardProps) {
  const systemReduced = useReducedMotion();
  const reduceMotion = Boolean(systemReduced) || reducedMotionPref;

  const jitter = useMemo(() => {
    const h = hashSlug(card.slug);
    return {
      rotateZ: (((h % 23) - 11) * 0.28) / 10,
      y: ((h >> 5) % 5) * 0.35,
    };
  }, [card.slug]);

  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (reduceMotion) return;
      const t = event.currentTarget;
      const r = t.getBoundingClientRect();
      const px = ((event.clientX - r.left) / r.width - 0.5) * 2;
      const py = ((event.clientY - r.top) / r.height - 0.5) * 2;
      setTilt({ rx: py * -4.5, ry: px * 5.5 });
    },
    [reduceMotion],
  );

  const onPointerLeave = useCallback(() => {
    setTilt({ rx: 0, ry: 0 });
  }, []);

  const staggerDelay = Math.min(index * 0.011, 0.72);
  const to = {
    pathname: `/cards/${card.slug}`,
    search: search ? `?${search}` : "",
  } as const;

  const shellClass =
    "group relative block w-full min-w-0 max-w-full touch-manipulation outline-none focus-visible:ring-1 focus-visible:ring-line-strong focus-visible:ring-offset-2 focus-visible:ring-offset-void";

  const frame = (
    <motion.div
      className="origin-center"
      initial={reduceMotion ? false : { opacity: 0, y: 12, scale: 0.92 }}
      animate={{ opacity: 1, y: jitter.y, scale: 1 }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : {
              delay: staggerDelay,
              duration: 0.5,
              ease: [0.22, 1, 0.36, 1],
            }
      }
      whileHover={
        reduceMotion || compareMode
          ? undefined
          : {
              y: jitter.y - 5,
              scale: 1.045,
              transition: { type: "spring", stiffness: 420, damping: 32 },
            }
      }
      whileTap={reduceMotion || compareMode ? undefined : { scale: 0.96 }}
    >
      <motion.div
        className={[
          "w-full max-w-full transition-[filter] duration-300",
          compareMode ? "" : "group-hover:drop-shadow-[0_14px_32px_rgba(0,0,0,0.75)]",
        ].join(" ")}
        onPointerMove={compareMode ? undefined : onPointerMove}
        onPointerLeave={compareMode ? undefined : onPointerLeave}
        animate={{
          rotateX: compareMode ? 0 : tilt.rx,
          rotateY: compareMode ? 0 : tilt.ry,
          rotateZ: compareMode ? 0 : jitter.rotateZ,
        }}
        transition={{ type: "spring", stiffness: 280, damping: 26 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        <div
          className={[
            "aspect-[2/3] w-full max-w-full overflow-hidden rounded-none bg-void ring-1 ring-transparent",
            selected ? "ring-line-strong ring-offset-2 ring-offset-void" : "",
          ].join(" ")}
        >
          <TarotCardImage
            src={tarotCardThumbnailPath(card.imagePath)}
            highResSrc={card.imagePath}
            alt=""
            className="h-full w-full max-h-full max-w-full object-contain object-center"
            loading="lazy"
          />
        </div>
      </motion.div>
    </motion.div>
  );

  if (compareMode) {
    return (
      <button
        type="button"
        aria-pressed={selected}
        aria-label={selected ? `${card.name}, selected` : `${card.name}, not selected`}
        title={card.name}
        onClick={() => onToggleCompare?.(card.slug)}
        className={shellClass}
        style={{ perspective: 640 }}
      >
        {frame}
      </button>
    );
  }

  return (
    <Link to={to} aria-label={card.name} title={card.name} className={shellClass} style={{ perspective: 640 }}>
      {frame}
    </Link>
  );
});
