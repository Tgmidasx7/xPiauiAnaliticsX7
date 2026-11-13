import {
  Activity,
  ArrowUpRight,
  Camera as CameraIcon,
  CarFront,
  ChevronDown,
  CircleAlert,
  Gauge,
  GraduationCap,
  ShieldCheck,
  Timer,
} from "lucide-react";
import { Link } from "react-router-dom";
import { formatNumber } from "../../lib/format";
import { useScope } from "../../state/scope";
import { useWorkspace } from "../../state/workspace";

export function KpiGrid() {
  const { dataset, path } = useScope();
  const { events } = useWorkspace();
  const { metrics, cameras, networkLinks, areas } = dataset;
  const pending = events.filter((event) => event.status !== "resolved");
  const critical = pending.filter((event) => event.severity === "critical").length;
  return (
    <section
      aria-label={`Indicadores principais · ${dataset.label} · cenário sintético`}
      className="stack"
    >
      <div className="kpi-grid">
        <article className="kpi kpi--primary">
          <div>
            <p className="kpi-label">
              <CameraIcon size={16} />
              Câmeras operacionais
            </p>
            <strong className="kpi-value">
              {metrics.onlineCameras}
              <small> / {cameras.length}</small>
            </strong>
            <p className="kpi-foot">
              <span className="text-success">{metrics.cameraAvailability}%</span> de disponibilidade
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
                strokeDasharray={`${(2 * Math.PI * 34 * metrics.onlineCameras) / cameras.length} ${2 * Math.PI * 34}`}
              />
            </svg>
            <span>{metrics.cameraAvailability}%</span>
          </div>
        </article>
        <Link className="kpi" to={path("/eventos?status=pending")}>
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
        <Link className="kpi" to={path("/veiculos")}>
          <p className="kpi-label">
            <CarFront size={14} />
            Leituras de veículos
          </p>
          <strong className="kpi-value">{formatNumber(metrics.vehicleReadingsVolume)}</strong>
          <p className="kpi-foot">
            <Activity size={12} />
            Volume sintético do dia
          </p>
        </Link>
        <Link className="kpi" to={path("/infraestrutura")}>
          <p className="kpi-label">
            <Gauge size={14} />
            Latência média
          </p>
          <strong className="kpi-value">
            {metrics.averageLatency}
            <small> ms</small>
          </strong>
          <p className="kpi-foot">
            <span className="text-success">Dentro do limite</span> de 60 ms
          </p>
        </Link>
      </div>
      <details className="additional-metrics">
        <summary>
          <span>Mais indicadores · rede, educação e segurança</span>
          <ChevronDown size={14} />
        </summary>
        <dl className="additional-metrics-grid">
          <div className="additional-metric">
            <dt>Enlaces saudáveis</dt>
            <dd>
              {metrics.healthyLinks}
              <small className="subtle"> / {networkLinks.length}</small>
            </dd>
          </div>
          <div className="additional-metric">
            <dt>Áreas cobertas</dt>
            <dd>
              {areas.length}
              <small className="subtle"> / {areas.length}</small>
            </dd>
          </div>
          <div className="additional-metric">
            <dt>
              <GraduationCap size={14} /> Escolas conectadas
            </dt>
            <dd>{metrics.educationConnectedPct}%</dd>
          </div>
          <div className="additional-metric">
            <dt>
              <ShieldCheck size={14} /> Bases disponíveis
            </dt>
            <dd>
              {metrics.securityAvailableUnits}
              <small className="subtle"> / {dataset.securityUnits.length}</small>
            </dd>
          </div>
          <div className="additional-metric">
            <dt>Eventos resolvidos</dt>
            <dd>{events.length - pending.length}</dd>
          </div>
          <div className="additional-metric">
            <dt>Ocorrências em aberto</dt>
            <dd>{metrics.securityOpen}</dd>
          </div>
          <div className="additional-metric">
            <dt>Resposta média sintética</dt>
            <dd className="row">
              <Timer size={16} />
              {metrics.securityAverageResponse} min
            </dd>
          </div>
          <div className="additional-metric">
            <dt>Educadores em formação</dt>
            <dd>{formatNumber(metrics.educationTeachersTrained)}</dd>
          </div>
        </dl>
      </details>
    </section>
  );
}
