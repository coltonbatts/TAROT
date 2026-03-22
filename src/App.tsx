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
          ? "min-h-screen flex-1"
          : "mx-auto flex min-h-screen w-full max-w-[1400px] flex-1 flex-col"
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
    <div className="min-h-screen bg-void text-bone">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:border focus:border-line focus:bg-panel focus:px-4 focus:py-2 focus:text-bone"
      >
        Skip to content
      </a>

      <AppMain />
    </div>
  );
}
