import type { ReactNode } from "react";

type ViewportChamberProps = {
  children: ReactNode;
  footer?: ReactNode;
};

/**
 * Frames the 3D canvas as a contained “chamber” with a subtle diagram layer.
 */
export function ViewportChamber({ children, footer }: ViewportChamberProps) {
  return (
    <div className="relative flex min-h-0 flex-1 flex-col border border-line bg-inset">
      <div className="pointer-events-none absolute inset-0 text-bone opacity-[0.07]" aria-hidden>
        <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
          <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="0.12" />
          <line x1="50" y1="4" x2="50" y2="96" stroke="currentColor" strokeWidth="0.06" />
          <line x1="4" y1="50" x2="96" y2="50" stroke="currentColor" strokeWidth="0.06" />
        </svg>
      </div>
      <div className="relative flex min-h-[min(64vh,560px)] flex-1 flex-col items-stretch justify-center p-3 sm:p-4 lg:min-h-[min(52vh,520px)]">
        {children}
      </div>
      {footer ? (
        <footer className="shrink-0 border-t border-line bg-void/80 px-3 py-2 sm:px-4">{footer}</footer>
      ) : null}
    </div>
  );
}
