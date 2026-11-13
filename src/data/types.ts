export type RegionId = "capital" | "norte" | "litoral" | "centro" | "sul";
export type CameraStatus = "online" | "maintenance" | "offline";
export type EventSeverity = "critical" | "warning" | "info";
export type EventStatus = "open" | "investigating" | "resolved";
export type ThemeName = "verde" | "ciano" | "ambar";

export interface Region {
  id: RegionId;
  name: string;
  reference: string;
  position: { x: number; y: number };
}

export interface Camera {
  id: string;
  name: string;
  region: RegionId;
  status: CameraStatus;
  latency: number;
  resolution: string;
  fps: number;
  scene: number;
}

export interface OperationalEvent {
  id: string;
  title: string;
  category: "Trânsito" | "Infraestrutura" | "Perímetro" | "Mobilidade";
  severity: EventSeverity;
  status: EventStatus;
  cameraId: string;
  region: RegionId;
  timestamp: string;
  description: string;
}

export interface VehicleReading {
  id: string;
  vehicle: string;
  type: "Automóvel" | "Motocicleta" | "Ônibus" | "Caminhão";
  cameraId: string;
  region: RegionId;
  direction: "Entrada" | "Saída";
  speed: number;
  timestamp: string;
  review: boolean;
}

export interface NetworkLink {
  id: string;
  name: string;
  region: RegionId;
  latency: number;
  loss: number;
  uptime: number;
  status: "healthy" | "degraded";
}

export interface ActivityPoint {
  label: string;
  events: number;
  previous: number;
}

export interface Preferences {
  theme: ThemeName;
  sidebarCollapsed: boolean;
  density: "comfortable" | "compact";
  matrix: boolean;
  reduceMotion: boolean;
  cameraLayout: "grid" | "list";
}

export interface Workspace {
  version: 1;
  preferences: Preferences;
  eventOverrides: Record<string, EventStatus>;
  favoriteCameraIds: string[];
}
