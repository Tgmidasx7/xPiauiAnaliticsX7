import { Download, FilterX, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Badge, SeverityBadge } from "../components/ui/badge";
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
import type {
  SecurityNature,
  SecurityOccurrence,
  SecurityStatus,
  SecurityUnit,
} from "../data/types";
import { downloadCsv } from "../lib/csv";
import { formatTime, matchesSearch } from "../lib/format";
import { useScope } from "../state/scope";
import { useUi } from "../state/ui";

const PAGE_SIZE = 8;
const natures: SecurityNature[] = ["Patrimonial", "Trânsito", "Violência", "Apoio", "Prevenção"];
const statusLabels: Record<SecurityStatus, string> = {
  registered: "Registrado",
  dispatched: "Despachado",
  "on-scene": "Em atendimento",
  closed: "Encerrado",
};
const statusTones: Record<SecurityStatus, "neutral" | "info" | "warning" | "success"> = {
  registered: "neutral",
  dispatched: "info",
  "on-scene": "warning",
  closed: "success",
};
const unitStatusLabels = {
  available: "Disponível",
  busy: "Em atendimento",
  maintenance: "Manutenção",
} as const;
const unitStatusTones = { available: "success", busy: "warning", maintenance: "neutral" } as const;
const programMeta = {
  active: { label: "Ativo", tone: "success" },
  expanding: { label: "Em expansão", tone: "info" },
  planned: { label: "Planejado", tone: "neutral" },
} as const;

export function SecurityPage() {
  const { dataset, scope } = useScope();
  const { securityOccurrences, securityUnits, securityPrograms, areas, metrics } = dataset;
  const { notify } = useUi();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [nature, setNature] = useState("all");
  const [status, setStatus] = useState("all");
  const [severity, setSeverity] = useState("all");
  const [page, setPage] = useState(1);
  const area = areas.some((item) => item.id === params.get("area")) ? params.get("area")! : "all";
  const setArea = (value: string) => {
    const next = new URLSearchParams(params);
    if (value === "all") next.delete("area");
    else next.set("area", value);
    setParams(next, { replace: true });
    setPage(1);
  };
  const filtered = securityOccurrences.filter(
    (item) =>
      matchesSearch(
        `${item.id} ${item.nature} ${getArea(dataset, item.areaId)?.name ?? ""}`,
        query,
      ) &&
      (area === "all" || item.areaId === area) &&
      (nature === "all" || item.nature === nature) &&
      (status === "all" ||
        (status === "open" ? item.status !== "closed" : item.status === status)) &&
      (severity === "all" || item.severity === severity),
  );
  const safePage = Math.min(page, Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)));
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const clear = () => {
    setQuery("");
    setNature("all");
    setStatus("all");
    setSeverity("all");
    setArea("all");
    setPage(1);
  };
  const closed = securityOccurrences.filter((item) => item.status === "closed").length;
  const personnel = securityUnits.reduce((sum, unit) => sum + unit.personnel, 0);
  const vehicles = securityUnits.reduce((sum, unit) => sum + unit.vehicles, 0);
  const columns: Column<SecurityOccurrence>[] = [
    {
      key: "occurrence",
      label: "Ocorrência",
      wide: true,
      render: (row) => (
        <>
          <span className="cell-primary">{row.nature}</span>
          <span className="cell-secondary mono">{row.id}</span>
        </>
      ),
    },
    {
      key: "area",
      label: scope === "piaui" ? "Região" : "Zona",
      render: (row) => getArea(dataset, row.areaId)?.name,
    },
    {
      key: "severity",
      label: "Severidade",
      render: (row) => <SeverityBadge severity={row.severity} />,
    },
    {
      key: "status",
      label: "Situação",
      render: (row) => <Badge tone={statusTones[row.status]}>{statusLabels[row.status]}</Badge>,
    },
    {
      key: "response",
      label: "Resposta",
      render: (row) => (
        <span className="mono">
          {row.status === "registered" ? "—" : `${row.responseMinutes} min`}
        </span>
      ),
    },
    {
      key: "units",
      label: "Unidades",
      render: (row) => <span className="mono">{row.unitsAssigned || "—"}</span>,
    },
    {
      key: "time",
      label: "Horário",
      render: (row) => (
        <time className="mono subtle" dateTime={row.timestamp}>
          {formatTime(row.timestamp)}
        </time>
      ),
    },
  ];
  const unitColumns: Column<SecurityUnit>[] = [
    {
      key: "unit",
      label: "Base de referência",
      wide: true,
      render: (row) => (
        <>
          <span className="cell-primary">{row.name}</span>
          <span className="cell-secondary mono">
            {row.id} · {row.type}
          </span>
        </>
      ),
    },
    { key: "area", label: "Área", render: (row) => getArea(dataset, row.areaId)?.name },
    {
      key: "status",
      label: "Disponibilidade",
      render: (row) => (
        <Badge tone={unitStatusTones[row.status]}>{unitStatusLabels[row.status]}</Badge>
      ),
    },
    {
      key: "personnel",
      label: "Efetivo de referência",
      render: (row) => <span className="mono">{row.personnel}</span>,
    },
    {
      key: "vehicles",
      label: "Veículos",
      render: (row) => <span className="mono">{row.vehicles}</span>,
    },
  ];
  const exportOccurrences = () => {
    downloadCsv(
      `spia-demo-${dataset.id}-seguranca`,
      [
        "ID",
        "Natureza",
        "Território",
        "Área",
        "Severidade",
        "Situação",
        "Resposta (min)",
        "Unidades designadas",
        "Horário UTC-3",
      ],
      filtered.map((row) => [
        row.id,
        row.nature,
        dataset.shortLabel,
        getArea(dataset, row.areaId)?.name,
        row.severity,
        statusLabels[row.status],
        row.status === "registered" ? "" : row.responseMinutes,
        row.unitsAssigned,
        formatTime(row.timestamp),
      ]),
    );
    notify(`${filtered.length} ocorrências sintéticas exportadas.`);
  };
  return (
    <div className="stack">
      <PageHeader
        eyebrow={`Inteligência · segurança do estado · ${dataset.shortLabel}`}
        title="Segurança pública"
        description={
          scope === "piaui"
            ? "Ocorrências agregadas, bases integradas e programas de prevenção em uma leitura estadual de demonstração. Sem dados pessoais ou despacho real."
            : "Ocorrências agregadas, bases operacionais e programas preventivos da capital em uma leitura municipal de demonstração. Sem dados pessoais ou despacho real."
        }
        actions={
          <button className="button" onClick={exportOccurrences} disabled={!filtered.length}>
            <Download size={15} />
            Exportar ocorrências
          </button>
        }
      />
      <SummaryStrip
        label="Resumo da camada de segurança"
        items={[
          {
            label: "Ocorrências em aberto",
            value: metrics.securityOpen,
            unit: `/ ${securityOccurrences.length}`,
            hint: "Registradas, despachadas ou em atendimento",
          },
          {
            label: "Resposta média",
            value: metrics.securityAverageResponse,
            unit: "min",
            hint: "Média sintética das ocorrências já atendidas",
          },
          {
            label: "Bases disponíveis",
            value: metrics.securityAvailableUnits,
            unit: `/ ${securityUnits.length}`,
            hint: `${personnel} agentes e ${vehicles} veículos de referência`,
          },
          {
            label: "Encerradas",
            value: closed,
            hint: `${Math.round((closed / securityOccurrences.length) * 100)}% do ciclo demonstrativo`,
          },
        ]}
      />
      <Panel
        title="Fila de ocorrências"
        subtitle="Registros fictícios por natureza e área; nenhuma ocorrência real, vítima ou pessoa identificada"
      >
        <div className="filter-bar">
          <SearchField
            value={query}
            onChange={(value) => {
              setQuery(value);
              setPage(1);
            }}
            label="Buscar ocorrências"
            placeholder="Buscar ID, natureza ou área…"
          />
          <select
            className="filter-select"
            aria-label="Filtrar ocorrências por área"
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
            aria-label="Filtrar por natureza"
            value={nature}
            onChange={(event) => {
              setNature(event.target.value);
              setPage(1);
            }}
          >
            <option value="all">Todas as naturezas</option>
            {natures.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <select
            className="filter-select"
            aria-label="Filtrar por situação"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
          >
            <option value="all">Todas as situações</option>
            <option value="open">Em aberto</option>
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <select
            className="filter-select"
            aria-label="Filtrar por severidade"
            value={severity}
            onChange={(event) => {
              setSeverity(event.target.value);
              setPage(1);
            }}
          >
            <option value="all">Toda severidade</option>
            <option value="critical">Crítico</option>
            <option value="warning">Atenção</option>
            <option value="info">Informativo</option>
          </select>
        </div>
        <DataTable
          caption={`Ocorrências sintéticas de segurança · ${dataset.label}`}
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
          noun="ocorrências"
        />
      </Panel>
      <div className="analytics-grid">
        <Panel
          title="Ciclo de atendimento"
          subtitle="Distribuição das ocorrências por situação no snapshot"
        >
          <ProgressList
            items={(Object.keys(statusLabels) as SecurityStatus[]).map((key) => {
              const count = securityOccurrences.filter((item) => item.status === key).length;
              return {
                id: key,
                label: statusLabels[key],
                value: count,
                max: securityOccurrences.length,
                display: `${count} · ${Math.round((count / securityOccurrences.length) * 100)}%`,
                tone: statusTones[key] === "neutral" ? "accent" : statusTones[key],
              };
            })}
          />
        </Panel>
        <Panel
          title="Naturezas registradas"
          subtitle="Classificação agregada didática, sem estatística criminal oficial"
        >
          <ProgressList
            items={natures.map((item) => {
              const count = securityOccurrences.filter(
                (occurrence) => occurrence.nature === item,
              ).length;
              return {
                id: item,
                label: item,
                value: count,
                max: securityOccurrences.length,
                display: `${count} registros`,
                tone: item === "Violência" ? "danger" : item === "Prevenção" ? "success" : "accent",
              };
            })}
            note="As categorias descrevem apenas o fixture. Não usar para comparar criminalidade real entre regiões ou zonas."
          />
        </Panel>
      </div>
      <Panel
        title="Bases e unidades integradas"
        subtitle={`${securityUnits.length} unidades de referência · polícia, trânsito, defesa civil, guarda e bombeiros`}
      >
        <DataTable
          caption={`Bases operacionais sintéticas · ${dataset.label}`}
          columns={unitColumns}
          rows={securityUnits}
        />
      </Panel>
      <div className="analytics-grid">
        <Panel
          title="Resposta média por área"
          subtitle="Minutos médios das ocorrências já atendidas em cada área"
        >
          <ProgressList
            items={areas.map((item) => {
              const attended = securityOccurrences.filter(
                (occurrence) => occurrence.areaId === item.id && occurrence.status !== "registered",
              );
              const average = attended.length
                ? Math.round(
                    attended.reduce((sum, occurrence) => sum + occurrence.responseMinutes, 0) /
                      attended.length,
                  )
                : 0;
              return {
                id: item.id,
                label: item.name,
                value: average,
                max: 30,
                display: `${average} min · n=${attended.length}`,
                tone: average > 20 ? "warning" : "success",
              };
            })}
            note="Referência visual de 30 min, não meta oficial. Denominadores pequenos exigem cautela; registros não despachados ficam fora da média."
          />
        </Panel>
        <Panel
          title="Disponibilidade das bases"
          subtitle="Estado sintético das unidades de referência"
        >
          <ProgressList
            items={(Object.keys(unitStatusLabels) as (keyof typeof unitStatusLabels)[]).map(
              (key) => {
                const count = securityUnits.filter((unit) => unit.status === key).length;
                return {
                  id: key,
                  label: unitStatusLabels[key],
                  value: count,
                  max: securityUnits.length,
                  display: `${count}/${securityUnits.length}`,
                  tone: unitStatusTones[key] === "neutral" ? "accent" : unitStatusTones[key],
                };
              },
            )}
          />
        </Panel>
      </div>
      <section className="stack" aria-label="Programas de segurança acompanhados">
        <div className="section-heading">
          <p className="eyebrow">Programas e frentes</p>
          <h2>Prevenção, resposta e proteção do entorno escolar</h2>
          <p>
            Seis frentes sintéticas com ações e cobertura de referência para {dataset.shortLabel}.
          </p>
        </div>
        <div className="program-grid">
          {securityPrograms.map((program) => (
            <article className="panel program-card" key={program.id}>
              <div className="panel-body">
                <div className="program-card-top">
                  <ShieldCheck size={20} className="text-success" />
                  <Badge tone={programMeta[program.status].tone}>
                    {programMeta[program.status].label}
                  </Badge>
                </div>
                <h3>{program.name}</h3>
                <p className="program-focus">{program.focus}</p>
                <dl className="program-metrics">
                  <div>
                    <dt>Ações</dt>
                    <dd>{program.actions}</dd>
                  </div>
                  <div>
                    <dt>Cobertura</dt>
                    <dd>{program.coverage}%</dd>
                  </div>
                </dl>
                <progress
                  className="progress-track progress-track--success"
                  value={program.coverage}
                  max={100}
                  aria-label={`Cobertura sintética de ${program.name}: ${program.coverage}%`}
                />
                <p className="program-id mono">{program.id}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
      <InsightPanel
        title="Protocolo de leitura responsável"
        subtitle="Esta tela demonstra fluxo de gestão; não é canal de emergência nem sistema policial"
        items={[
          {
            title: "Não há despacho real",
            text: "Situações como despachado ou em atendimento são estados de fixture. Nenhum botão aciona polícia, bombeiros, defesa civil, guarda ou serviço de emergência.",
          },
          {
            title: "Dados agregados e fictícios",
            text: "Não há nomes, endereços, relatos reais, vítimas, investigados, placas ou identificação de agentes. Naturezas e tempos não representam estatística criminal oficial.",
          },
          {
            title: "Separe evento de ocorrência",
            text: "Eventos operacionais podem ter origem em câmeras e têm tratamento local na aba Eventos. Ocorrências desta aba têm ciclo próprio de segurança e não são convertidas automaticamente.",
          },
          {
            title: "Contextualize antes de decidir",
            text: "Cruze área, disponibilidade de bases e infraestrutura como hipótese de trabalho. Uma integração real exigiria governança, base legal, auditoria, segurança da informação e supervisão humana.",
          },
        ]}
      />
      <Panel title="Glossário de segurança" subtitle="Termos do ciclo demonstrativo">
        <DefinitionGrid
          items={[
            {
              term: "Registrado",
              definition:
                "Ocorrência sintética criada, ainda sem unidade designada ou tempo de resposta.",
            },
            {
              term: "Despachado / em atendimento",
              definition:
                "Estados didáticos do ciclo. Unidades designadas e minutos são valores fictícios, sem acionamento externo.",
            },
            {
              term: "Encerrado",
              definition:
                "Registro concluído no fixture. Não implica resolução de caso real ou decisão judicial/administrativa.",
            },
            {
              term: "Base disponível",
              definition:
                "Unidade de referência marcada como disponível no snapshot. Efetivo e veículos são agregados sintéticos, não escala real.",
            },
            {
              term: "Resposta média",
              definition:
                "Média simples de minutos das ocorrências já atendidas. Não é indicador oficial de desempenho policial.",
            },
            {
              term: "Segurança escolar",
              definition:
                "Frente de prevenção no entorno de unidades educacionais, relacionada à camada EdTech apenas por área de referência.",
            },
          ]}
        />
      </Panel>
      <ContextNote>
        Em emergência real, use os canais oficiais competentes. Este painel não recebe denúncias,
        não monitora pessoas e não deve orientar ações policiais.
      </ContextNote>
      <PageFooter />
    </div>
  );
}
