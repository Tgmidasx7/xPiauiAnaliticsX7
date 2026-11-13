import { Download, Info } from "lucide-react";
import { ActivityPanel } from "../components/overview/activity-chart";
import { PageFooter } from "../components/ui/page-footer";
import { PageHeader } from "../components/ui/page-header";
import { Panel } from "../components/ui/panel";
import { cameras, getRegion, regions } from "../data/demo";
import { downloadCsv } from "../lib/csv";
import { useUi } from "../state/ui";
import { useWorkspace } from "../state/workspace";

export function AnalyticsPage() {
  const { events } = useWorkspace();
  const { notify } = useUi();
  const severities = [
    { id: "critical", label: "Crítico", tone: "danger" },
    { id: "warning", label: "Atenção", tone: "warning" },
    { id: "info", label: "Informativo", tone: "info" },
  ] as const;
  const exportAnalysis = () => {
    downloadCsv(
      "spia-demo-analise-regional",
      ["Região", "Câmeras", "Disponíveis", "Eventos", "Pendentes", "Resolvidos"],
      regions.map((region) => [
        region.name,
        cameras.filter((camera) => camera.region === region.id).length,
        cameras.filter((camera) => camera.region === region.id && camera.status === "online")
          .length,
        events.filter((event) => event.region === region.id).length,
        events.filter((event) => event.region === region.id && event.status !== "resolved").length,
        events.filter((event) => event.region === region.id && event.status === "resolved").length,
      ]),
    );
    notify("Análise regional exportada.");
  };
  return (
    <div className="stack">
      <PageHeader
        eyebrow="Inteligência · padrões e contexto"
        title="Análises"
        description="Perguntas melhores, não mais indicadores. Explore os dados por camada."
        actions={
          <button className="button" onClick={exportAnalysis}>
            <Download size={15} />
            Exportar análise
          </button>
        }
      />
      <div className="notice-inline">
        <Info size={16} />
        <span>
          Severidade classifica o evento; status acompanha o tratamento. Cruze as duas dimensões
          antes de priorizar uma análise.
        </span>
      </div>
      <ActivityPanel />
      <div className="analytics-grid">
        <Panel
          title="Distribuição por severidade"
          subtitle={`${events.length} eventos · inclui suas alterações locais`}
        >
          <div className="panel-body health-list">
            {severities.map((severity) => {
              const count = events.filter((event) => event.severity === severity.id).length;
              const percent = Math.round((count / events.length) * 100);
              return (
                <div key={severity.id}>
                  <div className="health-item-top">
                    <span className={`text-${severity.tone}`}>{severity.label}</span>
                    <strong>
                      {count} · {percent}%
                    </strong>
                  </div>
                  <progress
                    className={`progress-track progress-track--${severity.tone}`}
                    value={count}
                    max={events.length}
                    aria-label={`${severity.label}: ${count} eventos`}
                  />
                </div>
              );
            })}
          </div>
        </Panel>
        <Panel
          title="Disponibilidade regional"
          subtitle="Câmeras disponíveis sobre o total de cada região"
        >
          <div className="panel-body health-list">
            {regions.map((region) => {
              const total = cameras.filter((camera) => camera.region === region.id).length;
              const online = cameras.filter(
                (camera) => camera.region === region.id && camera.status === "online",
              ).length;
              return (
                <div key={region.id}>
                  <div className="health-item-top">
                    <span>{getRegion(region.id)?.name}</span>
                    <strong>
                      {online}/{total}
                    </strong>
                  </div>
                  <progress
                    className="progress-track progress-track--accent"
                    value={online}
                    max={total}
                    aria-label={`${region.name}: ${online} de ${total} câmeras disponíveis`}
                  />
                </div>
              );
            })}
          </div>
        </Panel>
      </div>
      <PageFooter />
    </div>
  );
}
