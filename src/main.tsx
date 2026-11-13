import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app";
import { ErrorBoundary } from "./components/error-boundary";
import { AppRouter } from "./router";
import { UiProvider } from "./state/ui";
import { ScopeProvider } from "./state/scope";
import { WorkspaceProvider } from "./state/workspace";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <AppRouter>
        <ScopeProvider>
          <WorkspaceProvider>
            <UiProvider>
              <App />
            </UiProvider>
          </WorkspaceProvider>
        </ScopeProvider>
      </AppRouter>
    </ErrorBoundary>
  </StrictMode>,
);
