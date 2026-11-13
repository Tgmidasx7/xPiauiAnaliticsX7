export type ScopeId = "piaui" | "teresina";
export type RegionId = "capital" | "norte" | "litoral" | "centro" | "sul";
export type CapitalZoneId = "centro" | "norte" | "sul" | "leste" | "sudeste";
export type AreaId = RegionId | CapitalZoneId;
export type CameraStatus = "online" | "maintenance" | "offline";
export type EventSeverity = "critical" | "warning" | "info";
export type EventStatus = "open" | "investigating" | "resolved";
export type ThemeName = "verde" | "ciano" | "ambar";
export type ActivityPeriod = "6h" | "24h" | "7d";

export interface Region {
  id: AreaId;
  scope: ScopeId;
  name: string;
  reference: string;
  position: { x: number; y: number };
}

export interface Camera {
  id: string;
  scope: ScopeId;
  name: string;
  region: AreaId;
  status: CameraStatus;
  latency: number;
  resolution: string;
  fps: number;
  scene: number;
}

export type EventCategory =
  "Trânsito" | "Infraestrutura" | "Perímetro" | "Mobilidade" | "Educação" | "Segurança Pública";

export interface OperationalEvent {
  id: string;
  scope: ScopeId;
  title: string;
  category: EventCategory;
  severity: EventSeverity;
  status: EventStatus;
  cameraId: string;
  region: AreaId;
  timestamp: string;
  description: string;
}

export interface VehicleReading {
  id: string;
  scope: ScopeId;
  vehicle: string;
  type: "Automóvel" | "Motocicleta" | "Ônibus" | "Caminhão";
  cameraId: string;
  region: AreaId;
  direction: "Entrada" | "Saída";
  speed: number;
  timestamp: string;
  review: boolean;
}

export interface NetworkLink {
  id: string;
  scope: ScopeId;
  name: string;
  region: AreaId;
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

export type ConnectivityKind = "fiber" | "radio" | "satellite" | "offline";
export type EducationStage = "Infantil" | "Fundamental" | "Médio" | "EJA" | "Técnico";

export interface EducationUnit {
  id: string;
  scope: ScopeId;
  name: string;
  areaId: AreaId;
  stage: EducationStage;
  connectivity: ConnectivityKind;
  bandwidthMbps: number;
  devicesAvailable: number;
  devicesTotal: number;
  labs: number;
  teachersTrained: number;
  platformUsage: number;
  status: "ok" | "attention" | "critical";
}

export interface EducationProgram {
  id: string;
  scope: ScopeId;
  name: string;
  focus: string;
  units: number;
  educators: number;
  completion: number;
  status: "on-track" | "attention" | "planned";
}

export type SecurityNature = "Patrimonial" | "Trânsito" | "Violência" | "Apoio" | "Prevenção";
export type SecurityStatus = "registered" | "dispatched" | "on-scene" | "closed";

export interface SecurityOccurrence {
  id: string;
  scope: ScopeId;
  nature: SecurityNature;
  areaId: AreaId;
  severity: EventSeverity;
  status: SecurityStatus;
  timestamp: string;
  responseMinutes: number;
  unitsAssigned: number;
  description: string;
}

export interface SecurityUnit {
  id: string;
  scope: ScopeId;
  name: string;
  type: "Policiamento" | "Trânsito" | "Defesa Civil" | "Guarda Municipal" | "Bombeiros";
  areaId: AreaId;
  status: "available" | "busy" | "maintenance";
  personnel: number;
  vehicles: number;
}

export interface SecurityProgram {
  id: string;
  scope: ScopeId;
  name: string;
  focus: string;
  actions: number;
  coverage: number;
  status: "active" | "expanding" | "planned";
}

export interface DatasetMetrics {
  onlineCameras: number;
  cameraAvailability: string;
  averageLatency: number;
  healthyLinks: number;
  vehicleReadingsVolume: number;
  educationConnectedPct: number;
  educationDevicesAvailable: number;
  educationTeachersTrained: number;
  securityOpen: number;
  securityAverageResponse: number;
  securityAvailableUnits: number;
}

export interface Dataset {
  id: ScopeId;
  label: string;
  shortLabel: string;
  description: string;
  snapshotIso: string;
  areas: Region[];
  cameras: Camera[];
  events: OperationalEvent[];
  vehicleReadings: VehicleReading[];
  networkLinks: NetworkLink[];
  activityByPeriod: Record<ActivityPeriod, ActivityPoint[]>;
  educationUnits: EducationUnit[];
  educationPrograms: EducationProgram[];
  securityOccurrences: SecurityOccurrence[];
  securityUnits: SecurityUnit[];
  securityPrograms: SecurityProgram[];
  briefing: string[];
  metrics: DatasetMetrics;
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
