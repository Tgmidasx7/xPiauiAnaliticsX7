import { Download } from "lucide-react";
import { ActivityPanel } from "../components/overview/activity-chart";
import {
  ContextNote,
  DefinitionGrid,
  InsightPanel,
  ProgressList,
  SummaryStrip,
} from "../components/ui/insights";
import { PageFooter } from "../components/ui/page-footer";
import { PageHeader } from "../components/ui/page-header";
import { Panel } from "../components/ui/panel";
import { downloadCsv } from "../lib/csv";
import { useScope } from "../state/scope";
import { useUi } from "../state/ui";
import { useWorkspace } from "../state/workspace";

export function AnalyticsPage() {
  const { dataset, scope } = useScope();
  const { events } = useWorkspace();
  const { notify } = useUi();
  const { metrics, areas, cameras, educationUnits, securityOccurrences } = dataset;
  const severities = [
    { id: "critical", label: "Crítico", tone: "danger" },
    { id: "warning", label: "Atenção", tone: "warning" },
    { id: "info", label: "Informativo", tone: "info" },
  ] as const;
  const areaRows = areas.map((area) => {
    const areaCameras = cameras.filter((camera) => camera.region === area.id);
    const areaEvents = events.filter((event) => event.region === area.id);
    const schools = educationUnits.filter((unit) => unit.areaId === area.id);
    const occurrences = securityOccurrences.filter((item) => item.areaId === area.id);
    const attended = occurrences.filter((item) => item.status !== "registered");
    return {
      id: area.id,
      name: area.name,
      cameras: areaCameras.length,
      online: areaCameras.filter((camera) => camera.status === "online").length,
      events: areaEvents.length,
      pending: areaEvents.filter((event) => event.status !== "resolved").length,
      resolved: areaEvents.filter((event) => event.status === "resolved").length,
      schools: schools.length,
      connected: schools.filter((unit) => unit.connectivity !== "offline").length,
      occurrences: occurrences.length,
      openOccurrences: occurrences.filter((item) => item.status !== "closed").length,
      response: attended.length
        ? Math.round(
            attended.reduce((sum, item) => sum + item.responseMinutes, 0) / attended.length,
          )
        : 0,
    };
  });
  const exportAnalysis = () => {
    downloadCsv(
      `spia-demo-${dataset.id}-analise-regional`,
      [
        "Território",
        "Área",
        "Câmeras",
        "Disponíveis",
        "Eventos",
        "Pendentes",
        "Resolvidos",
        "Escolas",
        "Conectadas",
        "Ocorrências",
        "Abertas",
        "Resposta média (min)",
      ],
      areaRows.map((row) => [
        dataset.shortLabel,
        row.name,
        row.cameras,
        row.online,
        row.events,
        row.pending,
        row.resolved,
        row.schools,
        row.connected,
        row.occurrences,
        row.openOccurrences,
        row.response,
      ]),
    );
    notify(`Análise de ${dataset.shortLabel} exportada.`);
  };
  const resolved = events.filter((event) => event.status === "resolved").length;
  const closed = securityOccurrences.filter((item) => item.status === "closed").length;
  return (
    <div className="stack">
      <PageHeader
        eyebrow={`Inteligência · padrões e contexto · ${dataset.shortLabel}`}
        title="Análises"
        description="Cruze operação, EdTech e segurança pública por área. Indicadores agregados ajudam a formular perguntas; não provam causalidade nem substituem avaliação oficial."
        actions={
          <button className="button" onClick={exportAnalysis}>
            <Download size={15} />
            Exportar análise
          </button>
        }
      />
      <ContextNote>
        Severidade classifica o evento; status acompanha o tratamento. Cruze as duas dimensões antes
        de priorizar uma análise. Todos os valores são sintéticos.
      </ContextNote>
      <SummaryStrip
        label="Indicadores transversais"
        items={[
          {
            label: "Eventos resolvidos",
            value: `${Math.round((resolved / events.length) * 100)}%`,
            hint: `${resolved} de ${events.length} registros`,
          },
          {
            label: "Escolas conectadas",
            value: `${metrics.educationConnectedPct}%`,
            hint: `${educationUnits.length} unidades de referência`,
          },
          {
            label: "Ocorrências encerradas",
            value: `${Math.round((closed / securityOccurrences.length) * 100)}%`,
            hint: `${closed} de ${securityOccurrences.length} registros`,
          },
          {
            label: "Resposta média",
            value: metrics.securityAverageResponse,
            unit: "min",
            hint: "Apenas ocorrências já atendidas no fixture",
          },
        ]}
      />
      <ActivityPanel />
      <div className="analytics-grid">
        <Panel
          title="Distribuição por severidade"
          subtitle={`${events.length} eventos · inclui suas alterações locais`}
        >
          <ProgressList
            items={severities.map((severity) => {
              const count = events.filter((event) => event.severity === severity.id).length;
              return {
                id: severity.id,
                label: severity.label,
                value: count,
                max: events.length,
                display: `${count} · ${Math.round((count / events.length) * 100)}%`,
                tone: severity.tone,
              };
            })}
          />
        </Panel>
        <Panel
          title="Disponibilidade de vídeo por área"
          subtitle="Câmeras disponíveis sobre o total de cada área"
        >
          <ProgressList
            items={areaRows.map((row) => ({
              id: row.id,
              label: row.name,
              value: row.online,
              max: row.cameras,
              display: `${row.online}/${row.cameras}`,
              tone: row.online === row.cameras ? "success" : "warning",
            }))}
          />
        </Panel>
        <Panel
          title="Conectividade educacional por área"
          subtitle="Unidades com fibra, rádio ou satélite sobre o total"
        >
          <ProgressList
            items={areaRows.map((row) => ({
              id: row.id,
              label: row.name,
              value: row.connected,
              max: row.schools,
              display: `${row.connected}/${row.schools}`,
              tone: "info",
            }))}
          />
        </Panel>
        <Panel
          title="Encerramento de ocorrências por área"
          subtitle="Proporção encerrada no ciclo sintético de segurança"
        >
          <ProgressList
            items={areaRows.map((row) => ({
              id: row.id,
              label: row.name,
              value: row.occurrences - row.openOccurrences,
              max: row.occurrences,
              display: `${row.occurrences - row.openOccurrences}/${row.occurrences}`,
              tone: "success",
            }))}
          />
        </Panel>
      </div>
      <Panel
        title="Matriz comparativa por área"
        subtitle={
          scope === "piaui"
            ? "Regiões de referência do estado · exportação inclui todas as linhas"
            : "Zonas urbanas de referência da capital · exportação inclui todas as linhas"
        }
      >
        <div
          className="data-table-wrapper"
          tabIndex={0}
          role="region"
          aria-label={`Matriz comparativa sintética · ${dataset.label}`}
        >
          <table className="data-table">
            <caption className="sr-only">
              Comparativo sintético de operação, educação e segurança por área
            </caption>
            <thead>
              <tr>
                <th scope="col">Área</th>
                <th scope="col">Câmeras</th>
                <th scope="col">Eventos pend.</th>
                <th scope="col">Escolas conect.</th>
                <th scope="col">Ocorrências abertas</th>
                <th scope="col">Resposta média</th>
              </tr>
            </thead>
            <tbody>
              {areaRows.map((row) => (
                <tr key={row.id}>
                  <td data-label="Área">{row.name}</td>
                  <td data-label="Câmeras" className="mono">
                    {row.online}/{row.cameras}
                  </td>
                  <td data-label="Eventos pend." className="mono">
                    {row.pending}
                  </td>
                  <td data-label="Escolas conect." className="mono">
                    {row.connected}/{row.schools}
                  </td>
                  <td data-label="Ocorrências abertas" className="mono">
                    {row.openOccurrences}
                  </td>
                  <td data-label="Resposta média" className="mono">
                    {row.response} min
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
      <InsightPanel
        title="Perguntas que esta matriz permite fazer"
        subtitle="Hipóteses de trabalho, não conclusões automáticas"
        items={[
          {
            title: "Onde a operação está mais pressionada?",
            text: "Compare eventos pendentes com câmeras disponíveis. Uma fila maior pode refletir mais registros no fixture, não necessariamente maior risco real.",
          },
          {
            title: "A conectividade escolar acompanha a cobertura de vídeo?",
            text: "As camadas usam áreas comuns, mas inventários distintos. Conectividade escolar baixa sugere revisar a camada EdTech; não explica automaticamente eventos de segurança.",
          },
          {
            title: "O tempo de resposta merece leitura por área?",
            text: "A média considera apenas ocorrências já atendidas. Áreas com poucas ocorrências atendidas podem ter médias instáveis; confira os denominadores na exportação.",
          },
          {
            title: "O que muda entre estado e capital?",
            text: "A versão municipal usa zonas e corredores urbanos; a estadual usa regiões de referência. Compare padrões de interface, nunca some totais como se fossem bases oficiais independentes.",
          },
        ]}
      />
      <Panel
        title="Notas de método"
        subtitle="Limites explícitos para não transformar demonstração em estatística oficial"
      >
        <DefinitionGrid
          items={[
            {
              term: "Denominadores",
              definition:
                "Percentuais usam o total de registros da camada naquela área. Não há ponderação por população, matrículas, área geográfica ou volume real de chamadas.",
            },
            {
              term: "Tempo de resposta",
              definition:
                "Média simples dos minutos das ocorrências sintéticas com despacho/atendimento/encerramento. Registros ainda não despachados ficam fora da média.",
            },
            {
              term: "Alterações locais",
              definition:
                "Status de eventos podem mudar neste navegador. Exportações refletem o estado atual da sessão; demais camadas permanecem no snapshot original.",
            },
            {
              term: "Comparação temporal",
              definition:
                "A série de atividade é um fixture agregado por período. Não é consulta a banco histórico nem cálculo sobre os eventos listados na fila.",
            },
          ]}
        />
      </Panel>
      <PageFooter />
    </div>
  );
}
