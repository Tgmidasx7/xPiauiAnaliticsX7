import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { TerritoryMap } from "../components/overview/territory-map";
import { PageFooter } from "../components/ui/page-footer";
import { PageHeader } from "../components/ui/page-header";
import { DataTable } from "../components/ui/data-table";
import type { Column } from "../components/ui/data-table";
import { Panel } from "../components/ui/panel";
import { cameras, regions } from "../data/demo";
import type { Region } from "../data/types";
import { useWorkspace } from "../state/workspace";

export function TerritoriesPage() {
  const { events } = useWorkspace();
  const columns: Column<Region>[] = [
    {
      key: "region",
      label: "Região",
      render: (row) => (
        <>
          <span className="cell-primary">{row.name}</span>
          <span className="cell-secondary">{row.reference}</span>
        </>
      ),
    },
    {
      key: "cameras",
      label: "Câmeras",
      render: (row) => (
        <span className="mono">{cameras.filter((camera) => camera.region === row.id).length}</span>
      ),
    },
    {
      key: "online",
      label: "Disponíveis",
      render: (row) => (
        <span className="mono text-success">
          {
            cameras.filter((camera) => camera.region === row.id && camera.status === "online")
              .length
          }
        </span>
      ),
    },
    {
      key: "events",
      label: "Pendentes",
      render: (row) => (
        <span className="mono">
          {events.filter((event) => event.region === row.id && event.status !== "resolved").length}
        </span>
      ),
    },
    {
      key: "action",
      label: "Explorar",
      action: true,
      render: (row) => (
        <Link className="text-link" to={`/cameras?region=${row.id}`}>
          Ver câmeras
          <ArrowUpRight size={14} />
        </Link>
      ),
    },
  ];
  return (
    <div className="stack">
      <PageHeader
        eyebrow="Inteligência · leitura regional"
        title="Territórios"
        description="Uma camada de contexto para cada região de referência do Piauí."
      />
      <div className="overview-grid">
        <TerritoryMap explore />
        <Panel
          title="Cobertura por região"
          subtitle="Selecione um marco no mapa ou explore a tabela"
        >
          <DataTable
            caption="Cobertura sintética por região do Piauí"
            columns={columns}
            rows={regions}
          />
        </Panel>
      </div>
      <PageFooter />
    </div>
  );
}
