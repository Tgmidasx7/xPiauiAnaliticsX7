import {
  activityByPeriod,
  cameras,
  demoEvents,
  networkLinks,
  regions,
  SNAPSHOT_ISO,
  vehicleReadings,
} from "./demo";
import {
  buildEducationPrograms,
  buildEducationUnits,
  buildSecurityOccurrences,
  buildSecurityPrograms,
  buildSecurityUnits,
} from "./generators";
import {
  capitalZones,
  TERESINA_SNAPSHOT_ISO,
  teresinaActivityByPeriod,
  teresinaCameras,
  teresinaEvents,
  teresinaNetworkLinks,
  teresinaVehicleReadings,
} from "./teresina";
import type { AreaId, Camera, Dataset, DatasetMetrics, Region, ScopeId } from "./types";

export const scopeOptions = [
  { value: "piaui", label: "Piauí" },
  { value: "teresina", label: "Teresina Capital" },
] as const satisfies readonly { value: ScopeId; label: string }[];

export function isScopeId(value: unknown): value is ScopeId {
  return value === "piaui" || value === "teresina";
}

export function getArea(dataset: Dataset, id: AreaId | string): Region | undefined {
  return dataset.areas.find((area) => area.id === id);
}

export function getScopedCamera(dataset: Dataset, id: string): Camera | undefined {
  return dataset.cameras.find((camera) => camera.id === id);
}

export function calculateMetrics(
  dataset: Omit<Dataset, "metrics" | "briefing"> & { vehicleVolume: number },
): DatasetMetrics {
  const onlineCameras = dataset.cameras.filter((camera) => camera.status === "online").length;
  const connected = dataset.educationUnits.filter((unit) => unit.connectivity !== "offline");
  const attended = dataset.securityOccurrences.filter(
    (occurrence) => occurrence.status !== "registered",
  );
  return {
    onlineCameras,
    cameraAvailability: ((onlineCameras / dataset.cameras.length) * 100)
      .toFixed(1)
      .replace(".", ","),
    averageLatency: Math.round(
      dataset.networkLinks.reduce((sum, link) => sum + link.latency, 0) /
        dataset.networkLinks.length,
    ),
    healthyLinks: dataset.networkLinks.filter((link) => link.status === "healthy").length,
    vehicleReadingsVolume: dataset.vehicleVolume,
    educationConnectedPct: Math.round((connected.length / dataset.educationUnits.length) * 100),
    educationDevicesAvailable: dataset.educationUnits.reduce(
      (sum, unit) => sum + unit.devicesAvailable,
      0,
    ),
    educationTeachersTrained: dataset.educationUnits.reduce(
      (sum, unit) => sum + unit.teachersTrained,
      0,
    ),
    securityOpen: dataset.securityOccurrences.filter((occurrence) => occurrence.status !== "closed")
      .length,
    securityAverageResponse: attended.length
      ? Math.round(
          attended.reduce((sum, occurrence) => sum + occurrence.responseMinutes, 0) /
            attended.length,
        )
      : 0,
    securityAvailableUnits: dataset.securityUnits.filter((unit) => unit.status === "available")
      .length,
  };
}

const piauiBase = {
  id: "piaui" as const,
  label: "Piauí · visão estadual",
  shortLabel: "Piauí",
  description:
    "Cinco regiões de referência conectam operação, educação e segurança em uma leitura estadual de demonstração.",
  snapshotIso: SNAPSHOT_ISO,
  areas: regions,
  cameras,
  events: demoEvents,
  vehicleReadings,
  networkLinks,
  activityByPeriod,
  educationUnits: buildEducationUnits("piaui", regions, 40),
  educationPrograms: buildEducationPrograms("piaui", 40),
  securityOccurrences: buildSecurityOccurrences("piaui", regions, 42, SNAPSHOT_ISO),
  securityUnits: buildSecurityUnits("piaui", regions, 20),
  securityPrograms: buildSecurityPrograms("piaui"),
  vehicleVolume: 1284,
};

const teresinaBase = {
  id: "teresina" as const,
  label: "Teresina Capital · visão municipal",
  shortLabel: "Teresina Capital",
  description:
    "Cinco zonas urbanas de referência organizam corredores, terminais, escolas e bases operacionais da capital.",
  snapshotIso: TERESINA_SNAPSHOT_ISO,
  areas: capitalZones,
  cameras: teresinaCameras,
  events: teresinaEvents,
  vehicleReadings: teresinaVehicleReadings,
  networkLinks: teresinaNetworkLinks,
  activityByPeriod: teresinaActivityByPeriod,
  educationUnits: buildEducationUnits("teresina", capitalZones, 30),
  educationPrograms: buildEducationPrograms("teresina", 30),
  securityOccurrences: buildSecurityOccurrences(
    "teresina",
    capitalZones,
    36,
    TERESINA_SNAPSHOT_ISO,
  ),
  securityUnits: buildSecurityUnits("teresina", capitalZones, 15),
  securityPrograms: buildSecurityPrograms("teresina"),
  vehicleVolume: 946,
};

export const piauiDataset: Dataset = {
  ...piauiBase,
  metrics: calculateMetrics(piauiBase),
  briefing: [
    "A disponibilidade de vídeo é o ponto de partida: confira câmeras offline e enlaces degradados antes de interpretar a atividade regional.",
    "A camada EdTech reúne conectividade, dispositivos e formação docente em unidades de referência. Os indicadores não descrevem estudantes individualmente.",
    "A fila de segurança pública separa registro, despacho, atendimento e encerramento. Tempos e naturezas são sintéticos, sem acionamento de serviços reais.",
    "Use Territórios para comparar as cinco regiões e Análises para cruzar camadas. A versão Teresina Capital possui dados próprios, não um subconjunto filtrado desta tela.",
  ],
};

export const teresinaDataset: Dataset = {
  ...teresinaBase,
  metrics: calculateMetrics(teresinaBase),
  briefing: [
    "O recorte municipal acompanha corredores e terminais nas zonas Centro, Norte, Sul, Leste e Sudeste; a localização é esquemática.",
    "A leitura de mobilidade considera entradas, saídas e revisão de leituras fictícias. Identificadores DEMO não representam placas ou trajetos reais.",
    "EdTech apresenta escolas municipais de referência, conectividade e recursos digitais. Segurança integra bases, ocorrências e programas sem identificar pessoas.",
    "Alterne para Piauí para a visão estadual. Favoritos e alterações locais são preservados por identificador, mas cada versão mantém seu próprio inventário.",
  ],
};

export const datasets: Record<ScopeId, Dataset> = {
  piaui: piauiDataset,
  teresina: teresinaDataset,
};

export const allCameras = [...cameras, ...teresinaCameras];
export const allEvents = [...demoEvents, ...teresinaEvents];
