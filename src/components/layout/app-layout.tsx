import { Bell, ChevronRight, FlaskConical, Menu, Terminal } from "lucide-react";
import { useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useMediaQuery } from "../../hooks/use-media-query";
import { useUi } from "../../state/ui";
import { useWorkspace } from "../../state/workspace";
import { CameraDetailDialog } from "../cameras/camera-detail-dialog";
import { EventDetailDialog } from "../events/event-detail-dialog";
import { TerminalDialog } from "../terminal/terminal-dialog";
import { Dialog } from "../ui/dialog";
import { Toast } from "../ui/toast";
import { MatrixBackground } from "./matrix-background";
import { navigation } from "./navigation";
import { SidebarContent } from "./sidebar";

export function AppLayout() {
  const desktop = useMediaQuery("(min-width: 1024px)");
  const systemReduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const { pathname } = useLocation();
  const { preferences, events } = useWorkspace();
  const { mobileNavOpen, setMobileNavOpen, toggleTerminal } = useUi();
  const current = navigation.find((item) => item.path === pathname);
  const pending = events.filter((event) => event.status !== "resolved").length;
  const critical = events.some(
    (event) => event.severity === "critical" && event.status !== "resolved",
  );

  useEffect(() => {
    document.documentElement.dataset.sidebar = preferences.sidebarCollapsed
      ? "collapsed"
      : "expanded";
    document.documentElement.dataset.motion =
      preferences.reduceMotion || systemReduced ? "reduce" : "full";
  }, [preferences.sidebarCollapsed, preferences.reduceMotion, systemReduced]);
  useEffect(() => {
    document.title = `${current?.label ?? "Página não encontrada"} · S.P.I.A.`;
  }, [current?.label]);

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Pular para o conteúdo
      </a>
      <MatrixBackground desktop={desktop} />
      {desktop && (
        <aside className={`sidebar ${preferences.sidebarCollapsed ? "sidebar--collapsed" : ""}`}>
          <SidebarContent desktop />
        </aside>
      )}
      <Dialog
        open={!desktop && mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        title="Navegação principal"
        hideHeader
        className="navigation-drawer"
      >
        <SidebarContent />
      </Dialog>
      <div className="app-main">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="icon-button mobile-menu-trigger"
              type="button"
              aria-label="Abrir navegação"
              aria-expanded={mobileNavOpen}
              onClick={() => setMobileNavOpen(true)}
            >
              <Menu size={21} />
            </button>
            <Link to="/" className="topbar-brand" aria-label="S.P.I.A. — Visão geral">
              S.P.I.A.
            </Link>
            <div className="breadcrumb" aria-label="Localização">
              <span>Piauí</span>
              <ChevronRight size={13} />
              <span className="breadcrumb-current">{current?.label ?? "Navegação"}</span>
            </div>
          </div>
          <div className="topbar-actions">
            <span
              className="demo-badge"
              role="img"
              aria-label="Ambiente de demonstração. Todos os dados são sintéticos."
              title="Ambiente de demonstração. Dados sintéticos, sem integração operacional."
            >
              <FlaskConical size={12} />
              <span className="demo-full">Demonstração</span>
              <span className="demo-short">Demo</span>
            </span>
            <button
              className="command-trigger"
              type="button"
              onClick={() => toggleTerminal(true)}
              title="Abrir terminal: F2 ou Ctrl+K"
            >
              <Terminal size={16} />
              <span className="sr-only">Abrir terminal</span>
              <span className="command-trigger-label">Comandos</span>
              <kbd>Ctrl K</kbd>
            </button>
            <Link
              className="icon-button notification-link"
              to="/eventos?status=pending"
              aria-label={`Eventos: ${pending} pendentes`}
            >
              <Bell size={18} />
              {critical && <span className="notification-dot" aria-hidden="true" />}
            </Link>
          </div>
        </header>
        <main id="main-content" className="content" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
      <CameraDetailDialog />
      <EventDetailDialog />
      <TerminalDialog />
      <Toast />
    </div>
  );
}
