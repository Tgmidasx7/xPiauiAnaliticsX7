import { ArrowUpRight, GraduationCap, MapPin, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { TerritoryMap } from "../components/overview/territory-map";
import { PageFooter } from "../components/ui/page-footer";
import { PageHeader } from "../components/ui/page-header";
import { DataTable } from "../components/ui/data-table";
import type { Column } from "../components/ui/data-table";
import { ContextNote, DefinitionGrid, InsightPanel } from "../components/ui/insights";
import { Panel } from "../components/ui/panel";
import type { Region } from "../data/types";
import { useScope } from "../state/scope";
import { useWorkspace } from "../state/workspace";

export function TerritoriesPage() {
  const { dataset, scope, path } = useScope();
  const { events } = useWorkspace();
  const areaLabel = scope === "piaui" ? "Região" : "Zona";
  const columns: Column<Region>[] = [
    {
      key: "region",
      label: areaLabel,
      wide: true,
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
        <span className="mono">
          {dataset.cameras.filter((camera) => camera.region === row.id).length}
        </span>
      ),
    },
    {
      key: "online",
      label: "Disponíveis",
      render: (row) => (
        <span className="mono text-success">
          {
            dataset.cameras.filter(
              (camera) => camera.region === row.id && camera.status === "online",
            ).length
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
      key: "schools",
      label: "Escolas",
      render: (row) => (
        <span className="mono">
          {dataset.educationUnits.filter((unit) => unit.areaId === row.id).length}
        </span>
      ),
    },
    {
      key: "security",
      label: "Bases",
      render: (row) => (
        <span className="mono">
          {dataset.securityUnits.filter((unit) => unit.areaId === row.id).length}
        </span>
      ),
    },
    {
      key: "action",
      label: "Explorar",
      action: true,
      render: (row) => (
        <Link className="text-link" to={path(`/cameras?region=${row.id}`)}>
          Ver câmeras
          <ArrowUpRight size={14} />
        </Link>
      ),
    },
  ];
  return (
    <div className="stack">
      <PageHeader
        eyebrow={`Inteligência · leitura regional · ${dataset.shortLabel}`}
        title="Territórios"
        description={
          scope === "piaui"
            ? "Cinco regiões de referência do Piauí reúnem cobertura de vídeo, eventos, educação e segurança em uma leitura estadual."
            : "Cinco zonas urbanas de referência de Teresina organizam a leitura da capital por corredores, terminais, escolas e bases."
        }
      />
      <div className="overview-grid">
        <TerritoryMap explore />
        <Panel
          title={`Cobertura por ${areaLabel.toLowerCase()}`}
          subtitle="Selecione um marco no mapa ou explore a tabela comparativa"
        >
          <DataTable
            caption={`Cobertura sintética por área · ${dataset.label}`}
            columns={columns}
            rows={dataset.areas}
          />
        </Panel>
      </div>
      <section className="stack" aria-label="Perfis das áreas de referência">
        <div className="section-heading">
          <p className="eyebrow">Perfis de área</p>
          <h2>Contexto local, indicadores comparáveis</h2>
          <p>
            Cada cartão usa o mesmo contrato de dados; os valores pertencem apenas a{" "}
            {dataset.shortLabel}.
          </p>
        </div>
        <div className="area-profile-grid">
          {dataset.areas.map((area) => {
            const cameras = dataset.cameras.filter((camera) => camera.region === area.id);
            const online = cameras.filter((camera) => camera.status === "online").length;
            const schools = dataset.educationUnits.filter((unit) => unit.areaId === area.id);
            const connected = schools.filter((unit) => unit.connectivity !== "offline").length;
            const bases = dataset.securityUnits.filter((unit) => unit.areaId === area.id);
            const available = bases.filter((unit) => unit.status === "available").length;
            const pending = events.filter(
              (event) => event.region === area.id && event.status !== "resolved",
            ).length;
            const openOccurrences = dataset.securityOccurrences.filter(
              (item) => item.areaId === area.id && item.status !== "closed",
            ).length;
            return (
              <article className="panel area-profile" key={area.id}>
                <div className="panel-body">
                  <div className="area-profile-heading">
                    <MapPin size={18} className="text-accent" />
                    <div>
                      <h3>{area.name}</h3>
                      <p>{area.reference}</p>
                    </div>
                  </div>
                  <dl className="area-profile-metrics">
                    <div>
                      <dt>Câmeras disponíveis</dt>
                      <dd>
                        {online}/{cameras.length}
                      </dd>
                    </div>
                    <div>
                      <dt>Eventos pendentes</dt>
                      <dd>{pending}</dd>
                    </div>
                    <div>
                      <dt>
                        <GraduationCap size={13} /> Escolas conectadas
                      </dt>
                      <dd>
                        {connected}/{schools.length}
                      </dd>
                    </div>
                    <div>
                      <dt>
                        <ShieldCheck size={13} /> Bases disponíveis
                      </dt>
                      <dd>
                        {available}/{bases.length}
                      </dd>
                    </div>
                    <div>
                      <dt>Ocorrências abertas</dt>
                      <dd>{openOccurrences}</dd>
                    </div>
                    <div>
                      <dt>Enlaces monitorados</dt>
                      <dd>
                        {dataset.networkLinks.filter((link) => link.region === area.id).length}
                      </dd>
                    </div>
                  </dl>
                  <div className="area-profile-links">
                    <Link className="text-link" to={path(`/cameras?region=${area.id}`)}>
                      Câmeras
                      <ArrowUpRight size={13} />
                    </Link>
                    <Link className="text-link" to={path(`/educacao?area=${area.id}`)}>
                      Educação
                      <ArrowUpRight size={13} />
                    </Link>
                    <Link className="text-link" to={path(`/seguranca?area=${area.id}`)}>
                      Segurança
                      <ArrowUpRight size={13} />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
      <InsightPanel
        title="Como comparar as duas versões"
        subtitle="O recorte muda a unidade de análise, não o contrato da interface"
        items={[
          {
            title: "Piauí · escala estadual",
            text: "As regiões Capital, Norte, Litoral, Centro e Sul são referências de demonstração para distribuir corredores, unidades escolares e bases. Não são uma divisão oficial completa do estado.",
          },
          {
            title: "Teresina · escala municipal",
            text: "Centro, Norte, Sul, Leste e Sudeste organizam uma leitura urbana esquemática. A capital tem inventário próprio, não apenas as câmeras da região Capital do estado.",
          },
          {
            title: "Mapa como índice",
            text: "Os marcos selecionam áreas e abrem filtros. O desenho não tem precisão cartográfica, não mostra localização em tempo real e não deve orientar deslocamento operacional.",
          },
          {
            title: "Indicadores agregados",
            text: "Educação e segurança são apresentados por área e unidade de referência. Não há endereços sensíveis, nomes de estudantes, vítimas, agentes ou trajetórias individuais.",
          },
        ]}
      />
      <Panel title="Contrato territorial" subtitle="O que permanece igual ao alternar o recorte">
        <DefinitionGrid
          items={[
            {
              term: "Área de referência",
              definition:
                "Agrupamento didático usado por câmeras, eventos, escolas, bases e enlaces. O rótulo muda de região para zona conforme a versão.",
            },
            {
              term: "Inventário independente",
              definition:
                "Cada versão possui IDs, totais e métricas próprios. Não há soma automática entre estado e capital.",
            },
            {
              term: "Filtros compartilháveis",
              definition:
                "Links preservam territorio na query string. Ao trocar a versão, filtros de área/câmera são limpos para evitar combinações inválidas.",
            },
            {
              term: "Snapshot",
              definition:
                "Mesma data de referência nas duas versões para comparação controlada. Os valores continuam sendo sintéticos.",
            },
          ]}
        />
      </Panel>
      <ContextNote>
        As áreas e referências geográficas são escolhas de design para a demonstração. Não
        representam cobertura oficial, limites administrativos completos ou capacidade instalada
        real.
      </ContextNote>
      <PageFooter />
    </div>
  );
}
