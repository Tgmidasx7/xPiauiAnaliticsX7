import { CheckCheck, Cctv, GraduationCap, Map, Network, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { useScope } from "../../state/scope";
import { useWorkspace } from "../../state/workspace";
import { Panel } from "../ui/panel";

export function HealthPanel() {
  const { dataset, path } = useScope();
  const { events } = useWorkspace();
  const { metrics, cameras, networkLinks, areas, educationUnits, securityUnits } = dataset;
  const resolved = events.filter((event) => event.status === "resolved").length;
  const connected = educationUnits.filter((unit) => unit.connectivity !== "offline").length;
  const items = [
    {
      label: "Câmeras disponíveis",
      icon: Cctv,
      value: (metrics.onlineCameras / cameras.length) * 100,
      display: `${metrics.onlineCameras}/${cameras.length}`,
    },
    {
      label: "Enlaces saudáveis",
      icon: Network,
      value: (metrics.healthyLinks / networkLinks.length) * 100,
      display: `${metrics.healthyLinks}/${networkLinks.length}`,
    },
    {
      label: "Eventos resolvidos",
      icon: CheckCheck,
      value: (resolved / events.length) * 100,
      display: `${resolved}/${events.length}`,
    },
    {
      label: "Escolas conectadas",
      icon: GraduationCap,
      value: (connected / educationUnits.length) * 100,
      display: `${connected}/${educationUnits.length}`,
    },
    {
      label: "Bases disponíveis",
      icon: ShieldCheck,
      value: (metrics.securityAvailableUnits / securityUnits.length) * 100,
      display: `${metrics.securityAvailableUnits}/${securityUnits.length}`,
    },
    { label: "Áreas cobertas", icon: Map, value: 100, display: `${areas.length}/${areas.length}` },
  ];
  return (
    <Panel
      title="Saúde das camadas"
      subtitle="Operação, educação e segurança no mesmo recorte territorial"
    >
      <div className="panel-body">
        <div className="health-list">
          {items.map(({ label, icon: Icon, value, display }) => (
            <div key={label}>
              <div className="health-item-top">
                <span>
                  <Icon size={15} className="subtle" />
                  {label}
                </span>
                <strong>{display}</strong>
              </div>
              <progress
                className={`progress-track ${value < 95 ? "progress-track--warning" : ""}`}
                value={value}
                max={100}
                aria-label={`${label}: ${Math.round(value)} por cento`}
              >
                {Math.round(value)}%
              </progress>
            </div>
          ))}
        </div>
        <p className="health-note">
          Limiares demonstrativos: latência abaixo de 60 ms e perda abaixo de 1%. Indicadores
          educacionais e de segurança são agregados sintéticos.
        </p>
        <Link className="text-link u-mt-3" to={path("/infraestrutura")}>
          Ver infraestrutura
          <Network size={14} />
        </Link>
      </div>
    </Panel>
  );
}
