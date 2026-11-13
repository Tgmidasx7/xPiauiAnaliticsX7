import { ArrowUpRight, Clock3, Download, GraduationCap, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { EventsTable } from "../components/events/events-table";
import { ActivityPanel } from "../components/overview/activity-chart";
import { AreaOverview } from "../components/overview/area-overview";
import { HealthPanel } from "../components/overview/health-panel";
import { KpiGrid } from "../components/overview/kpi-grid";
import { TerritoryMap } from "../components/overview/territory-map";
import { ContextNote, InsightPanel } from "../components/ui/insights";
import { PageFooter } from "../components/ui/page-footer";
import { PageHeader } from "../components/ui/page-header";
import { Panel } from "../components/ui/panel";
import { downloadCsv } from "../lib/csv";
import { formatDate, formatNumber } from "../lib/format";
import { useScope } from "../state/scope";
import { useUi } from "../state/ui";
import { useWorkspace } from "../state/workspace";

export function OverviewPage() {
  const { dataset, path } = useScope();
  const { events } = useWorkspace();
  const { notify } = useUi();
  const { metrics } = dataset;
  const exportSummary = () => {
    downloadCsv(
      `spia-demo-${dataset.id}-resumo-2026-11-13`,
      ["Território", "Indicador", "Valor", "Origem"],
      [
        [dataset.shortLabel, "Câmeras disponíveis", metrics.onlineCameras, "Sintético"],
        [dataset.shortLabel, "Disponibilidade (%)", metrics.cameraAvailability, "Sintético"],
        [
          dataset.shortLabel,
          "Eventos pendentes",
          events.filter((event) => event.status !== "resolved").length,
          "Sintético; inclui alterações locais",
        ],
        [dataset.shortLabel, "Latência média (ms)", metrics.averageLatency, "Sintético"],
        [
          dataset.shortLabel,
          "Leituras de veículos no dia",
          metrics.vehicleReadingsVolume,
          "Sintético",
        ],
        [dataset.shortLabel, "Escolas conectadas (%)", metrics.educationConnectedPct, "Sintético"],
        [
          dataset.shortLabel,
          "Dispositivos disponíveis",
          metrics.educationDevicesAvailable,
          "Sintético",
        ],
        [dataset.shortLabel, "Ocorrências em aberto", metrics.securityOpen, "Sintético"],
        [dataset.shortLabel, "Resposta média (min)", metrics.securityAverageResponse, "Sintético"],
      ],
    );
    notify(`Resumo de ${dataset.shortLabel} exportado em CSV.`);
  };
  return (
    <div className="stack">
      <PageHeader
        eyebrow={`Inteligência territorial · ${dataset.shortLabel}`}
        title="Visão geral"
        description={dataset.description}
        actions={
          <>
            <span className="snapshot-label">
              <Clock3 size={13} />
              Snapshot · {formatDate(dataset.snapshotIso)}
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
            <Link className="text-link" to={path("/eventos")}>
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
      <AreaOverview />
      <div className="analytics-grid">
        <Panel
          title="Educação conectada"
          subtitle="EdTech como infraestrutura de aprendizagem, não apenas contagem de tablets"
          action={
            <Link className="text-link" to={path("/educacao")}>
              Abrir camada
              <ArrowUpRight size={14} />
            </Link>
          }
        >
          <div className="panel-body layer-highlight">
            <GraduationCap size={28} className="text-info" />
            <strong>{metrics.educationConnectedPct}%</strong>
            <p>
              das {dataset.educationUnits.length} unidades de referência possuem algum enlace
              digital.
            </p>
            <dl className="layer-facts">
              <div>
                <dt>Dispositivos disponíveis</dt>
                <dd>{formatNumber(metrics.educationDevicesAvailable)}</dd>
              </div>
              <div>
                <dt>Educadores em formação</dt>
                <dd>{formatNumber(metrics.educationTeachersTrained)}</dd>
              </div>
              <div>
                <dt>Programas acompanhados</dt>
                <dd>{dataset.educationPrograms.length}</dd>
              </div>
            </dl>
          </div>
        </Panel>
        <Panel
          title="Segurança integrada"
          subtitle="Prevenção, resposta e apoio com registros agregados de demonstração"
          action={
            <Link className="text-link" to={path("/seguranca")}>
              Abrir camada
              <ArrowUpRight size={14} />
            </Link>
          }
        >
          <div className="panel-body layer-highlight">
            <ShieldCheck size={28} className="text-success" />
            <strong>{metrics.securityAvailableUnits}</strong>
            <p>
              bases disponíveis em um inventário sintético de {dataset.securityUnits.length}{" "}
              unidades.
            </p>
            <dl className="layer-facts">
              <div>
                <dt>Ocorrências em aberto</dt>
                <dd>{metrics.securityOpen}</dd>
              </div>
              <div>
                <dt>Resposta média</dt>
                <dd>{metrics.securityAverageResponse} min</dd>
              </div>
              <div>
                <dt>Programas acompanhados</dt>
                <dd>{dataset.securityPrograms.length}</dd>
              </div>
            </dl>
          </div>
        </Panel>
      </div>
      <InsightPanel
        title="Leitura orientada do snapshot"
        subtitle="Quatro passos para interpretar esta versão sem extrapolar os dados"
        items={dataset.briefing.map((text, index) => ({
          title: [
            "Comece pela disponibilidade",
            "Leia o contexto territorial",
            "Cruze as camadas com cuidado",
            "Compare as versões",
          ][index]!,
          text,
        }))}
      />
      <ContextNote>
        Todos os números pertencem a um cenário sintético de {dataset.shortLabel}. Não há integração
        com câmeras, escolas, placas, ocorrências ou sistemas oficiais.
      </ContextNote>
      <PageFooter />
    </div>
  );
}
