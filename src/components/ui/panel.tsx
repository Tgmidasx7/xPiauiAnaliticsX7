import { useId } from "react";
import type { ReactNode } from "react";

interface PanelProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  footer?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function Panel({ title, subtitle, action, footer, className = "", children }: PanelProps) {
  const titleId = useId();
  return (
    <section className={`panel ${className}`} aria-labelledby={titleId}>
      <header className="panel-header">
        <div>
          <h2 id={titleId}>{title}</h2>
          {subtitle && <p className="panel-subtitle">{subtitle}</p>}
        </div>
        {action}
      </header>
      {children}
      {footer && <footer className="panel-footer">{footer}</footer>}
    </section>
  );
}
