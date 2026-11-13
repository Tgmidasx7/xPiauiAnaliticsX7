import { Download, FilterX, Star } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CameraCard } from "../components/cameras/camera-card";
import { PageFooter } from "../components/ui/page-footer";
import { PageHeader } from "../components/ui/page-header";
import { DataTable, EmptyState } from "../components/ui/data-table";
import type { Column } from "../components/ui/data-table";
import { ContextNote, DefinitionGrid, ProgressList, SummaryStrip } from "../components/ui/insights";
import { Pagination } from "../components/ui/pagination";
import { Panel } from "../components/ui/panel";
import { SearchField } from "../components/ui/search-field";
import { SegmentedControl } from "../components/ui/segmented-control";
import { CameraStatusBadge } from "../components/ui/badge";
import { getArea } from "../data";
import type { Camera } from "../data/types";
import { downloadCsv } from "../lib/csv";
import { matchesSearch } from "../lib/format";
import { useScope } from "../state/scope";
import { useUi } from "../state/ui";
import { useWorkspace } from "../state/workspace";

const PAGE_SIZE = 6;
export function CamerasPage() {
  const { dataset, scope } = useScope();
  const { cameras, areas } = dataset;
  const { preferences, setPreference, favoriteCameraIds } = useWorkspace();
  const { notify, openCamera } = useUi();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [page, setPage] = useState(1);
  const areaLabel = scope === "piaui" ? "região" : "zona";
  const region = areas.some((item) => item.id === params.get("region"))
    ? params.get("region")!
    : "all";
  const setRegion = (value: string) => {
    const next = new URLSearchParams(params);
    if (value === "all") next.delete("region");
    else next.set("region", value);
    setParams(next, { replace: true });
    setPage(1);
  };
  const clear = () => {
    setQuery("");
    setStatus("all");
    setFavoritesOnly(false);
    setRegion("all");
  };
  const filtered = cameras.filter(
    (camera) =>
      matchesSearch(
        `${camera.id} ${camera.name} ${getArea(dataset, camera.region)?.name ?? ""}`,
        query,
      ) &&
      (region === "all" || camera.region === region) &&
      (status === "all" || camera.status === status) &&
      (!favoritesOnly || favoriteCameraIds.includes(camera.id)),
  );
  const safePage = Math.min(page, Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)));
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const online = cameras.filter((camera) => camera.status === "online").length;
  const maintenance = cameras.filter((camera) => camera.status !== "online");
  const favorites = cameras.filter((camera) => favoriteCameraIds.includes(camera.id));
  const exportCameras = () => {
    downloadCsv(
      `spia-demo-${dataset.id}-cameras`,
      [
        "ID",
        "Nome",
        "Território",
        "Área",
        "Status",
        "Latência (ms)",
        "Resolução",
        "FPS",
        "Favorita",
      ],
      filtered.map((camera) => [
        camera.id,
        camera.name,
        dataset.shortLabel,
        getArea(dataset, camera.region)?.name,
        camera.status,
        camera.latency,
        camera.resolution,
        camera.fps,
        favoriteCameraIds.includes(camera.id) ? "Sim" : "Não",
      ]),
    );
    notify(`${filtered.length} câmeras sintéticas de ${dataset.shortLabel} exportadas.`);
  };
  const maintenanceColumns: Column<Camera>[] = [
    {
      key: "camera",
      label: "Câmera",
      wide: true,
      render: (row) => (
        <button className="table-action" onClick={() => openCamera(row.id)}>
          <span className="cell-primary">{row.name}</span>
          <span className="cell-secondary mono">{row.id}</span>
        </button>
      ),
    },
    { key: "area", label: "Área", render: (row) => getArea(dataset, row.region)?.name },
    { key: "status", label: "Status", render: (row) => <CameraStatusBadge status={row.status} /> },
    {
      key: "latency",
      label: "Latência",
      render: (row) => <span className="mono">{row.latency} ms</span>,
    },
  ];
  return (
    <div className="stack">
      <PageHeader
        eyebrow={`Operação · monitoramento · ${dataset.shortLabel}`}
        title="Câmeras"
        description={`Inventário, disponibilidade e fila de manutenção do recorte ${scope === "piaui" ? "estadual" : "municipal"}. As prévias são esquemas locais, sem transmissão real.`}
        actions={
          <button className="button" onClick={exportCameras} disabled={!filtered.length}>
            <Download size={15} />
            Exportar câmeras
          </button>
        }
      />
      <SummaryStrip
        label="Resumo do inventário de câmeras"
        items={[
          {
            label: "Disponíveis",
            value: online,
            unit: `/ ${cameras.length}`,
            hint: `${dataset.metrics.cameraAvailability}% do inventário`,
          },
          {
            label: "Em manutenção",
            value: cameras.filter((camera) => camera.status === "maintenance").length,
            hint: "Fora da operação planejada",
          },
          {
            label: "Offline",
            value: cameras.filter((camera) => camera.status === "offline").length,
            hint: "Prioridade de verificação",
          },
          {
            label: "Favoritas nesta versão",
            value: favorites.length,
            hint: "Salvas apenas neste navegador",
          },
        ]}
      />
      <Panel
        title="Inventário de câmeras"
        subtitle="Prévias esquemáticas geradas localmente; nenhuma transmissão real"
        action={
          <SegmentedControl
            value={preferences.cameraLayout}
            options={[
              { value: "grid", label: "Grade" },
              { value: "list", label: "Lista" },
            ]}
            onChange={(value) => setPreference("cameraLayout", value)}
            label="Visualização das câmeras"
          />
        }
      >
        <div className="filter-bar">
          <SearchField
            value={query}
            onChange={(value) => {
              setQuery(value);
              setPage(1);
            }}
            label="Buscar câmeras"
            placeholder={`Buscar câmera, ID ou ${areaLabel}…`}
          />
          <select
            className="filter-select"
            aria-label={`Filtrar câmeras por ${areaLabel}`}
            value={region}
            onChange={(event) => setRegion(event.target.value)}
          >
            <option value="all">Todas as áreas</option>
            {areas.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          <select
            className="filter-select"
            aria-label="Filtrar câmeras por status"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
          >
            <option value="all">Todos os status</option>
            <option value="online">Disponível</option>
            <option value="maintenance">Manutenção</option>
            <option value="offline">Offline</option>
          </select>
          <button
            className="button"
            aria-pressed={favoritesOnly}
            onClick={() => {
              setFavoritesOnly(!favoritesOnly);
              setPage(1);
            }}
          >
            <Star size={15} fill={favoritesOnly ? "currentColor" : "none"} />
            Favoritas
          </button>
        </div>
        <div className="panel-body">
          <p className="count-label u-mb-4" aria-live="polite">
            {filtered.length} de {cameras.length} câmeras · página {safePage}
          </p>
          {visible.length ? (
            <div
              className={`camera-grid ${preferences.cameraLayout === "list" ? "camera-grid--list" : ""}`}
            >
              {visible.map((camera) => (
                <CameraCard key={camera.id} camera={camera} />
              ))}
            </div>
          ) : (
            <EmptyState
              action={
                <button className="button" onClick={clear}>
                  <FilterX size={15} />
                  Limpar filtros
                </button>
              }
            />
          )}
        </div>
        <Pagination
          page={safePage}
          pageSize={PAGE_SIZE}
          total={filtered.length}
          onChange={setPage}
          noun="câmeras"
        />
      </Panel>
      <div className="analytics-grid">
        <Panel
          title="Disponibilidade por área"
          subtitle="Câmeras disponíveis sobre o total de cada área de referência"
        >
          <ProgressList
            items={areas.map((area) => {
              const total = cameras.filter((camera) => camera.region === area.id).length;
              const available = cameras.filter(
                (camera) => camera.region === area.id && camera.status === "online",
              ).length;
              return {
                id: area.id,
                label: area.name,
                value: available,
                max: total,
                display: `${available}/${total}`,
                tone: available === total ? "success" : "warning",
              };
            })}
            note="A meta demonstrativa é 100% de disponibilidade. Manutenção programada continua sendo indisponibilidade para a operação."
          />
        </Panel>
        <Panel
          title="Fila de manutenção"
          subtitle="Equipamentos que não estão disponíveis no snapshot"
        >
          <DataTable
            caption="Câmeras sintéticas em manutenção ou offline"
            columns={maintenanceColumns}
            rows={maintenance}
          />
        </Panel>
      </div>
      <Panel
        title="Como ler o inventário"
        subtitle="Definições estáveis para comparar Piauí e Teresina Capital"
      >
        <DefinitionGrid
          items={[
            {
              term: "Disponível",
              definition:
                "Câmera sintética marcada como online no snapshot. Não representa verificação de um equipamento real.",
            },
            {
              term: "Latência",
              definition:
                "Tempo simulado de transporte do vídeo, em milissegundos. O limite de referência desta demonstração é 60 ms.",
            },
            {
              term: "Favoritos",
              definition:
                "Lista local por identificador. IDs estaduais e municipais são distintos; alternar a versão não mistura inventários.",
            },
            {
              term: "Prévia",
              definition:
                "Desenho esquemático renderizado no navegador apenas quando o card entra na área visível. Não há stream, áudio ou gravação.",
            },
          ]}
        />
      </Panel>
      <ContextNote>
        Exportações incluem o território ativo e apenas as câmeras retornadas pelos filtros. Nenhum
        dado real de vídeo é coletado.
      </ContextNote>
      <PageFooter />
    </div>
  );
}
