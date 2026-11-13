import { PanelLeftClose, PanelLeftOpen, Settings2, X } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useWorkspace } from "../../state/workspace";
import { useUi } from "../../state/ui";
import { navigation } from "./navigation";

export function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <svg width="36" height="40" viewBox="0 0 40 44" fill="none">
        <path d="M20 2 37 12v20L20 42 3 32V12Z" stroke="currentColor" strokeWidth="1.6" />
        <path
          d="m12 22 6 6 11-13"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export function SidebarContent({ desktop = false }: { desktop?: boolean }) {
  const { preferences, setPreference, events } = useWorkspace();
  const { setMobileNavOpen } = useUi();
  const collapsed = desktop && preferences.sidebarCollapsed;
  const pending = events.filter((event) => event.status !== "resolved").length;
  return (
    <div className="sidebar-content">
      {desktop ? (
        <NavLink
          className="brand"
          to="/"
          aria-label={collapsed ? "S.P.I.A. — Visão geral" : undefined}
        >
          <BrandMark />
          <span className="brand-copy">
            <span className="brand-name">S.P.I.A.</span>
            <span className="brand-caption">Inteligência territorial</span>
          </span>
        </NavLink>
      ) : (
        <div className="drawer-heading">
          <div className="brand">
            <BrandMark />
            <span>
              <span className="brand-name">S.P.I.A.</span>
              <span className="brand-caption">Inteligência territorial</span>
            </span>
          </div>
          <button
            className="icon-button"
            type="button"
            aria-label="Fechar navegação"
            onClick={() => setMobileNavOpen(false)}
          >
            <X size={20} />
          </button>
        </div>
      )}
      <nav aria-label="Navegação principal">
        {(["Operação", "Inteligência"] as const).map((group) => (
          <div key={group}>
            <p className="eyebrow workspace-label">{group}</p>
            <ul className="nav-list">
              {navigation
                .filter((item) => item.group === group)
                .map(({ path, label, icon: Icon }) => (
                  <li key={path}>
                    <NavLink
                      className="nav-link"
                      to={path}
                      end={path === "/"}
                      title={collapsed ? label : undefined}
                      aria-label={collapsed ? label : undefined}
                      onClick={() => setMobileNavOpen(false)}
                    >
                      <Icon size={18} strokeWidth={1.7} />
                      <span className="nav-label">{label}</span>
                      {path === "/eventos" && pending > 0 && (
                        <span className="nav-count" aria-label={`${pending} pendentes`}>
                          {pending}
                        </span>
                      )}
                    </NavLink>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <ul className="nav-list">
          <li>
            <NavLink
              className="nav-link"
              to="/preferencias"
              title={collapsed ? "Preferências" : undefined}
              aria-label={collapsed ? "Preferências" : undefined}
              onClick={() => setMobileNavOpen(false)}
            >
              <Settings2 size={18} strokeWidth={1.7} />
              <span className="nav-label">Preferências</span>
            </NavLink>
          </li>
        </ul>
        {desktop && (
          <button
            className="button button--ghost sidebar-collapse"
            type="button"
            onClick={() => setPreference("sidebarCollapsed", !collapsed)}
            aria-label={collapsed ? "Expandir menu lateral" : "Recolher menu lateral"}
            aria-expanded={!collapsed}
          >
            {collapsed ? (
              <PanelLeftOpen size={17} />
            ) : (
              <>
                <PanelLeftClose size={17} />
                <span className="nav-label">Recolher menu</span>
              </>
            )}
          </button>
        )}
        <div className="operator-card">
          <span className="operator-avatar" aria-hidden="true">
            OP
          </span>
          <div className="operator-copy">
            <p className="operator-name">Operador local</p>
            <p className="operator-role">Perfil local</p>
          </div>
        </div>
      </div>
    </div>
  );
}
