import { Check, Monitor, RotateCcw } from "lucide-react";
import { useState } from "react";
import { PageFooter } from "../components/ui/page-footer";
import { PageHeader } from "../components/ui/page-header";
import { Dialog } from "../components/ui/dialog";
import { DefinitionGrid, InsightPanel } from "../components/ui/insights";
import { Panel } from "../components/ui/panel";
import { SegmentedControl } from "../components/ui/segmented-control";
import { Switch } from "../components/ui/switch";
import { datasets } from "../data";
import type { ThemeName } from "../data/types";
import { useMediaQuery } from "../hooks/use-media-query";
import { STORAGE_KEY } from "../lib/workspace";
import { useScope } from "../state/scope";
import { useUi } from "../state/ui";
import { useWorkspace } from "../state/workspace";

const themes: { value: ThemeName; label: string; caption: string }[] = [
  { value: "verde", label: "Verde", caption: "Institucional" },
  { value: "ciano", label: "Ciano", caption: "Neutro frio" },
  { value: "ambar", label: "Âmbar", caption: "Neutro quente" },
];
export function SettingsPage() {
  const { dataset, scope } = useScope();
  const { preferences, setPreference, resetWorkspace, favoriteCameraIds, events } = useWorkspace();
  const { notify } = useUi();
  const [resetOpen, setResetOpen] = useState(false);
  const coarse = useMediaQuery("(pointer: coarse)");
  const desktop = useMediaQuery("(min-width: 1024px)");
  const systemReduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const matrixAvailable = desktop && !coarse && !systemReduced && !preferences.reduceMotion;
  const matrixEnabled = preferences.matrix && matrixAvailable;
  const localChanges = events.filter(
    (event, index) => event.status !== dataset.events[index]?.status,
  ).length;
  const localFavorites = favoriteCameraIds.filter((id) =>
    dataset.cameras.some((camera) => camera.id === id),
  ).length;
  return (
    <div className="stack">
      <PageHeader
        eyebrow={`Sistema · experiência de uso · ${dataset.shortLabel}`}
        title="Preferências"
        description="Uma identidade consistente, ajustada ao seu dispositivo e ao seu ritmo. Preferências valem para as duas versões; dados e favoritos permanecem separados por território."
      />
      <div className="settings-grid">
        <Panel
          title="Identidade visual"
          subtitle="Apenas o acento muda. As cores de status permanecem consistentes."
        >
          <div className="panel-body">
            <div className="theme-options" role="group" aria-label="Tema de acento">
              {themes.map((theme) => (
                <button
                  key={theme.value}
                  className={`theme-option theme-option--${theme.value}`}
                  aria-pressed={preferences.theme === theme.value}
                  onClick={() => setPreference("theme", theme.value)}
                >
                  <span className="theme-swatch" aria-hidden="true" />
                  <span>{theme.label}</span>
                  <small>{theme.caption}</small>
                  {preferences.theme === theme.value && <Check size={14} className="theme-check" />}
                </button>
              ))}
            </div>
          </div>
        </Panel>
        <Panel title="Atalhos de teclado" subtitle="Compatíveis com ABNT2; sem teclas mortas">
          <div className="panel-body">
            <dl className="shortcut-list">
              <div>
                <dt>Abrir ou fechar terminal</dt>
                <dd>
                  <kbd>F2</kbd>
                </dd>
              </div>
              <div>
                <dt>Alternativa ao terminal</dt>
                <dd>
                  <kbd>Ctrl</kbd> + <kbd>K</kbd>
                </dd>
              </div>
              <div>
                <dt>Fechar janela ativa</dt>
                <dd>
                  <kbd>Esc</kbd>
                </dd>
              </div>
              <div>
                <dt>Histórico de comandos</dt>
                <dd>
                  <kbd>↑</kbd> <kbd>↓</kbd>
                </dd>
              </div>
            </dl>
          </div>
        </Panel>
        <Panel
          title="Movimento e desempenho"
          subtitle="Animações são opcionais. A legibilidade vem primeiro."
        >
          <div className="panel-body">
            <div className="setting-row">
              <div>
                <h3>Movimento reduzido</h3>
                <p>
                  Respeita a preferência do sistema e pode ser reforçada aqui. Gráficos deixam de
                  animar; a textura ambiente é desligada.
                </p>
              </div>
              <Switch
                label="Reduzir animações"
                checked={preferences.reduceMotion || systemReduced}
                disabled={systemReduced}
                onChange={(value) => setPreference("reduceMotion", value)}
              />
            </div>
            <div className="setting-row">
              <div>
                <h3>Textura ambiente Matrix</h3>
                <p>
                  {matrixAvailable
                    ? "Textura discreta no fundo, fora das superfícies de dados. Pausa com janelas abertas ou aba oculta."
                    : "Desativada neste dispositivo: requer desktop com mouse e movimento habilitado."}
                </p>
              </div>
              <Switch
                label="Textura ambiente Matrix"
                checked={matrixEnabled}
                disabled={!matrixAvailable}
                onChange={(value) => setPreference("matrix", value)}
              />
            </div>
          </div>
        </Panel>
        <Panel title="Densidade e navegação" subtitle="Preferências salvas apenas neste navegador">
          <div className="panel-body">
            <div className="setting-row">
              <div>
                <h3>Densidade da interface</h3>
                <p>Compacta reduz espaçamentos, sem reduzir a legibilidade.</p>
              </div>
              <SegmentedControl
                value={preferences.density}
                options={[
                  { value: "comfortable", label: "Normal" },
                  { value: "compact", label: "Compacta" },
                ]}
                onChange={(value) => setPreference("density", value)}
                label="Densidade da interface"
              />
            </div>
            <div className="setting-row">
              <div>
                <h3>Menu lateral recolhido</h3>
                <p>Ícones de 76 px no desktop. No mobile, a navegação abre em uma gaveta.</p>
              </div>
              <Switch
                label="Menu lateral recolhido no desktop"
                checked={preferences.sidebarCollapsed}
                onChange={(value) => setPreference("sidebarCollapsed", value)}
              />
            </div>
            <div className="setting-row">
              <div>
                <h3>Restaurar padrão</h3>
                <p>Remove favoritos e alterações de eventos das duas versões deste navegador.</p>
              </div>
              <button className="button button--danger" onClick={() => setResetOpen(true)}>
                <RotateCcw size={15} />
                Restaurar
              </button>
            </div>
          </div>
        </Panel>
      </div>
      <Panel
        title="Versões territoriais"
        subtitle="O seletor no menu troca o inventário completo preservando a aba atual"
      >
        <div className="panel-body scope-settings-grid">
          {Object.values(datasets).map((item) => (
            <article
              className={`scope-settings-card ${item.id === scope ? "scope-settings-card--active" : ""}`}
              key={item.id}
            >
              <p className="eyebrow">{item.id === scope ? "Versão ativa" : "Versão paralela"}</p>
              <h3>{item.label}</h3>
              <p>{item.description}</p>
              <dl className="layer-facts">
                <div>
                  <dt>Áreas de referência</dt>
                  <dd>{item.areas.length}</dd>
                </div>
                <div>
                  <dt>Câmeras / eventos</dt>
                  <dd>
                    {item.cameras.length} / {item.events.length}
                  </dd>
                </div>
                <div>
                  <dt>Unidades educacionais</dt>
                  <dd>{item.educationUnits.length}</dd>
                </div>
                <div>
                  <dt>Ocorrências / bases</dt>
                  <dd>
                    {item.securityOccurrences.length} / {item.securityUnits.length}
                  </dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </Panel>
      <div className="analytics-grid">
        <Panel title="Seu estado local" subtitle="O que este navegador guarda nesta demonstração">
          <DefinitionGrid
            items={[
              {
                term: "Chave de armazenamento",
                definition: `${STORAGE_KEY} · localStorage versionado, validado na leitura e sem envio a servidor.`,
              },
              {
                term: "Preferências",
                definition: `Tema ${preferences.theme}, densidade ${preferences.density === "compact" ? "compacta" : "normal"}, layout de câmeras ${preferences.cameraLayout === "grid" ? "em grade" : "em lista"}. Matrix ${preferences.matrix ? "solicitado" : "desligado"}; movimento reduzido ${preferences.reduceMotion ? "ativado" : "desativado"}.`,
              },
              {
                term: "Favoritos",
                definition: `${favoriteCameraIds.length} identificadores válidos no total; ${localFavorites} pertencem a ${dataset.shortLabel}. IDs de outra versão não aparecem no inventário atual.`,
              },
              {
                term: "Eventos alterados",
                definition: `${localChanges} alterações de status visíveis em ${dataset.shortLabel}. Overrides são aceitos apenas para IDs conhecidos das duas versões.`,
              },
            ]}
          />
        </Panel>
        <InsightPanel
          title="Acessibilidade e toque"
          subtitle="Compromissos mantidos nas dez abas e nos dois recortes"
          items={[
            {
              title: "Teclado primeiro",
              text: "F2 ou Ctrl+K abrem o terminal sem depender de tecla morta ABNT2. Diálogos nativos preservam foco, fecham com Escape e permitem clique no backdrop.",
            },
            {
              title: "Toque sem zoom acidental",
              text: "Inputs usam pelo menos 16 px em dispositivos de toque. Botões, links de ação e controles compactos respeitam alvo mínimo de 44 px nesse contexto.",
            },
            {
              title: "Leitura antes de decoração",
              text: "Texto secundário mantém contraste AA, fonte mínima de 11 px e tabelas com caption/scope. Abaixo de 700 px de container, tabelas viram cards.",
            },
            {
              title: "Movimento opcional",
              text: "Matrix começa desligado, não roda em toque ou movimento reduzido e pausa com overlays. Gráficos oferecem tabela alternativa e respeitam a preferência de movimento.",
            },
          ]}
        />
      </div>
      <Panel
        title="Governança da demonstração"
        subtitle="O que precisaria existir antes de qualquer integração real"
      >
        <DefinitionGrid
          items={[
            {
              term: "Origem dos dados",
              definition:
                "Fixtures determinísticos em src/data. Nenhuma chamada a API oficial, câmera, plataforma escolar ou sistema de segurança acontece em execução.",
            },
            {
              term: "Minimização",
              definition:
                "Não coletar dados pessoais de estudantes, vítimas, agentes ou motoristas. Identificadores DEMO e nomes de unidades são fictícios.",
            },
            {
              term: "Autenticação e autorização",
              definition:
                "Uma versão operacional exige identidade no servidor, perfis e permissões por território/camada, auditoria e revisão de base legal.",
            },
            {
              term: "Segurança da informação",
              definition:
                "Transporte protegido, gestão de segredos fora do front-end, logs auditáveis, retenção definida e resposta a incidentes antes de produção.",
            },
            {
              term: "Fontes locais",
              definition:
                "Inter e JetBrains Mono são empacotadas no build. Não há rastreamento, fontes remotas ou APIs externas em tempo de execução.",
            },
            {
              term: "Restauração",
              definition:
                "Limpar o estado local remove preferências, favoritos e overrides deste navegador. Não afeta dados externos porque não há integração.",
            },
          ]}
        />
      </Panel>
      <div className="notice-inline">
        <Monitor size={16} />
        <span>
          Fontes Inter e JetBrains Mono são hospedadas localmente. Não há chamadas a serviços de
          fontes, rastreamento ou APIs externas.
        </span>
      </div>
      <PageFooter />
      <Dialog
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        title="Restaurar a demonstração?"
        eyebrow="Dados locais"
        footer={
          <>
            <button className="button" onClick={() => setResetOpen(false)}>
              Cancelar
            </button>
            <button
              className="button button--danger"
              onClick={() => {
                resetWorkspace();
                setResetOpen(false);
                notify("Preferências, favoritos e eventos das duas versões restaurados ao padrão.");
              }}
            >
              Restaurar padrão
            </button>
          </>
        }
      >
        <p className="detail-description">
          Esta ação remove favoritos, alterações de status e preferências salvos neste navegador
          para Piauí e Teresina Capital. Os conjuntos sintéticos originais serão restaurados. Nenhum
          dado externo é afetado.
        </p>
      </Dialog>
    </div>
  );
}
