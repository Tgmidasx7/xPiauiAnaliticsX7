import { ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { getArea } from "../../data";
import type { AreaId } from "../../data/types";
import { useScope } from "../../state/scope";
import { useWorkspace } from "../../state/workspace";
import { Panel } from "../ui/panel";

const stateOutline =
  "M245 12 270 25 282 45 275 70 290 95 282 125 295 150 280 178 270 210 245 235 230 268 205 285 180 270 165 245 145 230 140 200 125 180 130 150 115 125 125 95 140 80 155 55 180 45 200 25Z";
const capitalOutline =
  "M116 70 174 42 244 50 302 88 326 150 304 218 250 262 176 254 112 216 82 150Z";

export function TerritoryMap({ explore = false }: { explore?: boolean }) {
  const { dataset, scope, path } = useScope();
  const [selected, setSelected] = useState<AreaId>(dataset.areas[0]!.id);
  const { events } = useWorkspace();
  const activeId = dataset.areas.some((area) => area.id === selected)
    ? selected
    : dataset.areas[0]!.id;
  const region = getArea(dataset, activeId)!;
  const regionalCameras = dataset.cameras.filter((camera) => camera.region === activeId);
  const online = regionalCameras.filter((camera) => camera.status === "online").length;
  const pending = events.filter(
    (event) => event.region === activeId && event.status !== "resolved",
  ).length;
  const areaNoun = scope === "piaui" ? "regiões" : "zonas";
  return (
    <Panel
      title="Cobertura territorial"
      subtitle={`${dataset.shortLabel} · ${dataset.areas.length} ${areaNoun} de referência`}
      action={
        explore ? undefined : (
          <Link className="text-link" to={path("/territorios")}>
            Explorar
            <ArrowUpRight size={14} />
          </Link>
        )
      }
    >
      <div
        className="territory-map"
        role="group"
        aria-label={`Mapa esquemático de ${dataset.shortLabel}. Selecione uma área para consultar a cobertura.`}
      >
        <svg
          className="territory-outline"
          viewBox="0 0 400 300"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d={scope === "piaui" ? stateOutline : capitalOutline}
            fill="var(--color-accent)"
            fillOpacity="0.035"
            stroke="var(--color-border-strong)"
            strokeWidth="1.2"
          />
          {scope === "piaui" ? (
            <path
              d="M160 93 240 69 292 30M160 93 236 159 204 240"
              fill="none"
              stroke="var(--color-accent)"
              strokeOpacity="0.22"
              strokeDasharray="3 5"
            />
          ) : (
            <path
              d="M176 132 192 60M176 132 288 138M176 132 176 222M176 132 264 210"
              fill="none"
              stroke="var(--color-accent)"
              strokeOpacity="0.22"
              strokeDasharray="3 5"
            />
          )}
        </svg>
        {dataset.areas.map((item) => (
          <button
            key={item.id}
            type="button"
            className="map-node"
            style={{ left: `${item.position.x}%`, top: `${item.position.y}%` }}
            aria-pressed={activeId === item.id}
            aria-label={`${item.name}, referência ${item.reference}`}
            onClick={() => setSelected(item.id)}
          >
            <span className="map-node-dot" />
            <span className="map-node-label">{item.name}</span>
          </button>
        ))}
      </div>
      <div className="map-selection" aria-live="polite">
        <div>
          <strong>
            {region.name} · {region.reference}
          </strong>
          <p>
            {online}/{regionalCameras.length} disponíveis · {pending} eventos pendentes
          </p>
        </div>
        <Link
          className="icon-button"
          to={path(`/cameras?region=${activeId}`)}
          aria-label={`Ver câmeras da área ${region.name}`}
        >
          <ArrowUpRight size={18} />
        </Link>
      </div>
      <p className="map-caption">Representação esquemática, sem precisão cartográfica.</p>
    </Panel>
  );
}
