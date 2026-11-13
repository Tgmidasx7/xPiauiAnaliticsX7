import { Download, FilterX } from "lucide-react";
import { useState } from "react";
import { PageFooter } from "../components/ui/page-footer";
import { PageHeader } from "../components/ui/page-header";
import { NetworkStatusBadge } from "../components/ui/badge";
import { DataTable } from "../components/ui/data-table";
import type { Column } from "../components/ui/data-table";
import {
  ContextNote,
  DefinitionGrid,
  InsightPanel,
  ProgressList,
  SummaryStrip,
} from "../components/ui/insights";
import { Pagination } from "../components/ui/pagination";
import { Panel } from "../components/ui/panel";
import { SearchField } from "../components/ui/search-field";
import { getArea } from "../data";
import type { NetworkLink } from "../data/types";
import { downloadCsv } from "../lib/csv";
import { matchesSearch } from "../lib/format";
import { useScope } from "../state/scope";
import { useUi } from "../state/ui";

const PAGE_SIZE = 8;
export function NetworkPage() {
  const { dataset, scope } = useScope();
  const { networkLinks, areas, metrics } = dataset;
  const { notify } = useUi();
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const filtered = networkLinks.filter(
    (link) =>
      matchesSearch(`${link.id} ${link.name}`, query) &&
      (region === "all" || link.region === region) &&
      (status === "all" || link.status === status),
  );
  const safePage = Math.min(page, Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)));
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const clear = () => {
    setQuery("");
    setRegion("all");
    setStatus("all");
    setPage(1);
  };
  const degraded = networkLinks.filter((link) => link.status === "degraded");
  const meanUptime = networkLinks.reduce((sum, link) => sum + link.uptime, 0) / networkLinks.length;
  const columns: Column<NetworkLink>[] = [
    {
      key: "link",
      label: "Enlace",
      wide: true,
      render: (row) => (
        <>
          <span className="cell-primary">{row.name}</span>
          <span className="cell-secondary mono">{row.id}</span>
        </>
      ),
    },
    {
      key: "region",
      label: scope === "piaui" ? "Região" : "Zona",
      render: (row) => getArea(dataset, row.region)?.name,
    },
    {
      key: "latency",
      label: "Latência",
      render: (row) => (
        <span className={`mono ${row.latency >= 60 ? "text-danger" : ""}`}>{row.latency} ms</span>
      ),
    },
    {
      key: "loss",
      label: "Perda",
      render: (row) => (
        <span className={`mono ${row.loss >= 1 ? "text-warning" : "subtle"}`}>
          {row.loss.toFixed(2).replace(".", ",")}%
        </span>
      ),
    },
    {
      key: "uptime",
      label: "Disponibilidade",
      render: (row) => (
        <>
          <span className="mono">{row.uptime.toFixed(2).replace(".", ",")}%</span>
          <progress
            className={`progress-track u-mt-2 ${row.status === "degraded" ? "progress-track--warning" : ""}`}
            value={row.uptime}
            max={100}
            aria-label={`Disponibilidade de ${row.id}`}
          />
        </>
      ),
    },
    { key: "status", label: "Status", render: (row) => <NetworkStatusBadge status={row.status} /> },
  ];
  const exportLinks = () => {
    downloadCsv(
      `spia-demo-${dataset.id}-infraestrutura`,
      [
        "ID",
        "Enlace",
        "Território",
        "Área",
        "Latência (ms)",
        "Perda (%)",
        "Disponibilidade (%)",
        "Status",
      ],
      filtered.map((row) => [
        row.id,
        row.name,
        dataset.shortLabel,
        getArea(dataset, row.region)?.name,
        row.latency,
        row.loss,
        row.uptime,
        row.status,
      ]),
    );
    notify(`${filtered.length} enlaces sintéticos exportados.`);
  };
  return (
    <div className="stack">
      <PageHeader
        eyebrow={`Operação · conectividade · ${dataset.shortLabel}`}
        title="Infraestrutura"
        description="Enlaces, latência, perda e disponibilidade das camadas de vídeo, educação e segurança — sem ruído visual e sem integração real."
        actions={
          <button className="button" onClick={exportLinks} disabled={!filtered.length}>
            <Download size={15} />
            Exportar enlaces
          </button>
        }
      />
      <SummaryStrip
        label="Resumo de conectividade"
        items={[
          {
            label: "Latência média",
            value: metrics.averageLatency,
            unit: "ms",
            hint: "Limite demonstrativo: 60 ms",
          },
          {
            label: "Enlaces saudáveis",
            value: metrics.healthyLinks,
            unit: `/ ${networkLinks.length}`,
            hint: `${degraded.length} degradado(s) para revisar`,
          },
          {
            label: "Disponibilidade média",
            value: meanUptime.toFixed(2).replace(".", ","),
            unit: "%",
            hint: "Média simples dos enlaces do snapshot",
          },
          {
            label: "Maior perda",
            value: Math.max(...networkLinks.map((link) => link.loss))
              .toFixed(2)
              .replace(".", ","),
            unit: "%",
            hint: "Limite demonstrativo: 1%",
          },
        ]}
      />
      <Panel title="Enlaces de rede" subtitle="Limiares: latência < 60 ms · perda < 1%">
        <div className="filter-bar">
          <SearchField
            value={query}
            onChange={(value) => {
              setQuery(value);
              setPage(1);
            }}
            label="Buscar enlaces"
            placeholder="Buscar enlace ou núcleo…"
          />
          <select
            className="filter-select"
            aria-label="Filtrar enlaces por área"
            value={region}
            onChange={(event) => {
              setRegion(event.target.value);
              setPage(1);
            }}
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
            aria-label="Filtrar enlaces por status"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
          >
            <option value="all">Todos os status</option>
            <option value="healthy">Saudável</option>
            <option value="degraded">Degradado</option>
          </select>
        </div>
        <DataTable
          caption={`Enlaces de rede sintéticos · ${dataset.label}`}
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
          noun="enlaces"
        />
      </Panel>
      <div className="analytics-grid">
        <Panel title="Latência por área" subtitle="Média dos enlaces de cada área de referência">
          <ProgressList
            items={areas.map((area) => {
              const links = networkLinks.filter((link) => link.region === area.id);
              const average = Math.round(
                links.reduce((sum, link) => sum + link.latency, 0) / links.length,
              );
              return {
                id: area.id,
                label: area.name,
                value: average,
                max: 60,
                display: `${average} ms`,
                tone: average >= 45 ? "warning" : "accent",
              };
            })}
            note="Barras usam 60 ms como referência visual. Valores acima do limite são destacados na tabela."
          />
        </Panel>
        <Panel
          title="Enlaces que pedem atenção"
          subtitle="Priorize perda de pacotes e disponibilidade antes de interpretar atividade"
        >
          <DataTable caption="Enlaces sintéticos degradados" columns={columns} rows={degraded} />
        </Panel>
      </div>
      <InsightPanel
        title="Leitura de resiliência"
        subtitle="Como conectar infraestrutura às outras camadas desta versão"
        items={[
          {
            title: "Vídeo depende de enlace",
            text: "Uma câmera offline pode refletir manutenção do equipamento ou conectividade. Confira o enlace da área antes de atribuir causa; o fixture não estabelece causalidade real.",
          },
          {
            title: "EdTech tem requisitos próprios",
            text: `Das ${dataset.educationUnits.length} unidades educacionais, ${dataset.educationUnits.filter((unit) => unit.connectivity === "fiber").length} usam fibra sintética e ${dataset.educationUnits.filter((unit) => unit.connectivity === "offline").length} estão sem enlace. A aba Educação detalha tecnologia e banda.`,
          },
          {
            title: "Segurança precisa de continuidade",
            text: "Bases e ocorrências são agregadas por área. Disponibilidade de rede é um contexto de demonstração, não um canal real de despacho ou emergência.",
          },
          {
            title: "Compare versões, não some tudo",
            text: "Piauí e Teresina Capital têm inventários independentes. Alternar o recorte preserva a rota, mas troca métricas, enlaces, escolas e bases para evitar dupla contagem.",
          },
        ]}
      />
      <Panel title="Contrato dos indicadores" subtitle="Definições para leitura e exportação">
        <DefinitionGrid
          items={[
            {
              term: "Latência",
              definition:
                "Tempo simulado de ida e volta do enlace, em milissegundos. Não é medição de rede real.",
            },
            {
              term: "Perda",
              definition:
                "Percentual sintético de pacotes não entregues. Acima de 1% o cenário marca atenção.",
            },
            {
              term: "Disponibilidade",
              definition:
                "Percentual sintético de tempo operacional do enlace no período de referência.",
            },
            {
              term: "Degradado",
              definition:
                "Estado do fixture que combina perda elevada e menor disponibilidade. Não dispara alerta externo.",
            },
          ]}
        />
      </Panel>
      <ContextNote>
        Os limiares são escolhas didáticas desta base, não normas técnicas ou metas oficiais de
        conectividade.
      </ContextNote>
      <PageFooter />
    </div>
  );
}
