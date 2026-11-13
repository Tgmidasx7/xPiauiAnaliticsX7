import { ArrowUpRight } from "lucide-react";
import { getArea } from "../../data";
import { useScope } from "../../state/scope";
import type { OperationalEvent } from "../../data/types";
import { formatTime } from "../../lib/format";
import { useUi } from "../../state/ui";
import { EventStatusBadge, SeverityBadge } from "../ui/badge";
import { DataTable } from "../ui/data-table";
import type { Column } from "../ui/data-table";

export function EventsTable({
  events,
  compact = false,
  emptyAction,
}: {
  events: OperationalEvent[];
  compact?: boolean;
  emptyAction?: React.ReactNode;
}) {
  const { openEvent } = useUi();
  const { dataset } = useScope();
  const titleColumn: Column<OperationalEvent> = {
    key: "event",
    label: "Evento",
    wide: true,
    render: (event) => (
      <button className="table-action" onClick={() => openEvent(event.id)}>
        <span className="cell-primary">{event.title}</span>
        <span className="cell-secondary mono">
          {event.id} · {event.category}
        </span>
      </button>
    ),
  };
  const columns: Column<OperationalEvent>[] = [
    titleColumn,
    {
      key: "severity",
      label: "Severidade",
      render: (event) => <SeverityBadge severity={event.severity} />,
    },
    ...(!compact
      ? [
          {
            key: "region",
            label: "Região",
            render: (event: OperationalEvent) => getArea(dataset, event.region)?.name,
          } satisfies Column<OperationalEvent>,
        ]
      : []),
    {
      key: "status",
      label: "Status",
      render: (event) => <EventStatusBadge status={event.status} />,
    },
    {
      key: "time",
      label: "Horário",
      render: (event) => (
        <time className="mono subtle" dateTime={event.timestamp}>
          {formatTime(event.timestamp)}
        </time>
      ),
    },
    ...(!compact
      ? [
          {
            key: "action",
            label: "Ação",
            action: true,
            render: (event: OperationalEvent) => (
              <button className="text-link" onClick={() => openEvent(event.id)}>
                Analisar
                <ArrowUpRight size={14} />
              </button>
            ),
          } satisfies Column<OperationalEvent>,
        ]
      : []),
  ];
  return (
    <DataTable
      caption={compact ? "Últimos eventos do cenário sintético" : "Eventos operacionais sintéticos"}
      columns={columns}
      rows={events}
      emptyAction={emptyAction}
    />
  );
}
