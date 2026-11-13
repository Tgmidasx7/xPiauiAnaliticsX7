import {
  AlertTriangle,
  CheckCircle2,
  CircleDot,
  Clock3,
  Info,
  Wrench,
  XCircle,
} from "lucide-react";
import type { CameraStatus, EventSeverity, EventStatus, NetworkLink } from "../../data/types";

type Tone = "success" | "warning" | "danger" | "info" | "neutral" | "accent";
const icons = {
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: XCircle,
  info: Info,
  neutral: Clock3,
  accent: CircleDot,
};

export function Badge({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  const Icon = icons[tone];
  return (
    <span className={`badge badge--${tone}`}>
      <Icon size={12} />
      {children}
    </span>
  );
}

export function CameraStatusBadge({ status }: { status: CameraStatus }) {
  if (status === "online") return <Badge tone="success">Disponível</Badge>;
  if (status === "maintenance")
    return (
      <Badge tone="warning">
        <Wrench size={12} />
        Manutenção
      </Badge>
    );
  return <Badge tone="danger">Offline</Badge>;
}

export function SeverityBadge({ severity }: { severity: EventSeverity }) {
  const labels = { critical: "Crítico", warning: "Atenção", info: "Informativo" };
  const tones = { critical: "danger", warning: "warning", info: "info" } as const;
  return <Badge tone={tones[severity]}>{labels[severity]}</Badge>;
}

export function EventStatusBadge({ status }: { status: EventStatus }) {
  if (status === "resolved") return <Badge tone="success">Resolvido</Badge>;
  if (status === "investigating") return <Badge tone="info">Em análise</Badge>;
  return <Badge tone="neutral">Pendente</Badge>;
}

export function NetworkStatusBadge({ status }: { status: NetworkLink["status"] }) {
  return (
    <Badge tone={status === "healthy" ? "success" : "warning"}>
      {status === "healthy" ? "Saudável" : "Degradado"}
    </Badge>
  );
}
