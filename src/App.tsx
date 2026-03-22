import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { CardDetailPage } from "./pages/CardDetailPage";
import { LibraryPage } from "./pages/LibraryPage";

function AppMain() {
  const location = useLocation();
  const isLibrary = location.pathname === "/";

  return (
    <main
      id="main"
      className={
        isLibrary
          ? "min-h-screen"
          : "mx-auto flex min-h-screen w-full max-w-[1760px] flex-1 flex-col px-4 py-4 sm:px-6 lg:px-8 lg:py-6"
      }
    >
      <Routes>
        <Route path="/" element={<LibraryPage />} />
        <Route path="/cards/:slug" element={<CardDetailPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </main>
  );
}

export default function App() {
  return (
    <div className="min-h-screen overflow-hidden bg-charcoal-950 text-bone-50">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:border focus:border-white/15 focus:bg-charcoal-950 focus:px-4 focus:py-2 focus:text-bone-50"
      >
        Skip to content
      </a>

      <AppMain />
    </div>
  );
}
