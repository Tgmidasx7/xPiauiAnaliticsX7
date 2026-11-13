import { SearchX } from "lucide-react";
import type { ReactNode } from "react";

export interface Column<T> {
  key: string;
  label: string;
  render: (row: T) => ReactNode;
  wide?: boolean;
  action?: boolean;
}

export function EmptyState({
  title = "Nenhum resultado encontrado",
  description = "Ajuste a busca ou remova os filtros para ver mais registros.",
  action,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <SearchX size={28} />
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}

export function DataTable<T extends { id: string }>({
  caption,
  columns,
  rows,
  emptyAction,
}: {
  caption: string;
  columns: readonly Column<T>[];
  rows: readonly T[];
  emptyAction?: ReactNode;
}) {
  if (rows.length === 0) return <EmptyState action={emptyAction} />;
  return (
    <div className="data-table-wrapper" tabIndex={0} role="region" aria-label={caption}>
      <table className="data-table">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} scope="col">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              {columns.map((column) => (
                <td
                  key={column.key}
                  data-label={column.label}
                  data-wide={column.wide || undefined}
                  data-action={column.action || undefined}
                >
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
