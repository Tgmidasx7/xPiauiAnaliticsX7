import type { ReactNode } from "react";
import { BrowserRouter, HashRouter } from "react-router-dom";

/** Hash routing keeps deep links and refreshes working on GitHub Pages without rewrite rules. */
export function AppRouter({ children }: { children: ReactNode }) {
  if (import.meta.env.VITE_STATIC_HOST === "true") {
    return <HashRouter>{children}</HashRouter>;
  }
  return <BrowserRouter basename={import.meta.env.BASE_URL}>{children}</BrowserRouter>;
}
