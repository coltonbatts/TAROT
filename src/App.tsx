import { Link, Navigate, Route, Routes } from "react-router-dom";
import { CardDetailPage } from "./pages/CardDetailPage";
import { LibraryPage } from "./pages/LibraryPage";

export default function App() {
  return (
    <div className="min-h-screen bg-charcoal-950 text-bone-50">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:border focus:border-gold-200/20 focus:bg-charcoal-900 focus:px-4 focus:py-2 focus:text-bone-50"
      >
        Skip to content
      </a>

      <div className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col gap-4 px-3 py-3 sm:px-4 lg:px-6 lg:py-6">
        <header className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[rgba(13,16,21,0.82)] px-4 py-4 shadow-panel backdrop-blur-xl sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <Link to="/" className="group inline-flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gold-200/20 bg-gold-300/10 font-display text-xl text-gold-100 shadow-glow transition group-hover:border-gold-200/35 group-hover:bg-gold-300/15">
                TR
              </div>
              <div>
                <div className="font-display text-3xl leading-none tracking-[-0.03em] text-bone-50 sm:text-4xl">
                  Tarot Reference
                </div>
              <div className="mt-1 text-[0.68rem] uppercase tracking-[0.34em] text-smoke-100/60">
                  browse the archive, then open a dedicated card page
                </div>
              </div>
            </Link>
            <div className="hidden text-right md:block">
              <div className="text-[0.68rem] uppercase tracking-[0.34em] text-gold-100/70">
                Dedicated card pages
              </div>
              <div className="mt-2 text-sm text-smoke-100/65">
                Search, filter, and open a card into its own page.
              </div>
            </div>
          </div>
        </header>

        <main id="main" className="relative min-h-0 flex-1">
          <Routes>
            <Route path="/" element={<LibraryPage />} />
            <Route path="/cards/:slug" element={<CardDetailPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
