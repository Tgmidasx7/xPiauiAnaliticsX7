import { Download, FilterX, Star } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CameraCard } from "../components/cameras/camera-card";
import { PageFooter } from "../components/ui/page-footer";
import { PageHeader } from "../components/ui/page-header";
import { EmptyState } from "../components/ui/data-table";
import { Pagination } from "../components/ui/pagination";
import { Panel } from "../components/ui/panel";
import { SearchField } from "../components/ui/search-field";
import { SegmentedControl } from "../components/ui/segmented-control";
import { cameras, getRegion, regions } from "../data/demo";
import { downloadCsv } from "../lib/csv";
import { matchesSearch } from "../lib/format";
import { useUi } from "../state/ui";
import { useWorkspace } from "../state/workspace";

const PAGE_SIZE = 6;
export function CamerasPage() {
  const { preferences, setPreference, favoriteCameraIds } = useWorkspace();
  const { notify } = useUi();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [page, setPage] = useState(1);
  const region = regions.some((item) => item.id === params.get("region"))
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
      matchesSearch(`${camera.id} ${camera.name} ${getRegion(camera.region)?.name ?? ""}`, query) &&
      (region === "all" || camera.region === region) &&
      (status === "all" || camera.status === status) &&
      (!favoritesOnly || favoriteCameraIds.includes(camera.id)),
  );
  const safePage = Math.min(page, Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)));
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const exportCameras = () => {
    downloadCsv(
      "spia-demo-cameras",
      ["ID", "Nome", "Região", "Status", "Latência (ms)", "Favorita"],
      filtered.map((camera) => [
        camera.id,
        camera.name,
        getRegion(camera.region)?.name,
        camera.status,
        camera.latency,
        favoriteCameraIds.includes(camera.id) ? "Sim" : "Não",
      ]),
    );
    notify(`${filtered.length} câmeras sintéticas exportadas.`);
  };
  return (
    <div className="stack">
      <PageHeader
        eyebrow="Operação · monitoramento"
        title="Câmeras"
        description="Explore a cobertura por região, disponibilidade e favoritos."
        actions={
          <button className="button" onClick={exportCameras} disabled={!filtered.length}>
            <Download size={15} />
            Exportar câmeras
          </button>
        }
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
            placeholder="Buscar câmera, ID ou região…"
          />
          <select
            className="filter-select"
            aria-label="Filtrar câmeras por região"
            value={region}
            onChange={(event) => setRegion(event.target.value)}
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
      <PageFooter />
    </div>
  );
}
