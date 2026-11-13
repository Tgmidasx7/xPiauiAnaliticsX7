import { Download, FilterX, GraduationCap } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Badge } from "../components/ui/badge";
import { DataTable } from "../components/ui/data-table";
import type { Column } from "../components/ui/data-table";
import {
  ContextNote,
  DefinitionGrid,
  InsightPanel,
  ProgressList,
  SummaryStrip,
} from "../components/ui/insights";
import { PageFooter } from "../components/ui/page-footer";
import { PageHeader } from "../components/ui/page-header";
import { Pagination } from "../components/ui/pagination";
import { Panel } from "../components/ui/panel";
import { SearchField } from "../components/ui/search-field";
import { getArea } from "../data";
import type { ConnectivityKind, EducationStage, EducationUnit } from "../data/types";
import { downloadCsv } from "../lib/csv";
import { formatNumber, matchesSearch } from "../lib/format";
import { useScope } from "../state/scope";
import { useUi } from "../state/ui";

const PAGE_SIZE = 8;
const stages: EducationStage[] = ["Infantil", "Fundamental", "Médio", "EJA", "Técnico"];
const connectivityLabels: Record<ConnectivityKind, string> = {
  fiber: "Fibra",
  radio: "Rádio",
  satellite: "Satélite",
  offline: "Sem enlace",
};
const statusMeta = {
  ok: { label: "Adequado", tone: "success" },
  attention: { label: "Atenção", tone: "warning" },
  critical: { label: "Prioritário", tone: "danger" },
} as const;
const programMeta = {
  "on-track": { label: "Em andamento", tone: "success" },
  attention: { label: "Requer atenção", tone: "warning" },
  planned: { label: "Planejado", tone: "info" },
} as const;

export function EducationPage() {
  const { dataset, scope } = useScope();
  const { educationUnits, educationPrograms, areas, metrics } = dataset;
  const { notify } = useUi();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [stage, setStage] = useState("all");
  const [connectivity, setConnectivity] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const area = areas.some((item) => item.id === params.get("area")) ? params.get("area")! : "all";
  const setArea = (value: string) => {
    const next = new URLSearchParams(params);
    if (value === "all") next.delete("area");
    else next.set("area", value);
    setParams(next, { replace: true });
    setPage(1);
  };
  const filtered = educationUnits.filter(
    (unit) =>
      matchesSearch(
        `${unit.id} ${unit.name} ${getArea(dataset, unit.areaId)?.name ?? ""} ${unit.stage}`,
        query,
      ) &&
      (area === "all" || unit.areaId === area) &&
      (stage === "all" || unit.stage === stage) &&
      (connectivity === "all" || unit.connectivity === connectivity) &&
      (status === "all" || unit.status === status),
  );
  const safePage = Math.min(page, Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)));
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const clear = () => {
    setQuery("");
    setStage("all");
    setConnectivity("all");
    setStatus("all");
    setArea("all");
    setPage(1);
  };
  const labs = educationUnits.reduce((sum, unit) => sum + unit.labs, 0);
  const devicesTotal = educationUnits.reduce((sum, unit) => sum + unit.devicesTotal, 0);
  const averageUsage = Math.round(
    educationUnits.reduce((sum, unit) => sum + unit.platformUsage, 0) / educationUnits.length,
  );
  const columns: Column<EducationUnit>[] = [
    {
      key: "unit",
      label: "Unidade de referência",
      wide: true,
      render: (row) => (
        <>
          <span className="cell-primary">{row.name}</span>
          <span className="cell-secondary mono">
            {row.id} · {row.stage}
          </span>
        </>
      ),
    },
    {
      key: "area",
      label: scope === "piaui" ? "Região" : "Zona",
      render: (row) => getArea(dataset, row.areaId)?.name,
    },
    {
      key: "connectivity",
      label: "Conectividade",
      render: (row) => (
        <>
          <span>{connectivityLabels[row.connectivity]}</span>
          <span className="cell-secondary mono">
            {row.bandwidthMbps ? `${row.bandwidthMbps} Mbps` : "0 Mbps"}
          </span>
        </>
      ),
    },
    {
      key: "devices",
      label: "Dispositivos",
      render: (row) => (
        <>
          <span className="mono">
            {row.devicesAvailable}/{row.devicesTotal}
          </span>
          <progress
            className="progress-track u-mt-2"
            value={row.devicesAvailable}
            max={row.devicesTotal}
            aria-label={`Dispositivos disponíveis em ${row.id}`}
          />
        </>
      ),
    },
    {
      key: "labs",
      label: "Laboratórios",
      render: (row) => <span className="mono">{row.labs}</span>,
    },
    {
      key: "teachers",
      label: "Educadores formados",
      render: (row) => <span className="mono">{row.teachersTrained}</span>,
    },
    {
      key: "usage",
      label: "Uso da plataforma",
      render: (row) => <span className="mono">{row.platformUsage}%</span>,
    },
    {
      key: "status",
      label: "Prioridade",
      render: (row) => (
        <Badge tone={statusMeta[row.status].tone}>{statusMeta[row.status].label}</Badge>
      ),
    },
  ];
  const exportUnits = () => {
    downloadCsv(
      `spia-demo-${dataset.id}-educacao`,
      [
        "ID",
        "Unidade",
        "Território",
        "Área",
        "Etapa",
        "Conectividade",
        "Banda (Mbps)",
        "Dispositivos disponíveis",
        "Dispositivos totais",
        "Laboratórios",
        "Educadores formados",
        "Uso (%)",
        "Prioridade",
      ],
      filtered.map((row) => [
        row.id,
        row.name,
        dataset.shortLabel,
        getArea(dataset, row.areaId)?.name,
        row.stage,
        connectivityLabels[row.connectivity],
        row.bandwidthMbps,
        row.devicesAvailable,
        row.devicesTotal,
        row.labs,
        row.teachersTrained,
        row.platformUsage,
        statusMeta[row.status].label,
      ]),
    );
    notify(`${filtered.length} unidades educacionais sintéticas exportadas.`);
  };
  return (
    <div className="stack">
      <PageHeader
        eyebrow={`Inteligência · EdTech · ${dataset.shortLabel}`}
        title="Educação conectada"
        description={
          scope === "piaui"
            ? "Conectividade, dispositivos, laboratórios e formação docente em unidades escolares de referência do estado. Dados agregados, sem informações de estudantes."
            : "Infraestrutura digital e uso pedagógico em escolas municipais de referência da capital. Dados agregados por zona, sem informações de estudantes."
        }
        actions={
          <button className="button" onClick={exportUnits} disabled={!filtered.length}>
            <Download size={15} />
            Exportar unidades
          </button>
        }
      />
      <SummaryStrip
        label="Resumo da camada educacional"
        items={[
          {
            label: "Unidades conectadas",
            value: `${metrics.educationConnectedPct}%`,
            hint: `${educationUnits.filter((unit) => unit.connectivity !== "offline").length} de ${educationUnits.length} unidades`,
          },
          {
            label: "Dispositivos disponíveis",
            value: formatNumber(metrics.educationDevicesAvailable),
            unit: `/ ${formatNumber(devicesTotal)}`,
            hint: "Inventário sintético disponível para uso",
          },
          {
            label: "Educadores em formação",
            value: formatNumber(metrics.educationTeachersTrained),
            hint: "Soma de referências por unidade; não é cadastro oficial",
          },
          {
            label: "Laboratórios / uso médio",
            value: labs,
            unit: `· ${averageUsage}%`,
            hint: "Laboratórios ativos e uso médio da plataforma",
          },
        ]}
      />
      <Panel
        title="Inventário educacional"
        subtitle="Unidades fictícias nomeadas por área; nenhum endereço real ou dado pessoal é utilizado"
      >
        <div className="filter-bar">
          <SearchField
            value={query}
            onChange={(value) => {
              setQuery(value);
              setPage(1);
            }}
            label="Buscar unidades educacionais"
            placeholder="Buscar unidade, ID, área ou etapa…"
          />
          <select
            className="filter-select"
            aria-label="Filtrar unidades por área"
            value={area}
            onChange={(event) => setArea(event.target.value)}
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
            aria-label="Filtrar por etapa de ensino"
            value={stage}
            onChange={(event) => {
              setStage(event.target.value);
              setPage(1);
            }}
          >
            <option value="all">Todas as etapas</option>
            {stages.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <select
            className="filter-select"
            aria-label="Filtrar por conectividade"
            value={connectivity}
            onChange={(event) => {
              setConnectivity(event.target.value);
              setPage(1);
            }}
          >
            <option value="all">Toda conectividade</option>
            {Object.entries(connectivityLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <select
            className="filter-select"
            aria-label="Filtrar por prioridade"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
          >
            <option value="all">Toda prioridade</option>
            <option value="ok">Adequado</option>
            <option value="attention">Atenção</option>
            <option value="critical">Prioritário</option>
          </select>
        </div>
        <DataTable
          caption={`Unidades educacionais sintéticas · ${dataset.label}`}
          columns={columns}
          rows={visible}
          emptyAction={
            <button className="button" onClick={clear}>
              <FilterX size={15} />
              Limpar filtros
            </button>
          }
        />
        <Pagination
          page={safePage}
          pageSize={PAGE_SIZE}
          total={filtered.length}
          onChange={setPage}
          noun="unidades"
        />
      </Panel>
      <div className="analytics-grid">
        <Panel
          title="Tecnologia de acesso"
          subtitle="Distribuição das unidades por tipo de enlace sintético"
        >
          <ProgressList
            items={(Object.keys(connectivityLabels) as ConnectivityKind[]).map((kind) => {
              const count = educationUnits.filter((unit) => unit.connectivity === kind).length;
              return {
                id: kind,
                label: connectivityLabels[kind],
                value: count,
                max: educationUnits.length,
                display: `${count} · ${Math.round((count / educationUnits.length) * 100)}%`,
                tone: kind === "offline" ? "danger" : kind === "fiber" ? "success" : "info",
              };
            })}
            note="Ter enlace não garante banda adequada para uso pedagógico simultâneo; confira Mbps e dispositivos por unidade."
          />
        </Panel>
        <Panel
          title="Prioridade de intervenção"
          subtitle="Classificação demonstrativa por enlace e disponibilidade de dispositivos"
        >
          <ProgressList
            items={(Object.keys(statusMeta) as (keyof typeof statusMeta)[]).map((key) => {
              const count = educationUnits.filter((unit) => unit.status === key).length;
              return {
                id: key,
                label: statusMeta[key].label,
                value: count,
                max: educationUnits.length,
                display: `${count} unidades`,
                tone: statusMeta[key].tone,
              };
            })}
            note="Prioritário: sem enlace ou menos de 55% dos dispositivos disponíveis. Atenção: enlace não fibra ou disponibilidade abaixo de 75%."
          />
        </Panel>
      </div>
      <section className="stack" aria-label="Programas educacionais acompanhados">
        <div className="section-heading">
          <p className="eyebrow">Programas e frentes</p>
          <h2>Da infraestrutura à prática pedagógica</h2>
          <p>
            Seis frentes sintéticas para acompanhar execução, cobertura e atenção — sem metas
            oficiais.
          </p>
        </div>
        <div className="program-grid">
          {educationPrograms.map((program) => (
            <article className="panel program-card" key={program.id}>
              <div className="panel-body">
                <div className="program-card-top">
                  <GraduationCap size={20} className="text-info" />
                  <Badge tone={programMeta[program.status].tone}>
                    {programMeta[program.status].label}
                  </Badge>
                </div>
                <h3>{program.name}</h3>
                <p className="program-focus">{program.focus}</p>
                <dl className="program-metrics">
                  <div>
                    <dt>Unidades</dt>
                    <dd>{program.units}</dd>
                  </div>
                  <div>
                    <dt>Educadores</dt>
                    <dd>{program.educators}</dd>
                  </div>
                  <div>
                    <dt>Execução</dt>
                    <dd>{program.completion}%</dd>
                  </div>
                </dl>
                <progress
                  className="progress-track progress-track--info"
                  value={program.completion}
                  max={100}
                  aria-label={`Execução sintética de ${program.name}: ${program.completion}%`}
                />
                <p className="program-id mono">{program.id}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
      <InsightPanel
        title="Leitura EdTech por área"
        subtitle="Perguntas para planejar a próxima iteração com responsáveis pela educação"
        items={[
          {
            title: "Conectar não é suficiente",
            text: "Cruze tipo de enlace, banda e dispositivos disponíveis. Uma unidade conectada por rádio pode precisar de revisão antes de atividades síncronas ou laboratórios maker.",
          },
          {
            title: "Formação acompanha infraestrutura",
            text: "Educadores formados e uso de plataforma são indicadores de adoção, não avaliação de aprendizagem. Evite inferir desempenho de estudantes a partir desses agregados.",
          },
          {
            title: "Priorize sem expor pessoas",
            text: "A fila de prioridade aponta unidades de referência para conversa técnica. Não há nomes, matrículas, notas, frequência ou localização de estudantes.",
          },
          {
            title: "Integre com segurança do entorno",
            text: "A aba Segurança pública inclui a frente Segurança Escolar. Use a mesma área de referência para contextualizar rotas e equipamentos, sem transformar demonstração em policiamento real.",
          },
        ]}
      />
      <Panel title="Indicadores e salvaguardas" subtitle="Contrato de dados desta camada">
        <DefinitionGrid
          items={[
            {
              term: "Unidade conectada",
              definition:
                "Unidade sintética com fibra, rádio ou satélite. Sem enlace é classificada como offline, mesmo que tenha dispositivos.",
            },
            {
              term: "Dispositivos disponíveis",
              definition:
                "Quantidade fictícia pronta para uso sobre o total da unidade. Não representa inventário patrimonial real.",
            },
            {
              term: "Uso da plataforma",
              definition:
                "Percentual sintético de adoção de recursos digitais. Não mede aprendizagem, notas ou frequência individual.",
            },
            {
              term: "Educadores formados",
              definition:
                "Contagem agregada de referência por unidade. Pode haver sobreposição em programas; não deve ser tratada como total único de pessoas sem deduplicação oficial.",
            },
            {
              term: "Prioridade",
              definition:
                "Regra didática baseada em conectividade e razão de dispositivos disponíveis. Não é ranking oficial de escolas.",
            },
            {
              term: "Privacidade",
              definition:
                "Nenhum dado pessoal de estudante ou educador é coletado. Nomes de unidades são rótulos fictícios por área, não instituições reais identificadas.",
            },
          ]}
        />
      </Panel>
      <ContextNote>
        Esta camada é uma demonstração de produto EdTech para gestão territorial. Não está conectada
        a censos escolares, redes oficiais, plataformas de aprendizagem ou sistemas de gestão.
      </ContextNote>
      <PageFooter />
    </div>
  );
}
