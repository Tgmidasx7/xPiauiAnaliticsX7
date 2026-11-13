import { Download, FilterX } from "lucide-react";
import { useState } from "react";
import { PageFooter } from "../components/ui/page-footer";
import { PageHeader } from "../components/ui/page-header";
import { NetworkStatusBadge } from "../components/ui/badge";
import { DataTable } from "../components/ui/data-table";
import type { Column } from "../components/ui/data-table";
import { Pagination } from "../components/ui/pagination";
import { Panel } from "../components/ui/panel";
import { SearchField } from "../components/ui/search-field";
import { averageLatency, getRegion, networkLinks, regions } from "../data/demo";
import type { NetworkLink } from "../data/types";
import { downloadCsv } from "../lib/csv";
import { matchesSearch } from "../lib/format";
import { useUi } from "../state/ui";

const PAGE_SIZE = 8;
export function NetworkPage() {
  const { notify } = useUi();
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const filtered = networkLinks.filter(
    (link) =>
      matchesSearch(`${link.id} ${link.name}`, query) &&
      (region === "all" || link.region === region) &&
      (status === "all" || link.status === status),
  );
  const safePage = Math.min(page, Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)));
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const clear = () => {
    setQuery("");
    setRegion("all");
    setStatus("all");
    setPage(1);
  };
  const healthy = networkLinks.filter((link) => link.status === "healthy").length;
  const columns: Column<NetworkLink>[] = [
    {
      key: "link",
      label: "Enlace",
      wide: true,
      render: (row) => (
        <>
          <span className="cell-primary">{row.name}</span>
          <span className="cell-secondary mono">{row.id}</span>
        </>
      ),
    },
    { key: "region", label: "Região", render: (row) => getRegion(row.region)?.name },
    {
      key: "latency",
      label: "Latência",
      render: (row) => (
        <span className={`mono ${row.latency >= 60 ? "text-danger" : ""}`}>{row.latency} ms</span>
      ),
    },
    {
      key: "loss",
      label: "Perda",
      render: (row) => (
        <span className={`mono ${row.loss >= 1 ? "text-warning" : "subtle"}`}>
          {row.loss.toFixed(2).replace(".", ",")}%
        </span>
      ),
    },
    {
      key: "uptime",
      label: "Disponibilidade",
      render: (row) => (
        <>
          <span className="mono">{row.uptime.toFixed(2).replace(".", ",")}%</span>
          <progress
            className={`progress-track u-mt-2 ${row.status === "degraded" ? "progress-track--warning" : ""}`}
            value={row.uptime}
            max={100}
            aria-label={`Disponibilidade de ${row.id}`}
          />
        </>
      ),
    },
    { key: "status", label: "Status", render: (row) => <NetworkStatusBadge status={row.status} /> },
  ];
  const exportLinks = () => {
    downloadCsv(
      "spia-demo-infraestrutura",
      ["ID", "Enlace", "Região", "Latência (ms)", "Perda (%)", "Disponibilidade (%)", "Status"],
      filtered.map((row) => [
        row.id,
        row.name,
        getRegion(row.region)?.name,
        row.latency,
        row.loss,
        row.uptime,
        row.status,
      ]),
    );
    notify(`${filtered.length} enlaces sintéticos exportados.`);
  };
  return (
    <div className="stack">
      <PageHeader
        eyebrow="Operação · conectividade"
        title="Infraestrutura"
        description="Enlaces, latência e disponibilidade sem ruído visual."
        actions={
          <button className="button" onClick={exportLinks} disabled={!filtered.length}>
            <Download size={15} />
            Exportar enlaces
          </button>
        }
      />
      <div className="summary-strip">
        <div className="summary-item">
          <span>Latência média</span>
          <strong>
            {averageLatency}
            <small> ms</small>
          </strong>
        </div>
        <div className="summary-item">
          <span>Enlaces saudáveis</span>
          <strong>
            {healthy}
            <small> / {networkLinks.length}</small>
          </strong>
        </div>
        <div className="summary-item">
          <span>Limite de latência</span>
          <strong>
            60<small> ms</small>
          </strong>
        </div>
      </div>
      <Panel title="Enlaces de rede" subtitle="Limiares: latência < 60 ms · perda < 1%">
        <div className="filter-bar">
          <SearchField
            value={query}
            onChange={(value) => {
              setQuery(value);
              setPage(1);
            }}
            label="Buscar enlaces"
            placeholder="Buscar enlace ou núcleo…"
          />
          <select
            className="filter-select"
            aria-label="Filtrar enlaces por região"
            value={region}
            onChange={(event) => {
              setRegion(event.target.value);
              setPage(1);
            }}
          >
            <option value="all">Todas as regiões</option>
            {regions.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          <select
            className="filter-select"
            aria-label="Filtrar enlaces por status"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
          >
            <option value="all">Todos os status</option>
            <option value="healthy">Saudável</option>
            <option value="degraded">Degradado</option>
          </select>
        </div>
        <DataTable
          caption="Enlaces de rede sintéticos"
          columns={columns}
          rows={visible}
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
          noun="enlaces"
        />
      </Panel>
      <PageFooter />
    </div>
  );
}
