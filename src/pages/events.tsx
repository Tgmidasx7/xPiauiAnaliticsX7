import { Download, FilterX, X } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { EventsTable } from "../components/events/events-table";
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
import { getArea, getScopedCamera } from "../data";
import type { EventCategory } from "../data/types";
import { downloadCsv } from "../lib/csv";
import { formatTime, matchesSearch } from "../lib/format";
import { useScope } from "../state/scope";
import { useUi } from "../state/ui";
import { useWorkspace } from "../state/workspace";

const PAGE_SIZE = 8;
const statusOptions = [
  { value: "all", label: "Todos os status" },
  { value: "pending", label: "Pendentes e em análise" },
  { value: "open", label: "Pendentes" },
  { value: "investigating", label: "Em análise" },
  { value: "resolved", label: "Resolvidos" },
];
const categories: EventCategory[] = [
  "Trânsito",
  "Infraestrutura",
  "Perímetro",
  "Mobilidade",
  "Educação",
  "Segurança Pública",
];

export function EventsPage() {
  const { dataset, scope } = useScope();
  const { events } = useWorkspace();
  const { notify } = useUi();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [severity, setSeverity] = useState("all");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);
  const status = statusOptions.some((option) => option.value === params.get("status"))
    ? params.get("status")!
    : "all";
  const region = dataset.areas.some((area) => area.id === params.get("region"))
    ? params.get("region")!
    : "";
  const camera = getScopedCamera(dataset, params.get("camera") ?? "") ? params.get("camera")! : "";
  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (!value || value === "all") next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
    setPage(1);
  };
  const clear = () => {
    setQuery("");
    setSeverity("all");
    setCategory("all");
    setParams(scope === "teresina" ? { territorio: "teresina" } : {}, { replace: true });
    setPage(1);
  };
  const filtered = events.filter(
    (event) =>
      matchesSearch(
        `${event.id} ${event.title} ${event.category} ${getScopedCamera(dataset, event.cameraId)?.name ?? ""}`,
        query,
      ) &&
      (severity === "all" || event.severity === severity) &&
      (category === "all" || event.category === category) &&
      (status === "all" ||
        (status === "pending" ? event.status !== "resolved" : event.status === status)) &&
      (!region || event.region === region) &&
      (!camera || event.cameraId === camera),
  );
  const safePage = Math.min(page, Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)));
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const pending = events.filter((event) => event.status !== "resolved");
  const exportEvents = () => {
    downloadCsv(
      `spia-demo-${dataset.id}-eventos`,
      [
        "ID",
        "Evento",
        "Categoria",
        "Severidade",
        "Status",
        "Território",
        "Área",
        "Câmera",
        "Horário UTC-3",
      ],
      filtered.map((event) => [
        event.id,
        event.title,
        event.category,
        event.severity,
        event.status,
        dataset.shortLabel,
        getArea(dataset, event.region)?.name,
        event.cameraId,
        formatTime(event.timestamp),
      ]),
    );
    notify(`${filtered.length} eventos sintéticos exportados.`);
  };
  return (
    <div className="stack">
      <PageHeader
        eyebrow={`Operação · fila de análise · ${dataset.shortLabel}`}
        title="Eventos"
        description="Da triagem ao encerramento: categoria, severidade, origem e histórico local em uma fila auditável de demonstração."
        actions={
          <button className="button" onClick={exportEvents} disabled={!filtered.length}>
            <Download size={15} />
            Exportar eventos
          </button>
        }
      />
      <SummaryStrip
        label="Resumo da fila de eventos"
        items={[
          {
            label: "Eventos no snapshot",
            value: events.length,
            hint: "Inclui categorias operacionais, educação e segurança",
          },
          {
            label: "Pendentes",
            value: events.filter((event) => event.status === "open").length,
            hint: "Aguardando primeira análise",
          },
          {
            label: "Em análise",
            value: events.filter((event) => event.status === "investigating").length,
            hint: "Tratamento local em andamento",
          },
          {
            label: "Críticos não resolvidos",
            value: pending.filter((event) => event.severity === "critical").length,
            hint: "Prioridade demonstrativa",
          },
        ]}
      />
      <Panel
        title="Fila de eventos"
        subtitle="As alterações de status são locais e ficam salvas neste navegador"
        footer={<span>Severidade e status são dimensões independentes.</span>}
      >
        <div className="filter-bar">
          <SearchField
            value={query}
            onChange={(value) => {
              setQuery(value);
              setPage(1);
            }}
            label="Buscar eventos"
            placeholder="Buscar evento, ID, categoria ou câmera…"
          />
          <select
            className="filter-select"
            aria-label="Filtrar por status"
            value={status}
            onChange={(event) => setParam("status", event.target.value)}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
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
          <select
            className="filter-select"
            aria-label="Filtrar por categoria"
            value={category}
            onChange={(event) => {
              setCategory(event.target.value);
              setPage(1);
            }}
          >
            <option value="all">Todas as categorias</option>
            {categories.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <select
            className="filter-select"
            aria-label="Filtrar por área"
            value={region || "all"}
            onChange={(event) => setParam("region", event.target.value)}
          >
            <option value="all">Todas as áreas</option>
            {dataset.areas.map((area) => (
              <option key={area.id} value={area.id}>
                {area.name}
              </option>
            ))}
          </select>
        </div>
        {(region || camera) && (
          <div className="panel-body row row--wrap">
            {region && (
              <button className="button button--small" onClick={() => setParam("region", "")}>
                Área: {getArea(dataset, region)?.name ?? region}
                <X size={13} />
              </button>
            )}
            {camera && (
              <button className="button button--small" onClick={() => setParam("camera", "")}>
                Câmera: {camera}
                <X size={13} />
              </button>
            )}
          </div>
        )}
        <EventsTable
          events={visible}
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
          noun="eventos"
        />
      </Panel>
      <div className="analytics-grid">
        <Panel
          title="Distribuição por categoria"
          subtitle="Todas as categorias do snapshot, independentemente dos filtros da fila"
        >
          <ProgressList
            items={categories.map((item) => {
              const count = events.filter((event) => event.category === item).length;
              return {
                id: item,
                label: item,
                value: count,
                max: events.length,
                display: `${count} · ${Math.round((count / events.length) * 100)}%`,
                tone:
                  item === "Educação"
                    ? "info"
                    : item === "Segurança Pública"
                      ? "success"
                      : "accent",
              };
            })}
          />
        </Panel>
        <Panel
          title="Tratamento por severidade"
          subtitle="Crítico não significa necessariamente pendente; acompanhe as duas dimensões"
        >
          <ProgressList
            items={(
              [
                { id: "critical", label: "Crítico", tone: "danger" },
                { id: "warning", label: "Atenção", tone: "warning" },
                { id: "info", label: "Informativo", tone: "info" },
              ] as const
            ).map((item) => {
              const group = events.filter((event) => event.severity === item.id);
              const resolved = group.filter((event) => event.status === "resolved").length;
              return {
                ...item,
                value: resolved,
                max: group.length,
                display: `${resolved}/${group.length} resolvidos`,
              };
            })}
            note="As barras mostram resolução dentro de cada severidade. Alterações feitas nos detalhes atualizam este painel imediatamente."
          />
        </Panel>
      </div>
      <InsightPanel
        title="Fluxo de tratamento"
        subtitle="Um caminho explícito para a demonstração, sem despacho real"
        items={[
          {
            title: "1 · Triar",
            text: "Leia categoria, severidade, área e câmera de origem. Use a busca e os filtros para reduzir a fila sem perder o contexto do território.",
          },
          {
            title: "2 · Investigar",
            text: "Abra o evento e inicie a análise. O status muda apenas neste navegador; nenhuma equipe, protocolo ou sistema externo é acionado.",
          },
          {
            title: "3 · Encerrar com contexto",
            text: "Resolva o evento depois de revisar a origem. Eventos resolvidos permanecem exportáveis e podem ser reabertos para demonstrar o fluxo.",
          },
          {
            title: "4 · Cruzar camadas",
            text: `Eventos de educação e segurança conectam a fila às abas especializadas de ${dataset.shortLabel}. Ocorrências de segurança têm ciclo próprio na aba Segurança pública.`,
          },
        ]}
      />
      <Panel
        title="Glossário operacional"
        subtitle="Termos usados de forma consistente nas duas versões"
      >
        <DefinitionGrid
          items={[
            {
              term: "Severidade",
              definition:
                "Impacto potencial do cenário: crítico, atenção ou informativo. É independente do andamento do tratamento.",
            },
            {
              term: "Status",
              definition:
                "Andamento local: pendente, em análise ou resolvido. Persistido no navegador e validado contra IDs conhecidos.",
            },
            {
              term: "Categoria",
              definition:
                "Camada de origem do registro: trânsito, infraestrutura, perímetro, mobilidade, educação ou segurança pública.",
            },
            {
              term: "Origem",
              definition:
                "Câmera e área de referência do território ativo. Abra a câmera para conferir a configuração sintética ou visite Territórios para comparar áreas.",
            },
          ]}
        />
      </Panel>
      <ContextNote>
        Os eventos são fixtures determinísticos. Alterações de status não alteram dados oficiais e
        não representam decisões operacionais reais.
      </ContextNote>
      <PageFooter />
    </div>
  );
}
