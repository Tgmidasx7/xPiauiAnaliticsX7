import { createContext, useCallback, useContext, useMemo } from "react";
import type { ReactNode } from "react";
import { useSearchParams } from "react-router-dom";
import { datasets, isScopeId } from "../data";
import type { Dataset, ScopeId } from "../data/types";

interface ScopeContextValue {
  scope: ScopeId;
  dataset: Dataset;
  setScope: (scope: ScopeId) => void;
  /** Preserve the active territory across internal links without leaking area filters between scopes. */
  path: (to: string) => string;
}

const ScopeContext = createContext<ScopeContextValue | null>(null);

export function ScopeProvider({ children }: { children: ReactNode }) {
  const [params, setParams] = useSearchParams();
  const requested = params.get("territorio");
  const scope: ScopeId = isScopeId(requested) ? requested : "piaui";
  const dataset = datasets[scope];

  const path = useCallback(
    (to: string) => {
      const [pathname = "/", search = ""] = to.split("?");
      const next = new URLSearchParams(search);
      if (scope === "piaui") next.delete("territorio");
      else next.set("territorio", scope);
      const query = next.toString();
      return query ? `${pathname}?${query}` : pathname;
    },
    [scope],
  );

  const setScope = useCallback(
    (nextScope: ScopeId) => {
      if (nextScope === scope) return;
      // Area/camera/status filters are scope-specific. Keep only the territory on switch.
      setParams(nextScope === "piaui" ? {} : { territorio: nextScope });
    },
    [scope, setParams],
  );

  const value = useMemo(
    () => ({ scope, dataset, setScope, path }),
    [scope, dataset, setScope, path],
  );
  return <ScopeContext.Provider value={value}>{children}</ScopeContext.Provider>;
}

export function useScope() {
  const context = useContext(ScopeContext);
  if (!context) throw new Error("useScope deve ser usado dentro de ScopeProvider.");
  return context;
}
