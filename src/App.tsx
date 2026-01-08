import { Suspense, lazy } from "react";
import { Link, Route, Routes } from "react-router-dom";
import logo from "./assets/logo.svg";

const HomePage = lazy(() => import("./pages/HomePage/HomePage"));
const CreatePage = lazy(() => import("./pages/CreatePage/CreatePage"));
const EntryPage = lazy(() => import("./pages/EntryPage/EntryPage"));
const AuthPage = lazy(() => import("./pages/AuthPage/AuthPage"));
const ResultPage = lazy(() => import("./pages/ResultPage/ResultPage"));

function App() {
  const currentYear = new Date().getFullYear();
  return (
    <div className="app-shell overflow-hidden">
      <header className="mx-auto flex w-full max-w-none flex-col gap-4 px-5 pb-6 pt-6 sm:px-20 lg:px-28">
        <Link to="/" className="inline-flex w-fit">
          <div className="brand-font flex items-center gap-3">
            <img src={logo} alt="Manitoyo logo" className="h-10 w-10" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sand/70">
                manitoyo
              </p>
              <h1 className="text-2xl font-semibold text-ink sm:text-3xl">
                Manitoyo
              </h1>
            </div>
          </div>
        </Link>
      </header>

      <div className="mx-auto w-full max-w-6xl px-5 pb-6 sm:px-8 lg:px-10">
        <Suspense
          fallback={<div className="py-10 text-center text-ink/60">로딩 중...</div>}
        >
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/create" element={<CreatePage />} />
            <Route path="/entry" element={<EntryPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/result" element={<ResultPage />} />
          </Routes>
        </Suspense>
      </div>
      <footer className="pointer-events-none fixed bottom-[24px] right-6 z-50 text-right text-[11px] text-ink/70 sm:bottom-[60px]">
        ⓒ 2026-{currentYear} Woo. All rights reserved.
      </footer>
    </div>
  );
}

export default App;
