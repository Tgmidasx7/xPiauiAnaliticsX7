import { Check, Monitor, RotateCcw } from "lucide-react";
import { useState } from "react";
import { PageFooter } from "../components/ui/page-footer";
import { PageHeader } from "../components/ui/page-header";
import { Dialog } from "../components/ui/dialog";
import { Panel } from "../components/ui/panel";
import { SegmentedControl } from "../components/ui/segmented-control";
import { Switch } from "../components/ui/switch";
import type { ThemeName } from "../data/types";
import { useMediaQuery } from "../hooks/use-media-query";
import { useUi } from "../state/ui";
import { useWorkspace } from "../state/workspace";

const themes: { value: ThemeName; label: string; caption: string }[] = [
  { value: "verde", label: "Verde", caption: "Institucional" },
  { value: "ciano", label: "Ciano", caption: "Neutro frio" },
  { value: "ambar", label: "Âmbar", caption: "Neutro quente" },
];
export function SettingsPage() {
  const { preferences, setPreference, resetWorkspace } = useWorkspace();
  const { notify } = useUi();
  const [resetOpen, setResetOpen] = useState(false);
  const coarse = useMediaQuery("(pointer: coarse)");
  const desktop = useMediaQuery("(min-width: 1024px)");
  const systemReduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const matrixAvailable = desktop && !coarse && !systemReduced && !preferences.reduceMotion;
  const matrixEnabled = preferences.matrix && matrixAvailable;
  return (
    <div className="stack">
      <PageHeader
        eyebrow="Sistema · experiência de uso"
        title="Preferências"
        description="Uma identidade consistente, ajustada ao seu dispositivo e ao seu ritmo."
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
                <h3>Reduzir animações</h3>
                <p>
                  {systemReduced
                    ? "Ativo pelo sistema operacional. A preferência do sistema tem prioridade."
                    : "Desativa animações de gráficos e prévias de câmeras."}
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
                <p>Remove favoritos e alterações de eventos deste navegador.</p>
              </div>
              <button className="button button--danger" onClick={() => setResetOpen(true)}>
                <RotateCcw size={15} />
                Restaurar
              </button>
            </div>
          </div>
        </Panel>
      </div>
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
                notify("Preferências, favoritos e eventos restaurados ao padrão.");
              }}
            >
              Restaurar padrão
            </button>
          </>
        }
      >
        <p className="detail-description">
          Esta ação remove seus favoritos, alterações de status e preferências salvas neste
          navegador. O conjunto sintético original será restaurado. Nenhum dado externo é afetado.
        </p>
      </Dialog>
    </div>
  );
}
