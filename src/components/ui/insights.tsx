import { Info } from "lucide-react";
import type { ReactNode } from "react";
import { Panel } from "./panel";

export interface SummaryItem {
  label: string;
  value: ReactNode;
  unit?: string;
  hint?: string;
}

export function SummaryStrip({ items, label }: { items: SummaryItem[]; label: string }) {
  return (
    <section className="summary-strip" aria-label={label}>
      {items.map((item) => (
        <div className="summary-item" key={item.label}>
          <span>{item.label}</span>
          <strong>
            {item.value}
            {item.unit && <small> {item.unit}</small>}
          </strong>
          {item.hint && <p className="summary-hint">{item.hint}</p>}
        </div>
      ))}
    </section>
  );
}

export interface ProgressItem {
  id: string;
  label: string;
  value: number;
  max: number;
  display: string;
  tone?: "accent" | "success" | "warning" | "danger" | "info";
}

export function ProgressList({ items, note }: { items: ProgressItem[]; note?: string }) {
  return (
    <div className="panel-body">
      <div className="health-list">
        {items.map((item) => (
          <div key={item.id}>
            <div className="health-item-top">
              <span>{item.label}</span>
              <strong className="mono">{item.display}</strong>
            </div>
            <progress
              className={`progress-track progress-track--${item.tone ?? "accent"}`}
              value={item.value}
              max={Math.max(1, item.max)}
              aria-label={`${item.label}: ${item.display}`}
            />
          </div>
        ))}
      </div>
      {note && <p className="health-note">{note}</p>}
    </div>
  );
}

export function InsightPanel({
  title,
  subtitle,
  items,
}: {
  title: string;
  subtitle?: string;
  items: { title: string; text: string }[];
}) {
  return (
    <Panel title={title} subtitle={subtitle}>
      <ol className="insight-list panel-body">
        {items.map((item, index) => (
          <li key={item.title}>
            <span className="insight-index mono" aria-hidden="true">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </Panel>
  );
}

export function ContextNote({ children }: { children: ReactNode }) {
  return (
    <div className="notice-inline">
      <Info size={16} />
      <span>{children}</span>
    </div>
  );
}

export function DefinitionGrid({ items }: { items: { term: string; definition: string }[] }) {
  return (
    <dl className="definition-grid panel-body">
      {items.map((item) => (
        <div key={item.term}>
          <dt>{item.term}</dt>
          <dd>{item.definition}</dd>
        </div>
      ))}
    </dl>
  );
}
