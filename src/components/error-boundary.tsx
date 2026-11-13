import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

export class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Falha de interface:", error, info.componentStack);
  }
  render() {
    if (this.state.hasError)
      return (
        <main className="error-page">
          <p className="eyebrow">S.P.I.A.</p>
          <h1>Não foi possível exibir o painel</h1>
          <p>Recarregue a página. Suas preferências locais foram preservadas quando possível.</p>
          <button className="button button--primary" onClick={() => window.location.reload()}>
            Recarregar painel
          </button>
        </main>
      );
    return this.props.children;
  }
}
