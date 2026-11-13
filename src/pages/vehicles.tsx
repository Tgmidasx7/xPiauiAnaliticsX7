import { Download, FilterX, Info } from "lucide-react";
import { useState } from "react";
import { PageFooter } from "../components/ui/page-footer";
import { PageHeader } from "../components/ui/page-header";
import { Badge } from "../components/ui/badge";
import { DataTable } from "../components/ui/data-table";
import type { Column } from "../components/ui/data-table";
import { DefinitionGrid, ProgressList, SummaryStrip } from "../components/ui/insights";
import { Pagination } from "../components/ui/pagination";
import { Panel } from "../components/ui/panel";
import { SearchField } from "../components/ui/search-field";
import { getArea, getScopedCamera } from "../data";
import type { VehicleReading } from "../data/types";
import { downloadCsv } from "../lib/csv";
import { formatTime, matchesSearch } from "../lib/format";
import { useScope } from "../state/scope";
import { useUi } from "../state/ui";
import { useWorkspace } from "../state/workspace";

const PAGE_SIZE = 8;
const types = ["Automóvel", "Motocicleta", "Ônibus", "Caminhão"] as const;
export function VehiclesPage() {
  const { dataset, scope } = useScope();
  const { vehicleReadings, metrics } = dataset;
  const { openCamera, notify } = useUi();
  const { favoriteCameraIds } = useWorkspace();
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [direction, setDirection] = useState("all");
  const [area, setArea] = useState("all");
  const [reviewOnly, setReviewOnly] = useState(false);
  const [page, setPage] = useState(1);
  const filtered = vehicleReadings.filter(
    (reading) =>
      matchesSearch(
        `${reading.vehicle} ${reading.id} ${reading.cameraId} ${getScopedCamera(dataset, reading.cameraId)?.name ?? ""}`,
        query,
      ) &&
      (type === "all" || reading.type === type) &&
      (direction === "all" || reading.direction === direction) &&
      (area === "all" || reading.region === area) &&
      (!reviewOnly || reading.review),
  );
  const safePage = Math.min(page, Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)));
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const clear = () => {
    setQuery("");
    setType("all");
    setDirection("all");
    setArea("all");
    setReviewOnly(false);
    setPage(1);
  };
  const averageSpeed = Math.round(
    vehicleReadings.reduce((sum, reading) => sum + reading.speed, 0) / vehicleReadings.length,
  );
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
          <span className="cell-secondary">{getScopedCamera(dataset, row.cameraId)?.name}</span>
        </button>
      ),
    },
    {
      key: "region",
      label: scope === "piaui" ? "Região" : "Zona",
      render: (row) => getArea(dataset, row.region)?.name,
    },
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
      `spia-demo-${dataset.id}-veiculos`,
      [
        "ID",
        "Identificador",
        "Tipo",
        "Câmera",
        "Território",
        "Área",
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
        dataset.shortLabel,
        getArea(dataset, row.region)?.name,
        row.direction,
        row.speed,
        formatTime(row.timestamp),
        row.review ? "Revisar" : "Normal",
        favoriteCameraIds.includes(row.cameraId) ? "Sim" : "Não",
      ]),
    );
    notify(`${filtered.length} leituras sintéticas exportadas.`);
  };
  const reviewRows = vehicleReadings.filter((reading) => reading.review);
  return (
    <div className="stack">
      <PageHeader
        eyebrow={`Operação · mobilidade · ${dataset.shortLabel}`}
        title="Veículos"
        description={
          scope === "piaui"
            ? "Leituras sintéticas em corredores estaduais de referência, com origem rastreável e contexto de revisão."
            : "Leituras sintéticas em corredores e terminais da capital, com direção, zona urbana e contexto de revisão."
        }
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
      <SummaryStrip
        label="Resumo de mobilidade sintética"
        items={[
          {
            label: "Volume do dia",
            value: metrics.vehicleReadingsVolume.toLocaleString("pt-BR"),
            hint: "Total agregado do cenário; a tabela é uma amostra",
          },
          {
            label: "Leituras na amostra",
            value: vehicleReadings.length,
            hint: "Registros detalhados disponíveis abaixo",
          },
          {
            label: "Velocidade média",
            value: averageSpeed,
            unit: "km/h",
            hint: "Média simples da amostra, não indicador oficial",
          },
          {
            label: "Para revisar",
            value: reviewRows.length,
            hint: "Filtro rápido disponível na tabela",
          },
        ]}
      />
      <Panel
        title="Leituras recentes"
        subtitle="Amostra do volume sintético do dia; filtros não alteram os painéis agregados"
      >
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
            {types.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <select
            className="filter-select"
            aria-label="Filtrar por direção"
            value={direction}
            onChange={(event) => {
              setDirection(event.target.value);
              setPage(1);
            }}
          >
            <option value="all">Entrada e saída</option>
            <option>Entrada</option>
            <option>Saída</option>
          </select>
          <select
            className="filter-select"
            aria-label="Filtrar por área"
            value={area}
            onChange={(event) => {
              setArea(event.target.value);
              setPage(1);
            }}
          >
            <option value="all">Todas as áreas</option>
            {dataset.areas.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
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
          caption={`Leituras sintéticas de veículos · ${dataset.label}`}
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
      <div className="analytics-grid">
        <Panel
          title="Composição da amostra"
          subtitle="Tipos de veículo fictícios, sem inferência sobre pessoas"
        >
          <ProgressList
            items={types.map((item) => {
              const count = vehicleReadings.filter((reading) => reading.type === item).length;
              return {
                id: item,
                label: item,
                value: count,
                max: vehicleReadings.length,
                display: `${count} · ${Math.round((count / vehicleReadings.length) * 100)}%`,
              };
            })}
          />
        </Panel>
        <Panel
          title="Entradas e saídas por área"
          subtitle="Direção declarada no fixture; não representa trajetória ou rastreamento"
        >
          <DataTable
            caption="Direções sintéticas por área"
            columns={[
              {
                key: "area",
                label: "Área",
                render: (row: { id: string; name: string; entries: number; exits: number }) =>
                  row.name,
              },
              {
                key: "entries",
                label: "Entradas",
                render: (row) => <span className="mono">{row.entries}</span>,
              },
              {
                key: "exits",
                label: "Saídas",
                render: (row) => <span className="mono">{row.exits}</span>,
              },
            ]}
            rows={dataset.areas.map((item) => ({
              id: item.id,
              name: item.name,
              entries: vehicleReadings.filter(
                (reading) => reading.region === item.id && reading.direction === "Entrada",
              ).length,
              exits: vehicleReadings.filter(
                (reading) => reading.region === item.id && reading.direction === "Saída",
              ).length,
            }))}
          />
        </Panel>
      </div>
      <Panel
        title="Fila de revisão da amostra"
        subtitle="Registros destacados para demonstrar conferência de origem e contexto"
      >
        <DataTable
          caption="Leituras sintéticas marcadas para revisão"
          columns={columns}
          rows={reviewRows}
        />
      </Panel>
      <Panel
        title="Privacidade e interpretação"
        subtitle="O que esta camada não faz, por escolha de projeto"
      >
        <DefinitionGrid
          items={[
            {
              term: "Identificador DEMO",
              definition:
                "Código fictício estável para demonstrar a tabela. Não corresponde a placa, RENAVAM, rosto ou cadastro de pessoa.",
            },
            {
              term: "Velocidade",
              definition:
                "Valor sintético por leitura. A média da amostra não estima velocidade real de corredor nem substitui fiscalização.",
            },
            {
              term: "Direção",
              definition:
                "Rótulo entrada/saída do cenário. Não reconstrói trajetos e não cruza identificadores entre câmeras.",
            },
            {
              term: "Revisão",
              definition:
                "Marcação didática para exercitar filtros e conferência. Não é alerta oficial, multa ou decisão administrativa.",
            },
          ]}
        />
      </Panel>
      <PageFooter />
    </div>
  );
}
