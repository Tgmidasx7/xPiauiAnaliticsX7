import { CheckCheck, Cctv, Map, Network } from "lucide-react";
import { Link } from "react-router-dom";
import { cameras, networkLinks, onlineCameras, regions } from "../../data/demo";
import { useWorkspace } from "../../state/workspace";
import { Panel } from "../ui/panel";

export function HealthPanel() {
  const { events } = useWorkspace();
  const healthyLinks = networkLinks.filter((link) => link.status === "healthy").length;
  const resolved = events.filter((event) => event.status === "resolved").length;
  const items = [
    {
      label: "Câmeras disponíveis",
      icon: Cctv,
      value: (onlineCameras / cameras.length) * 100,
      display: `${onlineCameras}/${cameras.length}`,
    },
    {
      label: "Enlaces saudáveis",
      icon: Network,
      value: (healthyLinks / networkLinks.length) * 100,
      display: `${healthyLinks}/${networkLinks.length}`,
    },
    {
      label: "Eventos resolvidos",
      icon: CheckCheck,
      value: (resolved / events.length) * 100,
      display: `${resolved}/${events.length}`,
    },
    {
      label: "Regiões cobertas",
      icon: Map,
      value: 100,
      display: `${regions.length}/${regions.length}`,
    },
  ];
  return (
    <Panel title="Saúde da infraestrutura" subtitle="Visão consolidada dos enlaces e serviços">
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
          Limiares do cenário: latência abaixo de 60 ms e perda de pacotes abaixo de 1%.
        </p>
        <Link className="text-link u-mt-3" to="/infraestrutura">
          Ver infraestrutura
          <Network size={14} />
        </Link>
      </div>
    </Panel>
  );
}
