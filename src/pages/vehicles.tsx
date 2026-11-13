import { Download, FilterX, Info } from "lucide-react";
import { useState } from "react";
import { PageFooter } from "../components/ui/page-footer";
import { PageHeader } from "../components/ui/page-header";
import { Badge } from "../components/ui/badge";
import { DataTable } from "../components/ui/data-table";
import type { Column } from "../components/ui/data-table";
import { Pagination } from "../components/ui/pagination";
import { Panel } from "../components/ui/panel";
import { SearchField } from "../components/ui/search-field";
import { getCamera, getRegion, vehicleReadings } from "../data/demo";
import type { VehicleReading } from "../data/types";
import { downloadCsv } from "../lib/csv";
import { formatTime, matchesSearch } from "../lib/format";
import { useUi } from "../state/ui";
import { useWorkspace } from "../state/workspace";

const PAGE_SIZE = 8;
export function VehiclesPage() {
  const { openCamera, notify } = useUi();
  const { favoriteCameraIds } = useWorkspace();
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [reviewOnly, setReviewOnly] = useState(false);
  const [page, setPage] = useState(1);
  const filtered = vehicleReadings.filter(
    (reading) =>
      matchesSearch(
        `${reading.vehicle} ${reading.id} ${reading.cameraId} ${getCamera(reading.cameraId)?.name ?? ""}`,
        query,
      ) &&
      (type === "all" || reading.type === type) &&
      (!reviewOnly || reading.review),
  );
  const safePage = Math.min(page, Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)));
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const clear = () => {
    setQuery("");
    setType("all");
    setReviewOnly(false);
    setPage(1);
  };
  const columns: Column<VehicleReading>[] = [
    {
      key: "vehicle",
      label: "Identificador",
      render: (row) => (
        <>
          <span className="cell-primary mono">{row.vehicle}</span>
          <span className="cell-secondary mono">{row.id}</span>
        </>
      ),
    },
    { key: "type", label: "Tipo", render: (row) => row.type },
    {
      key: "camera",
      label: "Câmera",
      wide: true,
      render: (row) => (
        <button className="table-action" onClick={() => openCamera(row.cameraId)}>
          {row.cameraId}
          <span className="cell-secondary">{getCamera(row.cameraId)?.name}</span>
        </button>
      ),
    },
    { key: "region", label: "Região", render: (row) => getRegion(row.region)?.name },
    { key: "direction", label: "Direção", render: (row) => row.direction },
    {
      key: "speed",
      label: "Velocidade",
      render: (row) => <span className="mono">{row.speed} km/h</span>,
    },
    {
      key: "time",
      label: "Horário",
      render: (row) => (
        <time className="mono subtle" dateTime={row.timestamp}>
          {formatTime(row.timestamp)}
        </time>
      ),
    },
    {
      key: "review",
      label: "Revisão",
      render: (row) => (
        <Badge tone={row.review ? "warning" : "success"}>{row.review ? "Revisar" : "Normal"}</Badge>
      ),
    },
  ];
  const exportReadings = () => {
    downloadCsv(
      "spia-demo-veiculos",
      [
        "ID",
        "Identificador",
        "Tipo",
        "Câmera",
        "Região",
        "Direção",
        "Velocidade (km/h)",
        "Horário UTC-3",
        "Revisão",
        "Câmera favoritada",
      ],
      filtered.map((row) => [
        row.id,
        row.vehicle,
        row.type,
        row.cameraId,
        getRegion(row.region)?.name,
        row.direction,
        row.speed,
        formatTime(row.timestamp),
        row.review ? "Revisar" : "Normal",
        favoriteCameraIds.includes(row.cameraId) ? "Sim" : "Não",
      ]),
    );
    notify(`${filtered.length} leituras sintéticas exportadas.`);
  };
  return (
    <div className="stack">
      <PageHeader
        eyebrow="Operação · mobilidade"
        title="Veículos"
        description="Leituras de corredores com origem rastreável e contexto de revisão."
        actions={
          <button className="button" onClick={exportReadings} disabled={!filtered.length}>
            <Download size={15} />
            Exportar leituras
          </button>
        }
      />
      <div className="notice-inline">
        <Info size={16} />
        <span>
          Identificadores DEMO são fictícios, não placas reais. Nenhuma pessoa é identificada ou
          rastreada.
        </span>
      </div>
      <Panel title="Leituras recentes" subtitle="Amostra do volume sintético do dia">
        <div className="filter-bar">
          <SearchField
            value={query}
            onChange={(value) => {
              setQuery(value);
              setPage(1);
            }}
            label="Buscar leituras de veículos"
            placeholder="Buscar identificador ou câmera…"
          />
          <select
            className="filter-select"
            aria-label="Filtrar por tipo de veículo"
            value={type}
            onChange={(event) => {
              setType(event.target.value);
              setPage(1);
            }}
          >
            <option value="all">Todos os tipos</option>
            {["Automóvel", "Motocicleta", "Ônibus", "Caminhão"].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <button
            className="button"
            aria-pressed={reviewOnly}
            onClick={() => {
              setReviewOnly(!reviewOnly);
              setPage(1);
            }}
          >
            Para revisar
          </button>
        </div>
        <DataTable
          caption="Leituras sintéticas de veículos"
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
          noun="leituras"
        />
      </Panel>
      <PageFooter />
    </div>
  );
}
