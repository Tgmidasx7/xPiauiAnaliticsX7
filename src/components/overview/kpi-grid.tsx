import {
  Activity,
  ArrowUpRight,
  Camera as CameraIcon,
  CarFront,
  ChevronDown,
  CircleAlert,
  Gauge,
  Timer,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  averageLatency,
  cameraAvailability,
  cameras,
  networkLinks,
  onlineCameras,
  regions,
} from "../../data/demo";
import { useWorkspace } from "../../state/workspace";

export function KpiGrid() {
  const { events } = useWorkspace();
  const pending = events.filter((event) => event.status !== "resolved");
  const critical = pending.filter((event) => event.severity === "critical").length;
  const healthyLinks = networkLinks.filter((link) => link.status === "healthy").length;
  return (
    <section aria-label="Indicadores principais do cenário sintético" className="stack">
      <div className="kpi-grid">
        <article className="kpi kpi--primary">
          <div>
            <p className="kpi-label">
              <CameraIcon size={16} />
              Câmeras operacionais
            </p>
            <strong className="kpi-value">
              {onlineCameras}
              <small> / {cameras.length}</small>
            </strong>
            <p className="kpi-foot">
              <span className="text-success">{cameraAvailability}%</span> de disponibilidade
            </p>
          </div>
          <div className="availability-ring" aria-hidden="true">
            <svg width="100%" height="100%" viewBox="0 0 80 80">
              <circle
                cx="40"
                cy="40"
                r="34"
                fill="none"
                stroke="var(--color-border)"
                strokeWidth="4"
              />
              <circle
                cx="40"
                cy="40"
                r="34"
                fill="none"
                stroke="var(--color-accent)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${(2 * Math.PI * 34 * onlineCameras) / cameras.length} ${2 * Math.PI * 34}`}
              />
            </svg>
            <span>{cameraAvailability}%</span>
          </div>
        </article>
        <Link className="kpi" to="/eventos?status=pending">
          <p className="kpi-label">
            <CircleAlert size={14} />
            Eventos pendentes
          </p>
          <strong className="kpi-value">{String(pending.length).padStart(2, "0")}</strong>
          <p className="kpi-foot">
            <ArrowUpRight size={12} />
            <span className="text-danger">{critical} críticos</span> para revisar
          </p>
        </Link>
        <Link className="kpi" to="/veiculos">
          <p className="kpi-label">
            <CarFront size={14} />
            Leituras de veículos
          </p>
          <strong className="kpi-value">1.284</strong>
          <p className="kpi-foot">
            <Activity size={12} />
            Volume registrado no dia
          </p>
        </Link>
        <Link className="kpi" to="/infraestrutura">
          <p className="kpi-label">
            <Gauge size={14} />
            Latência média
          </p>
          <strong className="kpi-value">
            {averageLatency}
            <small> ms</small>
          </strong>
          <p className="kpi-foot">
            <span className="text-success">Dentro do limite</span> de 60 ms
          </p>
        </Link>
      </div>
      <details className="additional-metrics">
        <summary>
          <span>Mais indicadores · rede, cobertura e resposta</span>
          <ChevronDown size={14} />
        </summary>
        <dl className="additional-metrics-grid">
          <div className="additional-metric">
            <dt>Enlaces saudáveis</dt>
            <dd>
              {healthyLinks}
              <small className="subtle"> / {networkLinks.length}</small>
            </dd>
          </div>
          <div className="additional-metric">
            <dt>Regiões cobertas</dt>
            <dd>
              {regions.length}
              <small className="subtle"> / {regions.length}</small>
            </dd>
          </div>
          <div className="additional-metric">
            <dt>Eventos resolvidos</dt>
            <dd>{events.length - pending.length}</dd>
          </div>
          <div className="additional-metric">
            <dt>Resposta média</dt>
            <dd className="row">
              <Timer size={16} />
              4m 32s
            </dd>
          </div>
        </dl>
      </details>
    </section>
  );
}
