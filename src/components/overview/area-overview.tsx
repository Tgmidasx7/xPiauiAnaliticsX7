import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { Region } from "../../data/types";
import { useScope } from "../../state/scope";
import { useWorkspace } from "../../state/workspace";
import { DataTable } from "../ui/data-table";
import type { Column } from "../ui/data-table";
import { Panel } from "../ui/panel";

export function AreaOverview() {
  const { dataset, scope, path } = useScope();
  const { events } = useWorkspace();
  const areaLabel = scope === "piaui" ? "Região" : "Zona";
  const columns: Column<Region>[] = [
    {
      key: "area",
      label: areaLabel,
      wide: true,
      render: (area) => (
        <>
          <span className="cell-primary">{area.name}</span>
          <span className="cell-secondary">{area.reference}</span>
        </>
      ),
    },
    {
      key: "cameras",
      label: "Câmeras disponíveis",
      render: (area) => {
        const cameras = dataset.cameras.filter((camera) => camera.region === area.id);
        return (
          <span className="mono">
            {cameras.filter((camera) => camera.status === "online").length}/{cameras.length}
          </span>
        );
      },
    },
    {
      key: "events",
      label: "Eventos pendentes",
      render: (area) => (
        <span className="mono">
          {events.filter((event) => event.region === area.id && event.status !== "resolved").length}
        </span>
      ),
    },
    {
      key: "education",
      label: "Escolas conectadas",
      render: (area) => {
        const units = dataset.educationUnits.filter((unit) => unit.areaId === area.id);
        return (
          <span className="mono">
            {units.filter((unit) => unit.connectivity !== "offline").length}/{units.length}
          </span>
        );
      },
    },
    {
      key: "security",
      label: "Ocorrências abertas",
      render: (area) => (
        <span className="mono">
          {
            dataset.securityOccurrences.filter(
              (item) => item.areaId === area.id && item.status !== "closed",
            ).length
          }
        </span>
      ),
    },
    {
      key: "action",
      label: "Explorar",
      action: true,
      render: (area) => (
        <Link className="text-link" to={path(`/cameras?region=${area.id}`)}>
          Ver câmeras
          <ArrowUpRight size={14} />
        </Link>
      ),
    },
  ];
  return (
    <Panel
      title="Pulso por área de referência"
      subtitle={`${dataset.shortLabel} · quatro camadas lado a lado, sem misturar os territórios`}
      action={
        <Link className="text-link" to={path("/territorios")}>
          Comparar áreas
          <ArrowUpRight size={14} />
        </Link>
      }
    >
      <DataTable
        caption={`Resumo sintético por área · ${dataset.label}`}
        columns={columns}
        rows={dataset.areas}
      />
    </Panel>
  );
}
