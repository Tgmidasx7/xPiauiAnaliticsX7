import { ChevronLeft, ChevronRight } from "lucide-react";

export function Pagination({
  page,
  pageSize,
  total,
  onChange,
  noun = "registros",
}: {
  page: number;
  pageSize: number;
  total: number;
  onChange: (page: number) => void;
  noun?: string;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  return (
    <nav className="pagination" aria-label="Paginação">
      <span aria-live="polite">
        {start}–{end} de {total} {noun}
      </span>
      <div className="pagination-controls">
        <button
          className="icon-button"
          type="button"
          aria-label="Página anterior"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
        >
          <ChevronLeft size={16} />
        </button>
        <span className="mono">
          {page} / {pages}
        </span>
        <button
          className="icon-button"
          type="button"
          aria-label="Próxima página"
          disabled={page >= pages}
          onClick={() => onChange(page + 1)}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </nav>
  );
}
