import { ArrowUpRight, Clock3, Download } from "lucide-react";
import { Link } from "react-router-dom";
import { EventsTable } from "../components/events/events-table";
import { ActivityPanel } from "../components/overview/activity-chart";
import { HealthPanel } from "../components/overview/health-panel";
import { KpiGrid } from "../components/overview/kpi-grid";
import { TerritoryMap } from "../components/overview/territory-map";
import { PageFooter } from "../components/ui/page-footer";
import { PageHeader } from "../components/ui/page-header";
import { Panel } from "../components/ui/panel";
import { averageLatency, cameraAvailability, onlineCameras, SNAPSHOT_ISO } from "../data/demo";
import { downloadCsv } from "../lib/csv";
import { formatDate } from "../lib/format";
import { useUi } from "../state/ui";
import { useWorkspace } from "../state/workspace";

export function OverviewPage() {
  const { events } = useWorkspace();
  const { notify } = useUi();
  const exportSummary = () => {
    downloadCsv(
      "spia-demo-resumo-2026-11-13",
      ["Indicador", "Valor", "Origem"],
      [
        ["Câmeras disponíveis", onlineCameras, "Sintético"],
        ["Disponibilidade (%)", cameraAvailability, "Sintético"],
        [
          "Eventos pendentes",
          events.filter((event) => event.status !== "resolved").length,
          "Sintético; inclui alterações locais",
        ],
        ["Latência média (ms)", averageLatency, "Sintético"],
        ["Leituras de veículos", 1284, "Sintético"],
      ],
    );
    notify("Resumo exportado em CSV.");
  };
  return (
    <div className="stack">
      <PageHeader
        eyebrow="Inteligência territorial · Piauí"
        title="Visão geral"
        description="Uma leitura clara do território. Do panorama ao detalhe."
        actions={
          <>
            <span className="snapshot-label">
              <Clock3 size={13} />
              Snapshot · {formatDate(SNAPSHOT_ISO)}
            </span>
            <button className="button" onClick={exportSummary}>
              <Download size={15} />
              Exportar resumo
            </button>
          </>
        }
      />
      <KpiGrid />
      <div className="overview-grid">
        <ActivityPanel />
        <TerritoryMap />
      </div>
      <div className="overview-bottom-grid">
        <Panel
          title="Eventos recentes"
          subtitle="Priorize o que precisa de contexto"
          action={
            <Link className="text-link" to="/eventos">
              Ver todos
              <ArrowUpRight size={14} />
            </Link>
          }
          footer={
            <>
              <span>Horários em UTC−3</span>
              <span>Horário do snapshot: 09:00</span>
            </>
          }
        >
          <EventsTable events={events.slice(0, 5)} compact />
        </Panel>
        <HealthPanel />
      </div>
      <PageFooter />
    </div>
  );
}
