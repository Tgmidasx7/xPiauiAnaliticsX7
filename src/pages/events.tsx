import { Download, FilterX, X } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { EventsTable } from "../components/events/events-table";
import { PageFooter } from "../components/ui/page-footer";
import { PageHeader } from "../components/ui/page-header";
import { Pagination } from "../components/ui/pagination";
import { Panel } from "../components/ui/panel";
import { SearchField } from "../components/ui/search-field";
import { getCamera, getRegion } from "../data/demo";
import { downloadCsv } from "../lib/csv";
import { formatTime, matchesSearch } from "../lib/format";
import { useUi } from "../state/ui";
import { useWorkspace } from "../state/workspace";

const PAGE_SIZE = 8;
const statusOptions = [
  { value: "all", label: "Todos os status" },
  { value: "pending", label: "Pendentes e em análise" },
  { value: "open", label: "Pendentes" },
  { value: "investigating", label: "Em análise" },
  { value: "resolved", label: "Resolvidos" },
];

export function EventsPage() {
  const { events } = useWorkspace();
  const { notify } = useUi();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [severity, setSeverity] = useState("all");
  const [page, setPage] = useState(1);
  const status = statusOptions.some((option) => option.value === params.get("status"))
    ? params.get("status")!
    : "all";
  const region = params.get("region") ?? "";
  const camera = params.get("camera") ?? "";
  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (!value || value === "all") next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
    setPage(1);
  };
  const clear = () => {
    setQuery("");
    setSeverity("all");
    setParams({}, { replace: true });
    setPage(1);
  };
  const filtered = events.filter(
    (event) =>
      matchesSearch(
        `${event.id} ${event.title} ${event.category} ${getCamera(event.cameraId)?.name ?? ""}`,
        query,
      ) &&
      (severity === "all" || event.severity === severity) &&
      (status === "all" ||
        (status === "pending" ? event.status !== "resolved" : event.status === status)) &&
      (!region || event.region === region) &&
      (!camera || event.cameraId === camera),
  );
  const safePage = Math.min(page, Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)));
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const exportEvents = () => {
    downloadCsv(
      "spia-demo-eventos",
      ["ID", "Evento", "Severidade", "Status", "Região", "Câmera", "Horário UTC-3"],
      filtered.map((event) => [
        event.id,
        event.title,
        event.severity,
        event.status,
        getRegion(event.region)?.name,
        event.cameraId,
        formatTime(event.timestamp),
      ]),
    );
    notify(`${filtered.length} eventos sintéticos exportados.`);
  };
  return (
    <div className="stack">
      <PageHeader
        eyebrow="Operação · fila de análise"
        title="Eventos"
        description="Do alerta à decisão: contexto, origem e histórico em um só lugar."
        actions={
          <button className="button" onClick={exportEvents} disabled={!filtered.length}>
            <Download size={15} />
            Exportar eventos
          </button>
        }
      />
      <Panel
        title="Fila de eventos"
        subtitle="As alterações de status são locais e ficam salvas neste navegador"
        footer={<span>Severidade e status são dimensões independentes.</span>}
      >
        <div className="filter-bar">
          <SearchField
            value={query}
            onChange={(value) => {
              setQuery(value);
              setPage(1);
            }}
            label="Buscar eventos"
            placeholder="Buscar evento, ID ou câmera…"
          />
          <select
            className="filter-select"
            aria-label="Filtrar por status"
            value={status}
            onChange={(event) => setParam("status", event.target.value)}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            className="filter-select"
            aria-label="Filtrar por severidade"
            value={severity}
            onChange={(event) => {
              setSeverity(event.target.value);
              setPage(1);
            }}
          >
            <option value="all">Toda severidade</option>
            <option value="critical">Crítico</option>
            <option value="warning">Atenção</option>
            <option value="info">Informativo</option>
          </select>
        </div>
        {(region || camera) && (
          <div className="panel-body row row--wrap">
            {region && (
              <button className="button button--small" onClick={() => setParam("region", "")}>
                Região: {getRegion(region)?.name ?? region}
                <X size={13} />
              </button>
            )}
            {camera && (
              <button className="button button--small" onClick={() => setParam("camera", "")}>
                Câmera: {camera}
                <X size={13} />
              </button>
            )}
          </div>
        )}
        <EventsTable
          events={visible}
          emptyAction={
            <button className="button" onClick={clear}>
              <FilterX size={15} />
              Limpar filtros
            </button>
          }
        />
        <Pagination
          page={safePage}
          pageSize={PAGE_SIZE}
          total={filtered.length}
          onChange={setPage}
          noun="eventos"
        />
      </Panel>
      <PageFooter />
    </div>
  );
}
