import { useCallback, useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import type { TarotOrientation } from "../lib/tarot";
import { TarotCardImage } from "./TarotCardImage";

const MAX_TILT_DEG = 17;
const DRAG_THRESHOLD_PX = 14;

type CardStageProps = {
  src: string;
  alt: string;
  orientation: TarotOrientation;
  metaLine: string;
  className?: string;
  /** Short tap / click without drag toggles upright ↔ reversed (detail page). */
  onOrientationCycle?: () => void;
};

export function CardStage({
  src,
  alt,
  orientation,
  metaLine,
  className,
  onOrientationCycle,
}: CardStageProps) {
  const reduced = usePrefersReducedMotion();
  const [finePointer, setFinePointer] = useState(false);
  const [coarsePointer, setCoarsePointer] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const pointerOrigin = useRef<{ x: number; y: number } | null>(null);
  const dragged = useRef(false);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const [glow, setGlow] = useState({ x: 50, y: 42 });
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)");
    const coarse = window.matchMedia("(pointer: coarse)");
    const sync = () => {
      setFinePointer(fine.matches);
      setCoarsePointer(coarse.matches);
    };
    sync();
    fine.addEventListener("change", sync);
    coarse.addEventListener("change", sync);
    return () => {
      fine.removeEventListener("change", sync);
      coarse.removeEventListener("change", sync);
    };
  }, []);

  const tiltAllowed = !reduced;

  const updateTiltAndGlow = useCallback(
    (clientX: number, clientY: number) => {
      if (!tiltAllowed || !stageRef.current) return;
      const r = stageRef.current.getBoundingClientRect();
      const px = (clientX - r.left) / r.width - 0.5;
      const py = (clientY - r.top) / r.height - 0.5;
      const gx = ((clientX - r.left) / r.width) * 100;
      const gy = ((clientY - r.top) / r.height) * 100;
      setGlow({
        x: Math.max(0, Math.min(100, gx)),
        y: Math.max(0, Math.min(100, gy)),
      });
      setTilt({
        rx: Math.max(-1, Math.min(1, -py)) * MAX_TILT_DEG,
        ry: Math.max(-1, Math.min(1, px)) * MAX_TILT_DEG,
      });
    },
    [tiltAllowed],
  );

  const resetTilt = useCallback(() => {
    setTilt({ rx: 0, ry: 0 });
    setGlow({ x: 50, y: 42 });
  }, []);

  const transform = !tiltAllowed
    ? "none"
    : `perspective(1100px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) translateZ(0) scale(${pressed ? 0.988 : 1})`;

  const faceRotation = orientation === "reversed" ? "rotate(180deg)" : "rotate(0deg)";

  const handlePointerDown = (e: React.PointerEvent) => {
    pointerOrigin.current = { x: e.clientX, y: e.clientY };
    dragged.current = false;
    setPressed(true);
    if (finePointer) {
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (pointerOrigin.current) {
      const dx = e.clientX - pointerOrigin.current.x;
      const dy = e.clientY - pointerOrigin.current.y;
      if (dx * dx + dy * dy > DRAG_THRESHOLD_PX * DRAG_THRESHOLD_PX) {
        dragged.current = true;
      }
    }

    const canTilt =
      tiltAllowed &&
      ((finePointer && e.buttons === 0) || e.buttons === 1);
    if (canTilt) {
      updateTiltAndGlow(e.clientX, e.clientY);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setPressed(false);
    if (finePointer) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    }
    if (
      onOrientationCycle &&
      pointerOrigin.current &&
      !dragged.current &&
      !coarsePointer
    ) {
      onOrientationCycle();
    }
    pointerOrigin.current = null;
    resetTilt();
  };

  const handlePointerCancel = (e: React.PointerEvent) => {
    setPressed(false);
    pointerOrigin.current = null;
    resetTilt();
    if (finePointer) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    }
  };

  const interactive = Boolean(onOrientationCycle);

  return (
    <figure
      className={[
        "card-stage-root relative flex w-full max-w-[min(520px,92vw)] flex-col items-center",
        className ?? "",
      ].join(" ")}
    >
      <div
        className="pointer-events-none absolute -inset-x-[20%] -inset-y-[25%] opacity-90"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 55% 50% at 50% 42%, rgba(122, 107, 72, 0.22) 0%, rgba(76, 66, 88, 0.08) 35%, transparent 70%)",
        }}
      />
      <div className="relative w-full">
        <div
          ref={stageRef}
          role={interactive ? "button" : undefined}
          tabIndex={interactive ? 0 : undefined}
          aria-label={
            interactive
              ? coarsePointer
                ? `${alt}. Drag on the card to tilt. Use the Upright or Reversed controls to change orientation.`
                : `${alt}. Move the pointer to tilt the card. Click to reverse orientation.`
              : undefined
          }
          onKeyDown={
            interactive
              ? (ev) => {
                  if (ev.key === "Enter" || ev.key === " ") {
                    ev.preventDefault();
                    onOrientationCycle?.();
                  }
                }
              : undefined
          }
          className={[
            "relative mx-auto aspect-[2/3] w-full touch-manipulation outline-none focus-visible:ring-1 focus-visible:ring-line-strong focus-visible:ring-offset-4 focus-visible:ring-offset-black",
            tiltAllowed ? "cursor-grab active:cursor-grabbing" : "",
            interactive ? "select-none" : "",
          ].join(" ")}
          style={{ perspective: tiltAllowed ? "1100px" : undefined }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          onPointerLeave={(e) => {
            if (e.buttons === 0) {
              setPressed(false);
              pointerOrigin.current = null;
              resetTilt();
            }
          }}
        >
          <div
            className="relative h-full w-full [transform-style:preserve-3d] motion-safe:transition-[transform] motion-safe:duration-300 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ transform }}
          >
            <div
              className="card-stage-rim absolute inset-0 rounded-[15px] border border-line-strong bg-[#080808] motion-safe:transition-[transform] motion-safe:duration-500 motion-safe:[transition-timing-function:cubic-bezier(0.22,1,0.36,1)]"
              style={{
                transform: `${faceRotation} translateZ(12px)`,
                boxShadow: `
                  0 50px 100px -20px rgba(0,0,0,0.95),
                  0 28px 56px -24px rgba(0,0,0,0.85),
                  0 0 0 1px rgba(226,221,212,0.07),
                  0 0 80px -30px rgba(122,107,72,0.25),
                  inset 0 1px 0 rgba(226,221,212,0.09),
                  inset 0 -1px 0 rgba(0,0,0,0.5)
                `,
              }}
            >
              <div className="absolute inset-[4px] overflow-hidden rounded-[11px] bg-void ring-1 ring-white/[0.04]">
                <div
                  className="pointer-events-none absolute inset-0 z-20 mix-blend-soft-light"
                  style={{
                    background: `radial-gradient(circle at ${glow.x}% ${glow.y}%, rgba(255,255,255,0.24) 0%, transparent 42%)`,
                    opacity: tiltAllowed ? 0.9 : 0.35,
                  }}
                />
                <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-br from-white/[0.07] via-transparent to-transparent" />
                <TarotCardImage
                  src={src}
                  alt={interactive ? "" : alt}
                  className="relative z-[1] h-full w-full object-contain object-center contrast-[1.04]"
                  loading="eager"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <figcaption className="mt-7 max-w-md px-2 text-center">
        <span className="block font-mono text-[10px] leading-relaxed tracking-wide text-faint">
          {metaLine}
        </span>
        {interactive && !reduced && !coarsePointer ? (
          <span className="mt-3 block font-mono text-[9px] uppercase tracking-label text-faint/80">
            Move to tilt · click to reverse
          </span>
        ) : null}
        {interactive && !reduced && coarsePointer ? (
          <span className="mt-3 block font-mono text-[9px] uppercase tracking-label text-faint/80">
            Drag to tilt · use Upright / Reversed for orientation
          </span>
        ) : null}
        {interactive && reduced ? (
          <span className="mt-3 block font-mono text-[9px] uppercase tracking-label text-faint/80">
            Enter or Space to reverse
          </span>
        ) : null}
      </figcaption>
    </figure>
  );
}
