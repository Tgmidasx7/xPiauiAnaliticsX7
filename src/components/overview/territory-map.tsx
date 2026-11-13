import { ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { cameras, getRegion, regions } from "../../data/demo";
import type { RegionId } from "../../data/types";
import { useWorkspace } from "../../state/workspace";
import { Panel } from "../ui/panel";

export function TerritoryMap({ explore = false }: { explore?: boolean }) {
  const [selected, setSelected] = useState<RegionId>("capital");
  const { events } = useWorkspace();
  const region = getRegion(selected)!;
  const regionalCameras = cameras.filter((camera) => camera.region === selected);
  const online = regionalCameras.filter((camera) => camera.status === "online").length;
  const pending = events.filter(
    (event) => event.region === selected && event.status !== "resolved",
  ).length;
  return (
    <Panel
      title="Cobertura territorial"
      subtitle="Piauí · 5 regiões de referência"
      action={
        explore ? undefined : (
          <Link className="text-link" to="/territorios">
            Explorar
            <ArrowUpRight size={14} />
          </Link>
        )
      }
    >
      <div
        className="territory-map"
        role="group"
        aria-label="Mapa esquemático do Piauí. Selecione uma região para consultar a cobertura."
      >
        <svg
          className="territory-outline"
          viewBox="0 0 400 300"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M245 12 270 25 282 45 275 70 290 95 282 125 295 150 280 178 270 210 245 235 230 268 205 285 180 270 165 245 145 230 140 200 125 180 130 150 115 125 125 95 140 80 155 55 180 45 200 25Z"
            fill="var(--color-accent)"
            fillOpacity="0.035"
            stroke="var(--color-border-strong)"
            strokeWidth="1.2"
          />
          <path
            d="M160 93 240 69 292 30M160 93 236 159 204 240"
            fill="none"
            stroke="var(--color-accent)"
            strokeOpacity="0.22"
            strokeDasharray="3 5"
          />
        </svg>
        {regions.map((item) => (
          <button
            key={item.id}
            type="button"
            className="map-node"
            style={{ left: `${item.position.x}%`, top: `${item.position.y}%` }}
            aria-pressed={selected === item.id}
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
          to={`/cameras?region=${selected}`}
          aria-label={`Ver câmeras da região ${region.name}`}
        >
          <ArrowUpRight size={18} />
        </Link>
      </div>
      <p className="map-caption">Representação esquemática, sem precisão cartográfica.</p>
    </Panel>
  );
}
